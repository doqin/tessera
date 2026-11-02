/**
 * AppHeader — header cho Shell (BIOS-screen VGA look, dqcss).
 * Sử dụng .dq-row cho cột ngang + inline style cho căn chỉnh giữa hai phần.
 */
export function AppHeader() {
  return (
    <div
      className="dq-row"
      style={{ justifyContent: "space-between", padding: "var(--dq-space-2) var(--dq-space-4)" }}
    >
      <span style={{ fontSize: "var(--dq-text-base)", fontWeight: 700 }}>AI Agent UI — Shell</span>
    </div>
  );
}
