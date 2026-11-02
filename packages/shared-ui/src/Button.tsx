import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "dq-btn--primary",
  secondary: "dq-btn--secondary",
};

/**
 * Button dùng chung cho Shell và mọi Micro Frontend module (shared design system).
 * Đã chuyển từ Tailwind/shadcn sang dqcss (BIOS-screen VGA look).
 * Size được giữ nguyên theo kích thước mặc định của .dq-btn (padding space-2–4).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, type = "button", ...props }, ref) => {
    const classes = ["dq-btn", variantClasses[variant], className].filter(Boolean).join(" ");

    return <button ref={ref} type={type} className={classes} {...props} />;
  },
);

Button.displayName = "Button";
