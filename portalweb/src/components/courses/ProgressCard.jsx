import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdCheckBox } from "react-icons/md";

export default function ProgressCard({ progressMap, className = "" }) {
  const WEIGHTS = useMemo(
    () => ({
      "test-inicial": 10,
      "test-salida": 10,
      "punto-cero-calma": 20,
      "bosque-emociones": 20,
      "jardin-mental": 20,
      "lago-suenos": 20,
    }),
    []
  );

  const targetPercent = useMemo(() => {
    let total = 0,
      done = 0;
    for (const [key, w] of Object.entries(WEIGHTS)) {
      total += w;
      if (progressMap.get(key)) done += w;
    }
    return Math.round((done / total) * 100) || 0;
  }, [progressMap, WEIGHTS]);

  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const [dashOffset, setDashOffset] = useState(c);
  const firstRun = useRef(true);

  useEffect(() => {
    const offset = c * (1 - targetPercent / 100);
    if (firstRun.current) {
      const t = setTimeout(() => setDashOffset(offset), 50);
      firstRun.current = false;
      return () => clearTimeout(t);
    }
    setDashOffset(offset);
  }, [targetPercent, c]);

  const gradId = "pg-neon-grad";
  const glowId = "pg-neon-glow";

  return (
    <div
      className={`rounded-[20px] ring-1 ring-white/10 p-5
                  bg-white/5 backdrop-blur-md
                  flex items-center justify-between gap-4 ${className}`}
    >
      <svg
        width={160}
        height={160}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label={`Progreso ${targetPercent}%`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="pg-bg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(91,124,255,0.25)" />
            <stop offset="60%" stopColor="rgba(22,30,60,0.45)" />
            <stop offset="100%" stopColor="rgba(11,18,56,0.8)" />
          </radialGradient>

          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8BE7F0" />
            <stop offset="45%" stopColor="#8B7BFF" />
            <stop offset="100%" stopColor="#6B83FF" />
          </linearGradient>

          <filter
            id={glowId}
            x={-size}
            y={-size}
            width={size * 3}
            height={size * 3}
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur in="blur1" stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="pg-inner" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#89B5FF" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#89B5FF" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#89B5FF" stopOpacity="0.00" />
          </radialGradient>
          <filter
            id="innerGlow"
            x={-size}
            y={-size}
            width={size * 3}
            height={size * 3}
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <circle cx={size / 2} cy={size / 2} r={r} fill="url(#pg-bg)" />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - stroke * 0.8}
          fill="url(#pg-inner)"
          filter="url(#innerGlow)"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)",
          }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={`url(#${glowId})`}
        />

        <g
          transform={`translate(${size / 2 - 9}, ${size / 2 - 16})`}
          opacity="0.9"
        >
          <rect
            x="0"
            y="8"
            width="4"
            height="16"
            rx="2"
            fill="white"
            opacity="0.8"
          />
          <rect
            x="8"
            y="0"
            width="4"
            height="24"
            rx="2"
            fill="white"
            opacity="0.9"
          />
          <rect
            x="16"
            y="12"
            width="4"
            height="12"
            rx="2"
            fill="white"
            opacity="0.8"
          />
        </g>
      </svg>

      <div className="flex flex-col items-start pr-1">
        <div className="flex items-baseline gap-2 leading-none">
          <span className="text-4xl font-semibold tracking-tight">
            {targetPercent}%
          </span>
        </div>
        <span className="text-sm text-white/80 mt-1">Completado</span>

        <div className="mt-3 flex items-center gap-2 text-white/90">
          <MdCheckBox className="text-2xl" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
