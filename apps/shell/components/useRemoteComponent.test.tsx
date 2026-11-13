import { render, screen } from "@testing-library/react";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";
import { useRemoteComponent } from "./useRemoteComponent";

function Host({ load }: { load: () => Promise<{ default: () => JSX.Element }> }) {
  const Remote = useRemoteComponent(load);
  return Remote ? <Remote /> : <p>loading</p>;
}

describe("useRemoteComponent", () => {
  it("returns null while loading, then the remote's default export", async () => {
    render(<Host load={() => Promise.resolve({ default: () => <p>remote ready</p> })} />);
    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("remote ready")).toBeInTheDocument();
  });

  it("rethrows a load error during render so the boundary can catch it", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <RemoteModuleBoundary moduleName="m">
        <Host load={() => Promise.reject(new Error("boom"))} />
      </RemoteModuleBoundary>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("boom");
    consoleError.mockRestore();
  });

  it("does not update state after unmount", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    let resolve: (value: { default: () => JSX.Element }) => void = () => undefined;
    const { unmount } = render(<Host load={() => new Promise((r) => (resolve = r))} />);
    unmount();
    resolve({ default: () => <p>late</p> });
    await Promise.resolve();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
