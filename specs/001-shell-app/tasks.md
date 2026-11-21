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
- [x] **T015** Giải quyết/ghi nhận các hạn chế còn lại của MF (plan §7): request thừa
      `/autostatic/...` (404), shared module thiếu `version` (cảnh báo dev), xem xét SSR cho remote
      nếu cần.
      _(Đã sửa, kiểm bằng production build + browser thật (3 app `next start`): (1) `/autostatic/...`
      — nguyên nhân: `nextjs-mf` đổi `output.publicPath` `"/_next/"` → `"auto"` ở client compiler nên
      runtime nối `"auto" + "static/chunks/..."`; Shell đặt lại `"/_next/"` sau khi plugin apply
      (`apps/shell/next.config.js`) → không còn request `autostatic`, remote vẫn nạp, điều hướng mềm
      không reload. (2) Khai báo `version: "18.2.0"` cho `react`/`react/jsx-runtime`/`react-dom` ở cả
      3 app → hết 3 cảnh báo "No version specified" khi build. (3) SSR cho remote: **quyết định không
      làm** — Chat/Dashboard là widget tương tác phía client, nạp `ssr: false` đã đủ; ghi nhận là hạn
      chế có chủ đích (plan §7). Chưa đo lại trên Vercel.)_
- [x] **T016** Integration test tự động Shell ⇄ remote (nạp remote, điều hướng không reload,
      `lastToolCall` ghi bởi remote **được Shell/Dashboard đọc live** — kiểm chứng store singleton
      thực sự chung 1 instance, fallback khi remote down) — cần Chat module có nội dung thật.
      _(Playwright (đã thêm vào Tech Stack — constitution §4) trong `e2e/shell.spec.ts`, chạy trên
      production build của 3 app (`npm run test:e2e`, bước mới trong CI): (1) `/chat` nạp
      `remoteEntry.js` từ :3001 và không có request `autostatic`; (2) `/chat` ⇄ `/dashboard` là
      điều hướng mềm (marker `window` còn nguyên); (3) prompt ở Chat remote → `lastToolCall` hiện ở
      Dashboard remote, prompt thứ hai thay thế giá trị cũ, còn sau reload — chứng minh store chung
      1 instance qua localStorage + Zustand; (4) chặn :3002 → Shell hiện fallback, header/sidebar và
      điều hướng sang `/chat` vẫn chạy. `/api/chat` được mock ở mức trình duyệt (SSE kiểu Groq có
      tool-call) — không gọi Groq thật. Chạy lặp 24/24 pass trên máy phát triển; chưa có kết quả CI
      (job bị khoá do billing).)_
- [x] **T017** Kiểm thử NFR thực đo (First Load <3s, điều hướng <300ms, Lighthouse ≥80) — cần môi
      trường deploy thật (sau T013). Đo lần đầu 2026-11-04 (003 T016), đo lại sau khi sửa
      2026-11-13, và **đo lại toàn bộ 2026-11-21** trên https://tessera-shell.vercel.app (Chromium +
      Lighthouse 13.6.0, máy phát triển tại Việt Nam):

      - **NFR2 điều hướng.** Nguyên nhân thật của "lần đầu 406–421 ms" không phải mạng mà là React
        giữ fallback Suspense tối thiểu ~300 ms của `next/dynamic` (đo được 305 ms cả trên
        localhost, không có request nào lúc click). Đã bỏ `next/dynamic` cho remote (PR #16,
        `useRemoteComponent`). Production sau sửa, đo trong trang từ lúc click tới lúc nội dung
        hiện: có hover trước (remote đã prefetch) ≈ 7–18 ms; không hover (remote chưa nạp), 8 lần:
        157–344 ms, trung vị ≈ 210 ms, 2/8 lần ≥300 ms (344, 300) vì phải tải `remoteEntry.js`.
        E2E `e2e/shell.spec.ts` khoá ngưỡng <300 ms cho trường hợp đã prefetch.
      - **NFR1/NFR3 đo lại 2026-11-21** (Lighthouse 13.6.0, Chromium, mobile mô phỏng mặc định, 3
        lần/trang — mạng 1.6 Mbps / 150 ms RTT / CPU 4×): `/chat` Performance **78 / 78 / 70**, LCP
        **4,54 / 4,32 / 4,74 s**, FCP 1,45 / 1,23 / 1,54 s, TBT 222 / 323 / 421 ms, CLS 0;
        `/dashboard` **94 / 93 / 86**, LCP **1,11 / 0,90 / 0,92 s**, TBT 254 / 308 / 560 ms, CLS 0.
        → **NFR1 (<3 s) và NFR3 (≥80) đạt trên `/dashboard`, KHÔNG đạt trên `/chat`.**
      - **Nguyên nhân `/chat` chậm (đã xác định).** Phần tử LCP của `/chat` là khối empty-state của
        remote Chat ("Chưa có tin nhắn — nhập prompt bên dưới để bắt đầu.", 104×619 px); của
        `/dashboard` lại là chính câu fallback của Shell ("Đang tải Dashboard module…", vẽ ~0,5 s) nên
        số đẹp. Chuỗi tải của remote: `remoteEntry.js` 108 KB transfer / 406 KB parse, priority
        **Low**, chỉ bắt đầu ~1,6–2,0 s (sau khi Shell parse xong framework + webpack), xong 2,2–3,2 s;
        chunk `__federation_expose_ChatModule` 2,3–3,6 s; React mount xong → nội dung vẽ ở 4,1–4,7 s.
      - **Số 0,8–0,9 s ghi ngày 2026-11-13 không tái lập được**: 6 lần đo hôm nay đều ≥4,1 s cho
        `/chat`, còn `/dashboard` vẫn khớp 0,9–1,1 s. Vậy con số đúng là bản 2026-11-04 (LCP 4,0 s,
        mobile 87); bản "100 / 0,8 s" là đo sai (khả năng cao do cache remote đã ấm). Hết tồn tại
        "chênh lệch chưa rõ nguyên nhân".
      - **Hướng sửa (cần quyết định).** (1) `preconnect` tới `tessera-chat-module.vercel.app` và nạp
        sớm `remoteEntry.js` ngay khi HTML về (preload từ `<head>` / script inline) thay vì đợi Shell
        parse xong JS — ước tính bớt ~1,5–1,8 s, LCP về ~2,5–3 s. (2) Giảm bundle `remoteEntry.js`
        hoặc tách phần UI tĩnh của Chat để Shell SSR. (3) Không dùng cách "skeleton to hơn nội dung
        thật": LCP lấy mốc lớn nhất cuối cùng, skeleton chỉ thắng nếu lớn hơn khối nội dung cuối.
      - **Lưu ý cache.** `remoteEntry.js` luôn được tải kèm `?t=<timestamp>` nên trình duyệt không giữ bản cũ dù
        Vercel gắn `Cache-Control: immutable`; cấu hình `headers()` trong `next.config.js` và
        `vercel.json` đều không đổi được header này trên Vercel (đã thử trên preview).
