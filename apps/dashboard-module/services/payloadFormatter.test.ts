import { toPayloadView } from "./payloadFormatter";

describe("toPayloadView", () => {
  it("turns a plain object into key-value entries", () => {
    expect(toPayloadView({ query: "demo", limit: 3 })).toEqual({
      kind: "entries",
      entries: [
        { key: "query", value: "demo" },
        { key: "limit", value: "3" },
      ],
    });
  });

  it("renders nested objects and arrays as compact JSON", () => {
    expect(toPayloadView({ filter: { type: "a" }, tags: ["x", "y"] })).toEqual({
      kind: "entries",
      entries: [
        { key: "filter", value: '{"type":"a"}' },
        { key: "tags", value: '["x","y"]' },
      ],
    });
  });

  it("uses index keys for arrays", () => {
    expect(toPayloadView(["a", 2, null])).toEqual({
      kind: "entries",
      entries: [
        { key: "[0]", value: "a" },
        { key: "[1]", value: "2" },
        { key: "[2]", value: "null" },
      ],
    });
  });

  it("parses a JSON object string into entries", () => {
    expect(toPayloadView('{"summary":"done"}')).toEqual({
      kind: "entries",
      entries: [{ key: "summary", value: "done" }],
    });
  });

  it("keeps a plain string that is not a JSON container as text", () => {
    expect(toPayloadView("hello world")).toEqual({ kind: "text", text: "hello world" });
    expect(toPayloadView("{not json")).toEqual({ kind: "text", text: "{not json" });
  });

  it("shows empty containers as text", () => {
    expect(toPayloadView({})).toEqual({ kind: "text", text: "{}" });
    expect(toPayloadView([])).toEqual({ kind: "text", text: "[]" });
  });

  it("falls back to String() for scalars, null and functions", () => {
    expect(toPayloadView(42)).toEqual({ kind: "text", text: "42" });
    expect(toPayloadView(null)).toEqual({ kind: "text", text: "null" });
    expect(toPayloadView(true)).toEqual({ kind: "text", text: "true" });
    const fn = () => "func";
    expect(toPayloadView(fn)).toEqual({ kind: "text", text: String(fn) });
  });

  it("uses the message for an Error", () => {
    expect(toPayloadView(new Error("tool failed"))).toEqual({
      kind: "text",
      text: "tool failed",
    });
  });

  it("treats non-plain objects such as Date as text, not as empty entries", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    expect(toPayloadView(date)).toEqual({ kind: "text", text: String(date) });
  });

  it("does not throw on circular references", () => {
    const circular: Record<string, unknown> = { name: "loop" };
    circular.self = circular;
    const view = toPayloadView(circular);
    expect(view.kind).toBe("entries");
    expect(view).toEqual({
      kind: "entries",
      entries: [
        { key: "name", value: "loop" },
        { key: "self", value: "[object Object]" },
      ],
    });
  });

  it("falls back to Object.prototype.toString when String() throws", () => {
    class Hostile {
      toString(): string {
        throw new Error("no string form");
      }
    }
    expect(toPayloadView(new Hostile())).toEqual({ kind: "text", text: "[object Object]" });
  });
});
