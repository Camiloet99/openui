// src/components/auth/SignupIdentityStep.jsx
import { motion } from "framer-motion";
import { MdEmail, MdLock } from "react-icons/md";
import Input from "../Input";

const variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: { opacity: 0, x: 12, transition: { duration: 0.22, ease: "easeIn" } },
};

export default function SignupIdentityStep({
  values,
  setValues,
  errors,
  generalError,
  isVerifying,
  onValidate,
  onToLogin,
}) {
  return (
    <motion.form
      key="signup-step1"
      onSubmit={onValidate}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="space-y-5">
        <Input
          autoFocus
          aria-invalid={!!errors.email}
          placeholder="Email institucional"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          type="email"
          size="lg"
          iconLeft={<MdEmail size={18} />}
          error={errors.email}
        />
        <Input
          placeholder="Cédula de ciudadanía"
          value={values.dni}
          onChange={(e) => setValues((v) => ({ ...v, dni: e.target.value }))}
          size="lg"
          iconLeft={<MdLock size={18} />}
          error={errors.dni}
          helperText={!errors.dni ? "6–10 dígitos" : ""}
        />
        {generalError && (
          <div
            role="alert"
            className="text-sm rounded-md bg-red-500/10 border border-red-400/40 text-red-200 px-3 py-2"
          >
            {generalError}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isVerifying}
        className="mt-7 mb-8 h-12 w-full rounded-full bg-[#6C4CFF] font-medium shadow-[0_6px_18px_rgba(108,76,255,0.35)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-60"
      >
        {isVerifying ? "Validando..." : "Validar"}
      </button>

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
