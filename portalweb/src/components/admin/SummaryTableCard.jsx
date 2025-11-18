// src/components/admin/SummaryTableCard.jsx
import { useMemo, useState } from "react";
import Spinner from "@/components/ui/Spinner";

function getCompletionState(rawStatus) {
  const progress = getProgressFromStatus(rawStatus);
  return progress >= 100 ? "complete" : "progress";
}

function StatusPill({ status }) {
  const state = getCompletionState(status); // "complete" o "progress"
  const isComplete = state === "complete";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium",
        isComplete
          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/60"
          : "bg-sky-500/10 text-sky-300 border border-sky-500/60",
      ].join(" ")}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {isComplete ? "Finalizado" : "En proceso"}
    </span>
  );
}

function getProgressFromStatus(rawStatus) {
  // Caso nuevo: número directo (0-100)
  if (typeof rawStatus === "number" && !Number.isNaN(rawStatus)) {
    return Math.min(Math.max(rawStatus, 0), 100);
  }

  // Caso string numérica: "80"
  if (typeof rawStatus === "string") {
    const parsed = parseInt(rawStatus, 10);
    if (!Number.isNaN(parsed)) {
      return Math.min(Math.max(parsed, 0), 100);
    }
  }

  // Compatibilidad hacia atrás: antes enviábamos "complete" / "progress"
  if (rawStatus === "complete") return 100;
  if (rawStatus === "progress") return 60;

  // Por defecto, nada hecho
  return 0;
}

/** Header con icono de orden y estado activo */
function SortableHeader({ label, field, sortConfig, onSort }) {
  const isActive = sortConfig.field === field;
  const isAsc = sortConfig.direction === "asc";

  return (
    <th className="py-2 px-4 text-left font-medium">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 text-[11px] md:text-xs text-white/60 hover:text-white/90 transition-colors"
      >
        <span>{label}</span>
        <span className="inline-flex flex-col leading-none">
          {/* flecha arriba */}
          <svg
            className={`h-2.5 w-2.5 ${
              isActive && isAsc ? "opacity-100" : "opacity-40"
            }`}
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path d="M6 3L3.5 6h5L6 3z" fill="currentColor" />
          </svg>
          {/* flecha abajo */}
          <svg
            className={`h-2.5 w-2.5 -mt-[2px] ${
              isActive && !isAsc ? "opacity-100" : "opacity-40"
            }`}
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path d="M6 9l2.5-3h-5L6 9z" fill="currentColor" />
          </svg>
        </span>
      </button>
    </th>
  );
}

export default function SummaryTableCard({
  users,
  loading,
  error,
  page = 0,
  size = 20,
  total = 0,
  onPageChange,
}) {
  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc",
  });

  const handleSort = (field) => {
    setSortConfig((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  };

  const sortedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    const dir = sortConfig.direction === "asc" ? 1 : -1;

    const getValue = (u) => {
      switch (sortConfig.field) {
        case "name":
          return u.name || "";
        case "subregion":
          return u.subregion || "";
        case "municipio":
          return u.municipio || "";
        case "genero":
          return u.genero || "";
        case "edad":
          return typeof u.edad === "number"
            ? u.edad
            : parseInt(u.edad ?? "0", 10) || 0;
        case "enfoque":
          return u.enfoqueDiferencial || "";
        case "programa":
          return u.programa || "";
        case "nivel":
          return typeof u.nivel === "number"
            ? u.nivel
            : parseInt(u.nivel ?? "0", 10) || 0;
        case "avance":
          return getProgressFromStatus(u.experienceStatus);
        case "status":
          return u.experienceStatus || "";
        default:
          return "";
      }
    };

    const clone = [...users];
    clone.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);

      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb)) * dir;
    });

    return clone;
  }, [users, sortConfig]);

  const totalPages = Math.max(Math.ceil(total / size), 1);
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  const handlePrev = () => {
    if (!onPageChange || !canGoPrev) return;
    onPageChange(page - 1);
  };

  const handleNext = () => {
    if (!onPageChange || !canGoNext) return;
    onPageChange(page + 1);
  };

  return (
    <section className="rounded-[32px] bg-[#2a2e40] border border-black/20 px-5 py-4 md:px-6 md:py-5 shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold">Tabla resumen</h3>
        <span className="text-[11px] md:text-xs text-white/60">
          Estados:{" "}
          <span className="text-emerald-300 font-medium">Finalizado</span> /{" "}
          <span className="text-sky-300 font-medium">En proceso</span>
        </span>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-white/70">
          No hay usuarios registrados aún.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <SortableHeader
                    label="Estudiante"
                    field="name"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Subregión"
                    field="subregion"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Municipio"
                    field="municipio"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Género"
                    field="genero"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Edad"
                    field="edad"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Enfoque diferencial"
                    field="enfoque"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Programa"
                    field="programa"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Nivel"
                    field="nivel"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="% de avance"
                    field="avance"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Tasa de finalización"
                    field="status"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u) => {
                  const progress = getProgressFromStatus(u.experienceStatus);
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
                    >
                      {/* Estudiante */}
                      <td className="py-2 pr-4 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm text-white/75">
                            {u.name || "-"}
                          </span>
                          <span className="text-[11px] text-white/50">
                            {u.email}
                          </span>
                        </div>
                      </td>

                      {/* Subregión */}
                      <td className="py-2 px-4 align-middle text-[11px] md:text-xs">
                        {u.subregion || "-"}
                      </td>

                      {/* Municipio */}
                      <td className="py-2 px-4 align-middle text-[11px] md:text-xs">
                        {u.municipio || "-"}
                      </td>

                      {/* Género */}
                      <td className="py-2 px-4 align-middle text-[11px] md:text-xs">
                        {u.genero || "-"}
                      </td>

                      {/* Edad */}
                      <td className="py-2 px-4 align-middle text-[11px] md:text-xs">
                        {u.edad ?? "-"}
                      </td>

                      {/* Enfoque diferencial */}
                      <td className="py-2 px-4 align-middle text-[11px] md:text-xs max-w-[200px]">
                        <span className="line-clamp-2">
                          {u.enfoqueDiferencial || "-"}
                        </span>
                      </td>

                      {/* Programa */}
                      <td className="py-2 px-4 align-middle text-[11px] md:text-xs max-w-[200px]">
                        <span className="line-clamp-2">
                          {u.programa || "-"}
                        </span>
                      </td>

                      {/* Nivel */}
                      <td className="py-2 px-4 align-middle text-[11px] md:text-xs">
                        {u.nivel ?? "-"}
                      </td>

                      {/* % de avance */}
                      <td className="py-2 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="relative h-2 w-20 sm:w-24 md:w-28 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-400"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] md:text-xs text-white/70">
                            {progress}%
                          </span>
                        </div>
                      </td>

                      {/* Tasa de finalización */}
                      <td className="py-2 px-4 align-middle">
                        <StatusPill status={u.experienceStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          <div className="mt-4 flex items-center justify-between text-[11px] md:text-xs text-white/70">
            <span>
              Página {page + 1} de {totalPages} · {users.length} registros en
              esta página · {total} total
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={[
                  "px-3 py-1 rounded-full border border-white/20",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "hover:bg-white/10 transition-colors",
                ].join(" ")}
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                className={[
                  "px-3 py-1 rounded-full border border-white/20",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "hover:bg-white/10 transition-colors",
                ].join(" ")}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
