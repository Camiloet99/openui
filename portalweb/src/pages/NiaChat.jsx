// src/pages/NiaChat.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { getChatSession, sendMessageStream } from "@/services/niaService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** -------- CONFIG -------- */
const LS_KEY = "nia-chat-history-v1";

// Pasa tus assets acá (puedes importarlos si prefieres):
const HERO_VIDEO_SRC = "/videos/nia-video.mp4"; // ej: "/videos/nia-loop.mp4" (deja vacío para usar imagen)
const HERO_POSTER_IMG = "/images/nia-avatar.jpg"; // imagen fallback / poster

const SYSTEM_PROMPT = `Eres NIA, la Inteligencia Asistente de Aprendizaje del “Metaverso de Autocuidado” de la IU Digital.

# Tu propósito
Acompañas a estudiantes y funcionarios de la IU Digital en su bienestar emocional, autocuidado y fortalecimiento de habilidades para la vida. Orientas con calidez, claridad y empatía, guiando al usuario en cada zona del Metaverso y en sus procesos de aprendizaje y reflexión.

# Quién puede ingresar
El Metaverso está diseñado exclusivamente para la comunidad IU Digital (estudiantes y funcionarios).  
Pueden ingresar usando su correo institucional y su número de cédula.

# Zonas del Metaverso
El recorrido está compuesto por 4 espacios principales:
1. **Plazoleta de Bienvenida** — Introducción al viaje interior.  
2. **Bosque de las Emociones** — Reconocer, equilibrar y comprender lo que sentimos.  
3. **Jardín Mental** — Cultivar pensamientos, hábitos sanos y habilidades cognitivas.  
4. **Lago Contemplativo** — Conectar con la calma, la reflexión y el bienestar profundo.

Cada zona contiene actividades, ejercicios y módulos temáticos diseñados para la promoción y prevención en salud mental.

# Test de Medición
- **Test de Entrada:** para conocer el punto de partida del usuario.  
- **Test de Salida:** para evaluar su progreso al finalizar el recorrido.  
Explicas su importancia con suavidad y los orientas sobre cuándo realizarlos.

# Alcance del Metaverso
Aclara amablemente que:
- El Metaverso **no reemplaza la psicoterapia ni la atención especializada**.
- Si el usuario presenta malestar grave, crisis o situaciones que sobrepasan lo preventivo, lo orientas hacia la **Ruta de Atención a Emergencias en Salud Mental** y los canales profesionales correspondientes.

# Privacidad y seguimiento
Explicas con claridad que:
- El sistema registra uso, avance y resultados de tests.
- Toda la información es usada para evaluar impacto, experiencia y satisfacción del proyecto, a través de tableros de análisis.

# Tu tono y estilo
- Cálido, humano, amable, cercano.  
- Inspirador pero claro, evitando tecnicismos.  
- Invitas a respirar, reflexionar y avanzar con calma.  
- Eres una guía, no una IA técnica.

# Qué puedes hacer
- Explicar zonas, test y actividades.  
- Orientar sobre avance, próximas acciones y rutas.  
- Ofrecer ejercicios breves de respiración, contención o enfoque.  
- Acompañar emocionalmente con suavidad.  
- Resolver dudas de acceso y navegación.  
- Guiar hacia soporte técnico cuando sea necesario.

# Soporte Técnico
Si alguien tiene problemas para ingresar o usar la plataforma, indicas:
1. Revisar la **Guía rápida / Manual de Usuario**.  
2. Si persiste, contactar a **Bienestar IU Digital** o a  
   ➤ **admin@urbanik-hub.com**

# Emergencias en Salud Mental
Si un usuario menciona riesgo, crisis o urgencia:
- Prioriza su seguridad.  
- Recomienda acudir a la **Ruta de Atención a Emergencias en Salud Mental**,  
  o escribir a **calma@iudigital.edu.co**  
- Evitas dar diagnósticos o indicaciones clínicas.

Sé NIA: una voz serena que acompaña, inspira y sostiene.`;

const SUGGESTIONS = [
  "¿Quién puede ingresar al Metaverso de Autocuidado?",
  "Explícame el objetivo de este Metaverso y tu propósito, NIA",
  "Guíame por las zonas del Metaverso, ¿qué puedo explorar?",
  "¿Para qué sirve el Test de Entrada y el Test de Salida?",
  "¿Este Metaverso reemplaza la terapia psicológica?",
  "¿Qué actividades puedo hacer en el Bosque de las Emociones?",
  "¿Se hace seguimiento de mi progreso?",
  "Tengo problemas para ingresar, ¿qué puedo hacer?",
  "¿Qué son los KPIs y por qué los usan aquí?",
  "¿Qué hago si tengo una crisis emocional?"
];


