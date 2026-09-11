# Constitution — UIT.SE.66 (AI Agent MFE PoC)

> Tài liệu này là nguồn nguyên tắc **bất biến** của đồ án. Agent (Claude Code) phải đọc tài liệu
> này trước khi thực hiện **bất kỳ task nào**. Không được vi phạm các nguyên tắc dưới đây trừ khi
> chính tài liệu này được cập nhật trước.
>
> Nguồn: UIT.SE.66-D1-SetupAIAgent §4.1, đối chiếu Project Charter UIT.SE.66.

## 1. Coding Standards

- TypeScript **strict mode** bắt buộc cho mọi package/app.
- ESLint + Prettier **phải pass** trước khi commit — không commit code chưa lint sạch.

## 2. Architecture Principles

- Giữ đúng ranh giới 3 lớp: **Application Shell / Micro Frontend / Integration Layer**
  (xem `UIT.SE.66-D3-ProblemSolutionModel`).
- Một module **không được** import trực tiếp internal của module khác. Giao tiếp giữa các module
  chỉ qua Integration Layer: custom event hoặc subscribe global store (Zustand).
- Trong mỗi Micro Frontend, tổ chức code theo **MVVM** (Model / View / ViewModel) — xem D3 §6.

## 3. Testing Requirements

- Mỗi module MFE có Unit Test (Jest + React Testing Library), coverage tối thiểu **70%**.
- Integration Test cho luồng ghép nối Shell ⇄ module (load module, truyền state, điều hướng).

## 4. Dependency Rules

- Không thêm thư viện ngoài Tech Stack đã chốt (xem `UIT.SE.66 - Tech Stack.xlsx` /
  `UIT.SE.66-D2-TechStackFoundation`) nếu chưa cập nhật tài liệu tech stack trước.
- Tech Stack đã chốt: Next.js (App Router) + TypeScript, Module Federation
  (`@module-federation/nextjs-mf`, dự phòng: Next.js Multi-Zones), TailwindCSS + shadcn-ui,
  Zustand, Axios, Groq API (mặc định, free tier) / OpenAI API / Claude API (production-target),
  ESLint + Prettier, Jest + RTL, GitHub Actions, Vercel.

## 5. API Conventions

- PoC không có ngân sách — **Groq** (free tier, API tương thích OpenAI `/chat/completions`) là
  provider mặc định cho phát triển/test/demo. OpenAI API và Claude API được ghi nhận là lựa chọn
  production-target, chỉ dùng khi chủ động chấp nhận chi phí (không dùng làm mặc định trong CI
  hay trial script).
- Gọi LLM API (Groq/OpenAI/Claude) **chỉ dùng dữ liệu mẫu (mock/dummy)** — đúng cam kết bảo mật
  (NDA) trong Project Charter. Không đưa thông tin thật hoặc nhạy cảm vào prompt thử nghiệm.
- API key không commit vào repo — khai báo qua `.env.local` (đã trong `.gitignore`).

## 6. Git / Branching Policy

- Git-Flow đơn giản hóa: nhánh `main` + feature branches.
- Tự review Pull Request (diff) trước khi merge — không merge thẳng vào `main` khi chưa qua bước
  Review trong quy trình SDD.

## 7. Scope Discipline

- Không được tự ý mở rộng phạm vi (scope) ngoài **Inclusions** của Project Charter.
- Xem `Exclusions` trong Project Charter để biết rõ những gì **không** làm: backend AI agent
  orchestration đầy đủ, auth/bảo mật cấp production, ứng dụng mobile native, multi-tenant/enterprise.

## 8. Spec-Driven Development (SDD) — bắt buộc trước khi code

Trước khi Agent viết code cho một module/feature mới, thứ tự bắt buộc:

```
spec.md   → WHAT + WHY   (yêu cầu, user story, acceptance criteria)
plan.md   → HOW          (kiến trúc, component, tech stack, API design)
tasks.md  → DO           (atomic task, có dependency & thứ tự thực hiện)
```

Agent thực hiện task theo đúng `tasks.md` của spec tương ứng trong thư mục `specs/`. Không tự
suy diễn requirement ngoài spec. Nếu spec thiếu hoặc mơ hồ, dừng lại và bổ sung spec trước khi
tiếp tục implement (bước Clarify/Checklist), không đoán ý định người dùng.

## 9. Vi phạm

Nếu một thay đổi được đề xuất mà vi phạm bất kỳ mục nào ở trên, Agent phải dừng lại, nêu rõ xung
đột với constitution, và chờ xác nhận thay vì tự ý tiến hành.
