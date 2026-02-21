import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

const variants = {
  primary:
    "bg-gradient-brand text-white hover:opacity-90",
  secondary:
    "bg-surface border border-border text-text-primary hover:bg-white/5",
  danger:
    "bg-danger text-white hover:bg-danger/90",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-white/5",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
