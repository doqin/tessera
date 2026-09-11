# Tasks: Application Shell (001-shell-app)

Nguồn: `plan.md`. `[x]` = đã thực hiện trong phiên "D2 Foundation Setup" (03/10/2026 milestone,
bao gồm cả pivot Multi-Zones giữa phiên — xem `docs/findings/R2-module-federation-nextjs-approuter.md`);
`[ ]` = còn lại cho giai đoạn Thực hiện (đến 21/11/2026) hoặc chờ phụ thuộc khác (VD:
`specs/003-dashboard-module/spec.md`).

## Foundation (D2 §7 scope — thực hiện lần này)

- [x] **T001** Scaffold `apps/shell` bằng `create-next-app` trên Next.js 15.x, App Router + TS,
      gắn vào npm workspace gốc.
- [x] **T002** Đồng bộ `apps/shell/tsconfig.json` kế thừa `tsconfig.base.json` (strict mode).
- [x] **T003** Gỡ ESLint/Prettier config riêng do `create-next-app` sinh ra, dùng chung
      `eslint.config.mjs` + `prettier` ở root.
- [x] **T004 (revised)** ~~Cấu hình Module Federation host~~ → Sau khi Module Federation thất bại
      ở runtime (xem findings doc), cấu hình **Next.js Multi-Zones**: `rewrites()` proxy `/chat` +
      `/chat/:path*` sang `apps/chat-module` (dev: `http://localhost:3001`).
- [x] **T005** Tạo `packages/integration-store` (Zustand + `persist` localStorage): `sessionId`,
      `lastToolCall`, `navState` + actions; unit test (bao gồm test rehydrate qua
      `jest.isolateModules`, mô phỏng zone khác nạp lại). Cả `apps/shell` và `apps/chat-module`
      dùng qua npm workspace.
- [x] **T006** Tạo `packages/shared-ui`: `AppHeader.tsx`, `AppNav.tsx` (dùng `<a>` thuần — cross-
      zone safe) dùng chung cho mọi zone; `apps/shell/components/Sidebar.tsx` (client, sync
      `usePathname()` vào store, render `AppNav`); layout tổng (`app/layout.tsx`) dùng
      `packages/shared-ui`'s `Layout`.
- [x] **T007 (revised)** ~~RemoteModuleBoundary + useRemoteComponent (Module Federation)~~ → Đã xoá
      sau pivot (không còn client-side remote loading — Multi-Zones dùng server-side proxy
      `rewrites()`, lỗi được xử lý ở tầng HTTP/proxy chuẩn của Next.js).
- [x] **T008** Tạo `app/dashboard/page.tsx` placeholder tĩnh ("Dashboard module chưa triển khai —
      xem specs/003-dashboard-module").
- [x] **T009** Thêm `packages/shared-ui`: `Card.tsx`, `Layout.tsx` (+ test), theo pattern
      `Button.tsx` hiện có.
- [x] **T010** `.github/workflows/ci.yml`: checkout → setup-node@20 → `npm ci` → lint → typecheck
      → build (`--workspaces --if-present`) → test (`--coverage`), áp dụng cho toàn monorepo.
- [x] **T011** Xác nhận `npm run lint`, `npm run typecheck` (root + từng app), `npm test
--workspaces --if-present` (qua root `npm test`, roots bao trùm cả `apps/`), `npm run build
--workspaces --if-present` pass. Đồng thời chạy thật bằng dev server + production build
      (`next start`), kiểm tra bằng Browser tool: `/`, `/chat`, `/dashboard` render đúng, không
      lỗi console, chrome (header/nav) nhất quán giữa 2 zone.
- [x] **T012 (revised)** Ghi nhận lý do pivot từ `@module-federation/nextjs-mf` →
      `@module-federation/enhanced` → **Next.js Multi-Zones** vào
      `docs/findings/R2-module-federation-nextjs-approuter.md` (thay vì chỉ ghi version MF cuối
      cùng như dự kiến ban đầu — D2 §7 checklist item cuối, nay đã trở thành case study R2 đầy đủ).
- [x] **T013 (mới, phát sinh lúc pivot)** Sửa lỗi Tailwind v4 không quét `packages/shared-ui`
      (`@source` trong `globals.css` của cả 2 app) — phát hiện qua kiểm tra bằng mắt trên
      `/dashboard`, xem findings doc §11.

## Còn lại — chờ giai đoạn Thực hiện / phụ thuộc

- [ ] **T014** Deploy `apps/shell` + `apps/chat-module` lên Vercel (cần tài khoản Vercel của chủ
      đồ án — Agent không có quyền thực hiện). Sau khi có domain thật, đặt
      `NEXT_PUBLIC_CHAT_MODULE_URL` ở Vercel project settings của `shell` trỏ domain thật của
      `chat-module` (thay vì `http://localhost:3001`).
- [ ] **T015** Xây `/dashboard` thật, thành 1 zone Multi-Zones riêng (`apps/dashboard-module`) —
      chờ `specs/003-dashboard-module/spec.md` + `plan.md` + `tasks.md`.
- [ ] **T016** Integration test đầy đủ luồng Shell ⇄ Chat module (điều hướng, `lastToolCall`
      persist đúng qua `localStorage` sau hard navigation) — cần Chat module có nội dung thật (002
      T-level sau).
- [ ] **T017** Kiểm thử NFR thực đo (First Load <3s cho từng zone, Lighthouse ≥80) — cần môi
      trường deploy thật (sau T014). Ngưỡng <300ms chỉ áp dụng điều hướng trong cùng 1 zone (NFR2
      amended, spec §11).
