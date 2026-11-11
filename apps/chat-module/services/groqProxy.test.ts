/** @jest-environment node */
import {
  MAX_PROMPT_LENGTH,
  TOOL_EVENT_KEY,
  handleChatRequest,
  handleOptions,
  withToolExecution,
} from "./groqProxy";

const post = (body: unknown) =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("groqProxy", () => {
  const fetchMock = jest.fn();
  const env = { ...process.env };

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env = { ...env, GROQ_API_KEY: "test-key" };
    delete process.env.GROQ_MODEL;
    delete process.env.CHAT_ALLOWED_ORIGIN;
  });
  afterAll(() => {
    process.env = env;
  });

  it("answers CORS preflight", () => {
    const res = handleOptions();
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("access-control-allow-headers")).toBe("content-type");
  });

  it("uses CHAT_ALLOWED_ORIGIN when set", async () => {
    process.env.CHAT_ALLOWED_ORIGIN = "https://shell.example";
    expect(handleOptions().headers.get("access-control-allow-origin")).toBe(
      "https://shell.example",
    );
  });

  it("returns 500 when the API key is missing", async () => {
    delete process.env.GROQ_API_KEY;
    const res = await handleChatRequest(post({ prompt: "hi" }));
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["missing prompt", {}],
    ["blank prompt", { prompt: "  " }],
    ["non-string prompt", { prompt: 5 }],
    ["too-long prompt", { prompt: "a".repeat(MAX_PROMPT_LENGTH + 1) }],
  ])("returns 400 for %s", async (_name, body) => {
    const res = await handleChatRequest(post(body));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("streams the Groq response through with the key only in the upstream request", async () => {
    fetchMock.mockResolvedValue(new Response("data: hi\n\n", { status: 200 }));
    const res = await handleChatRequest(post({ prompt: "hello" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(await res.text()).toBe("data: hi\n\n");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init.headers.authorization).toBe("Bearer test-key");
    expect(JSON.parse(init.body)).toMatchObject({
      stream: true,
      messages: [{ role: "user", content: "hello" }],
      tool_choice: "auto",
      tools: [{ function: { name: "get_weather" } }, { function: { name: "search_docs" } }],
    });
  });

  it("honours GROQ_MODEL", async () => {
    process.env.GROQ_MODEL = "custom/model";
    fetchMock.mockResolvedValue(new Response("", { status: 200 }));
    await handleChatRequest(post({ prompt: "x" }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("custom/model");
  });

  it("returns 502 without leaking the upstream body on Groq errors", async () => {
    fetchMock.mockResolvedValue(new Response("secret details", { status: 401 }));
    const res = await handleChatRequest(post({ prompt: "x" }));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("secret");
  });

  it("returns 502 when Groq is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const res = await handleChatRequest(post({ prompt: "x" }));
    expect(res.status).toBe(502);
  });
});

const sse = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;
const toolDelta = (call: object) => sse({ choices: [{ delta: { tool_calls: [call] } }] });

async function run(chunks: string[]): Promise<string> {
  const encoder = new TextEncoder();
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
  return new Response(withToolExecution(source)).text();
}

function toolEvents(output: string) {
  return output
    .split("\n")
    .filter((line) => line.startsWith("data:") && line.includes(TOOL_EVENT_KEY))
    .map((line) => JSON.parse(line.slice(5))[TOOL_EVENT_KEY]);
}

describe("withToolExecution", () => {
  it("passes plain text streams through and still ends with [DONE]", async () => {
    const out = await run([sse({ choices: [{ delta: { content: "hi" } }] }), "data: [DONE]\n\n"]);
    expect(out).toContain('"content":"hi"');
    expect(out.trimEnd().endsWith("data: [DONE]")).toBe(true);
    expect(toolEvents(out)).toHaveLength(0);
  });

  it("assembles a tool call split across deltas, runs it and emits the event before [DONE]", async () => {
    const out = await run([
      toolDelta({ index: 0, id: "call_1", function: { name: "get_weather", arguments: '{"ci' } }),
      toolDelta({ index: 0, function: { arguments: 'ty":"Huế"}' } }),
      "data: [DONE]\n\n",
    ]);
    const [event] = toolEvents(out);
    expect(event).toMatchObject({
      id: "call_1",
      name: "get_weather",
      params: { city: "Huế" },
      result: { city: "Huế", temperature_c: 28 },
    });
    expect(out.indexOf(TOOL_EVENT_KEY)).toBeLessThan(out.indexOf("[DONE]"));
    expect(out.match(/\[DONE\]/g)).toHaveLength(1);
  });

  it("runs several tool calls in order", async () => {
    const out = await run([
      toolDelta({ index: 0, id: "a", function: { name: "get_weather", arguments: "{}" } }),
      toolDelta({ index: 1, id: "b", function: { name: "search_docs", arguments: "{}" } }),
      "data: [DONE]\n\n",
    ]);
    expect(toolEvents(out).map((e) => e.name)).toEqual(["get_weather", "search_docs"]);
  });

  it("survives invalid arguments and unknown tools without throwing", async () => {
    const out = await run([
      toolDelta({ index: 0, function: { name: "nope", arguments: "{broken" } }),
      "data: [DONE]\n\n",
    ]);
    const [event] = toolEvents(out);
    expect(event.params).toEqual({});
    expect(event.result).toEqual({ error: expect.stringContaining("nope") });
    expect(event.id).toMatch(/^call-/);
  });

  it("treats non-object arguments as empty params", async () => {
    const out = await run([
      toolDelta({ index: 0, id: "x", function: { name: "search_docs", arguments: "[1]" } }),
      "data: [DONE]\n\n",
    ]);
    expect(toolEvents(out)[0].params).toEqual({});
  });

  it("emits nothing extra when the upstream stream is cut without [DONE]", async () => {
    const out = await run([
      toolDelta({ index: 0, id: "a", function: { name: "get_weather", arguments: "{}" } }),
    ]);
    expect(toolEvents(out)).toHaveLength(0);
    expect(out).not.toContain("[DONE]");
  });

  it("handles lines split across chunks and a final line without newline", async () => {
    const line = toolDelta({
      index: 0,
      id: "a",
      function: { name: "search_docs", arguments: "{}" },
    });
    const out = await run([line.slice(0, 20), line.slice(20), "data: [DONE]"]);
    expect(toolEvents(out)).toHaveLength(1);
    expect(out.trimEnd().endsWith("data: [DONE]")).toBe(true);
  });

  it("forwards non-JSON data lines untouched", async () => {
    const out = await run([": comment\n", "data: {oops\n\n", "data: [DONE]\n\n"]);
    expect(out).toContain("data: {oops");
  });
});
