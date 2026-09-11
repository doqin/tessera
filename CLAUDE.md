# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repository này.

## Bối cảnh đồ án

UIT.SE.66 — "Tìm hiểu kiến trúc Micro Frontend & ứng dụng với Next.js xây dựng UI Interactive
cho AI Agent". Đồ án 1 (SE), 1 sinh viên (Nguyễn Tuấn Khang) đảm nhiệm toàn bộ vai trò
PM/BA/Dev/QA, GVHD: ThS. Nguyễn Công Hoan. PoC gồm 1 Application Shell + 2 Micro Frontend module
(Chat/Prompt, Tool-Invocation/Dashboard) ghép lại qua Module Federation.

## Bắt buộc đọc trước mọi task

1. `.specify/constitution.md` — nguyên tắc bất biến, không được vi phạm.
2. Spec tương ứng trong `specs/<NNN-module>/spec.md`, `plan.md`, `tasks.md` — nếu chưa có
   `plan.md`/`tasks.md` cho module đang làm, dừng lại và tạo trước khi implement (quy trình SDD,
   xem constitution §8).

## Quy tắc làm việc

- Không tự ý mở rộng phạm vi ngoài Inclusions của Project Charter (xem constitution §7).
- Không thêm dependency ngoài Tech Stack đã chốt mà không cập nhật tài liệu tech stack trước
  (constitution §4).
- LLM API mặc định cho PoC là **Groq** (free tier) — chỉ dùng OpenAI/Claude khi chủ động chấp
  nhận chi phí (production-target, constitution §5). Mọi lệnh gọi LLM API trong code/test chỉ
  dùng dữ liệu mẫu (mock/dummy) — không đưa dữ liệu thật vào prompt (NDA).
- TypeScript strict mode; ESLint + Prettier phải pass trước khi coi task là hoàn thành.
- Unit test (Jest + RTL) cho code mới, hướng tới coverage ≥70%/module.
- Một module không import trực tiếp internal của module khác — giao tiếp qua Integration Layer
  (Zustand store dùng chung hoặc custom event).

## Cấu trúc repository

```
.specify/constitution.md   # nguyên tắc bất biến
specs/                      # Spec Kit — 1 thư mục / 1 module, chứa spec.md + plan.md + tasks.md
  001-shell-app/
  002-chat-module/
  003-dashboard-module/
apps/                       # Next.js apps độc lập (shell, chat-module, dashboard-module) — D2
packages/shared-ui/         # Design system dùng chung (TailwindCSS/shadcn-ui)
tools/llm-trial/            # Script thử kết nối LLM API bằng dữ liệu mẫu
docs/                       # Tài liệu tham khảo (D1–D3, Tech Stack, Project Charter)
tests/                      # Integration test giữa shell và module
```

## Tài liệu tham khảo (đặt tại docs/reference/)

- Project Charter UIT.SE.66
- UIT.SE.66-D1-SetupAIAgent (AI Agent + SDD setup — tài liệu này)
- UIT.SE.66-D2-TechStackFoundation (Tech Stack + môi trường)
- UIT.SE.66-D3-ProblemSolutionModel (kiến trúc MFE, luồng runtime, MVVM)
- UIT.SE.66 - Tech Stack.xlsx (bảng tech stack đã chốt)

## Khi nào dừng lại và hỏi

- Spec thiếu hoặc mơ hồ (ambiguous requirement) — không tự suy diễn, bổ sung spec trước.
- Thay đổi có vẻ phá vỡ ranh giới kiến trúc 3 lớp hoặc merge 2 module MFE thành 1.
- Cần thêm thư viện/dependency chưa có trong Tech Stack đã chốt.
