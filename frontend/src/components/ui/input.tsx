import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full py-3 rounded-xl bg-surface border text-text-primary placeholder:text-text-muted focus:outline-none transition-colors",
              icon ? "pl-11 pr-4" : "px-4",
              error
                ? "border-danger focus:border-danger"
                : "border-border focus:border-primary",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
