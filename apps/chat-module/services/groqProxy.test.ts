/** @jest-environment node */
import { MAX_PROMPT_LENGTH, handleChatRequest, handleOptions } from "./groqProxy";

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
