export default function Input({
  iconLeft,
  rightAdornment,
  size = "lg",
  error = "",
  helperText = "",
  className = "",
  id,
  ...props
}) {
  const sizeClasses =
    size === "lg" ? "h-12 px-5 text-[15px]" : "h-11 px-4 text-sm";
  const borderClasses = error
    ? "border-red-400/70 focus-within:border-red-300 bg-red-500/5"
    : "border-white/15 focus-within:border-white/25 bg-white/5 focus-within:bg-white/10";

  const describedBy =
    helperText || error ? `${id || props.name}-desc` : undefined;

  return (
    <label className={`block ${className}`}>
      <div
        className={[
          "group flex items-center gap-2 rounded-full border transition-colors",
          sizeClasses,
          borderClasses,
        ].join(" ")}
      >
        {iconLeft && (
          <span
            className={`shrink-0 ${error ? "text-red-300" : "text-white/75"}`}
          >
            {iconLeft}
          </span>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className="peer min-w-0 flex-1 bg-transparent text-white placeholder:text-white/55 outline-none"
          {...props}
        />
        {rightAdornment && (
          <span
            className={`shrink-0 ${error ? "text-red-300" : "text-white/75"}`}
          >
            {rightAdornment}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={describedBy}
          className={`mt-2 text-xs ${error ? "text-red-300" : "text-white/70"}`}
        >
          {error || helperText}
        </p>
      )}
    </label>
  );
}
