# Plan: Tool-Invocation/Dashboard Module (003-dashboard-module)

- **Nguồn:** `spec.md` (phần Specify đã qua Clarify + Checklist §9–10), `UIT.SE.66-D2-TechStackFoundation`
  §4–7, `UIT.SE.66-D3-ProblemSolutionModel` §3, §5, §7, `specs/002-chat-module/plan.md` §1–2 (mô hình
  remote Module Federation), `docs/findings/R2-module-federation-nextjs-approuter.md` §13.
- **Trạng thái:** Hoàn thành T001–T016 (T017 đo NFR sau khi deploy — xem `tasks.md`).

## 1. Kiến trúc tổng quan

Dashboard module là **remote Module Federation** thứ hai (host: `apps/shell`, port `:3000`; remote:
`apps/dashboard-module`, port `:3002`):

```
apps/dashboard-module/
├── next.config.js             NextFederationPlugin: expose ./DashboardModule + shared (client-only)
├── app/
│   ├── layout.tsx              AppHeader (packages/shared-ui) — chrome cho trang chạy độc lập
│   └── page.tsx                trang chạy độc lập (dev/test riêng ở :3002); Shell không dùng trang này
├── components/                 View — component thuần, nhận props
│   ├── DashboardModule.tsx     ĐƯỢC EXPOSE qua MF; compose DashboardWindow, "use client"
│   ├── DashboardWindow.tsx     Bảng/thẻ hiển thị tool call gần nhất (FR1)
│   ├── ToolRow.tsx             Hàng hiển thị tool name + parameters + result (FR3)
│   └── EmptyState.tsx          Placeholder khi chưa có lastToolCall (FR1/FR4)
├── hooks/                      ViewModel
│   └── useDashboardViewModel.ts   state toolCall, subscribe integrationStore, tự render lại (FR2)
├── services/                   Model
│   ├── dashboardService.ts      đọc lastToolCall từ integrationStore (không gọi LLM API — FR/FE scope)
│   └── payloadFormatter.ts      chuẩn hoá parameters/result thành key-value + rút gọn (FR3)
└── types/
    └── dashboard.ts             ToolCall, DashboardState, Message (trạng thái: sent/processing/error)
```

Dashboard không gọi LLM API (chỉ đọc state từ Integration Layer) — tuân theo Cơ chế Integration
Layer (Constitution §2) và D3 §7. Shell, Chat module và Dashboard module dùng chung một instance
Zustand store (Module Federation `shared` singleton).

CSS của remote: component dùng class `.dq-*` của dqcss; Shell đã import dqcss toàn cục.

## 2. Quyết định FR3 — rút gọn giá trị dài

- **Mức rút gọn:** `PAYLOAD_PREVIEW_LIMIT = 200` ký tự cho mỗi giá trị (một entry key-value hoặc
  một khối text), cắt thêm `…`; hàm thuần `truncateForPreview` ở `services/payloadFormatter.ts` để
  unit test được, không phụ thuộc DOM.
- **Nút mở rộng đặt ở cấp khối** (`parameters`/`result`), không phải từng entry: một tool call thường
  có 1–2 giá trị dài, mỗi entry một nút sẽ làm panel rối. Nút `Mở rộng`/`Thu gọn` mang
  `aria-expanded` và mở rộng **tất cả** giá trị dài trong khối.
- **Không có nút khi mọi giá trị đều ngắn** — tránh nút vô nghĩa ở tool call thường.
- **Trạng thái mở rộng reset theo tool call:** `PayloadBlock` được key theo
  `${toolCall.id}:params|result`, nên tool call mới mount lại và trở về thu gọn (không mang trạng
  thái mở rộng của tool trước sang).
- **Chỉ thuần UI, không đổi dữ liệu:** store vẫn giữ payload gốc; rút gọn chỉ ở tầng render, giá trị
  đầy đủ hiện lại sau khi bấm.
