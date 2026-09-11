"use client";

import { useEffect } from "react";
import { AppNav, type AppNavItem } from "@tessera/shared-ui";
import { useIntegrationStore } from "@tessera/integration-store";

const NAV_ITEMS: AppNavItem[] = [
  { href: "/chat", label: "Chat" },
  { href: "/dashboard", label: "Dashboard" },
];

/**
 * Zone Chat module chỉ phục vụ đúng 1 route (`/chat`) nên activeHref cố định — khác với Shell's
 * Sidebar (specs/001-shell-app), nơi activeHref phải theo dõi usePathname() vì Shell phục vụ
 * nhiều route trong cùng zone.
 */
export function ZoneNav() {
  const setNavState = useIntegrationStore((state) => state.setNavState);

  useEffect(() => {
    setNavState("/chat");
  }, [setNavState]);

  return <AppNav items={NAV_ITEMS} activeHref="/chat" />;
}
