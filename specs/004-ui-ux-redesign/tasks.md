# Tasks: UI/UX Redesign & Presentation Features (004-ui-ux-redesign)

Nguồn: `plan.md`. `[x]` = đã thực hiện và kiểm bằng test/lint/typecheck.

## A. Nền tảng dùng chung

- [x] **T001** Viết lại `packages/shared-ui/src/theme.css`: ghi đè token dqcss (radius 6px, viền
      1px, bỏ bóng cứng, palette trung tính + vermilion, dark than dịu) + bộ class `ts-*` cho
      shell/chat/dashboard/overview/settings/palette. Không gradient, không `backdrop-filter`,
      không dot-grid.
- [x] **T001b** Hai hệ chữ qua `next/font`: `Be_Vietnam_Pro` (display + UI) / `Roboto_Mono` (dữ
      liệu), subset `vietnamese`, khai báo ở cả 3 `app/layout.tsx` **trên `<html>`**.
- [x] **T001c** Status bar thành dải mực (`--ts-status-bg/fg/muted/signal`), tool gần nhất là tín
      hiệu vermilion, số tool call có `aria-live`.
- [x] **T002** `i18n.ts`: dictionary EN (nguồn kiểu) + VI, `translate` có interpolation, `useT`,
      `useLocale` (tránh hydration mismatch).
- [x] **T003** `theme.ts` + `ThemeScript` + `ThemeToggle`: lưu `localStorage`, đặt `data-theme` trước
      hydrate.
- [x] **T004** `Icon.tsx` (SVG nội tuyến), `Badge.tsx`, `useCopy.ts` (clipboard + fallback).
- [x] **T005** `AppHeader` cho trang độc lập, `AppNav` (icon + mô tả, `aria-current`),
      `SidebarPanel` (nav + nút thu gọn rail), `Layout` (`100dvh`, rail thu gọn qua context),
      `sidebarState.tsx`, `Card` → `ts-card`.
- [x] **T006** Export toàn bộ API mới trong `packages/shared-ui/src/index.ts`; thêm dependency
      `@tessera/integration-store` cho shared-ui.

## B. Integration Layer

- [x] **T007** Mở rộng `types.ts`: `ToolCall.durationMs`, `ToolCall.status`, `Locale`,
      `ToolCallStatus`.
- [x] **T008** `integrationStore.ts`: `toolCallHistory` (cap 50, khử trùng id), `locale`,
      `appendToolCall`, `clearToolCallHistory`, `setLocale`; persist có chọn lọc (bỏ `navState`).
- [x] **T009** Test cho lịch sử/locale (`history.test.ts`), giữ test persist cũ xanh.

## C. Shell

- [x] **T010** `ShellHeader`: top bar 3 ô — ô tìm kiếm ở giữa mở palette, nút Cài đặt bên phải,
      hamburger bên trái (chỉ ≤900 px); không brand/breadcrumb/toggle; Ctrl/Cmd+K.
- [x] **T011** `CommandPalette`: dialog, lọc, ↑/↓/Enter/Escape, click overlay đóng.
- [x] **T012** `Sidebar`: 3 mục (Chat/Dashboard/Kiến trúc), bỏ panel phiên/tool call, giữ prefetch
      remote Dashboard; thu gọn rail 72 px nhớ trạng thái; ≤900 px là drawer (mở bằng hamburger,
      đóng bằng scrim/Escape/đổi route).
- [x] **T012b** `app/settings/page.tsx`: theme, ngôn ngữ, thông tin phiên; `aria-pressed`; test
      chuyển theme/ngôn ngữ.
- [x] **T013** `StatusBar`: route, session, số tool call, tool gần nhất, stack; cập nhật live.
- [x] **T014** `RemoteErrorFallback` + `ModuleLoading`: fallback/loading theo giao diện mới, song ngữ.
- [x] **T015** `app/overview/page.tsx`: một stack tuần tự 4 lớp (`.ts-stack`, hàng host mang tín
      hiệu), dải 4 bước (`.ts-flow`), danh sách quyết định (`.ts-decisions`) — thay hai lưới thẻ.
- [x] **T016** `app/layout.tsx`: Layout + ThemeScript + chrome mới.

## D. Chat module

- [x] **T017** `services/markdown.ts` + `components/MarkdownText.tsx`: parser an toàn, không
      `dangerouslySetInnerHTML`, chặn scheme link lạ.
