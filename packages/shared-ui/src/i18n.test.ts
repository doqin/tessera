import { renderHook } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { messagesEn, messagesVi, translate, useT } from "./i18n";

describe("i18n", () => {
  it("has the same keys in both languages", () => {
    expect(Object.keys(messagesVi).sort()).toEqual(Object.keys(messagesEn).sort());
  });

  it("translates per locale", () => {
    expect(translate("vi", "nav.chat")).toBe("Chat");
    expect(translate("en", "nav.dashboard")).toBe("Dashboard");
    expect(translate("en", "dash.empty.title")).toBe("No tool has been called yet");
  });

  it("interpolates variables", () => {
    expect(translate("vi", "chat.chars", { count: 3, max: 10 })).toBe("3/10");
    expect(translate("en", "dash.kpi.successHint", { ok: 2, failed: 1 })).toBe("2 ok · 1 failed");
  });

  it("keeps unknown placeholders untouched", () => {
    expect(translate("en", "chat.chars", { count: 1 })).toBe("1/{max}");
  });

  it("keeps Vietnamese copy free of untranslated English UI words", () => {
    // Thuật ngữ đã thoả thuận trong sản phẩm (không dịch) — mọi thứ khác phải là tiếng Việt.
    const allowed = new Set([
      "groq",
      "tool",
      "json",
      "module",
      "federation",
      "shell",
      "store",
      "id",
      "agent",
      "chat",
      "dashboard",
      "ctrl",
      "shift",
      "enter",
      "remote",
      "markdown",
    ]);
    const english = new Set([
      "error",
      "streaming",
      "invocation",
      "loading",
      "steps",
      "filter",
      "search",
      "result",
      "parameters",
      "retry",
      "copy",
      "expand",
      "collapse",
      "success",
      "session",
      "architecture",
      "overview",
      "status",
      "duration",
      "called",
    ]);

    const violations: string[] = [];
    for (const [key, value] of Object.entries(messagesVi)) {
      // Tên tool là định danh kỹ thuật, không phải chuỗi cần dịch.
      const words =
        value
          .replace(/get_weather|search_docs/g, "")
          .toLowerCase()
          .match(/[a-z]+/g) ?? [];
      for (const word of words) {
        if (english.has(word) && !allowed.has(word)) violations.push(`${key}: ${word}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("exposes a t() bound to the store locale", () => {
    useIntegrationStore.setState({ locale: "en" });
    const { result } = renderHook(() => useT());
    expect(result.current("nav.chat")).toBe("Chat");
    expect(result.current("dash.filter.all")).toBe("All");
    useIntegrationStore.setState({ locale: "vi" });
  });
});
