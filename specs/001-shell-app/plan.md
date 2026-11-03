# Plan: Application Shell (001-shell-app)

- **Nguồn:** `spec.md` (đã Clarify + Checklist §9–10, Lịch sử quyết định §11),
  `UIT.SE.66-D2-TechStackFoundation` §4–7, `UIT.SE.66-D3-ProblemSolutionModel` §3, §4, §5, §7.
- **Trạng thái:** Implemented (foundation).
- **Lịch sử quan trọng:** Module Federation (kế hoạch gốc) thất bại trên Next.js 15.5 → tạm dùng
  Next.js Multi-Zones → thử lại và chạy được trên Next.js 13.5.11 → **kiến trúc hiện tại là Module
  Federation trên Next.js 13.5.11**. Tài liệu này mô tả kiến trúc hiện tại; toàn bộ bằng chứng,
  workaround và hạn chế: `docs/findings/R2-module-federation-nextjs-approuter.md` (§13).

## 1. Kiến trúc tổng quan

Application Shell là **host Module Federation** (Constitution §2, D3 §3 — 3 lớp Shell/Module/
Integration Layer):

```
apps/shell/                      ← Application Shell (host, :3000)
├── next.config.js                NextFederationPlugin (remotes + shared) + workaround App Router
├── mf/errorRemotePlugin.js       runtime plugin: lỗi nạp remote → component ném lỗi cho boundary
├── types/remotes.d.ts            khai báo kiểu cho module remote `chat_module/ChatModule`
├── app/
│   ├── layout.tsx                RootLayout — AppHeader + Sidebar (packages/shared-ui)
│   ├── page.tsx                  redirect → /chat
│   ├── chat/page.tsx             mount <RemoteChat /> vào vùng nội dung
│   └── dashboard/page.tsx        mount <RemoteDashboard /> (remote 003, xem specs/003-dashboard-module)
└── components/
    ├── Sidebar.tsx               "use client", usePathname() + sync navState; AppNav + next/link
    ├── RemoteChat.tsx            next/dynamic(loadChatRemote, { ssr: false }) trong boundary
    ├── chatRemote.ts             điểm nạp duy nhất `import("chat_module/ChatModule")`
    └── RemoteModuleBoundary.tsx  error boundary + fallback (FR5/AC5)
```

`apps/chat-module/` là **remote**, chi tiết ở `specs/002-chat-module/plan.md`. Shell không import
code của remote lúc build — chỉ biết tên module (`chat_module/ChatModule`) và URL `remoteEntry.js`.

## 2. Module Federation — cấu hình host

Nền tảng: Next.js **13.5.11** (App Router), React 18.2, `@module-federation/nextjs-mf` 8.8.76,
`webpack` 5.99.9 (ghim ở root + từng app), `styled-jsx` 5.1.1. Ràng buộc phiên bản và lý do
(`webpack@5.112` xoá `extractUrlAndGlobal`; Next 15.x chưa build được với MF): findings §13.

`apps/shell/next.config.js`:

- Đặt `process.env.NEXT_PRIVATE_LOCAL_WEBPACK = "true"` ở đầu file (nextjs-mf bắt buộc dùng webpack
  cài local).
- `remotes.chat_module = chat_module@${NEXT_PUBLIC_CHAT_MODULE_URL}/_next/static/chunks/remoteEntry.js`
  (mặc định `http://localhost:3001`; **đọc lúc build** nên production phải đặt biến này trước khi
  build Shell — T013).
- **Chỉ federation ở client compiler.** Compiler server/edge vẫn parse `import("chat_module/...")`
  nên được alias về module rỗng (`resolve.alias[...] = false`).
- **Bỏ guard App Router của nextjs-mf:** đặt `BuildManifestPlugin.appDirEnabled = false` chỉ trong
  lúc plugin validate rồi đặt lại `true` bằng một plugin nhỏ push ngay sau (cờ này Next dùng để sinh
  `rootMainFiles`; để `false` vĩnh viễn làm build lỗi "missing bootstrap script").
