import { act, renderHook, waitFor } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { useChatViewModel } from "./useChatViewModel";
import { sendPrompt } from "../services/chatService";

jest.mock("../services/chatService");

const sendPromptMock = sendPrompt as jest.MockedFunction<typeof sendPrompt>;

describe("useChatViewModel", () => {
  beforeEach(() => {
    sendPromptMock.mockReset();
    useIntegrationStore.setState({ lastToolCall: null });
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

    expect(useIntegrationStore.getState().lastToolCall).toEqual(toolCall);
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
});