/** -------- PAGE -------- */
export default function NiaChat() {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(LS_KEY);
    const base = stored ? JSON.parse(stored) : [];
    if (!base.find((m) => m.role === "system")) {
      base.unshift({ role: "system", content: SYSTEM_PROMPT });
    }
    return base;
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [thinking, setThinking] = useState(false);

  const listRef = useRef(null);
  const abortRef = useRef(null);
  const chatRef = useRef(null);
  const hasHistory = messages.some((m) => m.role !== "system");

  useEffect(() => {
    (async () => {
      chatRef.current = await getChatSession(messages);
    })();
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    localStorage.setItem(LS_KEY, JSON.stringify(messages));
  }, [messages]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  const handleSuggestion = (text) => {
    setInput(text);
    setTimeout(() => handleSend(), 0);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    setErrorMsg("");
    setLoading(true);
    setThinking(true);

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);

    const chatSession = await getChatSession(next);

    const newAssistant = { role: "model", content: "" };
    setMessages((prev) => [...prev, newAssistant]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const delta of sendMessageStream(
        chatSession,
        text,
        controller.signal
      )) {
        setMessages((prev) => {
          const cloned = [...prev];
          const lastIdx = cloned.length - 1;
          cloned[lastIdx] = {
            ...cloned[lastIdx],
            content: (cloned[lastIdx].content || "") + delta,
          };
          return cloned;
        });
      }
    } catch (err) {
      if (controller.signal.aborted) {
        setErrorMsg("Respuesta detenida.");
      } else {
        const msg =
          err?.status === 429
            ? "Límite de cuota/sesiones alcanzado. Intenta más tarde."
            : err?.message || "Error al generar respuesta.";
        setErrorMsg(msg);
        setMessages((prev) => {
          const cloned = [...prev];
          const last = cloned[cloned.length - 1];
          if (last?.role === "model" && !last.content) {
            cloned[cloned.length - 1] = {
              role: "model",
              content: "[Hubo un error generando la respuesta]",
            };
          }
          return cloned;
        });
      }
    } finally {
      setThinking(false);
      setLoading(false);
      abortRef.current = null;
      chatRef.current = await getChatSession([
        ...next,
        ...messages.slice(next.length),
      ]);
    }
  };

  const stop = () => abortRef.current?.abort();

  const clearChat = () => {
    abortRef.current?.abort();
    const base = [{ role: "system", content: SYSTEM_PROMPT }];
    setMessages(base);
    setInput("");
    setErrorMsg("");
    chatRef.current = getChatSession(base);
    localStorage.setItem(LS_KEY, JSON.stringify(base));
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* BG — mismo lenguaje visual del sitio */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[#0b1220]"
      />
      {/* halos azules/lilas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen opacity-70"
        style={{
          background:
            "radial-gradient(1000px 600px at 85% -10%, rgba(56,189,248,.18), transparent 60%), radial-gradient(1100px 700px at 0% 0%, rgba(129,140,248,.15), transparent 60%)",
        }}
      />
      {/* sutil grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* HEADER fino */}
      <header className="sticky top-0 z-20 ">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            {thinking ? (
              <button
                onClick={stop}
                className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-400/20"
              >
                Detener
              </button>
            ) : null}
            <button
              onClick={clearChat}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
            >
              Limpiar
            </button>
          </div>
        </div>
      </header>

      {/* HERO — avatar/video circular centrado */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="relative mx-auto -mt-2 mb-6 flex w-full items-center justify-center">
          <div className="relative">
            {/* halo grande */}
            <div className="absolute -inset-8 rounded-full bg-sky-400/10 blur-3xl" />
            {/* anillo grande */}
            <div className="relative h-42 w-42 overflow-hidden rounded-full ring-1 ring-white/20 shadow-[0_0_0_8px_rgba(2,6,23,0.7)]">
              {HERO_VIDEO_SRC ? (
                <video
                  src={HERO_VIDEO_SRC}
                  poster={HERO_POSTER_IMG}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={HERO_POSTER_IMG}
                  alt="NIA"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WRAPPER contenido */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Tarjeta marco del chat (match con tu “frame”) */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-0.5">
          <div className="rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent p-4 sm:p-6">
            {/* Sugerencias vacías */}
            {messages.filter((m) => m.role !== "system").length === 0 ? (
              <div className="mx-auto mt-2 w-full max-w-3xl">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="mb-3 text-sm font-medium text-white/80">
                    Prueba con:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(s)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Mensajes */}
            <main
              ref={listRef}
              className={[
                "overflow-y-auto space-y-4 pr-1 transition-[height] duration-300 ease-out",
                hasHistory
                  ? "h-[52vh] sm:h-[58vh]" // cuando ya hay conversación: más alto
                  : "h-[12vh] sm:h-[16vh]", // vacío: compacto
              ].join(" ")}
            >
              {messages
                .filter((m) => m.role !== "system")
                .map((m, i) => (
                  <MessageBubble key={i} role={m.role} content={m.content} />
                ))}

              {thinking ? <TypingIndicator /> : null}

              {errorMsg ? (
                <div className="mx-auto w-fit rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  {errorMsg}
                </div>
              ) : null}
            </main>

            {/* Composer */}
            <div className="mt-4">
              <div className="mx-auto w-full max-w-3xl">
                <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/[0.06] p-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        canSend && handleSend();
                      }
                    }}
                    rows={1}
                    placeholder="Escribe tu mensaje…"
                    className="min-h-[44px] max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-white placeholder-white/40 outline-none"
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={!canSend}
                      onClick={handleSend}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-400 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <SpinnerDot />
                          Enviando…
                        </>
                      ) : (
                        <>
                          <SendIcon />
                          Enviar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER sticky leve (opcional; ya hay marco) */}
      <div className="h-3" />
    </div>
  );
}

