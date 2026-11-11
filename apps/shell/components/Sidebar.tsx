"use client";

import { useEffect, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppNav, SidebarPanel, type AppNavItem } from "@tessera/shared-ui";
import { useIntegrationStore } from "@tessera/integration-store";
import { loadDashboardRemote } from "./dashboardRemote";

const NAV_ITEMS: AppNavItem[] = [
  { href: "/chat", label: "Chat" },
  { href: "/dashboard", label: "Dashboard" },
];

/**
 * Nạp trước remote khi hover/focus link: lần điều hướng đầu tới /dashboard phải tải remoteEntry.js
 * (~330 ms, specs/003-dashboard-module/tasks.md T016) — làm việc này sớm để vượt ngưỡng NFR2 (<300 ms).
 * import() được webpack cache nên gọi lặp lại không tải lại; lỗi nạp để boundary xử lý khi mount thật.
 */
const PREFETCH_BY_HREF: Record<string, () => Promise<unknown>> = {
  "/dashboard": loadDashboardRemote,
};

function PrefetchLink(props: ComponentProps<typeof Link>) {
  const prefetch = () => {
    void PREFETCH_BY_HREF[String(props.href)]?.().catch(() => undefined);
  };
  return <Link {...props} onMouseEnter={prefetch} onFocus={prefetch} />;
}

export function Sidebar() {
  const pathname = usePathname();
  const setNavState = useIntegrationStore((state) => state.setNavState);

  useEffect(() => {
    setNavState(pathname);
  }, [pathname, setNavState]);

  return (
    <SidebarPanel>
      <AppNav items={NAV_ITEMS} activeHref={pathname} LinkComponent={PrefetchLink} />
    </SidebarPanel>
  );
}
