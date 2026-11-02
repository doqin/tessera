import { fireEvent, render, screen } from "@testing-library/react";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) throw new Error("remoteEntry không tải được");
  return <p>remote ok</p>;
}

describe("RemoteModuleBoundary", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    shouldThrow = true;
    consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => consoleError.mockRestore());

  it("renders children when the remote loads fine", () => {
    shouldThrow = false;
    render(
      <RemoteModuleBoundary moduleName="chat_module">
        <Flaky />
      </RemoteModuleBoundary>,
    );
    expect(screen.getByText("remote ok")).toBeInTheDocument();
  });

  it("shows a clear fallback with the module name and error when the remote fails", () => {
    render(
      <RemoteModuleBoundary moduleName="chat_module">
        <Flaky />
      </RemoteModuleBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("chat_module");
    expect(screen.getByRole("alert")).toHaveTextContent("remoteEntry không tải được");
  });

  it("reloads the page when the user clicks the retry button", () => {
    const reload = jest.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", { configurable: true, value: { reload } });
    try {
      render(
        <RemoteModuleBoundary moduleName="chat_module">
          <Flaky />
        </RemoteModuleBoundary>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Tải lại trang" }));
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    }
  });
});
