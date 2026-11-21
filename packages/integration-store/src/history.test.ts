import { useIntegrationStore } from "./integrationStore";
import { CHAT_TRANSCRIPT_LIMIT, TOOL_HISTORY_LIMIT } from "./integrationStore";

const call = (id: string) => ({
  id,
  name: "tool",
  params: {},
  calledAt: "now",
});

describe("integrationStore history + locale", () => {
  beforeEach(() => {
    useIntegrationStore.setState({
      lastToolCall: null,
      toolCallHistory: [],
      chatTranscript: [],
      locale: "vi",
    });
  });

  it("appends tool calls to the history and keeps the latest last", () => {
    useIntegrationStore.getState().setLastToolCall(call("1"));
    useIntegrationStore.getState().setLastToolCall(call("2"));

    expect(useIntegrationStore.getState().toolCallHistory.map((item) => item.id)).toEqual([
      "1",
      "2",
    ]);
    expect(useIntegrationStore.getState().lastToolCall?.id).toBe("2");
  });

  it("replaces a duplicate id instead of appending it twice", () => {
    useIntegrationStore.getState().setLastToolCall(call("1"));
    useIntegrationStore.getState().setLastToolCall(call("1"));
    expect(useIntegrationStore.getState().toolCallHistory).toHaveLength(1);
  });

  it("caps the history at TOOL_HISTORY_LIMIT, dropping the oldest", () => {
    for (let index = 0; index < TOOL_HISTORY_LIMIT + 5; index += 1) {
      useIntegrationStore.getState().appendToolCall(call(String(index)));
    }
    const history = useIntegrationStore.getState().toolCallHistory;
    expect(history).toHaveLength(TOOL_HISTORY_LIMIT);
    expect(history[0]?.id).toBe("5");
  });

  it("clears the history", () => {
    useIntegrationStore.getState().setLastToolCall(call("1"));
    useIntegrationStore.getState().clearToolCallHistory();
    expect(useIntegrationStore.getState().toolCallHistory).toEqual([]);
    expect(useIntegrationStore.getState().lastToolCall).toBeNull();
  });

  it("stores the selected locale", () => {
    useIntegrationStore.getState().setLocale("en");
    expect(useIntegrationStore.getState().locale).toBe("en");
  });

  it("stores and clears the chat transcript", () => {
    const message = {
      id: "m1",
      role: "user" as const,
      content: "xin chào",
      status: "sent" as const,
      createdAt: "now",
    };
    useIntegrationStore.getState().setChatTranscript([message]);
    expect(useIntegrationStore.getState().chatTranscript).toEqual([message]);

    useIntegrationStore.getState().clearChatTranscript();
    expect(useIntegrationStore.getState().chatTranscript).toEqual([]);
  });

  it("caps the chat transcript at CHAT_TRANSCRIPT_LIMIT, dropping the oldest", () => {
    const many = Array.from({ length: CHAT_TRANSCRIPT_LIMIT + 5 }, (_, index) => ({
      id: `m${index}`,
      role: "user" as const,
      content: `tin ${index}`,
      status: "sent" as const,
      createdAt: "now",
    }));
    useIntegrationStore.getState().setChatTranscript(many);
    const stored = useIntegrationStore.getState().chatTranscript;
    expect(stored).toHaveLength(CHAT_TRANSCRIPT_LIMIT);
    expect(stored[0]?.id).toBe("m5");
  });
});
