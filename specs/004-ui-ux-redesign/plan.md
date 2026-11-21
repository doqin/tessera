# Plan: UI/UX Redesign & Presentation Features (004-ui-ux-redesign)

- **Nguồn:** `spec.md` (§1–§9), `specs/001-shell-app/plan.md`, `specs/002-chat-module/plan.md`,
  `specs/003-dashboard-module/plan.md`, `.specify/constitution.md`.
- **Trạng thái:** Implemented.
- **Nguyên tắc:** không thêm dependency, không đổi ranh giới 3 lớp, mọi thay đổi UI đi qua
  `packages/shared-ui`; state liên module chỉ qua `@tessera/integration-store`.

## 1. Lớp giao diện (design system)

dqcss vẫn là base library. `packages/shared-ui/src/theme.css` làm 2 việc:

1. **Ghi đè token dqcss** để đổi "BIOS screen" thành UI sản phẩm:
   - `--dq-radius: 6px`, `--dq-border-width: 1px`, `--dq-shadow-offset: 0` (bỏ bóng cứng).
   - palette "instrument": nền trung tính `#f6f7f8`, surface `#ffffff`, mực `#14161a`, vermilion
     `#b4371c` làm primary; dark theme than `#17181b` / `#1e1f23` / `#e28663` với thân chữ ~11:1
     (dịu hơn đen tuyền). Bảng đầy đủ trong `:root[data-theme="dark"]`; tương phản kiểm trên mọi
     surface (NFR7).
   - hai hệ chữ qua `next/font`: Be Vietnam Pro (`--font-app-sans`, dùng cho display + UI), Roboto
     Mono (`--font-app-mono`, chỉ dữ liệu/ID/route). Font variable đặt trên `<html>` để
     `--dq-font-base` ở `:root` resolve được (nếu đặt trên `<body>` sẽ fallback Times New Roman).
   - không gradient, không `backdrop-filter`, không dot-grid: hierarchy bằng surface tone + hairline.
2. **Thêm class `ts-*`** cho phần dqcss không có: `.ts-app` (cao `100dvh`), `.ts-topbar`,
   `.ts-search`, `.ts-sidebar*` (kể cả rail thu gọn 72 px), `.ts-main`, `.ts-statusbar`,
   `.ts-card`, `.ts-chat*`, `.ts-msg*`, `.ts-toolcard*`, `.ts-md`, `.ts-kpi*`, `.ts-timeline*`,
   `.ts-toolbar`, `.ts-detail`, `.ts-stack*`, `.ts-flow*`, `.ts-decisions*`, `.ts-settings`,
   `.ts-setting`, `.ts-choice`, `.ts-meta`, `.ts-overlay`, `.ts-palette*`, `.ts-seg`, `.ts-badge`,
   `.ts-kbd`, `.ts-menu-btn`, `.ts-scrim`. Dưới 900 px top bar là `auto · 1fr · auto` và sidebar là
   drawer (`.ts-sidebar--mobile-open`).

Status bar là **dải mực** (`--ts-status-bg` = ink ở cả hai theme) và là neo nhận diện: route,
session, số tool call, tool gần nhất (tín hiệu vermilion), stack. Top bar chỉ có ô tìm kiếm ở giữa
(mở palette) và nút Cài đặt bên phải; theme + ngôn ngữ chuyển về `/settings`.

`.dq-*` vẫn dùng được cho control cơ bản (`.dq-btn`, `.dq-input`) nhưng đã được "mềm hoá" bằng override.

## 2. i18n (VI/EN)

- `packages/shared-ui/src/i18n.ts`: dictionary phẳng `en` (nguồn kiểu) + `vi` (đủ key, TypeScript
  bắt thiếu key), `translate(locale, key, vars)` thay `{name}`, hook `useT()`/`useLocale()`.
- `locale: "vi" | "en"` nằm trong **Integration Layer** để remote đọc được (React context không qua
  ranh giới MFE). Mặc định `vi`.
