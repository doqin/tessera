import { render } from "@testing-library/react";
import { RemotePreload } from "./RemotePreload";

const ENTRY = "https://tessera-chat-module.vercel.app/_next/static/chunks/remoteEntry.js?t=123";

describe("RemotePreload", () => {
  it("preconnects to the remote origin and preloads its remoteEntry (no crossOrigin, to match MF's classic script)", () => {
    const { container } = render(<RemotePreload entryUrl={ENTRY} />);

    const preconnect = container.querySelector('link[rel="preconnect"]');
    expect(preconnect).toHaveAttribute("href", "https://tessera-chat-module.vercel.app");
    expect(preconnect).toHaveAttribute("crossorigin", "anonymous");

    const preload = container.querySelector('link[rel="preload"]');
    expect(preload).toHaveAttribute("href", ENTRY);
    expect(preload).toHaveAttribute("as", "script");
    expect(preload).not.toHaveAttribute("crossorigin");

    expect(container.querySelector('link[rel="dns-prefetch"]')).toHaveAttribute(
      "href",
      "https://tessera-chat-module.vercel.app",
    );
  });

  it("renders nothing when no entry URL is configured", () => {
    const { container } = render(<RemotePreload entryUrl="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
