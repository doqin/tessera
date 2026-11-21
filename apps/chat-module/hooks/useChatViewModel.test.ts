import { act, renderHook, waitFor } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { useChatViewModel } from "./useChatViewModel";
import { sendPrompt } from "../services/chatService";

jest.mock("../services/chatService");

const sendPromptMock = sendPrompt as jest.MockedFunction<typeof sendPrompt>;

describe("useChatViewModel", () => {
  beforeEach(() => {
    sendPromptMock.mockReset();
    useIntegrationStore.setState({ lastToolCall: null, toolCallHistory: [], chatTranscript: [] });
  });

  it("appends the user message immediately on submit", async () => {
    sendPromptMock.mockResolvedValue({
      message: { id: "a1", role: "agent", content: "ok", status: "sent", createdAt: "now" },
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("chào bạn");
    });

    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "chào bạn" });
  });

  it("appends the agent reply once chatService resolves", async () => {
    sendPromptMock.mockResolvedValue({
      message: {
        id: "a1",
        role: "agent",
        content: "phản hồi mẫu",
        status: "sent",
        createdAt: "now",
      },
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("hỏi gì đó");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({ role: "agent", content: "phản hồi mẫu" });
  });

  it("updates the shared integration store when the response carries a toolCall", async () => {
    const toolCall = {
      id: "t1",
      name: "mock_search",
      params: { query: "demo" },
      calledAt: "now",
    };
    sendPromptMock.mockResolvedValue({
      message: { id: "a1", role: "agent", content: "ok", status: "sent", createdAt: "now" },
      toolCall,
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("gọi tool");
    });

    expect(useIntegrationStore.getState().lastToolCall).toMatchObject(toolCall);
    expect(useIntegrationStore.getState().toolCallHistory).toHaveLength(1);
    expect(useIntegrationStore.getState().toolCallHistory[0]).toMatchObject({
      ...toolCall,
      status: "success",
    });
  });

  it("appends an error message and does not throw when chatService rejects", async () => {
    sendPromptMock.mockRejectedValue(new Error("timeout"));
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("sẽ lỗi");
    });

    await waitFor(() => {
      expect(result.current.messages.at(-1)).toMatchObject({ status: "error" });
    });
  });

  it("ignores blank prompts", async () => {
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("   ");
    });

    expect(result.current.messages).toHaveLength(0);
    expect(sendPromptMock).not.toHaveBeenCalled();
  });

  it("updates one agent message in place as deltas stream in", async () => {
    let finish: (value: Awaited<ReturnType<typeof sendPrompt>>) => void = () => undefined;
    sendPromptMock.mockImplementation((_prompt, options) => {
      options?.onDelta?.("Xin ");
      options?.onDelta?.("chào");
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    const { result } = renderHook(() => useChatViewModel());

    let pending: Promise<void> = Promise.resolve();
    await act(async () => {
      pending = result.current.submitPrompt("hi");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({ role: "agent", content: "Xin chào" });
    const streamingId = result.current.messages[1].id;

    await act(async () => {
      finish({
        message: { id: "x", role: "agent", content: "Xin chào", status: "sent", createdAt: "now" },
      });
      await pending;
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].id).toBe(streamingId);
  });

  it("keeps the partial agent message with interrupted status and skips the store update", async () => {
    sendPromptMock.mockImplementation(async (_prompt, options) => {
      options?.onDelta?.("một phần");
      return {
        message: {
          id: "x",
          role: "agent",
          content: "một phần",
          status: "interrupted",
          createdAt: "now",
        },
      };
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("hi");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      content: "một phần",
      status: "interrupted",
    });
    expect(useIntegrationStore.getState().lastToolCall).toBeNull();
  });

  it("keeps already-streamed text and adds an error message when the call rejects midway", async () => {
    sendPromptMock.mockImplementation(async (_prompt, options) => {
      options?.onDelta?.("dở dang");
      throw new Error("boom");
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("hi");
    });

    expect(result.current.messages.map((m) => m.status)).toEqual(["sent", "sent", "error"]);
    expect(result.current.messages[1].content).toBe("dở dang");
    expect(result.current.isSending).toBe(false);
  });

  it("stop aborts the in-flight request and keeps the partial reply as interrupted", async () => {
    sendPromptMock.mockImplementation(
      (_prompt, options) =>
        new Promise((_resolve, reject) => {
          options?.onDelta?.("một nửa");
          options?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const { result } = renderHook(() => useChatViewModel());

    let pending: Promise<void> = Promise.resolve();
    await act(async () => {
      pending = result.current.submitPrompt("hi");
    });
    expect(result.current.isSending).toBe(true);
    expect(result.current.streamingId).toBe(result.current.messages[1]?.id);

    act(() => result.current.stop());
    await act(async () => {
      await pending;
    });

    expect(result.current.messages[1]).toMatchObject({
      content: "một nửa",
      status: "interrupted",
    });
    expect(result.current.isSending).toBe(false);
    expect(result.current.streamingId).toBeNull();
  });

  it("regenerate drops the selected reply and re-runs the preceding prompt without duplicating it", async () => {
    sendPromptMock
      .mockResolvedValueOnce({
        message: { id: "a1", role: "agent", content: "lần 1", status: "sent", createdAt: "now" },
      })
      .mockResolvedValueOnce({
        message: { id: "a2", role: "agent", content: "lần 2", status: "sent", createdAt: "now" },
      });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("hỏi lại");
    });
    const firstReplyId = result.current.messages[1]?.id ?? "";

    await act(async () => {
      result.current.regenerate(firstReplyId);
    });

    await waitFor(() => {
      expect(result.current.messages.at(-1)?.content).toBe("lần 2");
    });
    expect(result.current.messages.filter((message) => message.role === "user")).toHaveLength(1);
    expect(sendPromptMock).toHaveBeenCalledTimes(2);
    expect(sendPromptMock).toHaveBeenLastCalledWith("hỏi lại", expect.anything());
  });

  it("retry resends the prompt of an errored reply", async () => {
    sendPromptMock.mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce({
      message: { id: "a1", role: "agent", content: "đã trả lời", status: "sent", createdAt: "now" },
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("thử lại");
    });
    const errorId = result.current.messages.at(-1)?.id ?? "";

    await act(async () => {
      result.current.retry(errorId);
    });

    await waitFor(() => {
      expect(result.current.messages.at(-1)?.content).toBe("đã trả lời");
    });
    expect(result.current.messages.some((message) => message.status === "error")).toBe(false);
  });

  it("restores the transcript from the integration store on mount", () => {
    const stored = [
      {
        id: "m1",
        role: "user" as const,
        content: "tin cũ",
        status: "sent" as const,
        createdAt: "now",
      },
    ];
    useIntegrationStore.setState({ chatTranscript: stored });

    const { result } = renderHook(() => useChatViewModel());

    expect(result.current.messages).toEqual(stored);
  });

  it("writes the transcript back to the integration store after a reply", async () => {
    sendPromptMock.mockResolvedValue({
      message: { id: "a1", role: "agent", content: "ok", status: "sent", createdAt: "now" },
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("hỏi");
    });

    await waitFor(() => {
      expect(useIntegrationStore.getState().chatTranscript).toHaveLength(2);
    });
    expect(useIntegrationStore.getState().chatTranscript[0]).toMatchObject({
      role: "user",
      content: "hỏi",
    });
  });

  it("clearConversation empties both the local list and the store", async () => {
    sendPromptMock.mockResolvedValue({
      message: { id: "a1", role: "agent", content: "ok", status: "sent", createdAt: "now" },
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.submitPrompt("hỏi");
    });
    await waitFor(() => {
      expect(useIntegrationStore.getState().chatTranscript).toHaveLength(2);
    });

    act(() => {
      result.current.clearConversation();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(useIntegrationStore.getState().chatTranscript).toHaveLength(0);
  });

  it("ignores regenerate/retry for unknown message ids", async () => {
    sendPromptMock.mockResolvedValue({
      message: { id: "a1", role: "agent", content: "ok", status: "sent", createdAt: "now" },
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      result.current.regenerate("unknown");
      result.current.retry("unknown");
    });

    expect(sendPromptMock).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });
});
