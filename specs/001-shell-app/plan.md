# Plan: Application Shell (001-shell-app)

- **Nguồn:** `spec.md` (đã Clarify + Checklist §9–10, Amendment §11), `UIT.SE.66-D2-TechStackFoundation`
  §4–7, `UIT.SE.66-D3-ProblemSolutionModel` §3, §4, §5, §7.
- **Trạng thái:** Implemented (foundation).
- **Lịch sử quan trọng:** Bản kế hoạch này ban đầu chọn Module Federation làm cơ chế Integration
  Layer. Sau khi triển khai thật gặp một chuỗi lỗi build-time/runtime không tự khắc phục được (xem
  toàn bộ quá trình, bằng chứng lỗi, phân tích nguyên nhân tại
  `docs/findings/R2-module-federation-nextjs-approuter.md`), đã **pivot sang Next.js Multi-Zones**
  — phương án dự phòng cho rủi ro R2 đã chốt sẵn từ D2 §3/D3 §5. Tài liệu này mô tả kiến trúc
  **sau pivot** (trạng thái implement thật trong repo).

## 1. Kiến trúc tổng quan

Application Shell là **zone chủ** trong mô hình Multi-Zones (Constitution §2, D3 §3 — 3 lớp
Shell/Module/Integration Layer không đổi, chỉ đổi cơ chế Integration Layer nạp module):

```
apps/shell/                      ← Application Shell (zone chủ)
├── next.config.ts                transpilePackages + rewrites() proxy /chat sang zone Chat module
├── app/
│   ├── layout.tsx                RootLayout — AppHeader + Sidebar (packages/shared-ui)
│   ├── page.tsx                  redirect → /chat
│   └── dashboard/page.tsx         placeholder "chưa triển khai" (003 chưa có spec)
└── components/
    └── Sidebar.tsx                "use client", usePathname() + sync navState vào store dùng chung
```

`apps/chat-module/` là **zone thứ cấp** độc lập, tự phục vụ chrome (header/nav) giống hệt Shell để
giữ cảm giác 1 giao diện thống nhất (Next.js Multi-Zones guide: "look the same to the user") — chi
tiết ở `specs/002-chat-module/plan.md`.

## 2. Next.js Multi-Zones — cấu hình routing

- **`apps/shell/next.config.ts`**: `rewrites()` proxy `/chat` và `/chat/:path*` (bắt luôn static
  asset `/chat/_next/...`) sang `${NEXT_PUBLIC_CHAT_MODULE_URL}/chat...` (dev mặc định
  `http://localhost:3001`; production đặt biến môi trường này trỏ domain Vercel thật của
  `chat-module` — T014).
- **`apps/chat-module/next.config.ts`**: `basePath: "/chat"` — Next.js tự động prefix mọi route +
  static asset của app này với `/chat`, khớp đúng đích rewrite phía Shell. Không cần cấu hình
  `assetPrefix` riêng (basePath đã lo phần đó).
- **Điều hướng giữa 2 zone dùng thẻ `<a>` thuần**, không `next/link` — theo đúng khuyến nghị chính
  thức của Next.js Multi-Zones (next/link chỉ soft-navigate đúng trong cùng 1 zone). Nav dùng
  chung (`AppNav` — `packages/shared-ui`) luôn render `<a>`, kể cả cho route trong cùng zone
  (Dashboard) — đơn giản hoá 1 component dùng chung cho mọi zone, đánh đổi mất soft-navigation nội
  bộ Shell (chấp nhận được ở quy mô PoC 1 route/zone).
- **Không còn cần:** `@module-federation/enhanced`, `webpack` devDependency riêng,
  `hooks/useRemoteComponent.ts`, `components/RemoteModuleBoundary.tsx` — đã xoá khỏi codebase khi
  pivot (lịch sử đầy đủ trong findings doc, không lặp lại ở đây).

## 3. Integration Layer — Zustand store dùng chung (persist qua localStorage)

`packages/integration-store/src/integrationStore.ts` (theo D3 §7, spec FR4 amended):

```ts
interface IntegrationState {
  sessionId: string;
  lastToolCall: ToolCall | null;
  navState: { currentRoute: string };
  setLastToolCall: (call: ToolCall) => void;
  setNavState: (route: string) => void;
}
```

- Store sống ở `packages/integration-store` (không phải `apps/shell/`) — giữ đúng vai trò
  "Integration Layer" là một lớp độc lập (D3 §3), không thuộc về Shell hay module nào. Cả
  `apps/shell` và `apps/chat-module` khai báo `@tessera/integration-store` qua npm workspace.
