import { TOOL_DEFINITIONS, executeTool, isKnownTool } from "./tools";

describe("sample tools", () => {
  it("defines get_weather and search_docs with required parameters", () => {
    expect(TOOL_DEFINITIONS.map((t) => t.function.name)).toEqual(["get_weather", "search_docs"]);
    TOOL_DEFINITIONS.forEach((t) => expect(t.function.parameters.required).toHaveLength(1));
  });

  it("get_weather returns an object and defaults the city", () => {
    expect(executeTool("get_weather", { city: " Đà Nẵng " })?.result).toMatchObject({
      city: "Đà Nẵng",
    });
    expect(executeTool("get_weather", {})?.result).toMatchObject({ city: "Hà Nội" });
  });

  it("search_docs returns an array of hits", () => {
    const result = executeTool("search_docs", { query: "mfe" })?.result as { title: string }[];
    expect(result).toHaveLength(2);
    expect(result[0].title).toContain("mfe");
  });

  it("rejects unknown tools, including prototype keys", () => {
    expect(executeTool("nope", {})).toBeUndefined();
    expect(isKnownTool("toString")).toBe(false);
  });
});
