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
      _(Đã kiểm: unit test + `next build/start` — OPTIONS 204, thiếu key → 500. Chưa gọi thử Groq thật
      vì chưa có key trong môi trường; cần chạy tay với key trước khi coi là nghiệm thu.)_
- [x] **T013** Streaming thật: route proxy SSE của Groq (`stream: true`), `chatService` đọc từng
      chunk và gọi `onDelta`; `useChatViewModel` cập nhật một message agent tại chỗ nên
      `MessageBubble` tăng dần theo chunk (FR3, AC2). _(`toolCall` vẫn là mẫu cố định đến T016.)_
- [ ] **T014** Xử lý lỗi/timeout thật (15s, Clarify §9) — hiển thị message lỗi trong danh sách.
- [ ] **T015** Xử lý streaming bị ngắt giữa chừng (Clarify §9) — giữ partial content + chỉ báo.
- [ ] **T016** Tool-call detection thật từ response Groq (không còn mock `toolCall` cố định) →
      `integrationStore.setLastToolCall`.
- [ ] **T017** Coverage ≥70% cho toàn bộ `hooks/`+`services/` sau khi có logic thật (không chỉ
      mock).
