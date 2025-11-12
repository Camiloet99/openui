import { useEffect, useMemo, useRef, useState } from "react";
import { submitInitialTest } from "@/services/testsService";
import { useNavigate } from "react-router-dom";

const QUESTIONS = [
  "Me ha costado mucho descargar la tensión.",
  "Me di cuenta que tenía la boca seca.",
  "No podía sentir ningún sentimiento positivo.",
  "Se me hizo difícil respirar.",
  "Se me hizo difícil tomar la iniciativa para hacer cosas.",
  "Reaccioné exageradamente en ciertas situaciones.",
  "Sentí que mis manos temblaban.",
  "He sentido que estaba gastando una gran cantidad de energía.",
  "Estaba preocupado por situaciones en las cuales podía tener pánico o en las que podría hacer el ridículo.",
  "He sentido que no había nada que me ilusionara.",
  "Me he sentido inquieto.",
  "Se me hizo difícil relajarme.",
  "Me sentí triste y deprimido.",
  "No toleré nada que no me permitiera continuar con lo que estaba haciendo.",
  "Sentí que estaba al punto de pánico.",
  "No me pude entusiasmar por nada.",
  "Sentí que valía muy poco como persona.",
  "He tendido a sentirme enfadado con facilidad.",
  "Sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico.",
  "Tuve miedo sin razón.",
];

const SCALE = [0, 1, 2, 3];

function Chip({ selected, children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "h-8 min-w-8 px-3 grid place-items-center rounded-full text-sm transition",
        "ring-1 ring-white/15",
        selected
          ? "bg-[#5944F9] text-white shadow-[0_8px_20px_rgba(89,68,249,0.35)]"
          : "bg-white/5 text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function QuestionRow({ index, text, value, onChange }) {
  return (
    <div className="rounded-xl px-4 py-3 ring-1 ring-white/10 bg-white/3 hover:bg-white/[0.07] transition">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-[15px] md:max-w-[70%]">
          {index + 1}. {text}
        </p>
        <div className="flex items-center gap-2">
          {SCALE.map((n) => (
            <Chip
              key={n}
              selected={value === n}
              onClick={() => onChange(n)}
              ariaLabel={`Pregunta ${index + 1} opción ${n}`}
            >
              {n}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressMini({ percent }) {
  const size = 84;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (percent / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#74E0E6" />
          <stop offset="50%" stopColor="#7B6CFF" />
          <stop offset="100%" stopColor="#5B7CFF" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.15)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#g)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/** Barra inferior que aparece solo cuando el botón principal no es visible */
function StickyActionBar({ visible, onSubmit, disabled, sending, progress }) {
  return (
    <div
      aria-hidden={!visible}
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="pointer-events-auto rounded-2xl bg-[#0B0B11]/70 backdrop-blur-md ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,.35)] p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/5 ring-1 ring-white/10 grid place-items-center text-xs">
              {progress}%
            </div>
            <p className="text-sm text-white/80 hidden sm:block">
              {progress === 100
                ? "Listo para enviar"
                : "Responde todas las preguntas para habilitar el envío"}
            </p>
          </div>
          <button
            onClick={onSubmit}
            disabled={disabled}
            className={[
              "rounded-xl px-5 py-2.5 font-medium transition",
              !disabled
                ? "bg-[#5944F9] hover:brightness-110 shadow-[0_10px_24px_rgba(89,68,249,0.35)]"
                : "bg-white/10 text-white/60 cursor-not-allowed",
            ].join(" ")}
          >
            {sending ? "Enviando..." : "Enviar respuestas"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestInitial() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("test-inicial");
    return saved ? JSON.parse(saved) : Array(QUESTIONS.length).fill(null);
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // visibilidad del botón principal (aside)
  const asideBtnRef = useRef(null);
  const [actionBarVisible, setActionBarVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem("test-inicial", JSON.stringify(answers));
  }, [answers]);

  const progress = useMemo(() => {
    const filled = answers.filter((v) => v !== null).length;
    return Math.round((filled / QUESTIONS.length) * 100);
  }, [answers]);

  const allDone = answers.every((v) => v !== null);

  const handleChange = (idx, val) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSubmit = async () => {
    setError("");
    if (!allDone) {
      setError("Por favor responde todas las preguntas (0–3).");
      return;
    }
    setSending(true);
    try {
      const payload = {
        kind: "test-inicial",
        answers,
        submittedAt: new Date().toISOString(),
      };
      const resp = await submitInitialTest(payload);
      if (!resp?.ok) {
        setError("No se pudo enviar. Intenta nuevamente.");
        return;
      }
      localStorage.removeItem("test-inicial");
      navigate("/experience", { replace: true });
    } catch (err) {
      setError(err?.message || "Ocurrió un error al enviar.");
    } finally {
      setSending(false);
    }
  };

  // IntersectionObserver: muestra la barra inferior cuando el botón principal NO está visible
  useEffect(() => {
    const el = asideBtnRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        // visible en viewport -> ocultamos barra; no visible -> mostramos barra
        setActionBarVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-[calc(80vh-80px)]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-[22px] ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6">
          <h2 className="text-center text-xl font-semibold mb-4">
            Test Inicial
          </h2>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 text-white/85 text-[14px] leading-relaxed">
            <p className="mb-2">
              Lee cada afirmación y marca un número del 0 al 3 según cuánto te
              sucedió durante la última semana:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>0 = No me pasó.</li>
              <li>1 = Me pasó un poco / en parte del tiempo.</li>
              <li>2 = Me pasó bastante / en buena parte del tiempo.</li>
              <li>3 = Me pasó mucho / la mayor parte del tiempo.</li>
            </ul>
            <p className="mt-3">
              Responde pensando solo en la última semana. No hay respuestas
              “correctas” o “incorrectas”; contesta con sinceridad.
            </p>
          </div>
        </section>

        <aside className="rounded-[22px] ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center gap-5">
            <ProgressMini percent={progress} />
            <div>
              <div className="text-2xl font-semibold">{progress}%</div>
              <div className="text-white/70 text-sm -mt-1">Completado</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-white/80">
            Responde todas las preguntas para habilitar el envío.
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-500/10 text-red-200 text-sm px-3 py-2 ring-1 ring-red-400/30">
              {error}
            </div>
          )}

          <button
            ref={asideBtnRef}
            onClick={handleSubmit}
            disabled={!allDone || sending}
            className={[
              "mt-5 w-full rounded-xl py-3 font-medium transition",
              allDone && !sending
                ? "bg-[#5944F9] hover:brightness-110 shadow-[0_10px_24px_rgba(89,68,249,0.35)]"
                : "bg-white/10 text-white/60 cursor-not-allowed",
            ].join(" ")}
          >
            {sending ? "Enviando..." : "Enviar respuestas"}
          </button>
        </aside>
      </div>

      <div className="mt-6 rounded-[22px] ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-4 md:p-6">
        <div className="grid gap-3">
          {QUESTIONS.map((q, i) => (
            <QuestionRow
              key={i}
              index={i}
              text={q}
              value={answers[i]}
              onChange={(val) => handleChange(i, val)}
            />
          ))}
        </div>
      </div>

      {/* Sticky action bar: solo aparece cuando el botón del aside no está visible */}
      <StickyActionBar
        visible={actionBarVisible}
        onSubmit={handleSubmit}
        disabled={!allDone || sending}
        sending={sending}
        progress={progress}
      />
    </div>
  );
}
