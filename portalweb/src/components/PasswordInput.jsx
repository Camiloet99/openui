import { useState } from "react";
import Input from "./Input";

export default function PasswordInput({
  iconLeft,
  iconShow,
  iconHide,
  size = "lg",
  ...props
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      size={size}
      type={visible ? "text" : "password"}
      iconLeft={iconLeft}
      rightAdornment={
        <button
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible((v) => !v)}
          className="cursor-pointer"
        >
          {visible ? iconHide : iconShow}
        </button>
      }
    />
  );
}
