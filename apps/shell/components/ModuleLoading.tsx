"use client";

/**
 * Trạng thái đang nạp remote Module Federation (Clarify 001 §9: không để màn hình trắng).
 */
export function ModuleLoading({ label }: { label: string }) {
  return (
    <div className="ts-card" style={{ padding: "var(--dq-space-6)" }}>
      <span className="ts-loading">
        <span className="ts-spinner" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}
