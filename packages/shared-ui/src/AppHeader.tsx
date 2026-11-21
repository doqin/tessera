"use client";

import type { ElementType, ReactNode } from "react";
import { useT } from "./i18n";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AppHeaderProps {
  /** Tên sản phẩm; mặc định lấy từ bộ chuỗi i18n. */
  title?: string;
  tagline?: string;
  breadcrumb?: BreadcrumbItem[];
  /** Vùng bên phải: theme toggle, language switch, session badge… */
  actions?: ReactNode;
  /** `next/link` khi chạy trong Next.js, mặc định thẻ <a>. */
  LinkComponent?: ElementType;
}

/**
 * Header dùng chung cho Shell và trang chạy độc lập của từng module.
 * Shell truyền breadcrumb + actions (ThemeToggle/LocaleToggle); module độc lập chỉ cần brand.
 */
export function AppHeader({
  title,
  tagline,
  breadcrumb,
  actions,
  LinkComponent = "a",
}: AppHeaderProps) {
  const t = useT();
  const BrandLink = LinkComponent;

  return (
    <header className="ts-header">
      <BrandLink href="/" className="ts-header__brand">
        <span className="ts-logo" aria-hidden="true">
          T
        </span>
        <span>
          <span className="ts-brand__name">{title ?? t("app.name")}</span>
          <span className="ts-brand__tag">{tagline ?? t("app.tagline")}</span>
        </span>
      </BrandLink>

      {breadcrumb && breadcrumb.length > 0 ? (
        <nav className="ts-crumb" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <span key={`${item.label}-${index}`} className="ts-crumb__item">
                {index > 0 ? (
                  <span className="ts-crumb__sep" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {isLast || !item.href ? (
                  <span
                    className={isLast ? "ts-crumb__current" : undefined}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <BrandLink href={item.href}>{item.label}</BrandLink>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}

      {actions ? <div className="ts-header__actions">{actions}</div> : null}
    </header>
  );
}
