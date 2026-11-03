# Tasks: Application Shell (001-shell-app)

Nguồn: `plan.md`. `[x]` = đã thực hiện (phiên "D2 Foundation Setup" 03/10/2026 và đợt chuyển sang
Next.js 13.5.11 + Module Federation — xem `docs/findings/R2-module-federation-nextjs-approuter.md`
§13); `[ ]` = còn lại cho giai đoạn Thực hiện (đến 21/11/2026) hoặc chờ phụ thuộc khác.

## Foundation (D2 §7 scope)

- [x] **T001** Scaffold `apps/shell` bằng `create-next-app`, App Router + TS, gắn vào npm workspace.
      _(Hiện ghim Next.js 13.5.11 / React 18.2 — thay cho 15.x ban đầu, T018.)_
- [x] **T002** Đồng bộ `apps/shell/tsconfig.json` kế thừa `tsconfig.base.json` (strict mode).
- [x] **T003** Gỡ ESLint/Prettier config riêng do `create-next-app` sinh ra, dùng chung
      `eslint.config.mjs` + `prettier` ở root.
- [x] **T004 (revised)** Cấu hình **Module Federation host**: `next.config.js` với
      `NextFederationPlugin` (`remotes.chat_module`, `shared`), workaround App Router (bỏ guard
      `appDirEnabled` tạm thời, federation chỉ ở client compiler, alias remote ở compiler
      server/edge) — `plan.md` §2. _(Từng đổi sang Multi-Zones giữa chừng, xem spec §11.)_
- [x] **T005** Tạo `packages/integration-store` (Zustand + `persist` localStorage): `sessionId`,
      `lastToolCall`, `navState` + actions; unit test (gồm rehydrate qua `jest.isolateModules`).
      Cả `apps/shell` và `apps/chat-module` dùng qua npm workspace; chia sẻ singleton qua MF `shared`.
- [x] **T006** Tạo `packages/shared-ui`: `AppHeader.tsx`, `AppNav.tsx` (prop `LinkComponent`, mặc
      định `<a>`), `Card.tsx`, `Layout.tsx`, `Button.tsx` (+ test); `apps/shell/components/Sidebar.tsx`
      (client, sync `usePathname()` vào store, render `AppNav` với `next/link`); layout tổng
      (`app/layout.tsx`).
- [x] **T007 (revised)** `RemoteModuleBoundary` + `RemoteChat` + `chatRemote.ts` (nạp remote bằng
      `next/dynamic` + `ssr: false`) và runtime plugin `mf/errorRemotePlugin.js` (lỗi nạp remote →
      fallback rõ ràng, FR5/AC5) + unit test.
- [x] **T008** Tạo `app/chat/page.tsx` (mount `RemoteChat`) và `app/dashboard/page.tsx` placeholder
      tĩnh ("Dashboard module chưa triển khai — xem specs/003-dashboard-module").
- [x] **T009** `.github/workflows/ci.yml`: checkout → setup-node@20 → `npm ci` → lint → typecheck
      → build (`--workspaces --if-present`) → test (`--coverage`), cho toàn monorepo.
- [x] **T010** Xác nhận `npm run lint`, typecheck (root + từng app), `npm test`, `npm run build
--workspaces --if-present` pass; chạy thật bằng dev server và production build, kiểm tra bằng
      browser: `/chat` nạp remote, soft navigation `/dashboard` → `/chat` không reload, gửi prompt
      ghi `lastToolCall`, tắt remote thì hiện fallback.
- [x] **T011** Ghi nhận toàn bộ quá trình thử/thất bại/thành công Module Federation (rủi ro R2) vào
      `docs/findings/R2-module-federation-nextjs-approuter.md` (§1–12 lần Next 15.5, §13 lần Next
      13.5.11).
- [x] **T012** Sửa Tailwind v4 không quét `packages/shared-ui` (`@source` trong `globals.css`), thêm
      `@source` tới components của chat-module để Shell sinh CSS cho remote. _(Đã bỏ khi chuyển sang dqcss —
      không còn `@source` trong `globals.css`.)_
- [x] **T018 (mới)** Hạ cấp Next.js 15.5 → **13.5.11** (React 19 → 18.2) và ghim phiên bản:
      `webpack` 5.99.9 (root + từng app), `styled-jsx` 5.1.1, `@module-federation/nextjs-mf`
      8.8.76; đổi `next.config.ts`/`postcss.config.mjs` → `.js` (CJS); font Geist → Inter/Roboto
      Mono; regenerate `package-lock.json`.

## Còn lại — chờ giai đoạn Thực hiện / phụ thuộc

- [x] **T013** Deploy `apps/shell` + `apps/chat-module` (+ `apps/dashboard-module`) lên Vercel. Đã xác nhận
      trên https://tessera-shell.vercel.app: Shell nạp `remoteEntry.js` từ `tessera-chat-module.vercel.app`
      và `tessera-dashboard-module.vercel.app` (cross-origin, không lỗi CORS). _(Deploy do chủ đồ án thực hiện.)_
- [x] **T014** Xây `/dashboard` thật, thành remote Module Federation thứ hai
      (`apps/dashboard-module`, :3002). _(Đã mount qua `apps/shell/components/RemoteDashboard.tsx`,
      commit `482e645`; module làm theo `specs/003-dashboard-module/` — T001–T011 đã xong, còn lại xem
      spec 003.)_
- [ ] **T015** Giải quyết/ghi nhận các hạn chế còn lại của MF (plan §7): request thừa
      `/autostatic/...` (404), shared module thiếu `version` (cảnh báo dev), xem xét SSR cho remote
      nếu cần.
- [ ] **T016** Integration test tự động Shell ⇄ remote (nạp remote, điều hướng không reload,
      `lastToolCall` ghi bởi remote **được Shell/Dashboard đọc live** — kiểm chứng store singleton
      thực sự chung 1 instance, fallback khi remote down) — cần Chat module có nội dung thật.
      _(Store singleton đã kiểm chứng thủ công trong browser 2026-11-03; phần integration test tự
      động và live read vẫn còn.)_
- [ ] **T017** Kiểm thử NFR thực đo (First Load <3s, điều hướng <300ms, Lighthouse ≥80) — cần môi
      trường deploy thật (sau T013).