- `useLocale()` trả `"vi"` ở lần render đầu (khớp HTML server) rồi mới áp giá trị trong store sau khi
  mount → không hydration mismatch.

## 3. Theme

- `packages/shared-ui/src/theme.ts`: `readStoredTheme`, `applyTheme`, `toggleTheme`,
  `THEME_BOOT_SCRIPT`.
- `ThemeScript` nhúng script trong `<head>` của cả 3 app → `data-theme` được đặt trước hydrate.
- `ThemeToggle` + `LocaleToggle` dùng trong `/settings`; bảng lệnh vẫn có action đổi theme/ngôn ngữ.

## 4. Thành phần theo app

### packages/shared-ui

| File                                                     | Vai trò                                  |
| -------------------------------------------------------- | ---------------------------------------- |
| `theme.css`                                              | token override + `ts-*`                  |
| `i18n.ts`, `theme.ts`                                    | chuỗi + theme thuần (test được)          |
| `Icon.tsx`                                               | icon SVG nội tuyến (không thư viện)      |
| `AppHeader.tsx`                                          | header cho trang độc lập của remote      |
| `AppNav.tsx`                                             | nav có icon + mô tả, `aria-current`      |
| `SidebarPanel.tsx`                                       | nav + nút thu gọn rail (state ở context) |
| `Layout.tsx`                                             | `100dvh`, rail thu gọn, main cuộn        |
| `sidebarState.tsx`                                       | context + localStorage cho rail          |
| `Badge.tsx`                                              | nhãn trạng thái                          |
| `ThemeToggle.tsx`, `LocaleToggle.tsx`, `ThemeScript.tsx` | control hệ thống                         |
| `useCopy.ts`                                             | clipboard + fallback `execCommand`       |
| `Card.tsx`, `Button.tsx`                                 | giữ API cũ, đổi sang `ts-card`           |

### apps/shell

| File                                 | Vai trò                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| `components/ShellHeader.tsx`         | top bar: ô tìm kiếm giữa + nút Cài đặt                  |
| `components/CommandPalette.tsx`      | dialog Ctrl/Cmd+K, filter + phím mũi tên                |
| `components/Sidebar.tsx`             | 3 mục nav + prefetch remote Dashboard (không panel phụ) |
| `app/settings/page.tsx`              | theme, ngôn ngữ, thông tin phiên                        |
| `components/StatusBar.tsx`           | route, session, số tool call, tool gần nhất, stack      |
| `components/RemoteErrorFallback.tsx` | fallback 001 AC5 với giao diện mới                      |
| `app/overview/page.tsx`              | trang kiến trúc (song ngữ)                              |
| `app/layout.tsx`                     | Layout + ThemeScript + chrome                           |

### apps/chat-module

| File                            | Vai trò                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `services/markdown.ts`          | parser Markdown tối giản → dữ liệu (không innerHTML)          |
| `components/MarkdownText.tsx`   | render block/inline thành React element, chặn scheme lạ       |
| `components/ChatWindow.tsx`     | trạng thái rỗng + gợi ý, auto-scroll, cursor stream           |
| `components/MessageBubble.tsx`  | avatar, meta, markdown, tool card, copy/regenerate/retry      |
| `components/ToolResultCard.tsx` | kết quả tool đọc được ngay trong transcript                   |
| `components/PromptInput.tsx`    | textarea auto-grow, Enter/Shift+Enter, stop, đếm ký tự        |
| `components/ChatModule.tsx`     | chrome của module (model badge)                               |
| `hooks/useChatViewModel.ts`     | `streamingId`, `stop`, `regenerate`, `retry`, đo `durationMs` |

### apps/dashboard-module

