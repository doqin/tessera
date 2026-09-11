"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppNav, type AppNavItem } from "@tessera/shared-ui";
import { useIntegrationStore } from "@tessera/integration-store";

const NAV_ITEMS: AppNavItem[] = [
  { href: "/chat", label: "Chat" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Sidebar() {
  const pathname = usePathname();
  const setNavState = useIntegrationStore((state) => state.setNavState);

  useEffect(() => {
    setNavState(pathname);
  }, [pathname, setNavState]);

  return <AppNav items={NAV_ITEMS} activeHref={pathname} />;
}
