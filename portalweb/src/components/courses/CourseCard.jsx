// src/components/courses/CourseCard.jsx
import {
  MdShare,
  MdEmojiEmotions,
  MdAutoAwesome,
  MdArrowForward,
} from "react-icons/md";

export default function CourseCard({
  title,
  subtitle,
  img,
  onClick = () => {},
  statusLogoSrc,
  className = "",
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-[24px] ring-1 ring-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,.45)] hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,.55)] transition-shadow ${className}`}
    >
      <img
        src={img}
        alt={title}
        className="h-48 w-full object-cover md:h-56"
      />

      {/* Overlay principal (ya lo tenías) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1238]/75 via-[#0B1238]/40 to-transparent" />

      {/* Faja sutil para realzar texto cerca a la base */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B1238]/80 via-[#0B1238]/20 to-transparent" />

      {/* Contenido: anclado abajo */}
      <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end">
        <div className="relative max-w-[90%] md:max-w-[80%]">
          {/* Ribbon/chip translúcido que “abraza” el título */}
          <div className="inline-block rounded-xl px-3 py-1.5 bg-gradient-to-r from-white/12 via-white/8 to-transparent backdrop-blur-[2px] ring-1 ring-white/10">
            <h3 className="text-[17px] md:text-xl font-semibold leading-snug text-white drop-shadow-sm tracking-[-0.01em]">
              {title}
            </h3>
          </div>

          {/* Barrita glow que conversa con el degradado */}
          <div className="mt-2 h-[2px] w-16 md:w-20 bg-gradient-to-r from-cyan-300/80 via-sky-300/80 to-indigo-300/70 rounded-full shadow-[0_0_12px_rgba(125,211,252,0.55)]" />

          {/* Subtítulo con mejor legibilidad y clamp */}
          <p className="mt-2 text-[13px] md:text-sm text-white/85 leading-snug drop-shadow line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Botón/logo: flotante abajo-derecha, pulido */}
        <button
          type="button"
          onClick={onClick}
          className="group absolute bottom-4 right-4 -mb-0.5 p-0 bg-transparent border-0
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                     transition-transform duration-200 ease-out
                     hover:scale-105 active:scale-95 cursor-pointer
                     hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
          aria-label={`Abrir ${title}`}
          title={title}
        >
          {statusLogoSrc ? (
            <img
              src={statusLogoSrc}
              alt=""
              className="h-12 w-auto object-contain select-none pointer-events-none
                         transition-all duration-200 ease-out
                         group-hover:-translate-y-[1px] group-hover:brightness-110
                         group-active:brightness-95"
              draggable={false}
            />
          ) : (
            <span className="sr-only">Abrir</span>
          )}
        </button>
      </div>
    </article>
  );
}

export const CardIcons = {
  MdShare,
  MdEmojiEmotions,
  MdAutoAwesome,
  MdArrowForward,
};
