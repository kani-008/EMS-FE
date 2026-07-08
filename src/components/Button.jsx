// frontend/src/components/Button.jsx
import React from "react";

const PlusIcon = () => (
  <svg
    className="w-4 h-4 shrink-0"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
  </svg>
);

const VARIANTS = {
  primary:
    "border border-green-600 text-green-600 hover:bg-green-600 hover:text-white active:scale-95",
  "outline-green":
    "border border-green-600 text-green-600 hover:bg-green-600 hover:text-white active:scale-95",
  danger:
    "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white active:scale-95",
  "outline-red":
    "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white active:scale-95",
  primaryCreate:
    "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm",
  "outline-blue":
    "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-95",
  ghost:
    "border border-slate-400 text-slate-600 hover:bg-slate-100 active:scale-95",
};

const BASE =
  "inline-flex items-center justify-center gap-2 " +
  "px-5 py-2 h-10 " + // Single default size: px-5 py-2 h-10 (every button must be the same size)
  "rounded-md text-sm font-medium " +
  "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 " +
  "whitespace-nowrap";

const Button = ({
  label,
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  iconOnlyMobile = false,
  ariaLabel,
  className = "",
}) => {
  const isDisabled = disabled || loading;
  const variantCls = VARIANTS[variant] ?? VARIANTS.primary;
  const displayAriaLabel = ariaLabel || (typeof label === "string" ? label : undefined);
  const content = label ?? children;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={displayAriaLabel}
      aria-label={displayAriaLabel}
      className={[
        BASE,
        variantCls,
        isDisabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin mr-1 text-currentColor"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}

      {!loading && variant === "primaryCreate" && <PlusIcon />}

      {!loading && variant !== "primaryCreate" && icon && (
        <span className="shrink-0">{icon}</span>
      )}

      {content && (
        <span className={iconOnlyMobile ? "max-sm:hidden" : ""}>
          {content}
        </span>
      )}
    </button>
  );
};

export default Button;
