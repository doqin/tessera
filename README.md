# UIT.SE.66 — Micro Frontend AI Agent UI (PoC)

Tìm hiểu kiến trúc Micro Frontend & ứng dụng với Next.js xây dựng UI Interactive cho AI Agent.
Đồ án 1 (SE) — Nguyễn Tuấn Khang, GVHD: ThS. Nguyễn Công Hoan.

## Tóm tắt

PoC gồm 1 Application Shell (Next.js App Router) + 2 Micro Frontend module (Chat/Prompt,
Tool-Invocation/Dashboard) độc lập triển khai, ghép lại thành 1 giao diện thống nhất qua Module
Federation. Chi tiết đầy đủ: xem `docs/reference/`.

## Quy trình phát triển: AI Coding Agent + Spec-Driven Development (SDD)

Đồ án dùng Claude Code làm Agent triển khai chính, kết hợp SDD để giữ specification làm nguồn
tham chiếu duy nhất trước khi viết code. Xem `CLAUDE.md` và `.specify/constitution.md`.

```
spec.md   → WHAT + WHY
plan.md   → HOW
tasks.md  → DO
```

## Cấu trúc repository

```
.specify/constitution.md   # nguyên tắc bất biến của đồ án
specs/                      # Spec Kit — 1 thư mục / 1 module
  001-shell-app/spec.md
  002-chat-module/spec.md
  003-dashboard-module/
apps/                       # Next.js apps độc lập (shell, chat-module, dashboard-module)
packages/shared-ui/         # Design system dùng chung (TailwindCSS/shadcn-ui)
tools/llm-trial/            # Script thử kết nối LLM API bằng dữ liệu mẫu
docs/reference/             # Project Charter, D1–D3, Tech Stack
tests/                      # Integration test giữa shell và module
```

## Tech Stack đã chốt

Next.js (App Router) + TypeScript · **Next.js Multi-Zones** (đã pivot từ Module Federation sau khi
gặp lỗi runtime không khắc phục được — xem
`docs/findings/R2-module-federation-nextjs-approuter.md`) · TailwindCSS + shadcn-ui · Zustand ·
Axios · ESLint + Prettier · Jest + React Testing Library · GitHub Actions · Vercel. Chi tiết:
`docs/reference/UIT.SE.66 - Tech Stack.xlsx`.

## Bắt đầu

```bash
npm install
npm run lint --workspaces --if-present
npm test --workspaces --if-present
```

Thử kết nối LLM API (dữ liệu mẫu, không dùng dữ liệu thật — xem `tools/llm-trial/README.md`):

```bash
node tools/llm-trial/test-llm-connection.mjs
```
