import { HTMLAttributes } from "react";
import { clsx } from "clsx";

const colorMap = {
  default: "bg-surface text-text-secondary border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  accent: "bg-accent/10 text-accent border-accent/20",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof typeof colorMap;
}

export default function Badge({
  color = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        colorMap[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
