import { expect, test, type Page } from "@playwright/test";

const CHAT_API = "**/api/chat";

/** Giả lập `/api/chat` (không gọi Groq thật): model gọi tool `search_docs` với query = prompt. */
async function mockChatApi(page: Page) {
  await page.route(CHAT_API, async (route) => {
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type",
    };
    if (route.request().method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: cors });
    }
    const { prompt } = route.request().postDataJSON() as { prompt: string };
    const chunk = (delta: object, finish: string | null = null) =>
      `data: ${JSON.stringify({ choices: [{ delta, finish_reason: finish }] })}\n\n`;
    const body =
      chunk({ content: "Đang tìm " }) +
      chunk({
        tool_calls: [
          {
            index: 0,
            id: `call-${prompt}`,
            function: { name: "search_docs", arguments: JSON.stringify({ query: prompt }) },
          },
        ],
      }) +
      chunk({}, "tool_calls") +
      "data: [DONE]\n\n";
    return route.fulfill({
      status: 200,
      headers: { ...cors, "content-type": "text/event-stream" },
      body,
    });
  });
}

async function sendPrompt(page: Page, text: string) {
  await page.getByLabel("Prompt").fill(text);
  await page.getByRole("button", { name: "Gửi" }).click();
}

test.describe("Shell nạp remote qua Module Federation", () => {
  test("/chat nạp remote Chat từ origin riêng và không sinh request /autostatic", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    await page.goto("/chat");
    await expect(page.getByLabel("Prompt")).toBeVisible();

    expect(
      requests.some((url) => url.includes("localhost:3001") && url.includes("remoteEntry")),
    ).toBe(true);
    expect(requests.filter((url) => url.includes("autostatic"))).toEqual([]);
  });

  test("điều hướng /chat → /dashboard là điều hướng mềm (không reload)", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByLabel("Prompt")).toBeVisible();
    await page.evaluate(() => {
      (window as unknown as { __marker: string }).__marker = "same-document";
    });

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Chưa có tool nào được gọi")).toBeVisible();

    const marker = await page.evaluate(() => (window as unknown as { __marker?: string }).__marker);
    expect(marker).toBe("same-document");

    await page.getByRole("link", { name: "Chat" }).click();
    await expect(page.getByLabel("Prompt")).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __marker?: string }).__marker)).toBe(
      "same-document",
    );
  });
});

test.describe("NFR2 — điều hướng <300 ms", () => {
  test("lần điều hướng đầu tới /dashboard sau khi hover link (remote đã prefetch) dưới 300 ms", async ({
    page,
  }) => {
    await page.goto("/chat");
    await expect(page.getByLabel("Prompt")).toBeVisible();

    const link = page.getByRole("link", { name: "Dashboard" });
    await link.hover();
    await page.waitForTimeout(1000); // thời gian prefetch remote khi hover

    // Đo trong trang từ lúc click tới lúc nội dung Dashboard hiện (không tính overhead của Playwright).
    const ms = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const start = performance.now();
          const observer = new MutationObserver(() => {
            if (document.body.innerText.includes("Chưa có tool nào được gọi")) {
              observer.disconnect();
              resolve(performance.now() - start);
            }
          });
          observer.observe(document.body, { childList: true, subtree: true, characterData: true });
          document.querySelector<HTMLAnchorElement>('a[href="/dashboard"]')?.click();
        }),
    );
    expect(ms).toBeLessThan(300);
  });
});

test.describe("lastToolCall từ Chat được Dashboard đọc qua store dùng chung", () => {
  test("tool call ghi bởi remote Chat hiện ở Dashboard, giá trị mới nhất thắng, sống sau reload", async ({
    page,
  }) => {
    await mockChatApi(page);
    await page.goto("/chat");

    await sendPrompt(page, "first");
    await expect(page.getByText("Đang tìm")).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("search_docs")).toBeVisible();
    await expect(page.getByText("first", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Chat" }).click();
    await sendPrompt(page, "second");
    await expect(page.getByText("Đang tìm").last()).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("second", { exact: true })).toBeVisible();
    await expect(page.getByText("first", { exact: true })).toHaveCount(0);

    await page.reload();
    await expect(page.getByText("second", { exact: true })).toBeVisible();
  });
});

test.describe("fallback khi remote down", () => {
  test("remote Dashboard không tải được → Shell báo lỗi, chrome và điều hướng vẫn hoạt động", async ({
    page,
  }) => {
    await page.route(/localhost:3002\//, (route) => route.abort("connectionrefused"));

    await page.goto("/dashboard");
    await expect(page.locator("[role=alert]", { hasText: "dashboard_module" })).toBeVisible();
    await expect(page.getByText("AI Agent UI — Shell")).toBeVisible();

    await page.getByRole("link", { name: "Chat" }).click();
    await expect(page.getByLabel("Prompt")).toBeVisible();
  });
});
