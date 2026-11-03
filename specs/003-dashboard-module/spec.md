# Spec: Tool-Invocation/Dashboard Module (003-dashboard-module)

- **Status:** Not started (phầnSpecify — mới viết branch `feature/003-dashboard-module-spec`)
- **Liên quan:** UIT.SE.66-D3 §3, §7 (Tool-Invocation/Dashboard module), UIT.SE.66-D1 §4, UIT.SE.66-D2
  (Tech Stack), `specs/001-shell-app/spec.md` §9 (Clarify) và `specs/002-chat-module/plan.md` §2
  (mô hình remote Module Federation)

## 1. WHY — User Story

Là người dùng cuối của AI Agent UI, tôi muốn xem một **bảng/thẻ hiển thị các tool Agent đã gọi**
(tool name), **tham số** (parameters) và **kết quả trả về** (result), để tôi có thể theo dõi những
thao tác của Agent ngay trên UI — không phải chỉ nhìn vào log giao tiếp.

## 2. Phạm vi

### Trong phạm vi (Inclusions — Project Charter)

- Hiển thị **tool call gần nhất** (`lastToolCall`) đăng ký từ Integration Layer (Zustand store dùng
  chung) khi có, và **trạng thái rỗng** khi chưa có (dạng placeholder).
- Hiển thị các trường riêng lẻ: **tên tool**, **tham số** (JSON/collapsed), **kết quả trả về**.
- **Subscribe global store** khi module mount, tự động render lại khi `lastToolCall` thay đổi
  (D3 §7 — không cần reload trang, không gọi API).
- Gói thành **remote Module Federation** độc lập (`apps/dashboard-module`, port `:3002`), expose
  `./DashboardModule`; Shell nạp ở route `/dashboard` bằng soft navigation.
- MVVM: Model (`toolCall` type), ViewModel (`useDashboardViewModel`), View (table/card, thuần props).
- Dùng chung `packages/shared-ui` (AppHeader/Button/Card/Layout) và `packages/integration-store`.
- Màu theme: `packages/shared-ui` (Groq-inspired theme bằng dqcss), không style riêng.

### Ngoài phạm vi (Exclusions — Project Charter)

- Gọi LLM API (Dashboard chỉ **đọc** state đã có từ store — không tự gọi API).
- Lưu trữ lịch sử tool call bền vững ngoài phiên hiện tại (chỉ `lastToolCall`, theo mục tối thiểu
  của Integration Layer — D3 §7).
- Auth/bảo mật cấp production.
- Khai thác nhiều tool call trở lại (có thể mở rộng store song song nếu cần).

## 3. Functional Requirements

- **FR1:** Khi route `/dashboard` được truy cập, module PHẢI render bảng/thẻ hiển thị tool call gần
  nhất (nếu có) hoặc placeholder "Chưa có tool nào được gọi" (nếu chưa có).
- **FR2:** Khi mount, module PHẢI subscribe `integrationStore` để đọc `lastToolCall` và tự động
  render lại UI khi giá trị thay đổi (D3 §7) — không reload, không gọi API.
- **FR3:** Bảng/thẻ hiển thị các trường rõ ràng: **tool name**, **parameters**, **result**.
  `parameters` và `result` hiển thị dạng chuỗi gọn (collapsed/truncated) kèm nút mở rộng nếu dài.
- **FR4:** Nếu `lastToolCall` là `null`/không có, hiển thị placeholder rõ ràng và không crash.
- **FR5:** Module được build thành remote Module Federation (expose `./DashboardModule`) và Shell
  mount ở `/dashboard` (client-only, `ssr: false`).
- **FR6:** Không import code của Shell hay Chat module; chỉ dùng chung
  `packages/shared-ui` + `packages/integration-store` qua npm workspace. Module vẫn chạy được
  độc lập (dev/test riêng ở :3002).

## 4. Non-Functional Requirements

- **NFR1–NFR3, NFR5:** như `specs/001-shell-app/spec.md` — First Load <3s, độ trễ điều hướng <300ms,
  Lighthouse ≥80.
- **NFR4:** Responsive, tương thích Chrome/Firefox/Edge, tối thiểu 1366×768.
- **NFR6:** TypeScript strict; ESLint + Prettier pass.
- **NFR7:** Unit test coverage ≥70% cho `hooks/` + `components/` (thay cho `app/page.tsx` dev-only).
- **NFR8:** Remote chỉ render phía client (không SSR cho nội dung remote).

## 5. Acceptance Criteria

- **AC1:** Given Dashboard module đã mount, when không có `lastToolCall` trong store, then hiển thị
  placeholder "Chưa có tool nào được gọi" và không crash.
- **AC2:** Given Chat module cập nhật `lastToolCall` trong store dùng chung, when Dashboard đã
  mount, then đọc được giá trị mới nhất và render row tool (tên + tham số + kết quả) — live read;
  cần integration test T015/T016 (Shell⇄Dashboard, dùng chung mục T016 của Shell/chat scope) để xác nhận store singleton thật sự chung 1 instance.
- **AC3:** Given `lastToolCall` mang payload, when render, then hiển thị tất cả 3 trường (tool name,
  parameters, result) đúng kiểu dữ liệu.
