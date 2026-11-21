"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

const STORAGE_KEY = "tessera-sidebar-collapsed";

interface SidebarState {
  /** Sidebar thu về rail icon 72px (desktop). */
  collapsed: boolean;
  toggle: () => void;
  /** Drawer điều hướng đang mở trên mobile. */
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarStateContext = createContext<SidebarState>({
  collapsed: false,
  toggle: () => undefined,
  mobileOpen: false,
  toggleMobile: () => undefined,
  closeMobile: () => undefined,
});

/**
 * Trạng thái thu gọn sidebar sống ở Layout vì cả rail (bề rộng) lẫn nút bên trong đều cần biết.
 * Ghi nhớ lựa chọn để lần mở sau giữ nguyên; đọc trong effect để server/client không lệch.
 */
export function SidebarStateProvider({ children }: PropsWithChildren) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage bị chặn — giữ mặc định mở.
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Không ghi được thì vẫn đổi cho phiên hiện tại.
      }
      return next;
    });
  }, []);

  const toggleMobile = useCallback(() => setMobileOpen((value) => !value), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({ collapsed, toggle, mobileOpen, toggleMobile, closeMobile }),
    [collapsed, toggle, mobileOpen, toggleMobile, closeMobile],
  );

  return <SidebarStateContext.Provider value={value}>{children}</SidebarStateContext.Provider>;
}

export function useSidebarState(): SidebarState {
  return useContext(SidebarStateContext);
}
