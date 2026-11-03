# Spec: Chat/Prompt Module (002-chat-module)

- **Status:** Implemented (foundation, mock service) — remote Module Federation trên Next.js
  13.5.11, xem §11 và `specs/001-shell-app/spec.md` §11
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
- Đóng gói module thành 1 **remote Module Federation** độc lập (expose `./ChatModule`), Shell nạp
  lúc runtime ở route `/chat`.

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
- **FR5:** Module PHẢI build/deploy độc lập như một remote Module Federation riêng (expose
  `./ChatModule`), không phụ thuộc trực tiếp vào internal của Shell hay Dashboard module — chỉ dùng
  chung `packages/shared-ui` và `packages/integration-store` qua npm workspace. Module vẫn chạy được
  độc lập (dev/test riêng).

## 4. Non-Functional Requirements

- **NFR1–NFR6:** như spec Shell app — First Load <3s, điều hướng <300ms (không reload), Lighthouse
  ≥80, responsive, TS strict + lint pass, coverage ≥70% (xem `specs/001-shell-app/spec.md`).
- **NFR7:** Không đưa dữ liệu cá nhân/nhạy cảm thật vào request gửi LLM API — chỉ dữ liệu mẫu
  (NDA, constitution §5).

## 5. Acceptance Criteria

- **AC1:** Given Chat module đã mount, when người dùng gõ prompt và submit, then message của
  người dùng xuất hiện ngay trong danh sách message.
- **AC2:** Given prompt đã gửi, when mock LLM API trả lời, then phản hồi của Agent hiển thị dạng
  streaming (tăng dần), không xuất hiện toàn bộ cùng lúc.
- **AC3:** Given response mock chứa payload tool-call, when nhận được, then `lastToolCall` trong
  store dùng chung được cập nhật trong cùng chu kỳ render.
- **AC4:** Given module được build như remote Module Federation, when Shell cấu hình `remotes` trỏ
  tới `remoteEntry.js` của module, then người dùng truy cập `/chat` từ Shell thấy đúng nội dung
  module mà Shell không cần import internal của module.
- **AC5:** Given chạy Unit test, when thực thi, then View và ViewModel (MVVM, D3 §6) được test
  tách biệt, đạt coverage ≥70%.

## 6. Edge Cases (cần rà soát ở bước Clarify)

- LLM API mock trả lỗi/timeout — Module cần hiển thị trạng thái lỗi rõ ràng, không treo UI.
- Người dùng submit nhiều prompt liên tiếp trước khi phản hồi trước hoàn tất (concurrency).
- Response streaming bị ngắt giữa chừng (network drop).

## 7. Dependencies / References

- Tech stack: Next.js 13.5.11 (App Router) + TypeScript, **Module Federation** (§11), dqcss, Zustand, Axios/fetch, Groq API (mặc định, free tier) /
  OpenAI API / Claude API (production-target) — dữ liệu mẫu/dummy — UIT.SE.66-D2 §4.
- Kiến trúc: UIT.SE.66-D3 §3–7 (mô hình 3 lớp, MVVM, mô hình chia sẻ state — ví dụ cụ thể mục 7
  minh hoạ đúng luồng Chat → Dashboard qua `lastToolCall`).
- Constitution: `.specify/constitution.md`.
- Trial kết nối LLM API: `tools/llm-trial/` (bằng chứng Agent gọi được API trước khi implement
  đầy đủ module — checklist D1 mục 6).

## 8. Tiếp theo

`plan.md` và `tasks.md` cho module này được viết ở bước Plan/Tasks của quy trình SDD, sau khi
spec này qua Clarify + Checklist. `plan.md` và `tasks.md` đã có trong thư mục này.

## 9. Clarify

- **LLM API mock trả lỗi/timeout:** ViewModel (`useChatViewModel`) bắt lỗi từ `chatService`, thêm
  một message hệ thống dạng lỗi vào danh sách message ("Không nhận được phản hồi, thử lại") thay
  vì để UI treo; không tự động retry ngầm (nhất quán với quyết định ở 001 §9 — tránh vòng lặp lỗi
  vô hạn). Timeout cụ thể: 15s cho một lần gọi mock API trước khi coi là lỗi.
- **Người dùng submit nhiều prompt liên tiếp trước khi phản hồi trước hoàn tất:** Cho phép gửi tiếp
  (không khóa ô nhập) — mỗi prompt tạo một message độc lập trong danh sách, phản hồi được gắn với
  đúng prompt theo thứ tự gọi API (FIFO); không cần hàng đợi phức tạp vì mock API trả lời nhanh
  trong PoC.
- **Response streaming bị ngắt giữa chừng (network drop):** Hiển thị phần đã nhận được của message
  (partial content) kèm chỉ báo nhỏ "phản hồi bị ngắt" thay vì xoá mất nội dung đã stream — không
  tự động resume (ngoài phạm vi PoC).

## 10. Checklist

- [x] Mọi Functional Requirement (FR1–FR5) có Acceptance Criteria tương ứng kiểm thử được.
- [x] Non-Functional Requirement có ngưỡng đo được, khớp Quality Management của Project Charter.
- [x] Toàn bộ Edge Case ở mục 6 đã có quyết định xử lý ở mục 9.
- [x] Cam kết NDA (chỉ dữ liệu mẫu/dummy gửi LLM API) được nêu rõ trong FR2/NFR7 — không có yêu
      cầu nào ngụ ý dùng dữ liệu thật.
- [x] Phạm vi khớp Inclusions của Project Charter — không mở rộng sang backend orchestration hay
      lưu trữ lịch sử bền vững.
- [x] Sẵn sàng chuyển sang bước Plan.

## 11. Cơ chế ghép nối với Shell

Chat module là **remote Module Federation** trên Next.js 13.5.11 (`@module-federation/nextjs-mf`).
Giai đoạn Next.js 15.5 từng phải tạm chuyển sang Multi-Zones (`basePath`/`rewrites()`) vì Module
Federation không chạy được; sau khi thử lại thành công trên 13.5.11, repo quay lại Module Federation
— toàn bộ lịch sử quyết định, đánh đổi và hạn chế (chỉ render phía client, workaround config…) ở
`specs/001-shell-app/spec.md` §11 và `docs/findings/R2-module-federation-nextjs-approuter.md` §13.
FR5/AC4 ở trên mô tả đúng cơ chế hiện tại.
