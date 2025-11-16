// src/components/admin/SubregionStatsCard.jsx
import tag1 from "@/assets/admin/tags/tag1.png";
import tag2 from "@/assets/admin/tags/tag2.png";
import tag3 from "@/assets/admin/tags/tag3.png";

const SUBREGION_TAGS = {
  "Bajo Cauca": { tag: tag1, color: "#5D5FEF" },
  Nordeste: { tag: tag2, color: "#29C6F8" },
  Occidente: { tag: tag3, color: "#A855F7" },
};

export default function SubregionStatsCard({ total, subregionStats, hasData }) {
  return (
    <div className="rounded-3xl bg-[#24293F] border border-white/5 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold">
          % de participación por subregión
        </h3>
        <span className="text-xs text-white/50">
          {hasData ? "Datos en tiempo real" : "Sin datos"}
        </span>
      </div>

      <div className="mt-4 flex flex-col lg:flex-row gap-6">
        {/* “Diagrama de torta” simplificado */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/40 to-sky-400/30 blur-xl" />
            <div className="relative grid place-items-center h-full w-full rounded-full border border-white/10 bg-[#1A1D2E]">
              <div className="relative h-24 w-24 rounded-full bg-[#24293F] border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(#5D5FEF_0_120deg,#29C6F8_120deg_210deg,#A855F7_210deg_360deg)] opacity-80" />
                <div className="absolute inset-[18%] rounded-full bg-[#1A1D2E]" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <p className="text-[11px] text-white/60 mb-0.5">
                  Total estudiantes
                </p>
                <p className="text-lg font-semibold">{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista por subregión */}
        <div className="flex-1 space-y-3">
          {subregionStats.map((s) => {
            const tagCfg = SUBREGION_TAGS[s.subregion] || {};
            const color = tagCfg.color || "#64748b";
            const percentWidth = `${Math.min(s.percent, 100)}%`;
            return (
              <div key={s.subregion} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {tagCfg.tag && (
                      <img
                        src={tagCfg.tag}
                        alt=""
                        className="h-4 w-4 object-contain"
                        draggable={false}
                      />
                    )}
                    <span className="text-sm font-medium">{s.subregion}</span>
                  </div>
                  <span className="text-xs text-white/60">
                    {s.percent}% ({s.count} est.)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: percentWidth,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {subregionStats.length === 0 && (
            <p className="text-xs text-white/60">
              Aún no hay estudiantes con subregión registrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
