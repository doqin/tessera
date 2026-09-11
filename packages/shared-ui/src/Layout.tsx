import type { PropsWithChildren, ReactNode } from "react";

export interface LayoutProps extends PropsWithChildren {
  header?: ReactNode;
  sidebar?: ReactNode;
}

/**
 * Layout khung chung (header + sidebar tuỳ chọn + vùng nội dung) — dùng cho Shell và cho
 * layout nội bộ của module khi cần bố cục nhất quán. Theo checklist D2 §7.
 */
export function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {header ? <header className="border-b border-border">{header}</header> : null}
      <div className="flex flex-1">
        {sidebar ? <aside className="w-56 shrink-0 border-r border-border">{sidebar}</aside> : null}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