| File                             | Vai trò                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| `services/metrics.ts`            | KPI, filter/search, JSON an toàn (`toolCallToJson`)                 |
| `components/DashboardWindow.tsx` | KPI hero + readout, toolbar, timeline, panel chi tiết, xác nhận xoá |
| `components/ToolTimeline.tsx`    | dòng thời gian, dot trạng thái, chọn item                           |
| `components/ToolRow.tsx`         | metadata + payload có thu gọn/mở rộng + copy JSON                   |
| `components/EmptyState.tsx`      | trạng thái rỗng + CTA sang Chat                                     |
| `hooks/useDashboardViewModel.ts` | subscribe store, selection/filter/query, clear                      |

### packages/integration-store

- `ToolCall` thêm `durationMs?`, `status?`; thêm `Locale`.
- `toolCallHistory` (cap 50, khử trùng id), `locale`, `chatTranscript` (cap 200 message),
  `clearToolCallHistory`, `clearChatTranscript`, `setLocale`.
- `partialize` persist `sessionId`, `lastToolCall`, `toolCallHistory`, `locale`, `chatTranscript`;
  **không** persist `navState` (dẫn xuất từ pathname).
- Chat mirror transcript vào store với debounce 300 ms + flush khi unmount; mount lại thì rehydrate.
  Đây là thứ giữ hội thoại sống qua điều hướng Dashboard → Chat (bằng chứng cho Integration Layer).

## 4b. Tương tác & trạng thái (bổ sung sau critique)

- **Xoá lịch sử có xác nhận**: `DashboardWindow` giữ state `armed`; lần bấm đầu đổi nhãn thành
  "Xác nhận?" (tự huỷ sau 4 s), lần bấm thứ hai mới gọi `onClear`. Không dùng modal để không rời
  ngữ cảnh.
- **Status bar là dải mực**: `--ts-status-bg/fg/muted/signal`; tool gần nhất là tín hiệu vermilion
  duy nhất trên dải; `aria-live="polite"` trên ô số tool call.
- **KPI có thứ bậc**: `.ts-kpi--hero` (tổng lượt gọi, serif lớn) + `.ts-kpi-strip` (3 readout).
- **Overview là stack**: `.ts-stack` (4 lớp lồng nhau, hàng host mang tín hiệu) + `.ts-flow` (dải
  4 bước) + `.ts-decisions` (danh sách đánh số) — thay hai lưới thẻ bằng nhau.
- **Không trang trí rỗng**: bỏ dot-grid, glass blur, gradient logo/avatar, keyline 3 px.

## 5. Luồng dữ liệu mới

```
Chat: submit → SSE stream → (kết thúc) setLastToolCall({...toolCall, durationMs, status})
                                      ↓
Integration Layer: lastToolCall + toolCallHistory (cap 50) + locale
                                      ↓
Dashboard: subscribe → KPI/timeline/chi tiết     Shell: status bar + session
```

## 6. Testing

- View/ViewModel tách biệt như cũ; test mới cho `markdown` (parser + render), `metrics`, `i18n`,
  `theme`, `useCopy`, `CommandPalette`, `ShellHeader`, `StatusBar`, `ToolTimeline`, `ThemeToggle`,
  `LocaleToggle`.
- Cập nhật test cũ theo chuỗi UI mới nhưng giữ nguyên các câu bám e2e: "Chưa có tool nào được gọi",
  nav "Chat"/"Dashboard".
- Coverage thực đo sau thay đổi: **~96% statements / ~88% branches / ~93% functions**.

## 7. Rủi ro & đánh đổi

- **CSS override lên dqcss**: nếu nâng dqcss có thể lệch token — đã ghim `^0.1.0`; mọi thay đổi nằm
  trong `theme.css`, dễ soát.
- **i18n 2 dictionary**: thêm key phải thêm ở cả VI/EN — TypeScript bắt lỗi thiếu key.
- **Markdown tự viết**: chỉ tập con, không đầy đủ như thư viện — chấp nhận cho PoC, không rủi ro XSS.
- **Hydration**: các giá trị client-only (session, theme, locale) đều render mặc định rồi mới áp
  sau mount.
