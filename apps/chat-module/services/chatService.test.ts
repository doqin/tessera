/** @jest-environment node */
import { ChatTimeoutError, sendPrompt } from "./chatService";

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

const DONE = "data: [DONE]\n\n";
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

  it("generates fresh message ids and no toolCall for plain text replies", async () => {
    fetchMock.mockImplementation(async () => sseResponse([delta("x"), DONE]));
    const first = await sendPrompt("a");
    const second = await sendPrompt("b");
    expect(first.toolCall).toBeUndefined();
    expect(first.message.id).not.toBe(second.message.id);
  });

  describe("tool calls (T016)", () => {
    const toolDelta = (tc: object) =>
      `data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [tc] } }] })}\n\n`;
    const finish = `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "tool_calls" }] })}\n\n`;

    it("assembles a tool call from streamed fragments and runs the sample tool", async () => {
      fetchMock.mockResolvedValue(
        sseResponse([
          toolDelta({ index: 0, id: "call_1", function: { name: "get_weather", arguments: "" } }),
          toolDelta({ index: 0, function: { arguments: '{"city":' } }),
          toolDelta({ index: 0, function: { arguments: '"Huế"}' } }),
          finish,
          DONE,
        ]),
      );
      const { message, toolCall } = await sendPrompt("thời tiết Huế?");
      expect(toolCall).toMatchObject({
        id: "call_1",
        name: "get_weather",
        params: { city: "Huế" },
        result: { city: "Huế", temperatureC: 28, condition: "Nhiều mây" },
      });
      expect(message).toMatchObject({ status: "sent", content: "Đã gọi tool get_weather." });
    });

    it("keeps the model text and uses the last valid call when there are several", async () => {
      fetchMock.mockResolvedValue(
        sseResponse([
          delta("Để mình tìm."),
          toolDelta({ index: 0, id: "a", function: { name: "get_weather", arguments: '{"city":"X"}' } }),
          toolDelta({ index: 1, id: "b", function: { name: "search_docs", arguments: '{"query":"mf"}' } }),
          finish,
        ]),
      );
      const { message, toolCall } = await sendPrompt("hi");
      expect(message.content).toBe("Để mình tìm.");
      expect(toolCall).toMatchObject({ id: "b", name: "search_docs", params: { query: "mf" } });
      expect(Array.isArray(toolCall?.result)).toBe(true);
    });

    it.each([
      ["unknown tool", { name: "rm_rf", arguments: "{}" }],
      ["invalid JSON arguments", { name: "get_weather", arguments: "{city" }],
      ["non-object arguments", { name: "get_weather", arguments: "[1]" }],
    ])("ignores a tool call with %s", async (_name, fn) => {
      fetchMock.mockResolvedValue(sseResponse([delta("ok"), toolDelta({ index: 0, function: fn }), finish]));
      const { toolCall } = await sendPrompt("hi");
      expect(toolCall).toBeUndefined();
    });

    it("falls back to empty params and a generated id when arguments/id are missing", async () => {
      fetchMock.mockResolvedValue(
        sseResponse([toolDelta({ function: { name: "get_weather" } }), finish]),
      );
      const { toolCall } = await sendPrompt("hi");
      expect(toolCall?.params).toEqual({});
      expect(toolCall?.id).toBeTruthy();
    });

    it("does not report a tool call when the stream was interrupted", async () => {
      fetchMock.mockResolvedValue(
        sseResponse([
          delta("dở"),
          toolDelta({ index: 0, function: { name: "get_weather", arguments: '{"city":"X"}' } }),
        ]),
      );
      const { message, toolCall } = await sendPrompt("hi");
      expect(message.status).toBe("interrupted");
      expect(toolCall).toBeUndefined();
    });
  });

  describe("errors, timeout and interruption (T014/T015)", () => {
    const errorStream = (chunks: string[], error: Error) => {
      const encoder = new TextEncoder();
      let i = 0;
      return new Response(
        new ReadableStream<Uint8Array>({
          pull(controller) {
            if (i < chunks.length) controller.enqueue(encoder.encode(chunks[i++]));
            else controller.error(error);
          },
        }),
      );
    };

    it("rejects with ChatTimeoutError when fetch never answers within timeoutMs", async () => {
      fetchMock.mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
          }),
      );
      await expect(sendPrompt("hi", { timeoutMs: 20 })).rejects.toBeInstanceOf(ChatTimeoutError);
    });

    it("rejects with ChatTimeoutError when the stream stalls before any content", async () => {
      fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              init.signal?.addEventListener("abort", () => controller.error(new Error("aborted")));
            },
          }),
        );
      });
      await expect(sendPrompt("hi", { timeoutMs: 20 })).rejects.toBeInstanceOf(ChatTimeoutError);
    });

    it("keeps partial content as interrupted when the stream stalls midway", async () => {
      fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
        const encoder = new TextEncoder();
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(encoder.encode(delta("một phần")));
              init.signal?.addEventListener("abort", () => controller.error(new Error("aborted")));
            },
          }),
        );
      });
      const onDelta = jest.fn();
      const { message, toolCall } = await sendPrompt("hi", { timeoutMs: 20, onDelta });
      expect(onDelta).toHaveBeenCalledWith("một phần");
      expect(message).toMatchObject({ status: "interrupted", content: "một phần" });
      expect(toolCall).toBeUndefined();
    });

    it("keeps partial content as interrupted on a network error midway", async () => {
      fetchMock.mockResolvedValue(errorStream([delta("abc")], new Error("network down")));
      const { message } = await sendPrompt("hi");
      expect(message).toMatchObject({ status: "interrupted", content: "abc" });
    });

    it("rejects when the stream errors before any content", async () => {
      fetchMock.mockResolvedValue(errorStream([], new Error("network down")));
      await expect(sendPrompt("hi")).rejects.toThrow("network down");
    });

    it("marks a stream closed without [DONE]/finish_reason as interrupted", async () => {
      fetchMock.mockResolvedValue(sseResponse([delta("cụt")]));
      const { message } = await sendPrompt("hi");
      expect(message).toMatchObject({ status: "interrupted", content: "cụt" });
    });

    it("rejects when the stream closes with no content and no [DONE]", async () => {
      fetchMock.mockResolvedValue(sseResponse([]));
      await expect(sendPrompt("hi")).rejects.toThrow();
    });

    it("treats finish_reason as a clean end even without [DONE]", async () => {
      const finish = `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}\n\n`;
      fetchMock.mockResolvedValue(sseResponse([delta("xong"), finish]));
      const { message } = await sendPrompt("hi");
      expect(message.status).toBe("sent");
    });

    it("rejects when fetch itself fails", async () => {
      fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
      await expect(sendPrompt("hi")).rejects.toThrow("Failed to fetch");
    });

    it("rethrows instead of reporting interruption when the caller aborts", async () => {
      const controller = new AbortController();
      fetchMock.mockImplementation(async () => {
        controller.abort();
        return errorStream([delta("abc")], new Error("aborted"));
      });
      await expect(sendPrompt("hi", { signal: controller.signal })).rejects.toThrow();
    });
  });
});
