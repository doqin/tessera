# 003-dashboard-module — cấu trúc khởi tạo

Thư mục này được khởi tạo theo checklist UIT.SE.66-D1 §6 ("Khởi tạo cấu trúc specs/ cho 3 spec
đầu tiên: shell-app, chat-module, dashboard-module"). Checklist đó chỉ yêu cầu viết `spec.md` đầy
đủ cho **shell-app** và **chat-module** trước 03/10/2026 — `spec.md` của dashboard-module sẽ
được viết ở bước Specify kế tiếp, trước khi giai đoạn Thực hiện cho module này bắt đầu (mục tiêu
21/11/2026 theo Project Charter).

Tham khảo trước khi viết spec: UIT.SE.66-D3 §3 (Tool-Invocation/Dashboard module — bảng/thẻ hiển
thị tool Agent đã gọi, tham số, kết quả trả về) và §7 (nhận `lastToolCall` từ global store để
re-render).

Tích hợp dự kiến: remote Module Federation thứ hai (`apps/dashboard-module`, :3002) mà Shell nạp ở
route `/dashboard`, theo đúng mô hình của `apps/chat-module` (xem `specs/002-chat-module/plan.md`
và `docs/findings/R2-module-federation-nextjs-approuter.md` §13). Hiện `/dashboard` của Shell là
placeholder tĩnh.

Khi viết, tạo tại đây: `spec.md`, sau đó `plan.md`, `tasks.md` theo đúng thứ tự quy trình SDD ở
`.specify/constitution.md` §8.
