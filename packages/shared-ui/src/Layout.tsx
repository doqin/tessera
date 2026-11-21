"use client";

import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import { useT } from "./i18n";
import { SidebarStateProvider, useSidebarState } from "./sidebarState";

export interface LayoutProps extends PropsWithChildren {
  /** Header đã render sẵn (AppHeader/ShellHeader) — Layout không bọc thêm. */
  header?: ReactNode;
  sidebar?: ReactNode;
  /** Thanh trạng thái dưới cùng (tuỳ chọn). */
  statusBar?: ReactNode;
}

function Shell({ header, sidebar, statusBar, children }: LayoutProps) {
  const t = useT();
  const { collapsed, mobileOpen, closeMobile } = useSidebarState();
  const sidebarRef = useRef<HTMLElement>(null);

  // Escape đóng drawer; lên desktop thì đóng luôn để lần thu nhỏ sau không mở sẵn.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKeyDown);

    const desktop =
      typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 901px)") : null;
    const onChange = () => {
      if (desktop?.matches) closeMobile();
    };
    desktop?.addEventListener("change", onChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop?.removeEventListener("change", onChange);
    };
  }, [mobileOpen, closeMobile]);

  // Đưa focus vào drawer khi mở; trả về nút hamburger khi đóng để bàn phím không bị mất chỗ.
  useEffect(() => {
    const aside = sidebarRef.current;
    if (!aside) return;

    if (mobileOpen) {
      aside.querySelector<HTMLElement>("a, button")?.focus();
      return;
    }
    if (aside.contains(document.activeElement)) {
      document.getElementById("nav-toggle")?.focus();
    }
  }, [mobileOpen]);

  const sidebarClasses = [
    "ts-sidebar",
    collapsed ? "ts-sidebar--collapsed" : "",
    mobileOpen ? "ts-sidebar--mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ts-app">
      {header}
      <div className="ts-body">
        {sidebar ? (
          <>
            {mobileOpen ? (
              <button
                type="button"
                className="ts-scrim"
                aria-label={t("nav.close")}
                onClick={closeMobile}
              />
            ) : null}
            <aside
              id="app-nav"
              ref={sidebarRef}
              className={sidebarClasses}
              aria-label={t("nav.menu")}
            >
              {sidebar}
            </aside>
          </>
        ) : null}
        <main className="ts-main">
          <div className="ts-main__inner">{children}</div>
        </main>
      </div>
      {statusBar}
    </div>
  );
}

/**
 * Khung ứng dụng 3 vùng: header / sidebar + nội dung / status bar.
 * Cao đúng bằng viewport (`100dvh`) và chỉ vùng nội dung cuộn, nên không bao giờ có thêm
 * một thanh cuộn của cả trang phía sau panel chat. Dưới 900 px sidebar thành drawer mở bằng
 * nút hamburger trên top bar.
 */
export function Layout(props: LayoutProps) {
  return (
    <SidebarStateProvider>
      <Shell {...props} />
    </SidebarStateProvider>
  );
}
