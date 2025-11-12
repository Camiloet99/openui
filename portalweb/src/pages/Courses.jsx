import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/components/courses/Hero";
import CourseCard, { CardIcons } from "@/components/courses/CourseCard";
import ActionList from "@/components/courses/ActionList";
import ProgressCard from "@/components/courses/ProgressCard";
import { getMyProgress } from "@/services/progressService";
import Spinner from "@/components/ui/Spinner";

import card1 from "@/assets/courses/card-1.png";
import card2 from "@/assets/courses/card-2.jpg";
import card3 from "@/assets/courses/card-3.jpg";
import card4 from "@/assets/courses/card-4.jpg";

import partner1 from "@/assets/partner-1-white.png";
import partner2 from "@/assets/partner-2-white.png";
import { useNavigate } from "react-router-dom";

/**
 * UX/UI improvements included:
 * - Skeleton loader for page sections (Hero / Sidebar / Cards) with subtle shimmer
 * - Error state with retry
 * - Smart CTA label depending on user progress
 * - Soft entrance animations and micro-interactions (Framer Motion)
 * - Better accessibility: semantic buttons, keyboard activation, aria labels
 * - Responsive polish + reduced layout shift (reserve space while loading)
 */

function shimmerClass() {
  return "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";
}

export default function Courses() {
  const cardsBase = useMemo(
    () => [
      {
        key: "punto-cero-calma",
        title: "Punto Cero CALMA",
        subtitle: "Donde inicia tu viaje interior",
        img: card1,
        ctaBg: "#1995F1",
        ctaIcon: <CardIcons.MdShare />,
      },
      {
        key: "bosque-emociones",
        title: "Bosque de las Emociones",
        subtitle: "Reconéctate con tu interior",
        img: card2,
        ctaBg: "#FFC107",
        ctaIcon: <CardIcons.MdEmojiEmotions />,
      },
      {
        key: "jardin-mental",
        title: "Jardín Mental",
        subtitle: "Siembra tus metas, florece tu mente",
        img: card3,
        ctaBg: "#8BC34A",
        ctaIcon: <CardIcons.MdAutoAwesome />,
      },
      {
        key: "lago-suenos",
        title: "Lago de los Sueños",
        subtitle: "El reflejo de tus libertades",
        img: card4,
        ctaBg: "#9C27B0",
        ctaIcon: <CardIcons.MdArrowForward />,
      },
    ],
    []
  );

  const [progress, setProgress] = useState([]);
  const [testFlags, setTestFlags] = useState({ initial: false, exit: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProgress = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const p = await getMyProgress();
      const mapped = [
        { key: "punto-cero-calma", completed: !!p.medalla1 },
        { key: "bosque-emociones", completed: !!p.medalla2 },
        { key: "jardin-mental", completed: !!p.medalla3 },
        { key: "lago-suenos", completed: !!p.medalla4 },
      ];
      setProgress(mapped);
      setTestFlags({ initial: !!p.testInitialDone, exit: !!p.testExitDone });
    } catch (e) {
      console.error("getMyProgress error:", e);
      setError("No pudimos cargar tu progreso. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchProgress();
    })();
    return () => {
      mounted = false;
    };
  }, [fetchProgress]);

  const isFirstTime = useMemo(() => {
    const anyMedal = progress.some((p) => p.completed);
    return !testFlags.initial && !anyMedal;
  }, [progress, testFlags]);

  const progressMap = useMemo(() => {
    const map = new Map(progress.map((p) => [p.key, p.completed]));
    map.set("test-inicial", !!testFlags.initial);
    map.set("test-salida", !!testFlags.exit);
    return map;
  }, [progress, testFlags]);

  const buildStatusLogoSrc = (index, completed) => {
    const folder = completed ? "complete" : "nocomplete";
    return new URL(
      `../assets/courses/${folder}/logo-${index + 1}.png`,
      import.meta.url
    ).href;
  };

  const goSmart = () => {
    const anyMedal = progress.some((p) => p.completed);
    if (!testFlags.initial && !anyMedal) {
      navigate("/test-inicial");
      return;
    }
    const allMedals =
      progress.length === 4 && progress.every((p) => p.completed);
    if (allMedals && !testFlags.exit) {
      navigate("/test-salida");
      return;
    }
    navigate("/experience");
  };

  const smartCtaLabel = useMemo(() => {
    const anyMedal = progress.some((p) => p.completed);
    if (!testFlags.initial && !anyMedal) return "Hacer test inicial";
    const allMedals =
      progress.length === 4 && progress.every((p) => p.completed);
    if (allMedals && !testFlags.exit) return "Hacer test de salida";
    return "Continuar experiencia";
  }, [progress, testFlags]);

  const cards = useMemo(() => {
    return cardsBase.map((c, i) => {
      const isCompleted = progressMap.get(c.key) ?? false;
      const statusLogoSrc = buildStatusLogoSrc(i, isCompleted);
      return {
        ...c,
        statusLogoSrc,
        onClick: goSmart,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goSmart();
          }
        },
        role: "button",
        tabIndex: 0,
        "aria-label": `${c.title} — ${
          isCompleted ? "Completado" : "Pendiente"
        }`,
      };
    });
  }, [cardsBase, progressMap]);

  return (
    <div className="mt-4 sm:mt-6 lg:mt-12 relative min-h-[calc(80vh-80px)] flex flex-col space-y-8 pb-[calc(84px+env(safe-area-inset-bottom))] sm:pb-0">
      {/* Fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950"
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[60vh]"
          >
            <PageSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="min-h-[60vh] grid place-items-center"
          >
            <div className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <p className="text-base text-white/90">{error}</p>
              <button
                onClick={fetchProgress}
                className="mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 transition"
              >
                Reintentar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="contents"
          >
            {/* Hero / ActionList / ProgressCard */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px_320px]">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Hero
                  title="Metaverso IU Digital"
                  subtitle="Conoce a ti mismo"
                  ctaLabel={smartCtaLabel}
                  onCtaClick={goSmart}
                  reminder={
                    isFirstTime
                      ? {
                          text: "Puedes personalizar tu avatar 3D en tu perfil.",
                          actionLabel: "Ir a mi perfil",
                          onAction: () => navigate("/profile"),
                        }
                      : null
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ActionList
                  progressMap={progressMap}
                  testInitialDone={testFlags.initial}
                  testExitDone={testFlags.exit}
                  onClick={(key) => {
                    if (key === "contacto") {
                      window.open("mailto:soporte@tu-dominio.com", "_blank");
                      return;
                    }
                    if (key === "test-inicial") {
                      if (testFlags.initial) return;
                      navigate("/test-inicial");
                      return;
                    }
                    if (key === "test-salida") {
                      if (testFlags.exit) return;
                      if (!testFlags.initial) {
                        navigate("/test-inicial");
                        return;
                      }
                      navigate("/test-salida");
                      return;
                    }
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <ProgressCard progressMap={progressMap} />
              </motion.div>
            </div>

            {/* Cards */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((c, idx) => (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * (idx + 1) }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CourseCard {...c} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

/** Skeleton page with reserved layout **/
function PageSkeleton() {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px_320px]">
        {/* Hero block */}
        <div
          className={`h-[240px] sm:h-[300px] rounded-2xl bg-white/5 ${shimmerClass()} border border-white/10`}
        />

        {/* ActionList block */}
        <div
          className={`h-[240px] rounded-2xl bg-white/5 ${shimmerClass()} border border-white/10`}
        />

        {/* ProgressCard block */}
        <div
          className={`h-[240px] rounded-2xl bg-white/5 ${shimmerClass()} border border-white/10`}
        />
      </div>

      <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-[280px] rounded-2xl bg-white/5 ${shimmerClass()} border border-white/10`}
          />
        ))}
      </div>

      {/* Accessible fallback spinner for screen readers */}
      <div className="sr-only">
        <Spinner label="Cargando…" />
      </div>
    </div>
  );
}
