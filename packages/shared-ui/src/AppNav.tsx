export interface AppNavItem {
  href: string;
  label: string;
}

export interface AppNavProps {
  items: AppNavItem[];
  activeHref: string;
}

/**
 * Nav dùng chung giữa các zone (Next.js Multi-Zones) — luôn dùng thẻ <a> thuần thay vì
 * next/link, vì điều hướng có thể băng qua zone khác (domain/app khác); next/link chỉ
 * soft-navigate đúng trong cùng 1 zone (xem docs/findings/R2-module-federation-nextjs-approuter.md).
 */
export function AppNav({ items, activeHref }: AppNavProps) {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {items.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <a
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
          </a>
        );
      })}
    </nav>
  );
}
