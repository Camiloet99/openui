// src/components/admin/ParticipationSliderCard.jsx
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const COLORS_SUBREGION = ["#5D5FEF", "#29C6F8", "#A855F7", "#facc15"];
const COLORS_GENERO = ["#38bdf8", "#fbbf24"];
const COLORS_EDAD = ["#a3e635", "#f97316", "#ef4444"];
const COLORS_ENFOQUE = [
  "#22c55e",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#0ea5e9",
  "#9ca3af",
];

function buildPercentSeries(counts) {
  const total = Object.values(counts).reduce((acc, v) => acc + v, 0) || 1;
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export default function ParticipationSliderCard({ users }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 → derecha, -1 → izquierda

  const slides = useMemo(() => {
    // Subregión
    const subregionCounts = users.reduce((acc, u) => {
      const key = u.subregion || "Sin subregión";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const subregionSeries = buildPercentSeries(subregionCounts);

    // Género
    const generoCounts = users.reduce((acc, u) => {
      const raw = (u.genero || "").toUpperCase();
      let key = raw;
      if (raw.includes("MASC")) key = "Hombres";
      if (raw.includes("FEM")) key = "Mujeres";
      if (!key) key = "Sin dato";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const generoSeries = buildPercentSeries(generoCounts);

    // Edad (rangos)
    const edadCounts = users.reduce(
      (acc, u) => {
        const edad = typeof u.edad === "number" ? u.edad : parseInt(u.edad, 10);
        if (!edad || Number.isNaN(edad)) {
          acc["Sin dato"] = (acc["Sin dato"] || 0) + 1;
          return acc;
        }
        if (edad <= 17) acc["15 - 17"] = (acc["15 - 17"] || 0) + 1;
        else if (edad <= 24) acc["18 - 24"] = (acc["18 - 24"] || 0) + 1;
        else acc["25 en adelante"] = (acc["25 en adelante"] || 0) + 1;
        return acc;
      },
      { "15 - 17": 0, "18 - 24": 0, "25 en adelante": 0 }
    );
    const edadSeries = buildPercentSeries(edadCounts);

    // Enfoque diferencial
    const enfoqueCounts = users.reduce((acc, u) => {
      const key = u.enfoqueDiferencial || "No aplica";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const enfoqueSeries = buildPercentSeries(enfoqueCounts);

    return [
      {
        key: "subregion",
        title: "% de participación por subregión",
        series: subregionSeries,
        colors: COLORS_SUBREGION,
      },
      {
        key: "genero",
        title: "% de participación por género",
        series: generoSeries,
        colors: COLORS_GENERO,
      },
      {
        key: "edad",
        title: "% de participación por edad",
        series: edadSeries,
        colors: COLORS_EDAD,
      },
      {
        key: "enfoque",
        title: "% de participación enfoque diferencial",
        series: enfoqueSeries,
        colors: COLORS_ENFOQUE,
      },
    ];
  }, [users]);

  const totalSlides = slides.length;
  const current = slides[index] ?? slides[0];

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % totalSlides);
  };

  if (!current) return null;

  /** 🎯 Donut dinámico sin huecos oscuros:
   *   - Usa 0%–100% en lugar de grados.
   *   - No añade segmento de relleno.
   */
  const donutGradient = (() => {
    const series = current.series || [];
    if (!series.length) {
      return "conic-gradient(from -90deg, #4f46e5 0 100%)";
    }

    const total = series.reduce((acc, item) => acc + item.count, 0) || 1;
    let accPercent = 0;
    const segments = series.map((item, idx) => {
      const fraction = item.count / total;
      const start = accPercent;
      const end = accPercent + fraction * 100;
      accPercent = end;
      const color =
        current.colors[idx] ||
        current.colors[current.colors.length - 1] ||
        "#64748b";
      return `${color} ${start}% ${end}%`;
    });

    // Llenamos el círculo completo con los colores de la serie
    return `conic-gradient(from -90deg, ${segments.join(",")})`;
  })();

  const variants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 32 : -32,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -32 : 32,
    }),
  };

  return (
    <div className="rounded-[32px] bg-[#2a2e40] border border-black/20 px-6 py-5 md:px-7 md:py-6 shadow-[0_16px_36px_rgba(0,0,0,0.45)] overflow-hidden">
      {/* Header con flechas y título */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 transition"
        >
          <span className="sr-only">Anterior</span>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12.5 4.5L7 10l5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h3 className="text-sm md:text-base font-semibold text-white text-center">
          {current.title}
        </h3>

        <button
          type="button"
          onClick={handleNext}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 transition"
        >
          <span className="sr-only">Siguiente</span>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.5 4.5L13 10l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current.key}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col lg:flex-row gap-6 mt-2"
        >
          {/* ⭕ Donut dinámico (ocupando más espacio, sin borde oscuro grande) */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative h-40 w-40 md:h-48 md:w-48"
            >
              {/* Glow exterior */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/40 to-sky-400/30 blur-xl" />

              {/* Donut “grande” centrado */}
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="relative h-[82%] w-[82%] rounded-full bg-[#24293F] border border-white/10 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-90"
                    style={{ background: donutGradient }}
                  />
                  {/* Agujero central un poco más pequeño para que el aro se vea grueso */}
                  <div className="absolute inset-[26%] rounded-full bg-[#1F2336]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Leyenda derecha */}
          <div className="flex-1 space-y-3">
            {current.series.map((item, idx) => {
              const color =
                current.colors[idx] ||
                current.colors[current.colors.length - 1] ||
                "#64748b";
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs md:text-sm text-white/85">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] md:text-xs text-white/70">
                    <span>{item.percent}%</span>
                    <span className="text-white/40">·</span>
                    <span>
                      {item.count}{" "}
                      {item.count === 1 ? "estudiante" : "estudiantes"}
                    </span>
                  </div>
                </div>
              );
            })}

            {current.series.length === 0 && (
              <p className="text-xs text-white/60">
                Aún no hay datos suficientes para esta vista.
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Paginador 1/4 */}
      <div className="mt-4 flex justify-end">
        <span className="text-xs text-white/60">
          {index + 1}/{totalSlides}
        </span>
      </div>
    </div>
  );
}
