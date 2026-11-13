"use client";

import { useEffect, useState, type ComponentType } from "react";

type RemoteModule = { default: ComponentType };

type RemoteState =
  | { status: "loading" }
  | { status: "ready"; Component: ComponentType }
  | { status: "error"; error: unknown };

/**
 * Nạp remote Module Federation bằng state thường thay vì `next/dynamic`.
 *
 * `next/dynamic` dựa vào Suspense, và React chủ động giữ fallback tối thiểu ~300 ms trước khi hiện
 * nội dung thật (throttle) — nên điều hướng lần đầu tới route có remote luôn mất ≥300 ms dù remote
 * đã được prefetch (đo: 305 ms cả trên localhost, không có request mạng nào). Không dùng Suspense
 * thì nội dung hiện ngay khi `import()` resolve.
 *
 * Lỗi nạp được ném lại trong render để `RemoteModuleBoundary` bắt (spec FR5/AC5).
 */
export function useRemoteComponent(load: () => Promise<RemoteModule>): ComponentType | null {
  const [state, setState] = useState<RemoteState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    load().then(
      (module) => active && setState({ status: "ready", Component: module.default }),
      (error: unknown) => active && setState({ status: "error", error }),
    );
    return () => {
      active = false;
    };
  }, [load]);

  if (state.status === "error") throw state.error;
  return state.status === "ready" ? state.Component : null;
}
