# Plan: Chat/Prompt Module (002-chat-module)

- **Nguồn:** `spec.md` (đã Clarify + Checklist §9–10, Amendment §11), `UIT.SE.66-D2-TechStackFoundation`
  §4–7, `UIT.SE.66-D3-ProblemSolutionModel` §3, §5, §6, §7, `specs/001-shell-app/plan.md` (hợp đồng
  Multi-Zones/store phía Shell).
- **Trạng thái:** Implemented (foundation, mock service).
- **Lịch sử quan trọng:** Đã pivot từ Module Federation sang Next.js Multi-Zones cùng đợt với
  `specs/001-shell-app` — xem `docs/findings/R2-module-federation-nextjs-approuter.md`. Tài liệu
  này mô tả kiến trúc sau pivot.

## 1. Kiến trúc tổng quan (MVVM — D3 §6)

```
apps/chat-module/
├── next.config.ts             basePath: "/chat" (Next.js Multi-Zones — zone thứ cấp)
├── app/
│   ├── layout.tsx              AppHeader + ZoneNav (packages/shared-ui) — chrome giống hệt Shell
│   └── page.tsx                trang chính của zone (được Shell proxy tới qua rewrites())
├── components/                 View — component thuần, nhận props
│   ├── ChatModule.tsx           compose ChatWindow + PromptInput, "use client"
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   ├── PromptInput.tsx
│   └── ZoneNav.tsx              sync "/chat" vào integrationStore.navState, render AppNav
├── hooks/                      ViewModel
│   └── useChatViewModel.ts     state message list, gọi Model, cập nhật integrationStore.lastToolCall
├── services/                   Model
│   └── chatService.ts          gọi LLM API (Groq mặc định), trả Message[]/stream
└── types/
    └── chat.ts                 Message, ToolCall, ChatState
```

## 2. Next.js Multi-Zones — cấu hình zone thứ cấp

- `basePath: "/chat"` trong `next.config.ts` — mọi route (`app/page.tsx` → `/`) và static asset
  của app này tự động phục vụ dưới tiền tố `/chat`, khớp đích `rewrites()` của Shell
  (`specs/001-shell-app/plan.md` §2). Không cần `assetPrefix` riêng.
- `ChatModule.tsx` vẫn là Client Component (`"use client"`) — không đổi so với thiết kế ban đầu,
  lý do khác: cần `useState`/hooks cho ViewModel, không liên quan ràng buộc MF/App Router nữa.
- `app/layout.tsx` tự render `AppHeader` + `ZoneNav` (từ `packages/shared-ui`) — zone này chịu
  trách nhiệm chrome của chính nó (Multi-Zones: mỗi zone là 1 document riêng, không có Shell
  "bao" quanh nó ở tầng React runtime như Module Federation từng dự kiến).

## 3. Model — `chatService.ts`

- Gọi Groq API (`/chat/completions`, tương thích OpenAI shape) — tái dùng pattern từ
  `tools/llm-trial/test-llm-connection.mjs` (đã có sẵn, đã trial thành công theo D1 §6 checklist).
- **Giai đoạn nền tảng (phiên làm việc này):** `chatService.ts` dùng **mock cố định** (không gọi
  API thật) — trả về `Message` giả lập ngay để phục vụ mục tiêu "load remote thành công" của D2
  §7 mục 3, KHÔNG triển khai gọi Groq thật/streaming/tool-call thật ở đây (thuộc tasks còn lại,
  giai đoạn Thực hiện — xem `tasks.md`).
- Khi triển khai đầy đủ (giai đoạn sau): dùng `fetch` (không thêm SDK ngoài Tech Stack — Constitution
  §4), timeout 15s (Clarify §9), dữ liệu mẫu/dummy only (NFR7, NDA).

## 4. ViewModel — `useChatViewModel.ts`

- State: `messages: Message[]`, `isSending: boolean`.
- Submit prompt: append user message ngay (AC1), gọi `chatService`, append agent message khi có
  phản hồi (mock ở giai đoạn nền tảng); không khoá input khi đang chờ (Clarify §9 — cho phép gửi
  tiếp, FIFO theo thứ tự gọi).
- Khi response mock có `toolCall`, gọi `integrationStore.setLastToolCall(toolCall)` — import store
  từ package `@tessera/integration-store` qua npm workspace (theo quyết định ở
  `specs/001-shell-app/plan.md` §3).

## 5. View — component thuần

- `ChatWindow`: danh sách `MessageBubble` theo thời gian (FR1).
- `PromptInput`: input + submit, disabled chỉ khi rỗng (không disabled khi đang chờ — Clarify §9).
- `MessageBubble`: hiển thị message; hỗ trợ trạng thái "phản hồi bị ngắt" (Clarify §9) và
  "lỗi/timeout" (Clarify §9) qua một `status` field trên `Message`.
- Dùng Tailwind + style đồng bộ `packages/shared-ui` (Button, Card).

## 6. Testing strategy

- Unit test tách biệt View/ViewModel (spec AC5): `useChatViewModel` test với `chatService` mock
  (Jest mock module), component test bằng RTL cho `PromptInput`/`MessageBubble` không phụ thuộc
  service thật.
- Coverage ≥70% cho `hooks/` + `services/` (phần logic, không tính `app/page.tsx` dev-only).

## 7. Phạm vi phiên "D2 Foundation Setup" vs. giai đoạn Thực hiện

Phiên này (foundation): scaffold app, cấu hình zone Multi-Zones (`basePath`), `ChatModule` có UI
thật (ChatWindow/PromptInput/MessageBubble) nhưng **service mock cố định**, đủ để Shell proxy
`/chat` sang đúng nội dung (D2 §7 mục 3, đã đổi cơ chế nhưng vẫn đạt đúng mục tiêu "load module
thành công") và chứng minh pipeline hoạt động — đã verify bằng browser thật (dev + production
build).

Giai đoạn Thực hiện (sau, 21/11/2026): nối `chatService` với Groq API thật (theo mẫu
`tools/llm-trial`), streaming thật, xử lý timeout/lỗi thật theo Clarify §9 — xem `tasks.md` phần
còn lại.
