/**
 * Model — chuyển `parameters`/`result` của tool call thành dạng hiển thị (FR3, AC3).
 *
 * - Object (hoặc chuỗi JSON của object) → danh sách key-value; giá trị lồng nhau rút gọn dạng JSON.
 * - Array → danh sách key là chỉ số `[0]`, `[1]`…
 * - Error → thông điệp lỗi; giá trị khác (số, chuỗi, null, function…) → `String(value)`.
 * Không throw: giá trị không serialize được (vòng tham chiếu, BigInt…) rơi xuống `String(value)`.
 */

export interface PayloadEntry {
  key: string;
  value: string;
}

export type PayloadView =
  { kind: "entries"; entries: PayloadEntry[] } | { kind: "text"; text: string };

export function toPayloadView(value: unknown): PayloadView {
  if (value instanceof Error) return { kind: "text", text: value.message };

  const source = parseJsonContainer(value) ?? value;

  if (Array.isArray(source)) {
    if (source.length === 0) return { kind: "text", text: "[]" };
    return {
      kind: "entries",
      entries: source.map((item, index) => ({ key: `[${index}]`, value: formatValue(item) })),
    };
  }

  if (isPlainObject(source)) {
    const keys = Object.keys(source);
    if (keys.length === 0) return { kind: "text", text: "{}" };
    return {
      kind: "entries",
      entries: keys.map((key) => ({ key, value: formatValue(source[key]) })),
    };
  }

  return { kind: "text", text: stringifyScalar(source) };
}

/** Chuỗi có dạng JSON object/array (`'{"a":1}'`) được parse thành container; còn lại trả về null. */
function parseJsonContainer(value: unknown): unknown {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Giá trị bên trong một entry: chuỗi giữ nguyên, container dạng JSON gọn, còn lại `String()`. */
function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  if (typeof value === "object" && value !== null) {
    try {
      const serialized = JSON.stringify(value);
      return serialized === undefined ? String(value) : serialized;
    } catch {
      return String(value);
    }
  }
  return stringifyScalar(value);
}

function stringifyScalar(value: unknown): string {
  try {
    return String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}
