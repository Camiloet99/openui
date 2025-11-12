// src/components/auth/SignupCredentialsStep.jsx
import { motion } from "framer-motion";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import Input from "../Input";
import PasswordInput from "../PasswordInput";

const variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: { opacity: 0, x: 12, transition: { duration: 0.22, ease: "easeIn" } },
};

function Rule({ ok, label }) {
  return (
    <li
      className={`flex items-center gap-2 ${
        ok ? "text-white/85" : "text-white/55"
      }`}
    >
      {ok ? (
        <MdCheckCircle size={18} className="text-emerald-400" />
      ) : (
        <MdCancel size={18} className="text-red-300/80" />
      )}
      <span>{label}</span>
    </li>
  );
}

export default function SignupCredentialsStep({
  emailFixed,
  values,
  setValues,
  errors,
  rules,
  onBack,
  onSubmit,
  onToLogin,
}) {
  return (
    <motion.form
      key="signup-step2"
      onSubmit={onSubmit}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Input
        autoFocus
        aria-invalid={!!errors.email}
        placeholder="Email institucional"
        value={emailFixed}
        onChange={() => {}}
        type="email"
        size="lg"
        iconLeft={<MdEmail size={18} />}
        disabled
      />

      <div className="space-y-5 mt-5">
        <PasswordInput
          placeholder="Contraseña"
          value={values.pass}
          onChange={(e) => setValues((v) => ({ ...v, pass: e.target.value }))}
          size="lg"
          iconLeft={<MdLock size={18} />}
          iconShow={<MdVisibility size={18} />}
          iconHide={<MdVisibilityOff size={18} />}
          error={errors.pass}
        />
        <PasswordInput
          placeholder="Confirmar Contraseña"
          value={values.confirm}
          onChange={(e) =>
            setValues((v) => ({ ...v, confirm: e.target.value }))
          }
          size="lg"
          iconLeft={<MdLock size={18} />}
          iconShow={<MdVisibility size={18} />}
          iconHide={<MdVisibilityOff size={18} />}
          error={errors.confirm}
        />
      </div>

      <ul className="mt-3 mb-4 space-y-1.5 text-sm">
        <Rule ok={rules.len} label="8 caracteres mínimo" />
        <Rule ok={rules.upper} label="1 letra mayúscula" />
        <Rule ok={rules.special} label="1 carácter especial" />
      </ul>

      <div className="mb-2">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={values.accept}
            onChange={(e) =>
              setValues((v) => ({ ...v, accept: e.target.checked }))
            }
            className="mt-1 accent-[#6C4CFF]"
          />
          <span className={errors.accept ? "text-red-300" : "text-white/80"}>
            Acepto{" "}
            <a
              href="/legal/terms-privacy#privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Aviso de Privacidad
            </a>
            ,{" "}
            <a
              href="/legal/terms-privacy#terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Condiciones de Uso
            </a>{" "}
            y{" "}
            <a
              href="/legal/data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Política de Protección de Datos
            </a>
            .
          </span>
        </label>
        {errors.accept && (
          <p className="mt-1 text-xs text-red-300">{errors.accept}</p>
        )}
      </div>

      <div className="flex gap-3 mt-4 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="h-12 w-1/3 rounded-full bg-white/10 hover:bg-white/15 transition"
        >
          Volver
        </button>
        <button
          type="submit"
          className="h-12 flex-1 rounded-full bg-[#6C4CFF] font-medium shadow-[0_6px_18px_rgba(108,76,255,0.35)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Crear Cuenta
        </button>
      </div>

      <div className="text-center text-sm text-white/80">
        <div>¿Ya tienes cuenta?</div>
        <button
          type="button"
          onClick={onToLogin}
          className="underline underline-offset-4"
        >
          Inicia sesión.
        </button>
      </div>
    </motion.form>
  );
}
