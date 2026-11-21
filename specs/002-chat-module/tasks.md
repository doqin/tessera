# Tasks: Chat/Prompt Module (002-chat-module)

Nguồn: `plan.md`. `[x]` = đã thực hiện (phiên "D2 Foundation Setup" và đợt chuyển sang Next.js
13.5.11 + Module Federation — `docs/findings/R2-module-federation-nextjs-approuter.md` §13);
`[ ]` = giai đoạn Thực hiện (đến 21/11/2026).

## Foundation (D2 §7 scope)

- [x] **T001** Scaffold `apps/chat-module` (App Router + TS), gắn vào npm workspace. _(Hiện ghim
      Next.js 13.5.11 / React 18.2 — thay cho 15.x ban đầu, xem `specs/001-shell-app/tasks.md` T018.)_
- [x] **T002** Đồng bộ `tsconfig.json` kế thừa `tsconfig.base.json`; gỡ ESLint/Prettier riêng.
- [x] **T003 (revised)** Cấu hình **remote Module Federation**: `next.config.js` với
      `NextFederationPlugin` (expose `./ChatModule`, `shared` singleton, chỉ federation ở client
      compiler, workaround guard App Router) — `plan.md` §2. _(Từng đổi sang Multi-Zones giữa chừng
      trên Next.js 15.5, xem `specs/001-shell-app/spec.md` §11.)_
- [x] **T004** Tạo `types/chat.ts` (`Message`, `ToolCall`, trạng thái message: `sent`/`error`/
      `interrupted`).
- [x] **T005** Tạo `services/chatService.ts` — **mock cố định** (chưa gọi Groq thật), trả về
      `Message` giả lập kèm `toolCall` mẫu để chứng minh luồng `lastToolCall`.
- [x] **T006** Tạo `hooks/useChatViewModel.ts` (ViewModel) + unit test (mock `chatService`).
- [x] **T007 (revised)** Tạo View: `ChatWindow.tsx`, `MessageBubble.tsx`, `PromptInput.tsx`,
      `ChatModule.tsx` (`"use client"`, được expose qua MF) + RTL test cho
      `ChatWindow`/`PromptInput`/`MessageBubble`/`ChatModule`. _(`ZoneNav.tsx` của giai đoạn
      Multi-Zones đã xoá.)_
- [x] **T008 (revised)** `app/page.tsx` + `app/layout.tsx` — trang **chạy độc lập** (dev/test riêng
      ở :3001); khi tích hợp Shell nạp `ChatModule` qua MF, không dùng trang này.
- [x] **T009 (revised)** Xác nhận Shell nạp được remote ở route `/chat` — verify bằng dev server (2
      cổng 3000/3001) VÀ production build (`next build && next start`) qua browser thật: remote
      mount, soft navigation không reload, gửi prompt ghi `lastToolCall`, tắt remote thì Shell hiện
      fallback (D2 §7 mục 3 — "load remote thành công").
- [x] **T010** `npm run lint`/`typecheck`/`test`/`build --workspace=apps/chat-module` pass.
- [x] **T011** Thêm `@source "../../../packages/shared-ui/src";` vào `globals.css` (Tailwind v4 mặc
      định không quét `packages/shared-ui`); Shell thêm `@source` tới `components/` của module này
      để có CSS cho remote (findings §11, §13.8). _(Đã bỏ khi chuyển sang dqcss — không còn `@source`
      trong `globals.css`.)_

## Còn lại — giai đoạn Thực hiện (đến 21/11/2026)

