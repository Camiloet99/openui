import { motion } from "framer-motion";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
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

export default function LoginForm({
  onSubmit,
  onToForgot,
  onToSignup,
  errors,
  values,
  setValues,
}) {
  return (
    <motion.form
      key="login"
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
          placeholder="Email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          type="email"
          size="lg"
          iconLeft={<MdEmail size={18} />}
          error={errors.email}
        />
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
      </div>

      <div className="flex justify-center pt-7 pb-3">
        <button
          type="button"
          onClick={onToForgot}
          className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
        >
          ¿Has olvidado tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        className="mt-6 mb-8 h-12 w-full rounded-full bg-[#6C4CFF] font-medium shadow-[0_6px_18px_rgba(108,76,255,0.35)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        Ingresar
      </button>

      <div className="text-center text-sm text-white/80">
        <div>¿No tienes cuenta?</div>
        <button
          type="button"
          onClick={onToSignup}
          className="underline underline-offset-4"
        >
          Crea una aquí.
        </button>
      </div>
    </motion.form>
  );
}
