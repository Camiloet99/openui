import React, { useMemo } from "react";

export default function ActionList({
  progressMap,
  onClick = () => {},
  testInitialDone = false,
  testExitDone = false,
}) {
  const items = useMemo(
    () => [
      { key: "test-inicial", label: "Test inicial" },
      { key: "test-salida", label: "Test de salida " },
      { key: "contacto", label: "Contacto – Email" },
    ],
    []
  );

  const resolveSrc = (key) =>
    new URL(`../../assets/courses/nocomplete/${key}.png`, import.meta.url).href;

  const resolveBg = (key, completed) => {
    if (key === "contacto") return "#6EB9FF"; // siempre color
    if (!completed) return "transparent";
    if (key === "test-inicial") return "#5944F9";
    if (key === "test-salida") return "#0094FD";
    return "transparent";
  };

  const handleKey = (e, key, disabled) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) onClick(key);
    }
  };

  return (
    <div
      className="rounded-[20px] bg-white/5 backdrop-blur-md p-4 ring-1 ring-white/10
                 h-full min-h-[260px]"
      aria-label="Acciones"
    >
      <div className="grid grid-rows-3 gap-3 h-full">
        {items.map(({ key, label }) => {
          const src = resolveSrc(key);

          const isCompleted =
            key === "test-inicial"
              ? !!testInitialDone
              : key === "test-salida"
              ? !!testExitDone
              : progressMap.get(key) ?? false;

          const disabled =
            (key === "test-inicial" && testInitialDone) ||
            (key === "test-salida" && testExitDone);

          const bg = resolveBg(key, isCompleted);

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => !disabled && onClick(key)}
              onKeyDown={(e) => handleKey(e, key, disabled)}
              className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl px-1
                         cursor-pointer transition-transform duration-150 ease-out
                         focus-visible:outline-none
                         ${
                           disabled
                             ? "opacity-60 cursor-not-allowed"
                             : "hover:translate-x-[1px]"
                         }`}
              aria-label={label}
              aria-disabled={disabled ? "true" : "false"}
              title={label}
            >
              {/* Botón: solo imagen; fondo depende de estado */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onClick(key);
                }}
                className={`h-12 w-12 grid place-items-center rounded-xl ring-1 ring-white/40
                           transition-all duration-200 ease-out
                           hover:ring-white/70 focus:outline-none
                           focus-visible:ring-2 focus-visible:ring-white/80
                           ${
                             disabled
                               ? ""
                               : "hover:scale-105 active:scale-95 cursor-pointer"
                           }
                           hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]`}
                style={{ backgroundColor: bg }}
                aria-label={label}
                title={label}
              >
                <img
                  src={src}
                  alt=""
                  className="h-7 w-auto object-contain select-none pointer-events-none
                             transition-all duration-200 ease-out
                             group-hover:translate-y-[-1px] group-hover:brightness-110"
                  draggable={false}
                />
              </button>

              {/* Label al lado (misma línea) */}
              <span
                className="text-[14px] text-white/90 group-hover:text-white
                           transition-colors duration-150 truncate"
              >
                {label}
              </span>

              {/* Chip “Hecho” compacto en línea (no aumenta alto) */}
              {isCompleted && (
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 h-6
                             text-[11px] leading-none text-white/90
                             ring-1 ring-white/15 bg-white/10"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Hecho
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
