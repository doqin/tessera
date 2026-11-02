"use client";

import { useId, useState, type PropsWithChildren } from "react";

export interface SidebarPanelProps extends PropsWithChildren {
  title?: string;
  /** Trạng thái thu gọn ban đầu (uncontrolled). */
  defaultCollapsed?: boolean;
}

/**
 * Sidebar dạng panel (.dq-panel — cùng kiểu với panel của Chat module) có thể thu gọn.
 * Thanh tiêu đề giữ nút bật/tắt; khi thu gọn chỉ còn nút đó.
 */
export function SidebarPanel({
  title = "Menu",
  defaultCollapsed = false,
  children,
}: SidebarPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const bodyId = useId();

  return (
    <div
      className="dq-panel"
      style={{
        gap: 0,
        paddingBottom: 0,
        width: collapsed ? "auto" : "14rem",
      }}
    >
      <div
        className="dq-panel__title"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: "var(--dq-space-2)",
          borderBottom: collapsed ? "none" : undefined,
        }}
      >
        {collapsed ? null : <span>{title}</span>}
        <button
          type="button"
          className="dq-btn dq-btn--primary"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          style={{ padding: "0 var(--dq-space-2)", marginBottom: "var(--dq-shadow-offset)" }}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      <div
        id={bodyId}
        hidden={collapsed}
        style={{
          margin: "0 calc(var(--dq-panel-pad) * -1)",
          padding: "var(--dq-space-2) 0 var(--dq-panel-pad)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