- **`shared`:** `react`, `react/jsx-runtime`, `react-dom` trỏ vào bản **vendored của Next**
  (`next/dist/compiled/...`, singleton, eager) — chia sẻ React npm làm hỏng runtime App Router;
  cùng `@tessera/integration-store` và `zustand` (singleton) cho Integration Layer.
- `runtimePlugins: [mf/errorRemotePlugin.js]` — mặc định nextjs-mf nuốt lỗi nạp remote (render
  `null`); plugin này trả về component ném lỗi để boundary hiện fallback.
- `transpilePackages: ["@tessera/shared-ui", "@tessera/integration-store"]`,
  `eslint.ignoreDuringBuilds` (lint chạy ở bước CI riêng; môi trường build Vercel không luôn có
  eslint).

**Nạp remote ở client:** `RemoteChat` dùng `next/dynamic(loadChatRemote, { ssr: false })`; `loading`
ném lại `error` (next/dynamic báo lỗi qua prop thay vì throw) để `RemoteModuleBoundary` bắt được.
`RemoteModuleBoundary` hiển thị tên module + thông điệp lỗi + nút "Tải lại trang" (reload thật vì
next/dynamic ghi nhớ kết quả lỗi trong phiên, reset state boundary là không đủ).

**Điều hướng:** `AppNav` (`packages/shared-ui`) nhận prop `LinkComponent` (mặc định `<a>`); Sidebar
truyền `next/link` → soft navigation giữa `/chat` và `/dashboard`, không reload (FR2/FR3).

**CSS của remote:** Shell import `@doqin/dqcss` và `packages/shared-ui/src/theme.css` toàn cục trong
`apps/shell/app/globals.css`, nên class `.dq-*` mà component của remote dùng đã có sẵn trong trang.
Không cần cấu hình `@source` (đã bỏ khi chuyển từ Tailwind sang dqcss).

## 3. Integration Layer — Zustand store dùng chung

`packages/integration-store/src/integrationStore.ts` (D3 §7):

```ts
interface IntegrationState {
  sessionId: string;
  lastToolCall: ToolCall | null;
  navState: { currentRoute: string };
  setLastToolCall: (call: ToolCall) => void;
  setNavState: (route: string) => void;
}
```

- Store sống ở `packages/integration-store` (không thuộc Shell hay module nào — D3 §3). `apps/shell`
  và `apps/chat-module` khai báo `@tessera/integration-store` qua npm workspace; Module Federation
  `shared` (singleton) để Shell và remote dùng chung **một instance** lúc chạy.
- **Persist qua `localStorage`** (Zustand `persist`, `partialize` giữ `sessionId`, `lastToolCall`,
  `navState`): giữ trạng thái khi tải lại trang và khi remote chạy độc lập. Đây là giữ nguyên từ
  giai đoạn Multi-Zones (khi đó bắt buộc); dưới MF không còn bắt buộc nhưng vô hại và hữu ích.
- `noopStorage` guard cho `typeof window === "undefined"` (evaluate ở server-side render).
- Cập nhật đồng bộ qua `set()` — last-write-wins (Clarify §9).
- **Đã kiểm chứng (browser, 2026-11-03):** Shell và remote thực sự dùng chung 1 instance store —
  `window.__FEDERATION__.__INSTANCES__` có 2 instance (`shell`, `chat_module`) cùng trỏ một
  `shareScopeMap.default`, chỉ có một entry `@tessera/integration-store@0.1.0` (`from: "shell"`,
  `loaded: true`); `navState` do Shell ghi và `lastToolCall` do remote ghi cùng nằm trong một store
  state.
  **Chưa kiểm chứng:** re-render live khi một component khác đọc `lastToolCall` — Shell hiện không
  có component nào đọc `lastToolCall`; cần Dashboard hoặc integration test (T016).

