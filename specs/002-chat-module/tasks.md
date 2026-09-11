# Tasks: Chat/Prompt Module (002-chat-module)

Nguồn: `plan.md`. `[x]` = thực hiện trong phiên "D2 Foundation Setup" (bao gồm pivot Multi-Zones
giữa phiên — xem `docs/findings/R2-module-federation-nextjs-approuter.md`); `[ ]` = giai đoạn Thực
hiện (đến 21/11/2026).

## Foundation (D2 §7 scope — thực hiện lần này)

- [x] **T001** Scaffold `apps/chat-module` (Next.js 15.x, App Router + TS), gắn vào npm workspace.
- [x] **T002** Đồng bộ `tsconfig.json` kế thừa `tsconfig.base.json`; gỡ ESLint/Prettier riêng.
- [x] **T003 (revised)** ~~Cài `@module-federation/nextjs-mf`, cấu hình remote~~ → Thử
      `@module-federation/nextjs-mf` rồi `@module-federation/enhanced`, cả 2 đều thất bại (build
      hoặc runtime — findings doc). Pivot: `basePath: "/chat"` (Next.js Multi-Zones), gỡ toàn bộ
      dependency/cấu hình Module Federation.
- [x] **T004** Tạo `types/chat.ts` (`Message`, `ToolCall`, trạng thái message: `sent`/`error`/
      `interrupted`).
- [x] **T005** Tạo `services/chatService.ts` — **mock cố định** (chưa gọi Groq thật), trả về
      `Message` giả lập kèm `toolCall` mẫu để chứng minh luồng `lastToolCall`.
- [x] **T006** Tạo `hooks/useChatViewModel.ts` (ViewModel) + unit test (mock `chatService`).
- [x] **T007** Tạo View: `ChatWindow.tsx`, `MessageBubble.tsx`, `PromptInput.tsx`,
      `ChatModule.tsx` (`"use client"`) + `ZoneNav.tsx` (chrome dùng chung) + RTL test cho
      `PromptInput`/`MessageBubble`/`ZoneNav`.
- [x] **T008 (revised)** `app/page.tsx` + `app/layout.tsx` — nay là **trang production thật** của
      zone (không còn "dev-only"), Shell proxy `/chat` tới đây qua `rewrites()`.
- [x] **T009 (revised)** Xác nhận Shell (`apps/shell`) route đúng `/chat` sang zone Chat module —
      verify bằng dev server (2 cổng 3000/3001) VÀ production build (`next build && next start`)
      qua Browser tool, không chỉ "build thử" (D2 §7 mục 3 mục tiêu gốc, đạt bằng cơ chế khác).
- [x] **T010** `npm run lint`/`typecheck`/`test`/`build --workspace=apps/chat-module` pass.
- [x] **T011 (mới, phát sinh lúc pivot)** Thêm `@source "../../../packages/shared-ui/src";` vào
      `globals.css` — Tailwind v4 mặc định không quét `packages/shared-ui`, khiến `AppNav`/`AppHeader`
      mất style (phát hiện qua kiểm tra bằng mắt, xem findings doc §11).

## Còn lại — giai đoạn Thực hiện (đến 21/11/2026)

- [ ] **T012** Nối `chatService.ts` với Groq API thật (`/chat/completions`, theo mẫu
      `tools/llm-trial/test-llm-connection.mjs`), dùng `GROQ_API_KEY` từ `.env.local`.
- [ ] **T013** Streaming thật (SSE/chunked) thay cho mock trả nguyên khối — cập nhật
      `MessageBubble` tăng dần theo chunk (FR3, AC2).
- [ ] **T014** Xử lý lỗi/timeout thật (15s, Clarify §9) — hiển thị message lỗi trong danh sách.
- [ ] **T015** Xử lý streaming bị ngắt giữa chừng (Clarify §9) — giữ partial content + chỉ báo.
- [ ] **T016** Tool-call detection thật từ response Groq (không còn mock `toolCall` cố định) →
      `integrationStore.setLastToolCall`.
- [ ] **T017** Coverage ≥70% cho toàn bộ `hooks/`+`services/` sau khi có logic thật (không chỉ
      mock).
