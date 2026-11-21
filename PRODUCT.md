# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary — hội đồng báo cáo / GVHD** (ThS. Nguyễn Công Hoan) xem demo trực tiếp trong buổi báo
  cáo cuối kỳ. Họ có vài phút, không đọc code, và cần thấy ngay: chat với agent hoạt động, agent gọi
  tool, và kết quả tool hiện live ở một module khác mà không reload.
- **Secondary — sinh viên/lập trình viên học Micro Frontend**, dùng repo như một ví dụ chạy được
  (README, specs, dev servers ở 3 cổng).

## Product Purpose

Tessera là PoC cho đồ án UIT.SE.66: một **UI Interactive cho AI Agent** được ghép từ các frontend
build/deploy độc lập. Một Application Shell (host) nạp 2 remote — Chat/Prompt và
Tool-Invocation/Dashboard — qua Module Federation trên Next.js 13.5.11, chia sẻ một Integration
Layer. Thành công của sản phẩm là buổi demo chứng minh được: phản hồi agent stream về, tool call
xuất hiện tức thì ở module còn lại, và ranh giới 3 lớp vẫn đứng vững khi một remote chết.

## Positioning

Giao diện AI Agent được **lắp ráp lúc runtime từ các frontend triển khai độc lập**, không phải một
monolith. Thứ một demo monolith không thể sao chép trung thực là dòng state sống xuyên biên module:
Chat ghi `lastToolCall` vào store dùng chung → Dashboard đang subscribe tự render lại, không reload,
qua ranh giới Module Federation.

## Operating Context

- Chạy local bằng một lệnh: `npm run dev:all` → shell `:3000`, chat `:3001`, dashboard `:3002`; bản
  deploy tương ứng trên Vercel.
- LLM mặc định là **Groq free tier**, gọi qua route handler phía server của chat remote; API key nằm
  trong `.env.local`, không bao giờ xuống trình duyệt.
- Được đánh giá trong một buổi thuyết trình trên laptop/máy chiếu, và đọc lại sau đó qua báo cáo +
  repo (specs, tasks, findings).
- Hai tool mẫu cố định: `get_weather`, `search_docs` — kết quả giả, khác kiểu dữ liệu để Dashboard
  chứng minh hiển thị object lẫn array.

## Capabilities and Constraints

- Đúng 2 module MFE (Chat/Prompt, Tool-Invocation/Dashboard); Shell sở hữu layout, routing, theme,
  ngôn ngữ.
- **Ranh giới 3 lớp là bất biến**: Application Shell / Micro Frontend / Integration Layer. Module
  không import internal của nhau; mọi giao tiếp qua `@tessera/integration-store` hoặc custom event.
- Module Federation với **Next.js 13.5.11 ghim phiên bản** (nextjs-mf không chạy trên 14/15);
  remote chỉ render phía client (`ssr: false`).
- Quy tắc dự án đã ghi trong `.specify/constitution.md`: dqcss (`@doqin/dqcss`) là design system đã
  chốt — không thêm thư viện UI/icon/i18n mới nếu chưa cập nhật tài liệu tech stack; mọi lệnh gọi
  LLM chỉ dùng dữ liệu mẫu (cam kết NDA); TypeScript strict + ESLint/Prettier là cổng bắt buộc.
- Hợp đồng Integration Layer: `sessionId`, `lastToolCall`, `toolCallHistory` (tối đa 50, trong
  phiên), `navState`, `locale`.
- Ngoài phạm vi (Project Charter): auth/bảo mật production, backend orchestration đầy đủ, mobile
  native, multi-tenant/enterprise.

## Brand Commitments

- Tên hiển thị trong UI: **Tessera**; tên đồ án: UIT.SE.66. Ngôn ngữ mặc định là tiếng Việt, có
  chuyển VI/EN áp cho cả remote.
- Không có brand asset bên thứ ba, không testimonial/khách hàng hư cấu.

## Evidence on Hand

- Ứng dụng chạy được: `apps/shell`, `apps/chat-module`, `apps/dashboard-module`; package dùng chung
  `packages/shared-ui`, `packages/integration-store`.
- Spec Kit đầy đủ: `specs/001-shell-app` … `specs/004-ui-ux-redesign`, `.specify/constitution.md`,
  `docs/findings/R2-module-federation-nextjs-approuter.md`.
- Dữ liệu mẫu thật trong repo cho 2 tool; không có user thật, benchmark, analytics, pricing hay
  testimonial — công việc sau này không được bịa các mục đó.

## Product Principles

1. **Kiến trúc phải nhìn thấy được trên UI đang chạy** — mỗi màn hình nên làm rõ phần nào là shell,
   phần nào là remote, phần nào là state dùng chung.
2. **Một ngôn ngữ thị giác cho các mảnh deploy độc lập** — design system chia sẻ, không fork theo app.
3. **Live, không reload** — cập nhật xuyên module diễn ra trong phiên qua Integration Layer.
4. **Trung thực ở mức demo** — dữ liệu mẫu được nói rõ là mẫu; không tuyên bố vượt quá phạm vi PoC.
5. **Rẻ và kiểm chứng được** — LLM free tier, cổng local cố định, test/lint/typecheck là cổng trước
   khi coi là xong.

## Accessibility & Inclusion

Yêu cầu đã đặc tả trong spec 004: thao tác bàn phím cho luồng chính (Ctrl/Cmd+K, Enter để gửi),
mọi nút chỉ có icon phải có `aria-label`, trạng thái chọn dùng `aria-current`/`aria-pressed`, tôn
trọng `prefers-reduced-motion`; responsive từ 1366×768 xuống tới ~360 px.
