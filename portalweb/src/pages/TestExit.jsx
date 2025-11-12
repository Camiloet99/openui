import { useEffect, useMemo, useState } from "react";
import { submitExitTest } from "@/services/testsService";
import { useNavigate } from "react-router-dom";

const A_ITEMS = [
  "La experiencia general del Metaverso de Autocuidado fue satisfactoria.",
  "Pude acceder sin problemas desde mi(s) dispositivo(s) y red (accesibilidad).",
  "NIA (asistente virtual con IA) me orientó de forma clara y útil.",
  "Los contenidos de las 4 zonas me parecieron relevantes para mi realidad académica.",
  "Volvería a usar la plataforma para mi autocuidado.",
  "Recomendaría esta experiencia a un(a) compañero(a).",
];

const B_ITEMS = [
  "Aprendí al menos 1 técnica nueva de enfoque/gestión del tiempo (p. ej., Pomodoro, Timeboxing, Regla de 2 minutos, Eisenhower, Habit stacking, Ambient Shield).",
  "Apliqué (al menos una vez) alguna técnica durante estas semanas.",
  "Pienso mantener al menos 1 hábito de autocuidado (sueño, pausa digital, alimentación consciente, movimiento, mindfulness).",
];

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

function LikertRow({ index, text, value, onChange }) {
  return (
    <div className="rounded-xl px-4 py-3 ring-1 ring-white/10 bg-white/3 hover:bg-white/[0.07] transition">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-[15px] md:max-w-[70%]">
          {index + 1}. {text}
        </p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Chip
              key={n}
              selected={value === n}
              onClick={() => onChange(n)}
              ariaLabel={`Pregunta A${index + 1} opción ${n}`}
            >
              {n}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function YesNoRow({ index, text, value, onChange }) {
  return (
    <div className="rounded-xl px-4 py-3 ring-1 ring-white/10 bg-white/3 hover:bg-white/[0.07] transition">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-[15px] md:max-w-[70%]">
          {index + 1}. {text}
        </p>
        <div className="flex items-center gap-2">
          {["Sí", "No"].map((opt) => (
            <Chip
              key={opt}
              selected={value === opt}
              onClick={() => onChange(opt)}
              ariaLabel={`Ítem B${index + 1} ${opt}`}
            >
              {opt}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function SliderRow({ index, label, value, onChange }) {
  return (
    <div className="rounded-xl px-4 py-3 ring-1 ring-white/10 bg-white/3 transition">
      <label className="block text-[15px] mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[#5944F9]"
        />
        <span className="w-10 text-right font-medium">{value}</span>
      </div>
      <div className="mt-1 text-xs text-white/60">
        0 = Nada capaz · 10 = Totalmente capaz
      </div>
    </div>
  );
}

/* Donut compacto de progreso */
function ProgressMini({ percent }) {
  const size = 84,
    stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (percent / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
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
        stroke="url(#g2)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export default function TestExit() {
  const navigate = useNavigate();

  // A: 6 likert 1–5
  const [aVals, setAVals] = useState(() => Array(A_ITEMS.length).fill(null));
  // Comentario 140–200 chars
  const [comment, setComment] = useState("");
  // B: sí/no (3)
  const [bVals, setBVals] = useState(() => Array(B_ITEMS.length).fill(null));
  // C: sliders 0–10 (3)
  const [cVals, setCVals] = useState([5, 5, 5]); // centrados por defecto

  const commentLen = comment.trim().length;
  const commentValid = commentLen >= 140 && commentLen <= 200;

  const progress = useMemo(() => {
    let filled = 0,
      total = 0;
    total += A_ITEMS.length;
    filled += aVals.filter((v) => v != null).length;
    total += 1;
    filled += commentValid ? 1 : 0;
    total += B_ITEMS.length;
    filled += bVals.filter((v) => v != null).length;
    total += 3;
    filled += cVals.filter((v) => v != null).length;
    return Math.round((filled / total) * 100);
  }, [aVals, bVals, cVals, commentValid]);

  const allDone =
    aVals.every((v) => v != null) &&
    bVals.every((v) => v != null) &&
    cVals.every((v) => v != null) &&
    commentValid;

  // persistencia ligera
  useEffect(() => {
    const state = { aVals, bVals, cVals, comment };
    localStorage.setItem("test-salida", JSON.stringify(state));
  }, [aVals, bVals, cVals, comment]);
  useEffect(() => {
    const saved = localStorage.getItem("test-salida");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s?.aVals) setAVals(s.aVals);
        if (s?.bVals) setBVals(s.bVals);
        if (Array.isArray(s?.cVals)) setCVals(s.cVals);
        if (typeof s?.comment === "string") setComment(s.comment);
      } catch {}
    }
  }, []);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!allDone) {
      setError("Completa todas las secciones...");
      return;
    }
    setSending(true);
    try {
      const payload = {
        kind: "test-salida",
        /* ... */ submittedAt: new Date().toISOString(),
      };
      const resp = await submitExitTest(payload);
      if (!resp?.ok) {
        setError("No se pudo enviar. Intenta nuevamente.");
        return;
      }
      localStorage.removeItem("test-salida");
      navigate("/courses", { replace: true });
    } catch {
      setError("Ocurrió un error al enviar.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[calc(80vh-80px)]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* A + comentario */}
        <section className="rounded-[22px] ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6">
          <h2 className="text-center text-xl font-semibold mb-4">
            Test de salida
          </h2>

          <div className="mb-4 text-white/80">
            <div className="text-[15px] font-medium mb-2">
              A. Satisfacción y experiencia (1–5)
            </div>
            <div className="grid gap-3">
              {A_ITEMS.map((t, i) => (
                <LikertRow
                  key={i}
                  index={i}
                  text={t}
                  value={aVals[i]}
                  onChange={(v) =>
                    setAVals((prev) => {
                      const n = [...prev];
                      n[i] = v;
                      return n;
                    })
                  }
                />
              ))}
            </div>

            <div className="mt-5">
              <label className="block text-[15px] font-medium mb-2">
                En 1–2 frases (140–200 caracteres): ¿qué fue lo más útil y/o qué
                mejorarías?
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 p-3 outline-none focus:ring-white/30"
                placeholder="Escribe aquí…"
                maxLength={220}
              />
              <div
                className={`mt-1 text-xs ${
                  commentValid ? "text-white/60" : "text-red-300"
                }`}
              >
                {commentLen} / 200{" "}
                {commentValid ? "" : " (debe estar entre 140 y 200)"}
              </div>
            </div>
          </div>
        </section>

        {/* Panel lateral: progreso + enviar */}
        <aside className="rounded-[22px] ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center gap-5">
            <ProgressMini percent={progress} />
            <div>
              <div className="text-2xl font-semibold">{progress}%</div>
              <div className="text-white/70 text-sm -mt-1">Completado</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-white/80">
            Completa todas las secciones para habilitar el envío.
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-500/10 text-red-200 text-sm px-3 py-2 ring-1 ring-red-400/30">
              {error}
            </div>
          )}

          <button
            onClick={submit}
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

      {/* B y C */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[22px] ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-[16px] font-medium mb-3">
            B. Aprendizajes y aplicación práctica
          </h3>
          <p className="text-sm text-white/70 mb-2">
            Marca lo que aplique (Sí/No):
          </p>
          <div className="grid gap-3">
            {B_ITEMS.map((t, i) => (
              <YesNoRow
                key={i}
                index={i}
                text={t}
                value={bVals[i]}
                onChange={(v) =>
                  setBVals((prev) => {
                    const n = [...prev];
                    n[i] = v;
                    return n;
                  })
                }
              />
            ))}
          </div>
        </section>

        <section className="rounded-[22px] ring-1 ring-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-[16px] font-medium mb-3">
            C. Autoeficacia percibida (0–10)
          </h3>
          <div className="grid gap-3">
            <SliderRow
              index={0}
              label="¿Qué tan capaz te sientes de manejar tu estrés?"
              value={cVals[0]}
              onChange={(v) =>
                setCVals((prev) => {
                  const n = [...prev];
                  n[0] = v;
                  return n;
                })
              }
            />
            <SliderRow
              index={1}
              label="¿Qué tan capaz te sientes de manejar tu ansiedad?"
              value={cVals[1]}
              onChange={(v) =>
                setCVals((prev) => {
                  const n = [...prev];
                  n[1] = v;
                  return n;
                })
              }
            />
            <SliderRow
              index={2}
              label="¿Qué tan capaz te sientes de mejorar tu estado de ánimo?"
              value={cVals[2]}
              onChange={(v) =>
                setCVals((prev) => {
                  const n = [...prev];
                  n[2] = v;
                  return n;
                })
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}
