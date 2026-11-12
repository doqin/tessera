/** @jest-environment node */
import { STREAM_TIMEOUT_MS, sendPrompt } from "./chatService";

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

const DONE = "data: [DONE]\n\n";

/** Response có body stream tự điều khiển: đẩy chunk bằng push(), đóng bằng close(), hỏng bằng fail(). */
function controllableStream() {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  return {
    response: new Response(body, { status: 200 }),
    push: (text: string) => controller.enqueue(encoder.encode(text)),
    close: () => controller.close(),
    fail: (error: Error) => controller.error(error),
  };
}

/** fetch không bao giờ trả lời, chỉ reject khi bị abort — như server treo. */
function hangingFetch(_url: unknown, init: { signal: AbortSignal }) {
  return new Promise((_resolve, reject) => {
    const abort = () => reject(new DOMException("aborted", "AbortError"));
    if (init.signal.aborted) return abort();
    init.signal.addEventListener("abort", abort);
  });
}

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
      sseResponse([line.slice(0, 15), line.slice(15), ": keep-alive\n", "data: {broken\n\n", DONE]),
    );
    const { message } = await sendPrompt("hi");
    expect(message.content).toBe("ok");
  });

  it("flushes a final line that has no trailing newline", async () => {
    fetchMock.mockResolvedValue(sseResponse([delta("a"), DONE.trim()]));
    const { message } = await sendPrompt("hi");
    expect(message.content).toBe("a");
  });

  it("rejects when the API responds with an error status", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 502 }));
    await expect(sendPrompt("hi")).rejects.toThrow("502");
  });

  it("returns no toolCall when the stream carries no tool event", async () => {
    fetchMock.mockResolvedValue(sseResponse([delta("x"), DONE]));
    const { toolCall, message } = await sendPrompt("a");
    expect(toolCall).toBeUndefined();
    expect(message.content).toBe("x");
  });

  it("returns the tool call emitted by the route and a fresh message id each call", async () => {
    const call = {
      id: "c1",
      name: "get_weather",
      params: { city: "Huế" },
      result: { temperature_c: 28 },
      calledAt: "2026-11-11T00:00:00.000Z",
    };
    fetchMock.mockImplementation(async () =>
      sseResponse([
        delta("Để mình xem. "),
        `data: ${JSON.stringify({ tessera_tool_call: call })}\n\n`,
        DONE,
      ]),
    );
    const first = await sendPrompt("a");
    const second = await sendPrompt("b");
    expect(first.toolCall).toEqual(call);
    expect(first.message.content).toBe("Để mình xem. ");
    expect(first.message.id).not.toBe(second.message.id);
  });

  it("adds a confirmation line when the model only calls a tool and says nothing", async () => {
    const call = { id: "c1", name: "search_docs", params: {}, calledAt: "now" };
    fetchMock.mockResolvedValue(
      sseResponse([`data: ${JSON.stringify({ tessera_tool_call: call })}\n\n`, DONE]),
    );
    const { message, toolCall } = await sendPrompt("a");
    expect(toolCall?.name).toBe("search_docs");
    expect(message.content).toContain("search_docs");
    expect(message.content).toContain("Dashboard");
  });

  describe("timeout and interruption", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("rejects with a timeout error when no response arrives within 15s", async () => {
      fetchMock.mockImplementation(hangingFetch);
      const result = sendPrompt("hi");
      const assertion = expect(result).rejects.toThrow("15s");
      await jest.advanceTimersByTimeAsync(STREAM_TIMEOUT_MS);
      await assertion;
    });

    it("does not time out while chunks keep arriving, even past 15s in total", async () => {
      const stream = controllableStream();
      fetchMock.mockResolvedValue(stream.response);
      const result = sendPrompt("hi");
      for (let i = 0; i < 3; i += 1) {
        await jest.advanceTimersByTimeAsync(STREAM_TIMEOUT_MS - 1000);
        stream.push(delta(`${i}`));
      }
      stream.push(DONE);
      stream.close();
      await expect(result).resolves.toMatchObject({ message: { content: "012" } });
    });

    it("times out after 15s of silence mid-stream, keeping received deltas reported", async () => {
      const stream = controllableStream();
      // Như fetch thật: abort signal làm body stream đang đọc bị reject.
      fetchMock.mockImplementation(async (_url: unknown, init: { signal: AbortSignal }) => {
        init.signal.addEventListener("abort", () => stream.fail(new Error("aborted")));
        return stream.response;
      });
      const onDelta = jest.fn();
      const result = sendPrompt("hi", { onDelta });
      stream.push(delta("một phần"));
      await jest.advanceTimersByTimeAsync(0);
      const assertion = expect(result).rejects.toThrow("15s");
      await jest.advanceTimersByTimeAsync(STREAM_TIMEOUT_MS);
      await assertion;
      expect(onDelta).toHaveBeenCalledWith("một phần");
    });

    it("rejects when the connection drops mid-stream", async () => {
      const stream = controllableStream();
      fetchMock.mockResolvedValue(stream.response);
      const result = sendPrompt("hi");
      const assertion = expect(result).rejects.toThrow("network drop");
      stream.push(delta("a"));
      stream.fail(new Error("network drop"));
      await assertion;
    });

    it("rejects as interrupted when the stream closes without [DONE]", async () => {
      fetchMock.mockResolvedValue(sseResponse([delta("cụt")]));
      await expect(sendPrompt("hi")).rejects.toThrow("bị ngắt");
    });

    it("aborts the request when the caller's signal aborts", async () => {
      fetchMock.mockImplementation(hangingFetch);
      const caller = new AbortController();
      const result = sendPrompt("hi", { signal: caller.signal });
      const assertion = expect(result).rejects.toThrow("aborted");
      caller.abort();
      await assertion;
    });

    it("rejects immediately when the caller's signal is already aborted", async () => {
      fetchMock.mockImplementation(hangingFetch);
      const caller = new AbortController();
      caller.abort();
      await expect(sendPrompt("hi", { signal: caller.signal })).rejects.toThrow("aborted");
    });
  });
});
