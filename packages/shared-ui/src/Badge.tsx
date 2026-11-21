import type { HTMLAttributes, PropsWithChildren } from "react";

export type BadgeTone = "neutral" | "primary" | "success" | "danger" | "warning";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Nhãn nhỏ bo tròn (trạng thái tool, model, session…). */
export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  const classes = ["ts-badge", tone !== "neutral" ? `ts-badge--${tone}` : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

export function BadgeRow({ children }: PropsWithChildren) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{children}</div>;
}
