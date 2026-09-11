import { forwardRef, type HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

const baseClasses = "rounded-lg border border-border bg-card text-card-foreground shadow-sm";

/**
 * Card dùng chung cho Shell và mọi Micro Frontend module (shared design system).
 * Theo checklist D2 §7: "Button, Card, Layout" tối thiểu cho packages/shared-ui.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = [baseClasses, className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["flex flex-col gap-1 p-4", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["p-4 pt-0", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});
CardContent.displayName = "CardContent";
