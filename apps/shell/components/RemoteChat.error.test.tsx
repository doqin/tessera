import { render, screen } from "@testing-library/react";
import { RemoteChat } from "./RemoteChat";

jest.mock("./chatRemote", () => ({
  loadChatRemote: () => Promise.reject(new Error("remote down")),
}));

describe("RemoteChat (remote fails to load)", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => consoleError.mockRestore());

  it("shows the RemoteModuleBoundary fallback with the load error (spec FR5/AC5)", async () => {
    render(<RemoteChat />);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("chat_module");
    expect(alert).toHaveTextContent("remote down");
  });
});
