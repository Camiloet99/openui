// src/components/auth/ForgotForm.jsx
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

export default function ForgotForm({
  values,
  setValues,
  errors,
  onSubmit,
  onToLogin,
}) {
  return (
    <motion.form
      key="forgot"
      onSubmit={onSubmit}
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
          helperText={!errors.email ? "Email incorrecto" : ""}
          id="fp-email"
        />
        <Input
          placeholder="Código de Seguridad"
          value={values.code}
          onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
          size="lg"
          iconLeft={<MdLock size={18} />}
          error={errors.code}
          helperText={!errors.code ? "6 dígitos" : ""}
          id="fp-code"
        />
        <Input
          placeholder="Últimos 4 dígitos de la cédula"
          value={values.dni4}
          onChange={(e) => setValues((v) => ({ ...v, dni4: e.target.value }))}
          size="lg"
          iconLeft={<MdLock size={18} />}
          error={errors.dni4}
          helperText={!errors.dni4 ? "4 dígitos" : ""}
          id="fp-dni4"
        />
      </div>

      <button
        type="submit"
        className="mt-7 mb-8 h-12 w-full rounded-full bg-[#6C4CFF] font-medium shadow-[0_6px_18px_rgba(108,76,255,0.35)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        Validar
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
