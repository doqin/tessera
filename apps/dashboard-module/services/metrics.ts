import type { DashboardMetrics, ToolCall, ToolFilter } from "../types/dashboard";

/** Tool call bị coi là lỗi khi service gắn status "error" hoặc result là một Error. */
export function isErrorCall(call: ToolCall): boolean {
  return call.status === "error" || call.result instanceof Error;
}

/** Tổng hợp số liệu KPI cho Dashboard (004 — KPI cards). */
export function computeMetrics(calls: ToolCall[]): DashboardMetrics {
  const total = calls.length;
  const failed = calls.filter(isErrorCall).length;
  const success = total - failed;

  const durations = calls
    .map((call) => call.durationMs)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const avgLatencyMs =
    durations.length > 0
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : null;

  return {
    total,
    success,
    failed,
    successRate: total === 0 ? 0 : Math.round((success / total) * 100),
    avgLatencyMs,
    distinctTools: new Set(calls.map((call) => call.name)).size,
  };
}

/** Tìm theo tên tool, tham số và kết quả (không phân biệt hoa thường). */
export function matchesQuery(call: ToolCall, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    call.name,
    call.status ?? "",
    safeStringify(call.params),
    safeStringify(call.result),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function filterToolCalls(calls: ToolCall[], filter: ToolFilter, query: string): ToolCall[] {
  return [...calls].reverse().filter((call) => {
    if (filter === "success" && isErrorCall(call)) return false;
    if (filter === "error" && !isErrorCall(call)) return false;
    return matchesQuery(call, query);
  });
}

/** JSON để hiển thị/sao chép — không throw với vòng tham chiếu, BigInt hay Error. */
export function safeStringify(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Payload đầy đủ của một tool call dưới dạng JSON pretty-print. */
export function toolCallToJson(call: ToolCall): string {
  const payload = {
    id: call.id,
    name: call.name,
    status: call.status ?? (isErrorCall(call) ? "error" : "success"),
    calledAt: call.calledAt,
    durationMs: call.durationMs,
    params: call.params,
    result: call.result instanceof Error ? { message: call.result.message } : call.result,
  };
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return safeStringify(payload);
  }
}
