/** @jest-environment node */
import { sendPrompt } from "./chatService";

function sseResponse(chunks: string[], init: ResponseInit = { status: 200 }): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
  return new Response(body, init);
}

const delta = (content: string | null) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;

describe("chatService.sendPrompt", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("posts the prompt to the chat API", async () => {
    fetchMock.mockResolvedValue(sseResponse(["data: [DONE]\n\n"]));
    await sendPrompt("xin chào");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/chat$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ prompt: "xin chào" });
  });

  it("accumulates streamed deltas into the final agent message and reports each chunk", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([delta("Xin "), delta("chào"), delta(null), "data: [DONE]\n\n"]),
    );
    const onDelta = jest.fn();
    const { message } = await sendPrompt("hi", { onDelta });
    expect(onDelta.mock.calls).toEqual([["Xin "], ["chào"]]);
    expect(message).toMatchObject({ role: "agent", status: "sent", content: "Xin chào" });
  });

  it("handles SSE lines split across network chunks and ignores malformed lines", async () => {
    const line = delta("ok");
    fetchMock.mockResolvedValue(
      sseResponse([line.slice(0, 15), line.slice(15), ": keep-alive\n", "data: {broken\n\n"]),
    );
    const { message } = await sendPrompt("hi");
    expect(message.content).toBe("ok");
  });

  it("flushes a final line that has no trailing newline", async () => {
    fetchMock.mockResolvedValue(sseResponse([delta("a").trim()]));
    const { message } = await sendPrompt("hi");
    expect(message.content).toBe("a");
  });

  it("rejects when the API responds with an error status", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 502 }));
    await expect(sendPrompt("hi")).rejects.toThrow("502");
  });

  it("still attaches the temporary mock toolCall (until T016) and fresh ids", async () => {
    fetchMock.mockImplementation(async () => sseResponse([delta("x")]));
    const first = await sendPrompt("a");
    const second = await sendPrompt("b");
    expect(first.toolCall?.params).toEqual({ query: "a" });
    expect(first.message.id).not.toBe(second.message.id);
  });
});