/* -------------------- UI SUBCOMPONENTES -------------------- */

function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "flex max-w-[92%] sm:max-w-[80%] items-start gap-3",
          isUser ? "flex-row-reverse" : "flex-row",
        ].join(" ")}
      >
        <Avatar isUser={isUser} />
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-[15px] leading-relaxed shadow-sm",
            isUser
              ? "bg-[linear-gradient(180deg,rgba(14,165,233,0.28),rgba(14,165,233,0.20))] border-sky-400/30 text-sky-50"
              : "bg-white/[0.06] border-white/10 text-white/90",
          ].join(" ")}
        >
          <RichText text={content} />
        </div>
      </div>
    </div>
  );
}

function Avatar({ isUser }) {
  return isUser ? (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-500 text-white text-sm font-semibold">
      Tú
    </div>
  ) : (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-500/80 text-white text-sm font-semibold">
      N
    </div>
  );
}

/** Indicador “escribiendo…” */
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="ml-11 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white/80">
        <span className="inline-flex items-center gap-2">
          NIA está escribiendo
          <Dots />
        </span>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex">
      <span className="mx-0.5 h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:0ms]" />
      <span className="mx-0.5 h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:120ms]" />
      <span className="mx-0.5 h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:240ms]" />
    </span>
  );
}

/** Render bonito de backticks y links */
function RichText({ text }) {
  if (!text) return null;

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-semibold mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-semibold mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-sm font-semibold mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li {...props} />,
          strong: ({ node, ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                className="rounded bg-black/40 px-1.5 py-0.5 text-[0.9em]"
                {...props}
              />
            ) : (
              <code
                className="block rounded bg-black/40 px-3 py-2 text-[0.9em] overflow-x-auto"
                {...props}
              />
            ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 underline decoration-sky-300/50 underline-offset-2 hover:text-sky-200"
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/* -------------------- ICONOS -------------------- */
function NiaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-sky-300">
      <path
        d="M4 12a8 8 0 1116 0 8 8 0 01-16 0Zm4.5 0a3.5 3.5 0 107 0 3.5 3.5 0 00-7 0Z"
        fill="currentColor"
        opacity="0.35"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-white">
      <path d="M3 11l17-8-8 17-1-7-8-2z" fill="currentColor" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-white/70">
      <path
        d="M16.5 6.5l-7.8 7.8a3 3 0 104.2 4.2l8-8a5 5 0 10-7.1-7.1l-9.2 9.2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerDot() {
  return (
    <span className="relative inline-block h-3 w-3">
      <span className="absolute inset-0 animate-ping rounded-full bg-white/80 opacity-75"></span>
      <span className="relative inline-block h-3 w-3 rounded-full bg-white"></span>
    </span>
  );
}