- [x] **T018** `ChatWindow`: trạng thái rỗng + 4 gợi ý, auto-scroll, cursor stream.
- [x] **T019** `MessageBubble`: avatar, meta (giờ/thời gian xử lý/badge tool), markdown, tool card,
      copy/regenerate/retry.
- [x] **T019b** `ToolResultCard` + `describeToolResult`: kết quả tool đọc được ngay trong transcript
      (thời tiết/danh sách/JSON), câu trả lời không còn "xem Dashboard".
- [x] **T020** `PromptInput`: textarea auto-grow, Enter gửi / Shift+Enter xuống dòng, nút dừng, đếm
      ký tự.
- [x] **T021** `useChatViewModel`: `streamingId`, `stop` (AbortController), `regenerate`, `retry`,
      đo `durationMs`, ghi `status` vào store.
- [x] **T022** `ChatModule`: chrome module + badge model.
- [x] **T023** Test: markdown parser/render, MessageBubble actions, ChatWindow suggestions,
      PromptInput Enter/stop, ViewModel stop/regenerate/retry.

## E. Dashboard module

- [x] **T024** `services/metrics.ts`: KPI, filter/search, `safeStringify`, `toolCallToJson`.
- [x] **T025** `hooks/useDashboardViewModel.ts`: subscribe store, selection, filter, query, clear,
      fallback khi chỉ có `lastToolCall`.
- [x] **T026** `DashboardWindow`: KPI band có thứ bậc (`.ts-kpi--hero` + `.ts-kpi-strip`), toolbar
      (search + segmented filter), grid timeline/detail; nút xoá cần bước xác nhận tại chỗ (4 s).
- [x] **T027** `ToolTimeline`, `ToolRow` (metadata + copy JSON + payload thu gọn), `EmptyState` mới.
- [x] **T028** Test: metrics, ToolTimeline, DashboardWindow (KPI/filter/select/clear), ToolRow cũ
      vẫn xanh.

## F. Kiểm chứng

- [x] **T029** `npm run lint` — 0 error/warning.
- [x] **T030** `npm run typecheck` (`tsc --build --force`) — pass.
- [x] **T031** `npx jest --coverage` — 242 test pass, coverage toàn repo ~96% statements.
- [x] **T032** `npm run format` — pass (Prettier toàn repo).
- [x] **T033** Cập nhật spec 001/002/003 tham chiếu 004 (Inclusions + FR/AC liên quan).
- [x] **T034** Kiểm giao diện trên trình duyệt thật (dev servers 3000/3001/3002): light/dark, VI/EN,
      palette, Chat + Dashboard live, `/overview`, responsive.

## H. Vòng sửa sau critique (2026-11-21)

Nguồn: `.impeccable/critique/2026-11-21T10-27-28Z__apps-shell.md` (23/40). Phạm vi người dùng chọn:
3 lỗi P1.

- [x] **T037** Transcript sống sót qua điều hướng: `chatTranscript` trong Integration Layer
      (debounce + flush, cap 200), khôi phục khi mount, nút "Cuộc trò chuyện mới"; test store +
      ViewModel + ChatModule + integration.
- [x] **T038** Hết rò rỉ tiếng Anh: `dash.title` → "Lượt gọi tool", hậu tố "· lỗi", hint overview,
      subtitle Chat; `aria-label` bộ lọc; icon cảnh báo thay "×"; test chặn từ tiếng Anh trong
      dictionary VI.
- [x] **T039** Sàn tương phản & cỡ chữ: muted `#52607a` (≥5.5:1 trên mọi surface light), mọi
      micro-text 12 px; detector trình duyệt 1440×900 giảm 6/7/14 → 1/2/5, mobile 390×844
      1/2/7.
- [x] **T040** Polish: bỏ keyline 3 px trên card kiến trúc (craft-floor), thêm
      `suppressHydrationWarning` cho theme boot script, cập nhật DESIGN.md + sidecar.

## G. Việc tiếp theo (không thuộc phạm vi đã làm)

- [ ] **T035** Quay video demo + ảnh chụp cho slide báo cáo (dùng các trạng thái ở T034).
- [ ] **T036** Đo lại Lighthouse sau khi đổi giao diện để cập nhật bảng NFR của 001 T017.
