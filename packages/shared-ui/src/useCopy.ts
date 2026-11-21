"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sao chép văn bản vào clipboard kèm cờ `copied` tự tắt sau `resetMs`.
 * Dùng `navigator.clipboard` khi có (secure context), fallback `execCommand` cho môi trường cũ
 * và cho jsdom trong test.
 */
export function useCopy(resetMs = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else if (typeof document !== "undefined") {
          const area = document.createElement("textarea");
          area.value = text;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          document.execCommand?.("copy");
          document.body.removeChild(area);
        }
      } catch {
        // Clipboard bị chặn — vẫn hiện phản hồi để người dùng biết thao tác đã chạy.
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
    },
    [resetMs],
  );

  return { copied, copy };
}
