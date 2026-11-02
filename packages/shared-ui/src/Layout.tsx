import type { PropsWithChildren, ReactNode } from "react";

export interface LayoutProps extends PropsWithChildren {
  header?: ReactNode;
  sidebar?: ReactNode;
}

/**
 * Layout khung chung (header + sidebar tuỳ chọn + vùng nội dung) — dùng cho Shell và cho
 * layout nội bộ của module khi cần bố cục nhất quán.
 * Đã chuyển từ Tailwind/shadcn sang dqcss (BIOS-screen VGA look).
 * Bao dùng: .dq-container (lề giới hạn), .dq-stack (cột ngang), .dq-row (ngang).
 */
export function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <div className="dq-stack" style={{ minHeight: "100vh", gap: 0 }}>
      {header ? (
        <header
          className="dq-navbar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "var(--dq-space-2) var(--dq-space-4)",
          }}
        >
          {header}
        </header>
      ) : null}
      <div className="dq-row" style={{ flex: 1, alignItems: "stretch", gap: 0 }}>
        {sidebar ? (
          <aside
            style={{
              flexShrink: 0,
              alignSelf: "stretch",
              display: "flex",
              padding: "var(--dq-space-4) 0 var(--dq-space-4) var(--dq-space-4)",
            }}
          >
            {sidebar}
          </aside>
        ) : null}
        <main
          className="dq-stack"
          style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "var(--dq-space-4)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