## 4. Component design (MVVM áp dụng ở tầng Shell — D3 §6)

Shell không có nghiệp vụ phức tạp (không gọi LLM) nên MVVM mỏng: View (`Sidebar`, `RemoteChat`,
`RemoteModuleBoundary`, dùng `AppHeader`/`AppNav`/`Layout`/`Card` từ `packages/shared-ui`); không có
Model/service riêng. `Sidebar.tsx` là ViewModel-glue: đọc `usePathname()`, sync vào
`integrationStore.navState`, truyền `activeHref` xuống `AppNav` (component thuần).

## 5. Tech stack cụ thể dùng cho module này

| Nhóm        | Lựa chọn cụ thể                                                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js     | **13.5.11**, App Router; React 18.2; `next.config.js` (CJS)                                                                                                                             |
| MFE         | Module Federation: `@module-federation/nextjs-mf` 8.8.76 + `webpack` 5.99.9; dự phòng Multi-Zones (xem §11 của spec)                                                                    |
| Styling     | `@doqin/dqcss` (import toàn cục trong `globals.css`) + theme Groq trong `packages/shared-ui`; font `Inter`/`Roboto_Mono` (Geist không có ở 13.5)                                       |
| State       | Zustand (+ `persist` middleware, localStorage)                                                                                                                                          |
| Test        | Jest + React Testing Library, coverage ≥70% (Constitution §3)                                                                                                                           |
| Lint/Format | ESLint config gốc (`eslint.config.mjs`) + Prettier — không tạo config riêng cho app                                                                                                     |

## 6. Testing strategy

- Unit test: `Sidebar` (mock `next/navigation`, sync store + active link), `RemoteModuleBoundary`
  (render/fallback/nút tải lại), `RemoteChat` (mock `chatRemote`: thành công và lỗi, tách 2 file test
  vì next/dynamic memoize kết quả theo module), `errorRemotePlugin`, `AppHeader`/`AppNav`/`Layout`
  (`packages/shared-ui`), `integrationStore` (set/get + rehydrate qua `jest.isolateModules`).
- Không unit test `next.config.js`/`chatRemote.ts` (config / glue không resolve được trong jsdom).
- Kiểm chứng browser (đã thực hiện, cả `next dev` và `next build && next start`, 2 server :3000 +
  :3001): `/chat` nạp remote thành công; `/dashboard` → `/chat` soft navigation (không reload); gửi
  prompt qua remote ghi `lastToolCall` vào store + `localStorage`; tắt server remote thì Shell hiện
  fallback đúng FR5/AC5.

## 7. Hạn chế đã biết

- Remote **chỉ render phía client** (không SSR cho nội dung remote).
- Request thừa tới URL sai `/autostatic/chunks/...` (404) do federation runtime — trang vẫn hoạt
  động (findings §13.4); cảnh báo build vô hại: `Failed to patch lockfile ... 'os'` (Next 13.5 với
  lockfile npm 11), `Skipped not serializable cache item` (module federation không vào cache bền
  của webpack → build chậm hơn), log `.next/ssr does not exist`.
- Cấu hình dựa vào chi tiết nội bộ của nextjs-mf/Next.js (cờ `appDirEnabled`, React vendored) →
  mong manh khi nâng phiên bản; phải build + kiểm browser sau mỗi lần nâng.
- Ổ exFAT không chạy được `npm install` (cần symlink/junction cho npm workspaces).

## 8. Ngoài phạm vi lần thực hiện nền tảng này

- `/dashboard` là remote riêng (`apps/dashboard-module`) — chi tiết ở `specs/003-dashboard-module/`.
- Không deploy Vercel thật (cần tài khoản của chủ đồ án) — xem `tasks.md` T013.
- Chưa có integration test tự động Shell ⇄ remote và chưa đo NFR1/NFR3 (T016, T017).
