"use client";

import { useEffect, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIntegrationStore } from "@tessera/integration-store";
import {
  AppNav,
  SidebarPanel,
  useSidebarState,
  useT,
  type AppNavItem,
  type IconName,
} from "@tessera/shared-ui";
import type { TranslationKey } from "@tessera/shared-ui";
import { loadDashboardRemote } from "./dashboardRemote";

interface NavDefinition {
  href: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: IconName;
}

const NAV_DEFINITIONS: NavDefinition[] = [
  { href: "/chat", labelKey: "nav.chat", descKey: "nav.chatDesc", icon: "chat" },
  {
    href: "/dashboard",
    labelKey: "nav.dashboard",
    descKey: "nav.dashboardDesc",
    icon: "dashboard",
  },
  { href: "/overview", labelKey: "nav.overview", descKey: "nav.overviewDesc", icon: "layers" },
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
  const t = useT();
  const pathname = usePathname();
  const setNavState = useIntegrationStore((state) => state.setNavState);
  const { closeMobile } = useSidebarState();

  useEffect(() => {
    setNavState(pathname);
    closeMobile();
  }, [pathname, setNavState, closeMobile]);

  const items: AppNavItem[] = NAV_DEFINITIONS.map((definition) => ({
    href: definition.href,
    label: t(definition.labelKey),
    description: t(definition.descKey),
    icon: definition.icon,
  }));

  return (
    <SidebarPanel>
      <AppNav items={items} activeHref={pathname} LinkComponent={PrefetchLink} />
    </SidebarPanel>
  );
}
