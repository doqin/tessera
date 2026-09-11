import { useIntegrationStore } from "./integrationStore";

describe("useIntegrationStore", () => {
  afterEach(() => {
    useIntegrationStore.setState({
      lastToolCall: null,
      navState: { currentRoute: "/" },
    });
  });

  it("assigns a non-empty sessionId that stays stable across reads", () => {
    const first = useIntegrationStore.getState().sessionId;
    const second = useIntegrationStore.getState().sessionId;
    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });

  it("defaults lastToolCall to null and navState to the root route", () => {
    const state = useIntegrationStore.getState();
    expect(state.lastToolCall).toBeNull();
    expect(state.navState).toEqual({ currentRoute: "/" });
  });

  it("setLastToolCall replaces lastToolCall (last-write-wins)", () => {
    const call = {
      id: "1",
      name: "search",
      params: { query: "demo" },
      calledAt: new Date().toISOString(),
    };
    useIntegrationStore.getState().setLastToolCall(call);
    expect(useIntegrationStore.getState().lastToolCall).toEqual(call);

    const nextCall = { ...call, id: "2", name: "fetch" };
    useIntegrationStore.getState().setLastToolCall(nextCall);
    expect(useIntegrationStore.getState().lastToolCall).toEqual(nextCall);
  });

  it("setNavState updates the current route", () => {
    useIntegrationStore.getState().setNavState("/chat");
    expect(useIntegrationStore.getState().navState).toEqual({ currentRoute: "/chat" });
  });

  it("persists lastToolCall to localStorage so a fresh store instance rehydrates it (simulates a Multi-Zones reload)", () => {
    const toolCall = { id: "p1", name: "persisted_tool", params: {}, calledAt: "now" };
    useIntegrationStore.getState().setLastToolCall(toolCall);

    let rehydratedStore: typeof useIntegrationStore | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      rehydratedStore = require("./integrationStore").useIntegrationStore;
    });

    expect(rehydratedStore?.getState().lastToolCall).toEqual(toolCall);
  });
});
