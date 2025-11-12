// src/pages/AuthGateway.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import LoginForm from "@/components/auth/LoginForm";
import SignupIdentityStep from "@/components/auth/SignupIdentityStep";
import SignupCredentialsStep from "@/components/auth/SignupCredentialsStep";
import ForgotIdentityStep from "@/components/auth/ForgotIdentityStep";
import ForgotResetStep from "@/components/auth/ForgotResetStep";

import {
  verifyUserIdentityApi,
  signupApi,
  resetPasswordApi,
} from "@/services/authService";

import brandLogo from "../assets/brand-logo.png";
import hero from "../assets/login-hero.png";
import partner1 from "../assets/partner-1.png";
import partner2 from "../assets/partner-2.png";

/* ------- Tabs ------- */
const tabs = [
  { key: "login", label: "Ingresar" },
  { key: "signup", label: "Crear cuenta" },
  { key: "forgot", label: "Recuperar" },
];

const formContainerVariants = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  },
};

function ProgressDots({ total = 2, index = 0 }) {
  return (
    <div className="flex items-center gap-2.5 justify-center my-4" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className="h-2.5 w-2.5 rounded-full"
          animate={{ scale: i === index ? 1 : 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            background:
              i === index ? "rgba(108,76,255,1)" : "rgba(255,255,255,0.28)",
            boxShadow: i === index ? "0 0 14px rgba(108,76,255,0.55)" : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function AuthGateway() {
  const [mode, setMode] = useState("login");
  const [signupStep, setSignupStep] = useState(1);
  const [forgotStep, setForgotStep] = useState(1);

  const navigate = useNavigate();
  const { login } = useAuth();

  const FORM_WIDTH = "max-w-[420px]";
  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);

  // --------- LOGIN ---------
  const [loginValues, setLoginValues] = useState({ email: "", pass: "" });
  const [loginErrors, setLoginErrors] = useState({ email: "", pass: "" });
  const [loginOkBurst, setLoginOkBurst] = useState(false);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginErrors({ email: "", pass: "" });

    if (!isEmail(loginValues.email)) {
      setLoginErrors((p) => ({ ...p, email: "Email incorrecto" }));
    }
    if (!loginValues.pass) {
      setLoginErrors((p) => ({ ...p, pass: "Campo requerido" }));
    }

    if (isEmail(loginValues.email) && loginValues.pass) {
      try {
        await login(loginValues.email, loginValues.pass);
        setLoginOkBurst(true);
        setTimeout(() => navigate("/courses"), 250);
      } catch {
        setLoginErrors((p) => ({ ...p, pass: "Credenciales inválidas" }));
      }
    }
  }

  // --------- SIGNUP (Paso 1: identidad) ---------
  const [idValues, setIdValues] = useState({ email: "", dni: "" });
  const [idErrors, setIdErrors] = useState({ email: "", dni: "" });
  const [idGeneralError, setIdGeneralError] = useState("");
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [signupEmailFixed, setSignupEmailFixed] = useState("");

  async function handleValidateIdentity(e) {
    e.preventDefault();
    setIdErrors({ email: "", dni: "" });
    setIdGeneralError("");

    let okLocal = true;
    if (!isEmail(idValues.email)) {
      setIdErrors((p) => ({ ...p, email: "Email institucional inválido" }));
      okLocal = false;
    }
    if (!/^\d{6,10}$/.test(idValues.dni)) {
      setIdErrors((p) => ({ ...p, dni: "Cédula inválida (6–10 dígitos)" }));
      okLocal = false;
    }
    if (!okLocal) return;

    try {
      setIsVerifyingSignup(true);
      const resp = await verifyUserIdentityApi({
        email: idValues.email,
        dni: idValues.dni,
      });
      if (!resp?.ok) {
        setIdGeneralError("Combinación no válida o usuario no encontrado.");
        return;
      }
      setSignupEmailFixed(idValues.email);
      setSignupStep(2);
    } catch (err) {
      setIdGeneralError(err.message || "No pudimos validar tu identidad");
    } finally {
      setIsVerifyingSignup(false);
    }
  }

  // --------- SIGNUP (Paso 2: credenciales) ---------
  const [credValues, setCredValues] = useState({
    pass: "",
    confirm: "",
    accept: false,
  });
  const [credErrors, setCredErrors] = useState({
    pass: "",
    confirm: "",
    accept: "",
  });
  const signupRules = useMemo(
    () => ({
      len: credValues.pass.length >= 8,
      upper: /[A-ZÁÉÍÓÚÑ]/.test(credValues.pass),
      special: /[^A-Za-z0-9]/.test(credValues.pass),
    }),
    [credValues.pass]
  );

  async function handleSignupSubmit(e) {
    e.preventDefault();
    setCredErrors({ pass: "", confirm: "", accept: "" });

    if (!(signupRules.len && signupRules.upper && signupRules.special)) {
      setCredErrors((p) => ({ ...p, pass: "Contraseña insegura" }));
    }
    if (credValues.confirm !== credValues.pass) {
      setCredErrors((p) => ({ ...p, confirm: "Las contraseñas no coinciden" }));
    }
    if (!credValues.accept) {
      setCredErrors((p) => ({ ...p, accept: "Debes aceptar las políticas" }));
    }

    if (
      signupRules.len &&
      signupRules.upper &&
      signupRules.special &&
      credValues.confirm === credValues.pass &&
      credValues.accept
    ) {
      try {
        await signupApi({
          email: signupEmailFixed,
          dni: idValues.dni,
          password: credValues.pass,
        });
        await login(signupEmailFixed, credValues.pass);
        navigate("/courses");
      } catch (err) {
        setCredErrors((p) => ({
          ...p,
          pass: err.message || "Error al crear la cuenta",
        }));
      }
    }
  }

  // --------- FORGOT ---------
  const [forgotIdValues, setForgotIdValues] = useState({ email: "", dni: "" });
  const [forgotIdErrors, setForgotIdErrors] = useState({ email: "", dni: "" });
  const [forgotGeneralErr, setForgotGeneralErr] = useState("");
  const [forgotEmailFixed, setForgotEmailFixed] = useState("");

  async function handleForgotValidate(e) {
    e.preventDefault();
    setForgotIdErrors({ email: "", dni: "" });
    setForgotGeneralErr("");

    let ok = true;
    if (!isEmail(forgotIdValues.email)) {
      setForgotIdErrors((p) => ({
        ...p,
        email: "Email institucional inválido",
      }));
      ok = false;
    }
    if (!/^\d{6,10}$/.test(forgotIdValues.dni)) {
      setForgotIdErrors((p) => ({
        ...p,
        dni: "Cédula inválida (6–10 dígitos)",
      }));
      ok = false;
    }
    if (!ok) return;

    try {
      const resp = await verifyUserIdentityApi({
        email: forgotIdValues.email,
        dni: forgotIdValues.dni,
      });
      if (!resp?.ok) {
        setForgotGeneralErr("Combinación no válida o usuario no encontrado.");
        return;
      }
      setForgotEmailFixed(forgotIdValues.email);
      setForgotStep(2);
    } catch (err) {
      setForgotGeneralErr(err.message || "No pudimos validar tu identidad");
    }
  }

  const [forgotResetValues, setForgotResetValues] = useState({
    pass: "",
    confirm: "",
  });
  const [forgotResetErrors, setForgotResetErrors] = useState({
    pass: "",
    confirm: "",
  });
  const forgotRules = useMemo(
    () => ({
      len: forgotResetValues.pass.length >= 8,
      upper: /[A-ZÁÉÍÓÚÑ]/.test(forgotResetValues.pass),
      special: /[^A-Za-z0-9]/.test(forgotResetValues.pass),
    }),
    [forgotResetValues.pass]
  );
  const [forgotOkBurst, setForgotOkBurst] = useState(false);

  async function handleForgotReset(e) {
    e.preventDefault();
    setForgotResetErrors({ pass: "", confirm: "" });

    if (!(forgotRules.len && forgotRules.upper && forgotRules.special)) {
      setForgotResetErrors((p) => ({ ...p, pass: "Contraseña insegura" }));
    }
    if (forgotResetValues.confirm !== forgotResetValues.pass) {
      setForgotResetErrors((p) => ({
        ...p,
        confirm: "Las contraseñas no coinciden",
      }));
    }

    if (
      forgotRules.len &&
      forgotRules.upper &&
      forgotRules.special &&
      forgotResetValues.confirm === forgotResetValues.pass
    ) {
      try {
        await resetPasswordApi({
          email: forgotEmailFixed,
          dni: forgotIdValues.dni,
          newPassword: forgotResetValues.pass,
        });
        setForgotOkBurst(true);
        setMode("login");
        setForgotStep(1);
        setLoginValues((v) => ({ ...v, email: forgotEmailFixed, pass: "" }));
        setForgotIdValues({ email: "", dni: "" });
        setForgotResetValues({ pass: "", confirm: "" });
      } catch (err) {
        setForgotResetErrors((p) => ({
          ...p,
          pass: err.message || "Error al actualizar contraseña",
        }));
      }
    }
  }

  /* --------- Accesibilidad --------- */
  const firstFieldRef = useRef(null);
  useEffect(() => {
    firstFieldRef.current?.focus?.();
  }, [mode, signupStep, forgotStep]);

  const showStepper =
    (mode === "signup" && (signupStep === 1 || signupStep === 2)) ||
    (mode === "forgot" && (forgotStep === 1 || forgotStep === 2));

  const stepIndex =
    mode === "signup" ? signupStep - 1 : mode === "forgot" ? forgotStep - 1 : 0;

  return (
    <div className="min-h-screen bg-[#0f1422] text-white flex items-center justify-center">
      <div className="w-full max-w-[1400px] px-4 py-6">
        <div className="grid items-center gap-10 md:gap-12 lg:gap-16 lg:grid-cols-[440px_minmax(0,1fr)]">
          {/* Columna izquierda */}
          <div className="w-full">
            <div className={`${FORM_WIDTH} mx-auto mb-8`}>
              <img
                src={brandLogo}
                alt="Urbanik"
                className="mx-auto block w-[70%] md:w-[64%]" // ⬅️ reducido sutilmente
              />
            </div>

            {/* Tabs */}
            <div className={`${FORM_WIDTH} mx-auto mb-4`}>
              <div className="relative flex items-center justify-between bg-white/5 rounded-full p-1">
                {tabs.map((t) => {
                  const active = mode === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => {
                        setMode(t.key);
                        if (t.key === "signup") setSignupStep(1);
                        if (t.key === "forgot") setForgotStep(1);
                      }}
                      className="relative z-10 flex-1 py-2 text-sm rounded-full"
                    >
                      <motion.span
                        className={`block text-center ${
                          active ? "text-white" : "text-white/65"
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t.label}
                      </motion.span>
                      {active && (
                        <motion.span
                          layoutId="tab-underline"
                          className="absolute inset-0 rounded-full bg-white/10"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 36,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`${FORM_WIDTH} mx-auto relative rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}
            >
              {showStepper && <ProgressDots total={2} index={stepIndex} />}

              <motion.div
                key={`${mode}-${signupStep}-${forgotStep}`}
                variants={formContainerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-[420px]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mode === "login" && (
                    <motion.div layout key="login" className="relative">
                      <AnimatePresence>
                        {loginOkBurst && (
                          <motion.div
                            key="ok-burst"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1.02 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.25 }}
                            className="absolute -top-2 -right-2 text-emerald-400"
                            aria-hidden
                          >
                            ✓
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <LoginForm
                        onSubmit={handleLoginSubmit}
                        onToForgot={() => {
                          setMode("forgot");
                          setForgotStep(1);
                        }}
                        onToSignup={() => {
                          setMode("signup");
                          setSignupStep(1);
                        }}
                        errors={loginErrors}
                        values={loginValues}
                        setValues={setLoginValues}
                      />
                      <div className="sr-only" aria-live="polite">
                        {loginErrors?.email || loginErrors?.pass
                          ? "Hay errores en el formulario"
                          : ""}
                      </div>
                    </motion.div>
                  )}

                  {mode === "signup" && signupStep === 1 && (
                    <motion.div
                      key="signup-1"
                      layout
                      animate={idGeneralError ? { x: [0, -6, 6, -4, 0] } : {}}
                      transition={{ duration: 0.35 }}
                    >
                      <SignupIdentityStep
                        values={idValues}
                        setValues={setIdValues}
                        errors={idErrors}
                        generalError={idGeneralError}
                        isVerifying={isVerifyingSignup}
                        onValidate={handleValidateIdentity}
                        onToLogin={() => setMode("login")}
                      />
                      <div className="sr-only" aria-live="assertive">
                        {idGeneralError}
                      </div>
                    </motion.div>
                  )}

                  {mode === "signup" && signupStep === 2 && (
                    <motion.div key="signup-2" layout>
                      <SignupCredentialsStep
                        emailFixed={signupEmailFixed}
                        values={credValues}
                        setValues={setCredValues}
                        errors={credErrors}
                        rules={signupRules}
                        onBack={() => setSignupStep(1)}
                        onSubmit={handleSignupSubmit}
                        onToLogin={() => setMode("login")}
                      />
                    </motion.div>
                  )}

                  {mode === "forgot" && forgotStep === 1 && (
                    <motion.div
                      key="forgot-1"
                      layout
                      animate={forgotGeneralErr ? { x: [0, -6, 6, -4, 0] } : {}}
                      transition={{ duration: 0.35 }}
                    >
                      <ForgotIdentityStep
                        values={forgotIdValues}
                        setValues={setForgotIdValues}
                        errors={forgotIdErrors}
                        generalError={forgotGeneralErr}
                        isVerifying={false}
                        onValidate={handleForgotValidate}
                        onToLogin={() => setMode("login")}
                      />
                      <div className="sr-only" aria-live="assertive">
                        {forgotGeneralErr}
                      </div>
                    </motion.div>
                  )}

                  {mode === "forgot" && forgotStep === 2 && (
                    <motion.div key="forgot-2" layout>
                      <AnimatePresence>
                        {forgotOkBurst && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="absolute -top-2 -right-2 text-emerald-400"
                          >
                            ✓
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <ForgotResetStep
                        emailFixed={forgotEmailFixed}
                        values={forgotResetValues}
                        setValues={setForgotResetValues}
                        errors={forgotResetErrors}
                        rules={forgotRules}
                        onBack={() => setForgotStep(1)}
                        onSubmit={handleForgotReset}
                        onToLogin={() => setMode("login")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Columna derecha: hero (ligeramente más grande) */}
          <div className="hidden lg:flex justify-end pr-3">
            <motion.div
              className="relative overflow-hidden rounded-[36px] w-[min(64vw,1200px)] max-w-[1200px]"
              initial={{ y: 6 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
            >
              <motion.img
                src={hero}
                alt="Escena de bienvenida"
                className="block w-full h-[65vh] object-cover rounded-[36px] will-change-transform"
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
              />

              {/* overlay sutil opcional */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[36px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,20,34,0.0) 0%, rgba(15,20,34,0.08) 60%, rgba(15,20,34,0.18) 100%)",
                }}
              />

              <div className="absolute bottom-6 right-6 z-10 flex items-center gap-9 pr-1">
                <img
                  src={partner1}
                  alt="Partner 1"
                  className="h-[92px] w-auto opacity-95"
                />
                <img
                  src={partner2}
                  alt="Partner 2"
                  className="h-[92px] w-auto opacity-95"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
