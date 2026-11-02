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
    <nav className="flex flex-col gap-1 p-2">
      {items.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
