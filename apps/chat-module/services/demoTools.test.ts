import { DEMO_TOOLS, runDemoTool } from "./demoTools";

describe("demoTools", () => {
  it("declares get_weather and search_docs with required params", () => {
    expect(DEMO_TOOLS.map((t) => t.function.name)).toEqual(["get_weather", "search_docs"]);
    DEMO_TOOLS.forEach((t) => expect(t.function.parameters.required).toHaveLength(1));
  });

  it("returns fixed mock results", () => {
    expect(runDemoTool("get_weather", { city: "Đà Nẵng" })).toMatchObject({ city: "Đà Nẵng" });
    expect(runDemoTool("get_weather", {})).toMatchObject({ city: "không rõ" });
    expect(runDemoTool("search_docs", { query: "x" })).toHaveProperty("hits");
  });

  it("reports unknown tools as an error result instead of throwing", () => {
    expect(runDemoTool("rm_rf", {})).toEqual({ error: "Tool không tồn tại: rm_rf" });
  });
});