- [x] **T012** Nối Groq API thật qua route handler `apps/chat-module/app/api/chat/route.ts`
      (logic ở `services/groqProxy.ts`): `GROQ_API_KEY` (+ tuỳ chọn `GROQ_MODEL`,
      `CHAT_ALLOWED_ORIGIN`) chỉ nằm phía server (`.env.local`, xem `.env.local.example`); validate
      prompt (≤4000 ký tự), không chuyển tiếp body lỗi của Groq, CORS cho Shell gọi cross-origin.
      `chatService.sendPrompt` gọi `${NEXT_PUBLIC_CHAT_API_URL ?? http://localhost:3001}/api/chat`.
      _(Đã kiểm: unit test + `next build/start` — OPTIONS 204, thiếu key → 500. **Groq thật
      2026-11-21**: POST `/api/chat` với key trong `apps/chat-module/.env.local` → `200`, stream SSE
      đúng shape OpenAI (`data: {...}` từng chunk + `data: [DONE]`), model mặc định
      `qwen/qwen3.8-27b` trả `delta.tool_calls`; không cần đổi `GROQ_MODEL`.)_
- [x] **T013** Streaming thật: route proxy SSE của Groq (`stream: true`), `chatService` đọc từng
      chunk và gọi `onDelta`; `useChatViewModel` cập nhật một message agent tại chỗ nên
      `MessageBubble` tăng dần theo chunk (FR3, AC2). _(`toolCall` vẫn là mẫu cố định đến T016.)_
- [x] **T014** Xử lý lỗi/timeout thật (15s, Clarify §9) — hiển thị message lỗi trong danh sách.
      _(`chatService.sendPrompt`: timeout 15s theo kiểu "không có dữ liệu mới" (đặt lại mỗi chunk),
      ném `ChatTimeoutError`; `useChatViewModel` thêm message `status: "error"`. **Groq thật
      2026-11-21**: nhánh thành công đi qua đường thật (không mock). **Timeout 2026-11-21** (kiểm
      end-to-end bằng upstream treo thật: server SSE trả header 200 + `text/event-stream` rồi im lặng
      hoàn toàn, browser trỏ `NEXT_PUBLIC_CHAT_API_URL` vào đó): bong bóng lỗi hiện sau **15,71 s**
      với "Không nhận được phản hồi, thử lại." + "Lỗi/timeout — thử gửi lại."; store **không** bị ghi
      (`lastToolCall` cũ giữ nguyên); gửi lại prompt bình thường sau đó vẫn chạy và cập nhật dashboard
      sau 0,76 s → timer/abort được dọn sạch.)_
- [x] **T015** Xử lý streaming bị ngắt giữa chừng (Clarify §9) — giữ partial content + chỉ báo.
      _(Lỗi mạng/timeout/đóng stream thiếu `[DONE]`/`finish_reason` khi đã có nội dung → message
      `status: "interrupted"` (`MessageBubble` hiện chỉ báo), không ghi `lastToolCall`; chưa có nội dung → reject.
      **Kiểm end-to-end 2026-11-21** (upstream treo thật, xem T014): stream nhận 1 chunk rồi im lặng →
      sau **16,18 s** giữ nguyên "Đây là phần đầu" + "Phản hồi bị ngắt giữa chừng.", store không đổi.)_
- [x] **T016** Tool-call detection thật từ response Groq (không còn mock `toolCall` cố định) →
      `integrationStore.setLastToolCall`. _(2 tool mẫu `get_weather`/`search_docs` trong
      `services/tools.ts`; proxy gửi `tools`; `chatService` gom `delta.tool_calls`, chạy tool giả,
      trả `toolCall` kèm `result`. **Groq thật 2026-11-21** (`qwen/qwen3.8-27b`): prompt "weather in
      Hanoi" → stream `delta.tool_calls` (`get_weather`, `{"city":"Hà Nội"}`,
      `finish_reason: "tool_calls"`, `[DONE]`) → dashboard hiện đúng tool; prompt thứ hai chuyển sang
      `search_docs`. Model chỉ gọi tool mà không trả text → message "Đã gọi tool get_weather.".)_
- [x] **T017** Coverage ≥70% cho toàn bộ `hooks/`+`services/` sau khi có logic thật (không chỉ
      mock). _(Đo sau T014–T016: statements 97.8%, branches 93.3%.)_
