# apps/

Next.js 13.5.11 apps độc lập, ghép lại bằng **Module Federation** (`@module-federation/nextjs-mf`):

- `shell/` — **host** (Application Shell, :3000): header/sidebar, routing; route `/chat` nạp remote
  `chat_module/ChatModule` lúc runtime (client-only, `next/dynamic` + `ssr: false`), bọc trong
  `RemoteModuleBoundary` để lỗi nạp remote hiện fallback rõ ràng.
- `chat-module/` — **remote** (Chat/Prompt module, :3001): expose `./ChatModule`; vẫn chạy độc lập
  để dev/test riêng.
- `dashboard-module/` — **remote** thứ hai (Tool-Invocation/Dashboard module, :3002): expose
  `./DashboardModule`, Shell nạp ở route `/dashboard`. Spec, plan và tasks ở
  `specs/003-dashboard-module/`; đang trong giai đoạn Thực hiện.

Chạy cả hai (2 terminal): `npm run dev -w chat-module` và `npm run dev -w shell`, mở
http://localhost:3000/chat. URL remote của Shell cấu hình qua biến môi trường
`NEXT_PUBLIC_CHAT_MODULE_URL` (mặc định `http://localhost:3001`) — được đọc lúc **build** của
Shell, nên deploy production phải đặt biến này trước khi build.

## Lưu ý quan trọng

- Module Federation trên Next.js App Router **không được `nextjs-mf` hỗ trợ chính thức**; cấu hình
  ở `next.config.js` của mỗi app chứa các workaround bắt buộc và phiên bản được ghim — đọc
  `docs/findings/R2-module-federation-nextjs-approuter.md` (§13) trước khi nâng Next.js/React/
  webpack hoặc sửa các file config này.
- `next.config.js` phải là CommonJS (`.js`) — Next.js 13.5 không nhận `.ts` hay `.mjs`. Styling dùng
  `@doqin/dqcss` (không dùng Tailwind/PostCSS).
- Phương án dự phòng Next.js Multi-Zones (`rewrites()` + `basePath`) đã từng là cấu hình của repo
  này trong giai đoạn Next.js 15.5; xem lịch sử git và `specs/001-shell-app/spec.md` §11.

Kiến trúc chi tiết: `specs/001-shell-app/plan.md`, `specs/002-chat-module/plan.md`.
