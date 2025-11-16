// src/components/admin/GeoMapCard.jsx
import mapaImg from "@/assets/admin/mapa.png";

export default function GeoMapCard() {
  return (
    <div className="relative flex h-full flex-col">
      {/* Mapa grande ocupando casi todo el alto disponible */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src={mapaImg}
          alt="Mapa"
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
      </div>

      {/* Botón Informe PDF abajo a la derecha */}
      <div className="mt-4 flex justify-end">
        <button
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
            transition
          "
        >
          Informe PDF
        </button>
      </div>
    </div>
  );
}
