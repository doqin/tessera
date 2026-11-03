/**
 * EmptyState — placeholder khi chưa có tool call nào từ Agent.
 */
export default function EmptyState({
  message = "Chưa có tool nào được gọi",
}: {
  message?: string;
}) {
  return (
    <div
      className="dq-stack"
      style={{
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-lg)" }}>
        {message}
      </span>
    </div>
  );
}
