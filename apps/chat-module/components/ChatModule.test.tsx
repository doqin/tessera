import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import ChatModule from "./ChatModule";

jest.mock("../services/chatService", () => ({
  sendPrompt: jest.fn(async (_prompt: string, options?: { onDelta?: (delta: string) => void }) => {
    options?.onDelta?.("ok");
    return {
      message: { id: "a1", role: "agent", content: "ok", status: "sent", createdAt: "now" },
    };
  }),
}));

const storedTranscript = [
  {
    id: "m1",
    role: "user" as const,
    content: "tin nhắn cũ",
    status: "sent" as const,
    createdAt: "now",
  },
];

describe("ChatModule", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ chatTranscript: [], lastToolCall: null, toolCallHistory: [] });
  });

  it("restores a stored transcript instead of the empty state", () => {
    useIntegrationStore.setState({ chatTranscript: storedTranscript });
    render(<ChatModule />);

    expect(screen.getByText("tin nhắn cũ")).toBeInTheDocument();
    expect(screen.queryByText("Bạn muốn agent làm gì?")).not.toBeInTheDocument();
  });

  it("starts a new conversation from the header button", async () => {
    const user = userEvent.setup();
    useIntegrationStore.setState({ chatTranscript: storedTranscript });
    render(<ChatModule />);

    await user.click(screen.getByRole("button", { name: "Cuộc trò chuyện mới" }));

    expect(screen.getByText("Bạn muốn agent làm gì?")).toBeInTheDocument();
    expect(useIntegrationStore.getState().chatTranscript).toHaveLength(0);
  });

  it("renders the empty state with suggestions and the prompt input on mount", () => {
    render(<ChatModule />);
    expect(screen.getByText("Bạn muốn agent làm gì?")).toBeInTheDocument();
    expect(screen.getByLabelText("Prompt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thời tiết Hà Nội/ })).toBeInTheDocument();
  });

  it("sends the prompt when a suggestion chip is clicked", async () => {
    const user = userEvent.setup();
    render(<ChatModule />);

    await user.click(screen.getByRole("button", { name: /Thời tiết Hà Nội/ }));

    expect(await screen.findByText("ok")).toBeInTheDocument();
  });
});
