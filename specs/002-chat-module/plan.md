# Plan: Chat/Prompt Module (002-chat-module)

- **Nguồn:** `spec.md` (đã Clarify + Checklist §9–10, §11), `UIT.SE.66-D2-TechStackFoundation`
  §4–7, `UIT.SE.66-D3-ProblemSolutionModel` §3, §5, §6, §7, `specs/001-shell-app/plan.md` (hợp đồng
  Module Federation/store phía Shell).
- **Trạng thái:** Implemented (foundation, mock service).
- **Lịch sử quan trọng:** Module Federation (kế hoạch gốc) → tạm Multi-Zones (Next.js 15.5) →
  quay lại Module Federation trên Next.js 13.5.11 (kiến trúc hiện tại). Xem
  `specs/001-shell-app/spec.md` §11 và `docs/findings/R2-module-federation-nextjs-approuter.md` §13.

## 1. Kiến trúc tổng quan (MVVM — D3 §6)

```
apps/chat-module/
├── next.config.js             NextFederationPlugin: exposes ./ChatModule + shared (client-only)
├── postcss.config.js          Tailwind v4 (phải là .js — Next 13.5 không nhận .mjs)
├── app/
│   ├── layout.tsx              AppHeader (packages/shared-ui) — chrome cho trang chạy độc lập
│   └── page.tsx                trang chạy độc lập (dev/test riêng ở :3001); Shell không dùng trang này
├── components/                 View — component thuần, nhận props
│   ├── ChatModule.tsx           ĐƯỢC EXPOSE qua MF; compose ChatWindow + PromptInput, "use client"
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   └── PromptInput.tsx
├── hooks/                      ViewModel
│   └── useChatViewModel.ts     state message list, gọi Model, cập nhật integrationStore.lastToolCall
├── services/                   Model
│   └── chatService.ts          gọi LLM API (Groq mặc định), trả Message[]/stream
└── types/
    └── chat.ts                 Message, ToolCall, ChatState
```

## 2. Module Federation — cấu hình remote

- `apps/chat-module/next.config.js`: `NextFederationPlugin({ name: "chat_module", filename:
"static/chunks/remoteEntry.js", exposes: { "./ChatModule": "./components/ChatModule.tsx" },
shared: ... })`. Cùng nền tảng/phiên bản/workaround với Shell (Next.js 13.5.11, `webpack` 5.99.9,
  bỏ guard `appDirEnabled` tạm thời, **chỉ federation ở client compiler**, `shared` trỏ vào React
  vendored của Next + `@tessera/integration-store` + `zustand` singleton) — chi tiết và lý do:
  `specs/001-shell-app/plan.md` §2, findings doc §13.
- `ChatModule.tsx` là Client Component (`"use client"`) — bắt buộc vì Shell nạp client-only
  (`ssr: false`) và vì cần `useState`/hooks cho ViewModel.
- Không còn `basePath`/`ZoneNav` (của giai đoạn Multi-Zones). Chrome (header/sidebar) do Shell
  chịu trách nhiệm; `app/layout.tsx` của module chỉ phục vụ trang chạy độc lập.
- Remote chunk không mang CSS: Shell `@source` thư mục `components/` của module này trong
  `globals.css` để sinh utility class — **thêm class Tailwind mới trong `components/` là đủ, nhưng
  đổi tên/di chuyển thư mục `components/` phải cập nhật `@source` của Shell**.

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

Phiên này (foundation): scaffold app, cấu hình remote Module Federation, `ChatModule` có UI thật
(ChatWindow/PromptInput/MessageBubble) nhưng **service mock cố định**, đủ để Shell nạp `/chat` từ
remote (D2 §7 mục 3 — "load remote thành công") và chứng minh pipeline hoạt động — đã verify bằng
browser thật (dev + production build, gồm gửi prompt qua remote ghi `lastToolCall`).

Giai đoạn Thực hiện (sau, 21/11/2026): nối `chatService` với Groq API thật (theo mẫu
`tools/llm-trial`), streaming thật, xử lý timeout/lỗi thật theo Clarify §9 — xem `tasks.md` phần
còn lại.
