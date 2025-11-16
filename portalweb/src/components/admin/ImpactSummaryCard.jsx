// src/components/admin/ImpactSummaryCard.jsx
import estudiantesImg from "@/assets/admin/estudiantes.png";

function StatusRow({ value, label, color }) {
  return (
    <div className="flex items-center gap-2">
      {/* Número un poco más grande */}
      <span className="w-7 sm:w-8 text-right text-sm sm:text-base font-semibold text-white/90">
        {value}
      </span>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {/* Texto más grande, pero menor que el número */}
      <span className="text-xs sm:text-sm text-white/85">{label}</span>
    </div>
  );
}

export default function ImpactSummaryCard({ total, completed, inProgress }) {
  return (
    <div className="rounded-[999px] bg-[#2a2e40] px-7 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-7 shadow-[0_18px_40px_rgba(0,0,0,0.45)] border border-black/20 flex items-center gap-6 sm:gap-8">
      {/* Icono izquierda */}
      <div className="shrink-0 pl-1">
        <img
          src={estudiantesImg}
          alt="Estudiantes"
          className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
          draggable={false}
        />
      </div>

      {/* Número grande + texto */}
      <div className="flex items-center gap-4 sm:gap-5">
        <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-none">
          {total}
        </span>
        <div className="flex flex-col justify-center leading-tight text-xs sm:text-sm">
          <p className="text-white/85">Estudiantes</p>
          <p className="text-white/85">impactados</p>
        </div>
      </div>

      {/* Estados derecha */}
      <div className="ml-auto flex flex-col gap-1.5 sm:gap-2 pr-1">
        <StatusRow
          value={completed}
          label="Finalizado"
          color="#22c55e"
        />
        <StatusRow
          value={inProgress}
          label="En proceso"
          color="#06b6d4"
        />
      </div>
    </div>
  );
}
