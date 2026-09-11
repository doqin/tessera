# Spec: Application Shell (001-shell-app)

- **Status:** Draft — chờ Clarify/Checklist trước khi sang Plan
- **Liên quan:** UIT.SE.66-D3 §3 (Application Shell), UIT.SE.66-D1 §4 (quy trình SDD),
  UIT.SE.66-D2 (Tech Stack)

## 1. WHY — User Story

Là người dùng cuối của AI Agent UI, tôi muốn có một khung ứng dụng nhất quán (navigation, layout)
tự động nạp đúng micro frontend module cho trang tôi đang xem, để tôi có trải nghiệm một giao diện
thống nhất dù các module được build và deploy độc lập.

## 2. Phạm vi

### Trong phạm vi (Inclusions — Project Charter)

- Layout dùng Next.js App Router: header, sidebar điều hướng, vùng mount nội dung chính.
- Routing tới `/chat` (Chat module) và `/dashboard` (Dashboard module).
- Integration Layer: nạp remote bundle qua Module Federation tương ứng với route hiện tại.
- Áp dụng shared design system (TailwindCSS + shadcn-ui) ở tầng shell.
- Khởi tạo global store (Zustand) tại Integration Layer, expose: session id hiện tại, tool call
  gần nhất (`lastToolCall`), trạng thái điều hướng.

### Ngoài phạm vi (Exclusions — Project Charter)

- Backend AI agent orchestration đầy đủ.
- Auth/bảo mật cấp production.
- Ứng dụng mobile native.
- Quy mô multi-tenant/enterprise thật.

## 3. Functional Requirements

- **FR1:** Shell PHẢI render header + sidebar navigation trên mọi route.
- **FR2:** Khi điều hướng tới `/chat`, Shell PHẢI mount remote bundle của Chat module vào vùng nội
  dung mà không full page reload.
- **FR3:** Khi điều hướng tới `/dashboard`, Shell PHẢI mount remote bundle của Dashboard module
  tương tự FR2.
- **FR4:** Shell PHẢI expose một Zustand store dùng chung, cả 2 module đọc/ghi được các trường:
  `sessionId`, `lastToolCall`, `navState`.
- **FR5:** Nếu một remote module load thất bại, Shell PHẢI hiển thị fallback UI thay vì crash toàn
  bộ ứng dụng.

## 4. Non-Functional Requirements (theo Quality Management — Project Charter)

- **NFR1:** First Load < 3 giây.
- **NFR2:** Độ trễ chuyển tiếp giữa module < 300ms.
- **NFR3:** Lighthouse Performance ≥ 80/100.
- **NFR4:** Responsive, tương thích Chrome/Firefox/Edge, tối thiểu 1366×768.
- **NFR5:** TypeScript strict mode; ESLint + Prettier pass trong CI.
- **NFR6:** Unit test coverage ≥ 70% (Jest + React Testing Library).

## 5. Acceptance Criteria

- **AC1:** Given shell app đã deploy, when người dùng mở URL gốc, then header + sidebar render
  xong trong ngân sách First Load (<3s).
- **AC2:** Given người dùng click mục nav "Chat", when route đổi thành `/chat`, then Chat module
  mount xong trong <300ms, không full page reload.
- **AC3:** Given người dùng click mục nav "Dashboard", when route đổi thành `/dashboard`, then
  Dashboard module mount xong trong <300ms.
- **AC4:** Given Chat module cập nhật `lastToolCall` trong store dùng chung, when Dashboard module
  đang mounted, then Dashboard module tự re-render phản ánh giá trị mới, không cần refresh thủ công.
- **AC5:** Given một remote module load lỗi (VD: lỗi mạng), when người dùng điều hướng tới route
  đó, then Shell hiển thị fallback UI thay vì màn hình trắng/crash.

## 6. Edge Cases (cần rà soát ở bước Clarify)

- Người dùng điều hướng rất nhanh giữa `/chat` và `/dashboard` trước khi module trước load xong.
- Cả 2 module cùng ghi vào `lastToolCall` gần như đồng thời (race condition).
- Remote bundle version không khớp giữa Shell và module (breaking change ở remote).

## 7. Dependencies / References

- Tech stack: Next.js (App Router) + TypeScript, Module Federation
  (`@module-federation/nextjs-mf`, dự phòng Next.js Multi-Zones), TailwindCSS/shadcn-ui, Zustand
  (UIT.SE.66-D2 §4).
- Kiến trúc: UIT.SE.66-D3 §3–7 (mô hình 3 lớp MFE, MVVM trong module, mô hình chia sẻ state).
- Constitution: `.specify/constitution.md`.

## 8. Tiếp theo

`plan.md` và `tasks.md` cho module này được viết ở bước Plan/Tasks của quy trình SDD, sau khi
spec này qua Clarify + Checklist. Chưa thực hiện Implement khi thiếu `plan.md`/`tasks.md`.
