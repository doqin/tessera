import { render, screen } from "@testing-library/react";
import { RemoteChat } from "./RemoteChat";

// Trường hợp lỗi nạp nằm ở RemoteChat.error.test.tsx (mock module khác nhau theo file).
jest.mock("./chatRemote", () => ({
  loadChatRemote: () => Promise.resolve({ default: () => <p>chat remote mounted</p> }),
}));

describe("RemoteChat", () => {
  it("shows a loading state, then mounts the remote Chat module once it has loaded", async () => {
    render(<RemoteChat />);
    expect(screen.getByText(/Đang tải Chat module/)).toBeInTheDocument();
    expect(await screen.findByText("chat remote mounted")).toBeInTheDocument();
  });
});
