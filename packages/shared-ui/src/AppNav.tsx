import type { ElementType } from "react";
import { Icon, type IconName } from "./Icon";

export interface AppNavItem {
  href: string;
  label: string;
  /** Dòng mô tả ngắn dưới nhãn (trang trí, đã aria-hidden để tên link vẫn gọn). */
  description?: string;
  icon?: IconName;
}

export interface AppNavProps {
  items: AppNavItem[];
  activeHref: string;
  /**
   * Component render link. Mặc định thẻ `<a>` thuần (hard navigation); host truyền `next/link`
   * để điều hướng mềm giữa các route cùng app (không reload trang — spec 001 FR2/FR3).
   */
  LinkComponent?: ElementType;
}

export function AppNav({ items, activeHref, LinkComponent = "a" }: AppNavProps) {
  const Link = LinkComponent;

  return (
    <nav className="ts-nav" aria-label="Điều hướng chính">
      {items.map((item) => {
        const isActive = activeHref === item.href || activeHref.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            className="ts-nav__link"
          >
            {item.icon ? (
              <span className="ts-nav__icon">
                <Icon name={item.icon} size={18} />
              </span>
            ) : null}
            <span className="ts-nav__text">
              <span>{item.label}</span>
              {item.description ? (
                <span className="ts-nav__desc" aria-hidden="true">
                  {item.description}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
