# Spec: Chat/Prompt Module (002-chat-module)

- **Status:** Draft — chờ Clarify/Checklist trước khi sang Plan
- **Liên quan:** UIT.SE.66-D3 §3–4 (Chat/Prompt module, luồng runtime), UIT.SE.66-D1 §4,
  UIT.SE.66-D2 (Tech Stack, AI integration)

## 1. WHY — User Story

Là người dùng cuối, tôi muốn trò chuyện với AI Agent qua một giao diện chat, để tôi có thể gửi
prompt và xem phản hồi streaming, bao gồm cả khi Agent gọi tool.

## 2. Phạm vi

### Trong phạm vi (Inclusions — Project Charter)

- Khung chat: danh sách message (user + agent), ô nhập prompt.
- Gửi prompt tới LLM API **Groq** (free tier, mặc định cho PoC — không phát sinh chi phí; OpenAI
  API/Claude API là lựa chọn production-target, không bắt buộc) — **chỉ dùng dữ liệu mẫu/dummy**
  (NDA, constitution §5).
- Hiển thị phản hồi của Agent dạng streaming (tăng dần theo chunk/token), không đợi full response.
- Khi phản hồi có tool-call, publish sự kiện/cập nhật `lastToolCall` trong global store để
  Dashboard module tiêu thụ.
- Đóng gói module thành remote Module Federation, expose component để Shell mount.

### Ngoài phạm vi (Exclusions — Project Charter)

- Backend AI agent orchestration đầy đủ (dùng API có sẵn/mock, không tự xây orchestration).
- Lưu trữ lịch sử chat bền vững ngoài phiên hiện tại.
- Auth cấp production.

## 3. Functional Requirements

- **FR1:** Module PHẢI render chat window hiển thị danh sách message theo thứ tự thời gian.
- **FR2:** Module PHẢI cung cấp ô nhập prompt; submit sẽ gọi tới LLM API (mock/dummy data).
- **FR3:** Module PHẢI hiển thị phản hồi của Agent dạng streaming khi API hỗ trợ streaming.
- **FR4:** Khi response chứa tool-call, Module PHẢI cập nhật `lastToolCall` trong Zustand store
  dùng chung (Integration Layer).
- **FR5:** Module PHẢI có thể build/deploy độc lập dưới dạng Module Federation remote, không phụ
  thuộc trực tiếp vào internal của Shell hay Dashboard module.

## 4. Non-Functional Requirements

- **NFR1–NFR6:** như spec Shell app (First Load <3s ở cấp toàn ứng dụng, chuyển tiếp <300ms,
  Lighthouse ≥80, responsive, TS strict + lint pass, coverage ≥70%).
- **NFR7:** Không đưa dữ liệu cá nhân/nhạy cảm thật vào request gửi LLM API — chỉ dữ liệu mẫu
  (NDA, constitution §5).

## 5. Acceptance Criteria

- **AC1:** Given Chat module đã mount, when người dùng gõ prompt và submit, then message của
  người dùng xuất hiện ngay trong danh sách message.
- **AC2:** Given prompt đã gửi, when mock LLM API trả lời, then phản hồi của Agent hiển thị dạng
  streaming (tăng dần), không xuất hiện toàn bộ cùng lúc.
- **AC3:** Given response mock chứa payload tool-call, when nhận được, then `lastToolCall` trong
  store dùng chung được cập nhật trong cùng chu kỳ render.
- **AC4:** Given module được build độc lập, when deploy, then module expose được `remoteEntry.js`
  và Shell load được mà không cần import internal của module.
- **AC5:** Given chạy Unit test, when thực thi, then View và ViewModel (MVVM, D3 §6) được test
  tách biệt, đạt coverage ≥70%.

## 6. Edge Cases (cần rà soát ở bước Clarify)

- LLM API mock trả lỗi/timeout — Module cần hiển thị trạng thái lỗi rõ ràng, không treo UI.
- Người dùng submit nhiều prompt liên tiếp trước khi phản hồi trước hoàn tất (concurrency).
- Response streaming bị ngắt giữa chừng (network drop).

## 7. Dependencies / References

- Tech stack: Next.js (App Router) + TypeScript, Module Federation, TailwindCSS/shadcn-ui,
  Zustand, Axios/fetch, Groq API (mặc định, free tier) / OpenAI API / Claude API
  (production-target) — dữ liệu mẫu/dummy — UIT.SE.66-D2 §4.
- Kiến trúc: UIT.SE.66-D3 §3–7 (mô hình 3 lớp, MVVM, mô hình chia sẻ state — ví dụ cụ thể mục 7
  minh hoạ đúng luồng Chat → Dashboard qua `lastToolCall`).
- Constitution: `.specify/constitution.md`.
- Trial kết nối LLM API: `tools/llm-trial/` (bằng chứng Agent gọi được API trước khi implement
  đầy đủ module — checklist D1 mục 6).

## 8. Tiếp theo

`plan.md` và `tasks.md` cho module này được viết ở bước Plan/Tasks của quy trình SDD, sau khi
spec này qua Clarify + Checklist. Chưa thực hiện Implement khi thiếu `plan.md`/`tasks.md`.
