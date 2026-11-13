# tests/

Integration test kiểm tra luồng ghép nối giữa Shell app và các Micro Frontend module (load
module, truyền state qua Zustand store dùng chung, điều hướng) — theo Control Procedures của
Project Charter và Testing requirements ở `.specify/constitution.md` §3.

E2E trên trình duyệt thật (Playwright, chạy bản production build của 3 app) nằm ở `e2e/` — không
đặt spec Playwright ở đây vì Jest quét thư mục này. Chạy: build 3 app rồi `npm run test:e2e`
(lần đầu: `npx playwright install chromium`).

Unit test của từng module/package nằm cạnh source code tương ứng (VD:
`packages/shared-ui/src/Button.test.tsx`), không đặt ở đây.
