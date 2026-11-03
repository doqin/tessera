# Tasks: Tool-Invocation/Dashboard Module (003-dashboard-module)

Nguồn: `plan.md`. `[x]` = đã thực hiện; `[ ]` = giai đoạn Thực hiện (đến 21/11/2026).

## Foundation (D2 §7 scope)

- [x] **T001** Scaffold `apps/dashboard-module` (App Router + TS), gắn vào npm workspace.
      _(Hiện ghim Next.js 13.5.11 / React 18.2 — thay cho 15.x ban đầu, xem `specs/001-shell-app/tasks.md` T018.)_
- [x] **T002** Đồng bộ `tsconfig.json` kế thừa `tsconfig.base.json`; gỡ ESLint/Prettier riêng.
- [x] **T003 (revised)** Cấu hình **remote Module Federation**: `next.config.js` với
      `NextFederationPlugin` (expose `./DashboardModule`, `shared` singleton, chỉ federation ở client
      compiler, bỏ guard `appDirEnabled` tạm thời) — `plan.md` §1. _(Từng đổi sang Multi-Zones giữa chừng
      trên Next.js 15.5, xem `specs/001-shell-app/spec.md` §11.)_
- [x] **T004** Tạo `types/dashboard.ts` (`ToolCall`, `DashboardState`, Message (trạng thái: `sent`/
      `processing`/`error`)).
- [x] **T005** Tạo `services/dashboardService.ts` — **chỉ đọc `lastToolCall` từ integrationStore**, không
      gọi LLM API (danh mục Exclusions của spec: Dashboard không gọi API).
- [x] **T006** Tạo `hooks/useDashboardViewModel.ts` (ViewModel) + unit test (mock `integrationStore`).
      ViewModel subscribe store, tự render lại khi `lastToolCall` thay đổi, cleanup trên unmount.
- [x] **T007 (revised)** Tạo View: `DashboardWindow.tsx`, `ToolRow.tsx`, `EmptyState.tsx`,
      `DashboardModule.tsx` (`"use client"`, được expose qua MF) + RTL test cho `DashboardWindow`/
      `ToolRow`/`EmptyState`/`DashboardModule`.
- [x] **T008 (revised)** `app/page.tsx` + `app/layout.tsx` — trang **chạy độc lập** (dev/test riêng
      ở :3002); khi tích hợp Shell nạp `DashboardModule` qua MF, không dùng trang này.
- [x] **T009 (revised)** Xác nhận Shell nạp được remote ở route `/dashboard` — verify bằng dev server
      (2 cổng 3000/3002) VÀ production build (`next build && next start`) qua browser thật:
      remote mount, soft navigation không reload.
- [x] **T010** `npm run lint`/`typecheck`/`test`/`build --workspace=apps/dashboard-module` pass.
- [x] **T011** Thêm `@source "……packages/shared-ui/src"` vào `globals.css` (Tailwind v4 mặc định không
      quét `packages/shared-ui`); Shell thêm `@source` tới `components/` của module này để có CSS cho
      remote (findings §11, §13.8). _(Đã bỏ khi chuyển sang dqcss — không còn `@source` trong `globals.css`.)_

## Còn lại — giai đoạn Thực hiện (đến 21/11/2026)

- [x] **T012** Xử lý các kiểu dữ liệu `parameters`/`result` của `lastToolCall` (FR3/AC3): object →
      key-value (`services/payloadFormatter.ts`), array → key `[i]`, chuỗi JSON object/array được
      parse, Error → thông điệp, còn lại `String(value)`; không throw khi không serialize được.
      _(Chưa làm: rút gọn/thu gọn giá trị dài với nút mở rộng ở FR3 — cần quyết định UI riêng.)_
- [x] **T013** Trạng thái `processing` khi `result === undefined`: `DashboardWindow` hiện "Đang xử lý…",
      `ToolRow` hiện "Đang chờ kết quả…" thay vì `undefined`. Có testcase cho cả hai.
- [x] **T014** Coverage module dashboard (`components/` 100%, `hooks/` 100% statements,
      `services/` ≥97%); toàn repo 94.6% statements khi chạy `npx jest --coverage`.
- [ ] **T015** Integration test Shell ⇄ Dashboard (nạp remote, điều hướng không reload, fallback khi
      remote down, store singleton). _Đã có một phần: `tests/dashboard-chat.integration.test.tsx`
      kiểm chứng Chat ghi `lastToolCall` và Dashboard đọc live qua store chung trong cùng cây React.
      Phần còn lại (MF, điều hướng, fallback) cần trình duyệt thật — dùng chung T016 của Shell scope
      (001 spec T016)._
- [ ] **T016** Kiểm thử NFR thực đo (First Load <3s, điều hướng <300ms, Lighthouse ≥80) — cần môi
      trường deploy thật (sau T013 của Shell scope).
