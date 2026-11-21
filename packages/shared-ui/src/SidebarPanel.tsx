"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { Icon } from "./Icon";
import { useT } from "./i18n";
import { useSidebarState } from "./sidebarState";

export interface SidebarPanelProps extends PropsWithChildren {
  /** Khối cuối sidebar (tuỳ chọn) — ở shell hiện không dùng để giữ rail sạch. */
  footer?: ReactNode;
}

/**
 * Sidebar điều hướng. Nút thu gọn thu cả rail về 72px (icon + tooltip), không chỉ ẩn nav;
 * trạng thái sống ở `SidebarStateProvider` để Layout đổi được bề rộng.
 */
export function SidebarPanel({ footer, children }: SidebarPanelProps) {
  const t = useT();
  const { collapsed, toggle } = useSidebarState();

  return (
    <>
      <div className="ts-sidebar__nav">{children}</div>
      <div className="ts-sidebar__foot">
        {!collapsed && footer ? footer : null}
        <button
          type="button"
          className="ts-mini-btn ts-collapse"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
        >
          <Icon
            name="chevron"
            size={14}
            style={{ transform: collapsed ? "none" : "rotate(180deg)" }}
          />
          {collapsed ? null : <span className="ts-collapse__label">{t("nav.collapse")}</span>}
        </button>
      </div>
    </>
  );
}
