import { sendPrompt } from "./chatService";

describe("chatService.sendPrompt", () => {
  it("resolves with an agent message referencing the submitted prompt", async () => {
    const { message } = await sendPrompt("xin chào");
    expect(message.role).toBe("agent");
    expect(message.status).toBe("sent");
    expect(message.content).toContain("xin chào");
  });

  it("resolves with a mock toolCall so the Integration Layer flow can be exercised", async () => {
    const { toolCall } = await sendPrompt("tìm kiếm demo");
    expect(toolCall).toBeDefined();
    expect(toolCall?.params).toEqual({ query: "tìm kiếm demo" });
  });

  it("returns a fresh id for every call", async () => {
    const first = await sendPrompt("a");
    const second = await sendPrompt("b");
    expect(first.message.id).not.toBe(second.message.id);
  });
});
