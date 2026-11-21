import {
  computeMetrics,
  filterToolCalls,
  isErrorCall,
  matchesQuery,
  safeStringify,
  toolCallToJson,
} from "./metrics";
import type { ToolCall } from "../types/dashboard";

const call = (overrides: Partial<ToolCall> = {}): ToolCall => ({
  id: "t1",
  name: "get_weather",
  params: { city: "Hà Nội" },
  result: { temperatureC: 28 },
  calledAt: "2026-01-01T00:00:00Z",
  durationMs: 100,
  status: "success",
  ...overrides,
});

describe("computeMetrics", () => {
  it("returns zeroed metrics for an empty history", () => {
    expect(computeMetrics([])).toEqual({
      total: 0,
      success: 0,
      failed: 0,
      successRate: 0,
      avgLatencyMs: null,
      distinctTools: 0,
    });
  });

  it("computes counts, rate, latency and distinct tools", () => {
    const metrics = computeMetrics([
      call({ id: "1", durationMs: 100 }),
      call({ id: "2", name: "search_docs", durationMs: 200 }),
      call({ id: "3", durationMs: 300, status: "error" }),
    ]);
    expect(metrics).toEqual({
      total: 3,
      success: 2,
      failed: 1,
      successRate: 67,
      avgLatencyMs: 200,
      distinctTools: 2,
    });
  });

  it("counts an Error result as a failure and ignores missing durations", () => {
    const metrics = computeMetrics([
      call({ result: new Error("boom"), durationMs: undefined, status: undefined }),
    ]);
    expect(metrics.failed).toBe(1);
    expect(metrics.avgLatencyMs).toBeNull();
  });
});

describe("isErrorCall", () => {
  it("is true for status error or Error results", () => {
    expect(isErrorCall(call({ status: "error" }))).toBe(true);
    expect(isErrorCall(call({ result: new Error("x") }))).toBe(true);
    expect(isErrorCall(call())).toBe(false);
  });
});

describe("matchesQuery", () => {
  it("matches everything for an empty query", () => {
    expect(matchesQuery(call(), "   ")).toBe(true);
  });

  it("searches name, params and result case-insensitively", () => {
    expect(matchesQuery(call(), "WEATHER")).toBe(true);
    expect(matchesQuery(call(), "hà nội")).toBe(true);
    expect(matchesQuery(call(), "28")).toBe(true);
    expect(matchesQuery(call(), "nothing")).toBe(false);
  });

  it("matches on status", () => {
    expect(matchesQuery(call({ status: "error" }), "error")).toBe(true);
  });
});

describe("filterToolCalls", () => {
  const success = call({ id: "1", name: "get_weather" });
  const failure = call({ id: "2", name: "search_docs", status: "error" });

  it("returns the newest call first", () => {
    expect(filterToolCalls([success, failure], "all", "").map((item) => item.id)).toEqual([
      "2",
      "1",
    ]);
  });

  it("filters by outcome", () => {
    expect(filterToolCalls([success, failure], "success", "").map((item) => item.id)).toEqual([
      "1",
    ]);
    expect(filterToolCalls([success, failure], "error", "").map((item) => item.id)).toEqual(["2"]);
  });

  it("filters by query", () => {
    expect(filterToolCalls([success, failure], "all", "weather").map((item) => item.id)).toEqual([
      "1",
    ]);
  });
});

describe("safeStringify", () => {
  it("handles strings, errors, circular objects and primitives", () => {
    expect(safeStringify("plain")).toBe("plain");
    expect(safeStringify(new Error("bad"))).toBe("bad");
    expect(safeStringify(42)).toBe("42");

    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(safeStringify(circular)).toBe("[object Object]");
  });
});

describe("toolCallToJson", () => {
  it("serialises the full payload", () => {
    const json = toolCallToJson(call());
    expect(json).toContain('"name": "get_weather"');
    expect(json).toContain('"status": "success"');
    expect(json).toContain('"durationMs": 100');
  });

  it("turns an Error result into a message object", () => {
    expect(toolCallToJson(call({ result: new Error("nope") }))).toContain('"message": "nope"');
  });

  it("falls back when the payload cannot be serialised", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(typeof toolCallToJson(call({ params: circular }))).toBe("string");
  });
});
