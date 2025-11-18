// src/components/admin/GeoMapCard.jsx
import { useMemo, useState } from "react";
import { exportAdminUsers } from "@/services/adminService";
import mapaImg from "@/assets/admin/mapa.png";

import tag1 from "@/assets/admin/tags/tag1.png";
import tag2 from "@/assets/admin/tags/tag2.png";
import tag3 from "@/assets/admin/tags/tag3.png";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TAG_IMAGES = [tag1, tag2, tag3];

// 🔹 Activa esto en true mientras ajustas posiciones
const DEBUG_SHOW_ALL_SUBREGIONS = false;

const SUBREGION_CONFIG = {
  "Bajo Cauca": { top: "30%", left: "65%" },
  "Magdalena Medio": { top: "68%", left: "80%" },
  Nordeste: { top: "50%", left: "70%" },
  Norte: { top: "53%", left: "50%" },
  Occidente: { top: "55%", left: "30%" },
  Oriente: { top: "80%", left: "65%" },
  Suroeste: { top: "78%", left: "37%" },
  Uraba: { top: "30%", left: "15%" },
  "Valle del Aburra": { top: "75%", left: "48%" },
};

export default function GeoMapCard({ users = [] }) {
  const [isExporting, setIsExporting] = useState(false);

  const { presentSubregions, countsBySubregion } = useMemo(() => {
    const counts = {};

    users.forEach((u) => {
      const raw = u?.subregion;
      if (!raw) return;

      const name = String(raw).trim();
      if (!SUBREGION_CONFIG[name]) return;

      counts[name] = (counts[name] || 0) + 1;
    });

    let present;

    if (DEBUG_SHOW_ALL_SUBREGIONS) {
      // Mostrar todas para ajustar posiciones
      present = Object.keys(SUBREGION_CONFIG);

      // Aseguramos que todas tengan al menos 0
      present.forEach((sr) => {
        if (typeof counts[sr] !== "number") {
          counts[sr] = 0;
        }
      });
    } else {
      // Solo las que realmente aparecen en users
      present = Object.keys(counts);
    }

    return { presentSubregions: present, countsBySubregion: counts };
  }, [users]);

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);

      // 1) Traer todos los usuarios del backend
      const data = await exportAdminUsers(); // Array<UserWithExperienceStatusRes>

      // 2) Crear el PDF (landscape)
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(14);
      doc.text("Informe de participación – Antioquia", 14, 15);

      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, 14, 22);

      // 3) Armar encabezados y filas
      const head = [
        [
          "Nombre",
          "Email",
          "Municipio",
          "Subregión",
          "Estado experiencia",
          "Género",
          "Edad",
          "Enfoque diferencial",
          "Nivel",
          "Programa",
        ],
      ];

      const body = (data ?? []).map((u) => [
        u.name ?? "",
        u.email ?? "",
        u.subregion ?? "",
        u.municipio ?? "",
        u.experienceStatus ?? "",
        u.genero ?? "",
        u.edad != null ? String(u.edad) : "",
        u.enfoqueDiferencial ?? "",
        u.nivel ?? "",
        u.programa ?? "",
      ]);

      // 4) Tabla con autoTable (versión moderna)
      autoTable(doc, {
        head,
        body,
        startY: 26,
        styles: {
          fontSize: 8,
        },
        headStyles: {
          fillColor: [41, 55, 92], // azul oscurito
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // 5) Descargar
      doc.save("informe-participacion-antioquia.pdf");
    } catch (err) {
      console.error("Error exportando PDF", err);
      alert("Error al generar el PDF. Intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <img
            src={mapaImg}
            alt="Mapa Antioquia"
            className="
              w-full
              max-w-[520px]
              lg:max-w-[600px]
              xl:max-w-[680px]
              h-auto
              max-h-[420px]
              object-contain
            "
            draggable={false}
          />

          {presentSubregions.map((subregion, index) => {
            const config = SUBREGION_CONFIG[subregion];
            if (!config) return null;

            const tagImg = TAG_IMAGES[index % TAG_IMAGES.length];
            const count = countsBySubregion[subregion] ?? 0;

            return (
              <div
                key={subregion}
                className="
                  absolute
                  -translate-x-1/2
                  -translate-y-1/2
                  group
                "
                style={{
                  top: config.top,
                  left: config.left,
                }}
              >
                {/* Tag en el mapa */}
                <img
                  src={tagImg}
                  alt={`Participación en ${subregion}`}
                  className="
                    cursor-default
                    select-none
                    w-5 h-5
                    sm:w-6 sm:h-6
                    lg:w-7 lg:h-7
                  "
                  draggable={false}
                />

                {/* Tooltip con nombre + conteo */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    -top-2
                    -translate-x-1/2
                    -translate-y-full
                    opacity-0
                    group-hover:opacity-100
                    group-hover:-translate-y-[120%]
                    bg-slate-900/95
                    text-white
                    text-[10px]
                    sm:text-xs
                    px-2
                    py-1
                    rounded-full
                    whitespace-nowrap
                    shadow-lg
                    border border-white/10
                    transition-all
                    duration-150
                  "
                >
                  <span className="font-medium">{subregion}</span>
                  <span className="mx-1">·</span>
                  <span className="opacity-80">
                    {count} participante{count === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleExportPdf}
          disabled={isExporting}
          className="
            inline-flex items-center gap-2
            rounded-full
            bg-[#2a2e40]
            px-4 py-2
            text-xs sm:text-sm
            text-white/85
            shadow-[0_8px_20px_rgba(0,0,0,0.35)]
            border border-white/10
            hover:bg-[#32364a]
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition
          "
        >
          {isExporting ? "Generando PDF..." : "Informe PDF"}
        </button>
      </div>
    </div>
  );
}