- **AC4:** Given module được build remote, when Shell nạp ở `/dashboard`, then nội dung của module
  render đúng trong vùng mount, header/sidebar giữ nguyên, không full page reload.
- **AC5:** Given Unit test thực thi, when chạy, then ViewModel + View (MVVM) được test tách biệt,
  coverage ≥70% cho phần logic.

## 6. Edge Cases (cần rà soát ở bước Clarify)

- `lastToolCall` có thể đến chưa có `result` (đang trong quá trình phản hồi) → hiển thị trang
  "đang xử lý" (loading placeholder) thay vì hiện `result: undefined`.
- `parameters`/`result` có thể là nhiều kiểu dữ liệu (string/array/object) → định dạng JSON
  có cấu trúc, fallback vào `String()` khi không parse được.
- Dashboard giao diện bị resize/responsive → bảng thu gọn (collapsible) trên màn hình nhỏ.

## 7. Dependencies / References

- Tech stack: Next.js 13.5.11 (App Router) + TypeScript, **Module Federation** (`nextjs-mf`
  8.8.76, client-only), `@tessera/integration-store` + Zustand, `packages/shared-ui` (dqcss theme),
  TailwindCSS v4 + shadcn-ui style.
- Kiến trúc: UIT.SE.66-D3 §3, §7 (dòng luồng Chat → Dashboard qua `lastToolCall`), Constitution
  `.specify/constitution.md` §2, §8.
- Mô hình remote MF: `specs/002-chat-module/plan.md` §2 + `docs/findings/R2-module-federation-nextjs-approuter.md` §13.

## 8. Tiếp theo

`plan.md` và `tasks.md` cho module này viết ở bước Plan/Tasks (quy trình SDD), sau khi spec qua
Clarify + Checklist. Chưa thực hiện Implement khi thiếu `plan.md`/`tasks.md`.

## 9. Clarify

- **Dashboard hiển thị "các tool Agent đã gọi" (nhiều) hay "tool gần nhất" (một)?**
  Giữ đúng mục **min scope** của Integration Layer (001 spec FR4): store lưu `lastToolCall`
  (một tool call gần nhất). Dashboard thể hiện **tool call hiện tại** (mới nhất). Nếu sau cần
  lịch sử nhiều tool, mở rộng store (danh sách heap) song song — không vội tại bước này.
- **`lastToolCall` có `result` chưa đầy đủ khi dashboard mount?** ViewModel tự ép trạng thái
  `processing` khi `result === undefined` (hiển thị placeholder "đang xử lý"), rồi render
  `result` khi có (Clarify 001 §9 áp dụng tương tự).
- **Đăng ký subscribe store không gây memory leak?** ViewModel unmount → auto-unsubscribe (cleanup)
  trong React `useEffect` return — không subscribe trực tiếp trong component body.
- **`parameters`/`result` định dạng JSON:** dùng `JSON.stringify(value, null, 2)` khi object/array,
  fallback `String(value)` khi không parse được, không throw.

## 10. Checklist

- [ ] Mọi FR1–FR6 có AC tương ứng kiểm thử được.
- [ ] NFR có ngưỡng đo, khớp Quality Management (Constitution §3, Project Charter §12).
- [ ] Toàn bộ Edge Case (mục 6) đã có quyết định xử lý ở mục 9 — không còn requirement mơ hồ.
- [ ] Không có yêu cầu bảo mật/cấp production nằm ngoài Exclusions (đối chiếu Project Charter).
- [ ] Phạm vi khớp Inclusions của Project Charter — không mở rộng sang LLM API, auth production.
- [ ] Sẵn sàng chuyển sang bước Plan (next: `specs/003-dashboard-module/plan.md` + `tasks.md`).

## 11. Cơ chế ghép nối với Shell

Dashboard module là **remote Module Federation** thứ hai trên Next.js 13.5.11 (**`@module-federation/nextjs-mf`**
8.8.76), theo đúng cấu hình remote của `apps/chat-module` (findings §13):

- `apps/dashboard-module/next.config.js`: `NextFederationPlugin` expose `./DashboardModule` +
  `shared` singleton (React vendored của Next + `@tessera/integration-store` + `zustand`) — chỉ
  federation ở client compiler, bỏ guard `appDirEnabled` tạm thời.
- `DashboardModule.tsx` là Client Component (`"use client"`) — bắt buộc vì Shell nạp client-only
  (`ssr: false`).
- `apps/shell/app/dashboard/page.tsx` là placeholder tĩnh; route `/dashboard` mount
  `<RemoteDashboard />` vào vùng nội dung của Shell (FR2/FR3 soft navigation).
- `app/layout.tsx` của module chỉ phục vụ trang chạy độc lập (dev/test :3002); chrome/header/sidebar
  do Shell chịu trách nhiệm.
- CSS của remote: Shell `@source` thư mục `components/` của module này trong `globals.css`
  (Tailwind v4) — thêm class Tailwind mới trong `components/` là đủ, nhưng đổi tên/di chuyển
  thư mục `components/` phải cập nhật `@source` của Shell.
- Cơ chế đang dùng: Chat module cập nhật `lastToolCall` → Dashboard subscribe store và re-render.