- **Persist qua `localStorage`** (Zustand `persist` middleware, `partialize` chỉ giữ `sessionId`,
  `lastToolCall`, `navState`) — **bắt buộc sau khi pivot Multi-Zones**: mỗi lần băng qua zone là
  một lần nạp lại runtime JS (store in-memory bị reset hoàn toàn), nhưng `localStorage` vẫn dùng
  chung được vì các zone cùng origin trình duyệt (chỉ khác server phía sau proxy). Zone tải sau
  **hydrate** được giá trị gần nhất lúc mount — không còn "live re-render trong khi đang mounted"
  như thiết kế MF ban đầu (xem spec FR4/AC4 amended).
- `noopStorage` guard cho `typeof window === "undefined"` — tránh lỗi khi package này được
  evaluate ở server-side render (Next.js Server Components).
- `lastToolCall`/`navState` cập nhật đồng bộ qua `set()` — last-write-wins (Clarify §9, vẫn đúng
  trong phạm vi 1 zone).

## 4. Component design (MVVM áp dụng ở tầng Shell — D3 §6)

Shell không có "nghiệp vụ" phức tạp (không gọi LLM), MVVM ở đây mỏng: View (`Sidebar`, dùng
`AppHeader`/`AppNav`/`Layout` từ `packages/shared-ui`) — không cần Model/service riêng vì Shell
không gọi API ngoài. `Sidebar.tsx` là ViewModel-glue mỏng: đọc `usePathname()` (chỉ có ý nghĩa
trong phạm vi zone Shell, vì Multi-Zones basePath khiến mỗi zone chỉ thấy pathname nội bộ của
chính nó), sync vào `integrationStore.navState`, truyền `activeHref` xuống `AppNav` (component
thuần, không phụ thuộc Next.js router — dùng lại được ở mọi zone).

## 5. Tech stack cụ thể dùng cho module này

| Nhóm        | Lựa chọn cụ thể                                                                                                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js     | 15.x, App Router                                                                                                                                                                                                                                |
| MFE         | Next.js Multi-Zones (`rewrites()` ở Shell, `basePath` ở Chat module) — đã pivot từ Module Federation, xem `docs/findings/R2-module-federation-nextjs-approuter.md`                                                                              |
| Styling     | TailwindCSS v4 (CSS-first, đồng bộ token với `packages/shared-ui` qua `@source` — bắt buộc để Tailwind quét được class trong package ngoài, xem findings doc §11) + component phong cách shadcn-ui (hand-written, không chạy CLI `shadcn init`) |
| State       | Zustand (+ `persist` middleware, localStorage)                                                                                                                                                                                                  |
| Test        | Jest + React Testing Library, coverage ≥70% (Constitution §3)                                                                                                                                                                                   |
| Lint/Format | ESLint config gốc (`eslint.config.mjs`) + Prettier — không tạo config riêng cho app                                                                                                                                                             |

## 6. Testing strategy

- Unit test: `Sidebar` (mock `next/navigation`, kiểm tra sync vào store + active link),
  `AppHeader`/`AppNav`/`Layout` (`packages/shared-ui`), `integrationStore` (set/get + rehydrate từ
  localStorage qua `jest.isolateModules`, mô phỏng "zone khác nạp lại").
- Manual/browser verification (đã thực hiện): 2 dev server (Shell :3000, Chat module :3001) +
  production build (`next build && next start`) — xác nhận `/`, `/chat`, `/dashboard` render đúng
  chrome, `AppNav` active state đúng, `lastToolCall` persist đúng qua `localStorage` sau khi gửi
  prompt ở `/chat` rồi điều hướng sang `/dashboard`.
- Không unit test cho `next.config.ts` (config, không phải logic nghiệp vụ).

## 7. Ngoài phạm vi lần thực hiện nền tảng này

- Không xây `/dashboard` thật (003 chưa có spec) — chỉ placeholder tĩnh.
- Không deploy Vercel thật trong phiên làm việc này (cần Vercel account của người dùng) — xem
  `tasks.md` mục cuối.
- AC4 (Dashboard tự re-render live khi Chat cập nhật `lastToolCall`) không còn khả thi dưới
  Multi-Zones trong khi 2 trang đang mounted đồng thời — đã ghi nhận là hệ quả kiến trúc chấp nhận
  được, xem spec §11.
