import PropTypes from "prop-types";
import bgDefault from "@/assets/courses/hero.jpg";
import { MdArrowForward } from "react-icons/md";

export default function Hero({
  title = "Test de inicio",
  subtitle = "Conoce a ti mismo",
  ctaLabel = "Empezar",
  onCtaClick = () => {},
  bgImage = bgDefault,
  badge,
  className = "",
  reminder = null,
}) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[28px] ring-1 ring-white/10",
        // sombra elegante (no heavy)
        "shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]",
        "transition-shadow duration-200 hover:shadow-[0_22px_55px_-20px_rgba(0,0,0,0.6)]",
        className,
      ].join(" ")}
      aria-label={title}
    >
      <img
        src={bgImage}
        alt=""
        aria-hidden
        className="h-[220px] w-full object-cover md:h-[280px] lg:h-[320px] select-none"
        draggable={false}
      />

      {/* overlay sutil con un poco más de soporte en la base */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/0" />

      {/* contenedor de texto anclado abajo */}
      <div className="absolute inset-0 flex items-end">
        <div className="space-y-2 px-6 py-5 sm:px-8 sm:py-7">
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl drop-shadow">
            {title}
          </h2>
          <p className="text-white/85 drop-shadow-sm">{subtitle}</p>

          {/* Reminder primera vez */}
          {reminder && (
            <div
              className="mt-2 inline-flex items-center gap-3 rounded-2xl
                         bg-white/10 ring-1 ring-white/15 backdrop-blur px-3.5 py-2
                         shadow-[0_8px_20px_-10px_rgba(0,0,0,0.55)]"
              role="note"
              aria-live="polite"
            >
              <span className="text-sm text-white/90">{reminder.text}</span>
              <button
                onClick={reminder.onAction}
                className="inline-flex items-center rounded-full bg-white/20 hover:bg-white/25
                           active:bg-white/30 transition px-3 py-1.5 text-xs font-medium
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {reminder.actionLabel}
              </button>
            </div>
          )}

          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 rounded-full bg-[#6C4CFF]
                       px-5 py-2.5 text-sm font-medium
                       transition-transform duration-150
                       hover:bg-[#5944F9] active:scale-[0.98]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                       shadow-[0_6px_18px_-8px_rgba(108,76,255,0.9)]
                       hover:shadow-[0_8px_22px_-8px_rgba(108,76,255,1)]
                       cursor-pointer"
            aria-label={ctaLabel}
            title={ctaLabel}
          >
            {ctaLabel} <MdArrowForward className="text-base" />
          </button>
        </div>
      </div>

      {badge && (
        <span
          className="absolute right-4 top-4 rounded-full bg-white/12 px-3 py-1 text-xs
                     ring-1 ring-white/15 backdrop-blur-[1px]
                     shadow-[0_6px_16px_-8px_rgba(0,0,0,0.5)]"
        >
          {badge}
        </span>
      )}
    </section>
  );
}

Hero.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  ctaLabel: PropTypes.string,
  onCtaClick: PropTypes.func,
  bgImage: PropTypes.string,
  badge: PropTypes.string,
  className: PropTypes.string,
  reminder: PropTypes.shape({
    text: PropTypes.string.isRequired,
    actionLabel: PropTypes.string.isRequired,
    onAction: PropTypes.func.isRequired,
  }),
};
