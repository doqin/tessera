// eslint-disable-next-line @typescript-eslint/no-require-imports
const errorRemotePlugin = require("./errorRemotePlugin") as () => {
  name: string;
  errorLoadRemote: (args: { id: string; from: string; error: unknown }) => unknown;
};

describe("errorRemotePlugin", () => {
  it("returns a module whose component throws a clear error naming the remote", () => {
    const plugin = errorRemotePlugin();
    const mod = plugin.errorLoadRemote({
      id: "chat_module/ChatModule",
      from: "runtime",
      error: new Error("net::ERR_CONNECTION_REFUSED"),
    }) as { default: () => never };
    expect(() => mod.default()).toThrow(/chat_module\/ChatModule.*không truy cập được/);
  });

  it("returns a module factory when MF resolves the remote at build time", () => {
    const plugin = errorRemotePlugin();
    const factory = plugin.errorLoadRemote({
      id: "chat_module/ChatModule",
      from: "build",
      error: new Error("x"),
    }) as () => { default: () => never };
    expect(() => factory().default()).toThrow(/không truy cập được/);
  });
});
