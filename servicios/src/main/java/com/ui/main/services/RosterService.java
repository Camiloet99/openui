package com.ui.main.services;

import com.ui.main.config.RosterProperties;
import com.ui.main.model.dto.RosterRow;
import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

@Service
@RequiredArgsConstructor
public class RosterService {

    private final RosterProperties props;

    private final AtomicReference<Map<String, RosterRow>> cache = new AtomicReference<>(Map.of());
    private final AtomicLong lastLoadedTime = new AtomicLong(0);
    private final Object lock = new Object();

    private static final DateTimeFormatter[] DATE_PATTERNS = new DateTimeFormatter[] {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy")
    };

    public Mono<Boolean> matchesEmailAndDni(String email, String dni) {
        return ensureLoaded().map(map -> {
            RosterRow row = map.get(normalizeEmail(email));
            return row != null && Objects.equals(row.dni(), dni);
        });
    }

    public Mono<RosterRow> findByInstitutionalEmail(String email) {
        return ensureLoaded().map(map -> map.get(normalizeEmail(email)));
    }

    private Mono<Map<String, RosterRow>> ensureLoaded() {
        Path path = Paths.get(props.getCsvPath());
        return Mono.fromSupplier(() -> {
            long mtime = Files.exists(path) ? path.toFile().lastModified() : 0;
            if (mtime == 0) throw new IllegalStateException("CSV no encontrado: " + path.toAbsolutePath());

            if (mtime != lastLoadedTime.get() || cache.get().isEmpty()) {
                synchronized (lock) {
                    if (mtime != lastLoadedTime.get() || cache.get().isEmpty()) {
                        cache.set(loadCsv(path));
                        lastLoadedTime.set(mtime);
                    }
                }
            }
            return cache.get();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private Map<String, RosterRow> loadCsv(Path path) {
        CsvParserSettings st = new CsvParserSettings();
        st.setHeaderExtractionEnabled(true);
        st.setLineSeparatorDetectionEnabled(true);
        st.setSkipEmptyLines(true);
        st.getFormat().setDelimiter(props.getDelimiter().charAt(0));

        try (Reader in = Files.newBufferedReader(
                path, Charset.forName(props.getCharset()))) {
            CsvParser parser = new CsvParser(st);
            parser.beginParsing(in);
            String[] headers = parser.getContext().headers();
            if (headers == null) {
                throw new IllegalStateException("El archivo no tiene cabecera (headers) detectada");
            }

            // Índices con matching flexible
            var c = props.getCols();
            int iCiudad  = findHeaderIndex(headers, c.getCiudadResidencia());
            int iSubreg  = findHeaderIndex(headers, c.getSubregion());
            int iName    = findHeaderIndex(headers, c.getName());
            int iTipoDoc = findHeaderIndex(headers, c.getTipoDocumentoId());
            int iDni     = findHeaderIndex(headers, c.getDni());
            int iFecha   = findHeaderIndex(headers, c.getFechaNacimiento(), true);
            int iEdad    = findHeaderIndex(headers, c.getEdad(), true);
            int iGenero  = findHeaderIndex(headers, c.getGenero(), true);
            int iTel     = findHeaderIndex(headers, c.getTelefono(), true);
            int iCel     = findHeaderIndex(headers, c.getCelular(), true);
            int iEmailP  = findHeaderIndex(headers, c.getEmailPersonal(), true);
            int iEmailI  = findHeaderIndex(headers, c.getEmailInstitutional());
            int iEnfDif  = findHeaderIndex(headers, c.getEnfoqueDiferencial(), true);
            int iProg    = findHeaderIndex(headers, c.getPrograma(), true);
            int iNivel   = findHeaderIndex(headers, c.getNivel(), true);
            int iAdmin   = findHeaderIndex(headers, c.getAdmin(), false);

            Map<String, RosterRow> map = new HashMap<>(16_000);
            String[] row;
            while ((row = parser.parseNext()) != null) {
                String emailInst = val(row, iEmailI);
                String dni = val(row, iDni);
                String name = val(row, iName);
                if (emailInst == null || dni == null || name == null) continue;

                LocalDate fnac = parseDate(val(row, iFecha));
                Integer edad = parseInt(val(row, iEdad));
                boolean admin = parseBool(val(row, iAdmin)); // <-- NUEVO

                RosterRow rr = new RosterRow(
                        val(row, iCiudad),
                        val(row, iSubreg),
                        name,
                        val(row, iTipoDoc),
                        dni,
                        fnac,
                        edad,
                        val(row, iGenero),
                        val(row, iTel),
                        val(row, iCel),
                        val(row, iEmailP),
                        normalizeEmail(emailInst),
                        val(row, iEnfDif),
                        val(row, iProg),
                        val(row, iNivel),
                        admin
                );

                map.put(normalizeEmail(emailInst), rr);
            }
            return Map.copyOf(map);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static boolean parseBool(String s) {
        if (s == null) return false;
        String v = s.trim().toLowerCase(Locale.ROOT);
        return v.equals("true") || v.equals("1") || v.equals("yes") || v.equals("y")
                || v.equals("si") || v.equals("sí");
    }

    // -------- helpers de headers y celdas --------

    private static int findHeaderIndex(String[] headers, String wanted) {
        return findHeaderIndex(headers, wanted, false);
    }
    private static int findHeaderIndex(String[] headers, String wanted, boolean optional) {
        String w = normHeader(wanted);
        for (int i = 0; i < headers.length; i++) {
            if (normHeader(headers[i]).equals(w)) return i;
        }
        if (optional) return -1;
        throw new IllegalStateException("Columna requerida no encontrada: " + wanted);
    }

    /** Normaliza: minúsculas, sin acentos, quita espacios/guiones/underscores/puntos */
    private static String normHeader(String s) {
        if (s == null) return "";
        String n = s.strip();
        n = Normalizer.normalize(n, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        n = n.toLowerCase(Locale.ROOT);
        n = n.replaceAll("[\\s_.-]+", "");
        return n;
    }

    private static String val(String[] row, int idx) {
        return idx < 0 || idx >= row.length ? null : trim(row[idx]);
    }
    private static String trim(String s){ return (s == null || s.isBlank()) ? null : s.trim(); }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private static Integer parseInt(String s) {
        try { return (s == null || s.isBlank()) ? null : Integer.parseInt(s.trim()); }
        catch (Exception ex) { return null; }
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        for (var f : DATE_PATTERNS) {
            try { return LocalDate.parse(s.trim(), f); } catch (Exception ignored) {}
        }
        return null;
    }
}