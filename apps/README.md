# apps/

Next.js apps độc lập, mỗi app là một **zone** (Next.js Multi-Zones):

- `shell/` — zone chủ (Application Shell): header/sidebar, routing, proxy `/chat` sang zone Chat
  module qua `rewrites()`.
- `chat-module/` — zone thứ cấp (Chat/Prompt module), `basePath: "/chat"`, tự render chrome giống
  Shell.
- `dashboard-module/` — **chưa scaffold**, chờ `specs/003-dashboard-module/spec.md` +
  `plan.md` + `tasks.md` (theo đúng quy trình SDD — xem `.specify/constitution.md` §8).

Kiến trúc tích hợp ban đầu chọn Module Federation; đã pivot sang Next.js Multi-Zones sau khi gặp
lỗi runtime không khắc phục được trong giai đoạn "D2 Foundation Setup" — chi tiết đầy đủ tại
`docs/findings/R2-module-federation-nextjs-approuter.md`. Xem `specs/001-shell-app/plan.md` và
`specs/002-chat-module/plan.md` để biết kiến trúc hiện tại.
