/**
 * Integration test — Chat module (ghi `lastToolCall`) ⇄ Dashboard module (đọc live) qua
 * Integration Layer (`@tessera/integration-store`). Hai module được mount cùng cây React, dùng
 * chung 1 store, giống cách Shell ghép hai remote ở `/chat` và `/dashboard`.
 *
 * Chưa bao gồm: nạp remote qua Module Federation và fallback khi remote down (cần trình duyệt
 * thật — xem specs/001-shell-app/tasks.md T016).
 */
import { TextDecoder, TextEncoder } from "node:util";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useIntegrationStore } from "@tessera/integration-store";
import ChatModule from "../apps/chat-module/components/ChatModule";
import DashboardModule from "../apps/dashboard-module/components/DashboardModule";

// jsdom không có TextDecoder/fetch streaming: giả lập đúng ranh giới mạng (route /api/chat của
// chat-module, trả SSE kiểu Groq) — phần còn lại của luồng Chat → store → Dashboard chạy thật.
function mockChatApi() {
  Object.assign(global, { TextDecoder });
  global.fetch = jest.fn(async (_url: unknown, init?: RequestInit) => {
    const { prompt } = JSON.parse(String(init?.body)) as { prompt: string };
    const sse = (delta: object, finish?: string) =>
      `data: ${JSON.stringify({ choices: [{ delta, finish_reason: finish ?? null }] })}\n\n`;
    // Model gọi tool search_docs với query = prompt người dùng.
    const encoded = new TextEncoder().encode(
      sse({
        tool_calls: [
          {
            index: 0,
            id: `call-${prompt}`,
            function: { name: "search_docs", arguments: JSON.stringify({ query: prompt }) },
          },
        ],
      }) +
        sse({}, "tool_calls") +
        "data: [DONE]\n\n",
    );
    let sent = false;
    return {
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: async () =>
            sent
              ? { done: true, value: undefined }
              : ((sent = true), { done: false, value: encoded }),
        }),
      },
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

function renderShellLikeLayout() {
  return render(
    <>
      <section aria-label="chat-region">
        <ChatModule />
      </section>
      <section aria-label="dashboard-region">
        <DashboardModule />
      </section>
    </>,
  );
}

describe("Chat ⇄ Dashboard integration", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ lastToolCall: null });
    mockChatApi();
  });

  it("shows the tool call from a prompt sent in Chat without remounting Dashboard", async () => {
    const user = userEvent.setup();
    renderShellLikeLayout();
    const dashboard = screen.getByRole("region", { name: "dashboard-region" });
    expect(within(dashboard).getByText("Chưa có tool nào được gọi")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Prompt"), "tìm tài liệu");
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    await waitFor(() => {
      expect(within(dashboard).getByText("search_docs")).toBeInTheDocument();
    });
    expect(within(dashboard).getByText("query")).toBeInTheDocument();
    expect(within(dashboard).getByText("tìm tài liệu")).toBeInTheDocument();
    expect(useIntegrationStore.getState().lastToolCall?.name).toBe("search_docs");
  });

  it("re-renders Dashboard with the latest tool call after a second prompt", async () => {
    const user = userEvent.setup();
    renderShellLikeLayout();
    const dashboard = screen.getByRole("region", { name: "dashboard-region" });
    const input = screen.getByLabelText("Prompt");
    const send = screen.getByRole("button", { name: "Gửi" });

    await user.type(input, "first");
    await user.click(send);
    await waitFor(() => {
      expect(within(dashboard).getByText("first")).toBeInTheDocument();
    });

    await user.type(input, "second");
    await user.click(send);
    await waitFor(() => {
      expect(within(dashboard).getByText("second")).toBeInTheDocument();
    });
    expect(within(dashboard).queryByText("first")).not.toBeInTheDocument();
  });
});
