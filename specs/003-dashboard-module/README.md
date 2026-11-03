# 003-dashboard-module

Thư mục SDD của Tool-Invocation/Dashboard module — remote Module Federation thứ hai
(`apps/dashboard-module`, :3002), được Shell nạp ở route `/dashboard`.

## Trạng thái (cập nhật 2026-11-04)

- **Giai đoạn:** Thực hiện, hạn 21/11/2026.
- **Đã xong (T001–T011):** scaffold app, cấu hình remote Module Federation, types / service /
  ViewModel / View, Shell mount `RemoteDashboard` ở `/dashboard` (`apps/shell/components/`),
  lint / typecheck / test / build.
- **Còn lại (T012–T016):** parse `parameters`/`result`, trạng thái "đang xử lý", coverage ≥70%,
  integration test Shell ⇄ Dashboard, đo NFR trên môi trường deploy.
- Chi tiết từng task: [`tasks.md`](./tasks.md).

## Tài liệu

| File | Nội dung |
| --- | --- |
| [`spec.md`](./spec.md) | WHAT + WHY: user story, FR/NFR, acceptance criteria, edge case, Clarify |
| [`plan.md`](./plan.md) | HOW: kiến trúc MVVM, cấu hình remote Module Federation |
| [`tasks.md`](./tasks.md) | DO: task atomic có thứ tự và trạng thái |

Thứ tự bắt buộc theo SDD: `spec.md` → `plan.md` → `tasks.md` → code
(`.specify/constitution.md` §8).

## Ghi chú

- Checklist §10 trong `spec.md` vẫn chưa được tick; chưa rà soát lại sau khi viết plan và tasks.
- Mô hình remote MF dùng chung với Chat module: `specs/002-chat-module/plan.md` §2 và
  `docs/findings/R2-module-federation-nextjs-approuter.md` §13.
