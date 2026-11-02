import type { ElementType } from "react";

export interface AppNavItem {
  href: string;
  label: string;
}

export interface AppNavProps {
  items: AppNavItem[];
  activeHref: string;
  /**
   * Component render link. Mặc định thẻ `<a>` thuần (hard navigation); host truyền `next/link`
   * để điều hướng mềm giữa các route cùng app (không reload trang — spec FR2/FR3).
   */
  LinkComponent?: ElementType;
}

export function AppNav({ items, activeHref, LinkComponent = "a" }: AppNavProps) {
  const Link = LinkComponent;
  return (
    <nav aria-label="Điều hướng chính" style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className="dq-navbar__link"
            style={{ padding: "var(--dq-space-2) var(--dq-space-4)" }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
