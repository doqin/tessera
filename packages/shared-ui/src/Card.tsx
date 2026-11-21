import { forwardRef, type HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * Card dùng chung cho Shell và mọi Micro Frontend module (shared design system).
 * Dựa trên dqcss nhưng dùng `ts-card` (bo góc mềm, viền 1px, bóng nhẹ) để khớp theme mới.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["ts-card", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["ts-card__head", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["ts-card__body", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});

CardContent.displayName = "CardContent";
