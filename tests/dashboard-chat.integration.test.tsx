/**
 * Integration test — Chat module (ghi `lastToolCall`) ⇄ Dashboard module (đọc live) qua
 * Integration Layer (`@tessera/integration-store`). Hai module được mount cùng cây React, dùng
 * chung 1 store, giống cách Shell ghép hai remote ở `/chat` và `/dashboard`.
 *
 * Chưa bao gồm: nạp remote qua Module Federation và fallback khi remote down (cần trình duyệt
 * thật — xem specs/001-shell-app/tasks.md T016).
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useIntegrationStore } from "@tessera/integration-store";
import ChatModule from "../apps/chat-module/components/ChatModule";
import DashboardModule from "../apps/dashboard-module/components/DashboardModule";

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
  });

  it("shows the tool call from a prompt sent in Chat without remounting Dashboard", async () => {
    const user = userEvent.setup();
    renderShellLikeLayout();
    const dashboard = screen.getByRole("region", { name: "dashboard-region" });
    expect(within(dashboard).getByText("Chưa có tool nào được gọi")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Prompt"), "tìm tài liệu");
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    await waitFor(() => {
      expect(within(dashboard).getByText("mock_search")).toBeInTheDocument();
    });
    expect(within(dashboard).getByText("query")).toBeInTheDocument();
    expect(within(dashboard).getByText("tìm tài liệu")).toBeInTheDocument();
    expect(useIntegrationStore.getState().lastToolCall?.name).toBe("mock_search");
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
