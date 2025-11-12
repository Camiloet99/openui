import React from "react";

export default function Spinner({
  size = 84,
  stroke = 10,
  label = "Cargando…",
  className = "",
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div
      className={`grid place-items-center gap-3 text-white/80 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_8px_20px_rgba(89,68,249,0.25)]"
      >
        <defs>
          {/* Mismo gradiente que usas en los progress donuts */}
          <linearGradient id="spin-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#74E0E6" />
            <stop offset="50%" stopColor="#7B6CFF" />
            <stop offset="100%" stopColor="#5B7CFF" />
          </linearGradient>
        </defs>

        {/* Pista tenue */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,.12)"
          strokeWidth={stroke}
        />

        {/* Arco activo */}
        <g>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#spin-g)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * 0.28} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Rotación infinita */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${size / 2} ${size / 2}`}
            to={`360 ${size / 2} ${size / 2}`}
            dur="1.2s"
            repeatCount="indefinite"
          />
        </g>
      </svg>

      <span className="text-sm tracking-wide">{label}</span>
    </div>
  );
}
