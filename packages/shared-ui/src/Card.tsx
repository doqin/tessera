import { forwardRef, type HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * Card dùng chung cho Shell và mọi Micro Frontend module (shared design system).
 * Đã chuyển từ Tailwind/shadcn sang dqcss (BIOS-screen VGA look).
 * .dq-panel — cyan title bar, square corners, hard drop shadow.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["dq-panel", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["dq-panel__title", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const classes = ["dq-panel__body", className].filter(Boolean).join(" ");
  return <div ref={ref} className={classes} {...props} />;
});

CardContent.displayName = "CardContent";
