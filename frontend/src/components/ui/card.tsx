import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ glass = true, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-2xl",
        glass ? "glass-card" : "bg-surface border border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("px-6 py-4 border-b border-border", className)} {...props}>
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent };
export default Card;
