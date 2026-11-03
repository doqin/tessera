# Plan: Tool-Invocation/Dashboard Module (003-dashboard-module)

- **Nguồn:** `spec.md` (phần Specify đã qua Clarify + Checklist §9–10), `UIT.SE.66-D2-TechStackFoundation`
  §4–7, `UIT.SE.66-D3-ProblemSolutionModel` §3, §5, §7, `specs/002-chat-module/plan.md` §1–2 (mô hình
  remote Module Federation), `docs/findings/R2-module-federation-nextjs-approuter.md` §13.
- **Trạng thái:** Đang implement — T001–T011 hoàn thành, còn T012–T016 (xem `tasks.md`).

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
│   └── dashboardService.ts      đọc lastToolCall từ integrationStore (không gọi LLM API — FR/FE scope)
└── types/
    └── dashboard.ts             ToolCall, DashboardState, Message (trạng thái: sent/processing/error)
```

Dashboard không gọi LLM API (chỉ đọc state từ Integration Layer) — tuân theo Cơ chế Integration
Layer (Constitution §2) và D3 §7. Shell, Chat module và Dashboard module dùng chung một instance
Zustand store (Module Federation `shared` singleton).

CSS của remote: component dùng class `.dq-*` của dqcss; Shell đã import dqcss toàn cục.
