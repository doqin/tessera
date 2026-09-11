# Spec: Application Shell (001-shell-app)

- **Status:** Implemented (foundation) — pivot sang Next.js Multi-Zones sau khi Module Federation
  thất bại ở runtime (xem §11 Amendment, `docs/findings/R2-module-federation-nextjs-approuter.md`)
- **Liên quan:** UIT.SE.66-D3 §3 (Application Shell), UIT.SE.66-D1 §4 (quy trình SDD),
  UIT.SE.66-D2 (Tech Stack)

## 1. WHY — User Story

Là người dùng cuối của AI Agent UI, tôi muốn có một khung ứng dụng nhất quán (navigation, layout)
tự động nạp đúng micro frontend module cho trang tôi đang xem, để tôi có trải nghiệm một giao diện
thống nhất dù các module được build và deploy độc lập.

## 2. Phạm vi

### Trong phạm vi (Inclusions — Project Charter)

- Layout dùng Next.js App Router: header, sidebar điều hướng, vùng mount nội dung chính.
- Routing tới `/chat` (Chat module) và `/dashboard` (Dashboard module).
- Integration Layer: route `/chat` sang zone Chat module qua `rewrites()` (Next.js Multi-Zones —
  xem §11 Amendment; ban đầu dự kiến Module Federation runtime import, đã pivot).
- Áp dụng shared design system (TailwindCSS + shadcn-ui) ở tầng shell.
- Khởi tạo global store (Zustand) tại Integration Layer, expose: session id hiện tại, tool call
  gần nhất (`lastToolCall`), trạng thái điều hướng.

### Ngoài phạm vi (Exclusions — Project Charter)

- Backend AI agent orchestration đầy đủ.
- Auth/bảo mật cấp production.
- Ứng dụng mobile native.
- Quy mô multi-tenant/enterprise thật.

## 3. Functional Requirements

- **FR1:** Shell PHẢI render header + sidebar navigation trên mọi route.
- **FR2 (amended, §11):** Khi điều hướng tới `/chat`, Shell PHẢI route đúng tới zone Chat module
  (qua `rewrites()`) — đây là hard navigation (Next.js Multi-Zones), không còn ràng buộc "không
  full page reload" như thiết kế Module Federation ban đầu.
- **FR3:** Khi điều hướng tới `/dashboard` (route nội bộ, cùng zone với Shell), soft navigation
  bình thường của Next.js App Router vẫn áp dụng.
- **FR4 (amended, §11):** Shell PHẢI expose một Zustand store dùng chung (`sessionId`,
  `lastToolCall`, `navState`), persist qua `localStorage` để zone tải sau (sau hard navigation)
  hydrate được giá trị gần nhất — không còn live-reactive giữa 2 zone khác nhau trong khi đang
  mounted đồng thời (bất khả thi dưới Multi-Zones, xem §11).
- **FR5:** Nếu route tới zone/module thất bại, Shell (hoặc chính zone đó) PHẢI hiển thị lỗi/fallback
  rõ ràng thay vì crash hoặc màn hình trắng không giải thích.

## 4. Non-Functional Requirements (theo Quality Management — Project Charter)

- **NFR1:** First Load < 3 giây.
- **NFR2 (amended, §11):** Độ trễ chuyển tiếp < 300ms áp dụng cho điều hướng **trong cùng 1 zone**
  (VD: Shell ⇄ `/dashboard`). Không áp dụng cho lượt băng qua zone khác (Shell → Chat module) —
  đây là hard navigation theo mô hình Multi-Zones, tốn thời gian tương đương First Load của zone
  đích (vẫn phải đạt NFR1 <3s ở zone đích).
- **NFR3:** Lighthouse Performance ≥ 80/100.
- **NFR4:** Responsive, tương thích Chrome/Firefox/Edge, tối thiểu 1366×768.
- **NFR5:** TypeScript strict mode; ESLint + Prettier pass trong CI.
- **NFR6:** Unit test coverage ≥ 70% (Jest + React Testing Library).

## 5. Acceptance Criteria

- **AC1:** Given shell app đã deploy, when người dùng mở URL gốc, then header + sidebar render
  xong trong ngân sách First Load (<3s).
- **AC2 (amended, §11):** Given người dùng click mục nav "Chat", when trình duyệt điều hướng tới
  `/chat`, then trang Chat module render đúng nội dung + chrome (header/sidebar) trong ngân sách
  First Load (<3s, NFR1) — không còn yêu cầu <300ms/không-reload (đó là hard navigation).
- **AC3:** Given người dùng click mục nav "Dashboard" (cùng zone Shell), when route đổi thành
  `/dashboard`, then trang render xong trong <300ms, không full page reload (soft navigation nội
  bộ zone vẫn giữ nguyên).
- **AC4 (amended, §11):** Given Chat module cập nhật `lastToolCall` trong store dùng chung, when
  người dùng sau đó điều hướng sang `/dashboard`, then Dashboard đọc được giá trị `lastToolCall`
  gần nhất từ `localStorage` lúc mount — không còn "tự re-render trong khi đang mounted" (2 zone
  không cùng runtime JS).
- **AC5:** Given zone Chat module không truy cập được (VD: server down, lỗi mạng ở tầng rewrite
  proxy), when người dùng điều hướng tới `/chat`, then trình duyệt/Shell hiển thị lỗi rõ ràng thay
  vì hành vi im lặng khó hiểu (Next.js mặc định trả lỗi proxy chuẩn; không cần Error Boundary
  phía client nữa vì không còn runtime import remote ở client).

## 6. Edge Cases (cần rà soát ở bước Clarify)

- Người dùng điều hướng rất nhanh giữa `/chat` và `/dashboard` trước khi module trước load xong.
- Cả 2 module cùng ghi vào `lastToolCall` gần như đồng thời (race condition).
- Remote bundle version không khớp giữa Shell và module (breaking change ở remote).

## 7. Dependencies / References

- Tech stack: Next.js (App Router) + TypeScript, **Next.js Multi-Zones** (đã pivot từ Module
  Federation — §11), TailwindCSS/shadcn-ui, Zustand (UIT.SE.66-D2 §4).
- Kiến trúc: UIT.SE.66-D3 §3–7 (mô hình 3 lớp MFE, MVVM trong module, mô hình chia sẻ state).
- Constitution: `.specify/constitution.md`.

## 8. Tiếp theo

`plan.md` và `tasks.md` cho module này được viết ở bước Plan/Tasks của quy trình SDD, sau khi
spec này qua Clarify + Checklist. Chưa thực hiện Implement khi thiếu `plan.md`/`tasks.md`.

## 9. Clarify

Rà soát các Edge Case ở mục 6, quyết định cụ thể cho từng trường hợp (self-review, thay peer
review theo Quality Management — Project Charter):

- **Điều hướng rất nhanh giữa `/chat` và `/dashboard` trước khi module trước load xong:** Integration
  Layer chỉ mount kết quả của lần điều hướng **mới nhất**; nếu một request load remote trước đó
  chưa resolve khi route đã đổi tiếp, kết quả trả về sau bị bỏ qua (không mount đè lên route hiện
  tại). Trong lúc remote đang load, vùng nội dung hiển thị trạng thái loading (không phải màn hình
  trắng) — không có debounce nhân tạo vì có thể vi phạm NFR2 (<300ms).
- **Cả 2 module cùng ghi `lastToolCall` gần như đồng thời:** Zustand `set()` đồng bộ trên
  main thread của trình duyệt (JS đơn luồng) nên không có race condition thực sự ở cấp code —
  áp dụng **last-write-wins** theo thứ tự lệnh gọi thực tế, không cần thêm cơ chế khóa/hàng đợi
  (giữ đúng nguyên tắc giới hạn phạm vi state ở mức tối thiểu, D3 §7).
- **Remote bundle version không khớp giữa Shell và module (breaking change ở remote):** Shell bắt
  lỗi khi `import()` remote thất bại (runtime error khi load `remoteEntry.js` hoặc khi gọi
  component không tồn tại) bằng Error Boundary quanh vùng mount, hiển thị fallback UI (FR5, AC5)
  kèm log lỗi ra console (không gửi lỗi lên service ngoài — ngoài phạm vi PoC). Không tự động
  retry ngầm để tránh vòng lặp lỗi vô hạn; người dùng có thể thử điều hướng lại thủ công.

## 10. Checklist

- [x] Mọi Functional Requirement (FR1–FR5) có Acceptance Criteria tương ứng kiểm thử được.
- [x] Non-Functional Requirement có ngưỡng đo được cụ thể (giây/ms/điểm số), khớp Quality
      Management của Project Charter.
- [x] Toàn bộ Edge Case ở mục 6 đã có quyết định xử lý ở mục 9 — không còn ambiguous requirement.
- [x] Không có yêu cầu bảo mật production nằm ngoài Exclusions (đối chiếu Project Charter).
- [x] Phạm vi khớp Inclusions của Project Charter — không mở rộng ngoài shell layout + routing +
      Module Federation host + Zustand store dùng chung.
- [x] Sẵn sàng chuyển sang bước Plan.

## 11. Amendment (sau Implement) — pivot sang Next.js Multi-Zones

Trong lúc thực hiện `tasks.md` (foundation), Module Federation (`@module-federation/nextjs-mf` rồi
`@module-federation/enhanced`) liên tục gặp lỗi build-time và runtime không tự khắc phục được
trong ngân sách thời gian hợp lý — kết thúc bằng một lỗi runtime sâu trong cơ chế
"attach webpack chunk" của `@module-federation/runtime` không tương thích với container Next.js
App Router sinh ra. Toàn bộ quá trình, bằng chứng lỗi cụ thể, và phân tích nguyên nhân được ghi lại
đầy đủ tại `docs/findings/R2-module-federation-nextjs-approuter.md` — tài liệu này là minh chứng
thực tế cho rủi ro **R2** trong Risk Management (Project Charter), với mitigation đã chốt sẵn từ
D2 §3.

**Quyết định (xác nhận bởi người dùng):** pivot sang **Next.js Multi-Zones** — phương án dự phòng
đã chốt. FR2, FR4, NFR2, AC2, AC4, AC5 ở trên đã được sửa trực tiếp (đánh dấu "amended, §11") để
phản ánh đúng hành vi hệ thống sau pivot, thay vì giữ nguyên yêu cầu không còn khả thi. Mô hình 3
lớp (Constitution §2, D3 §3) không đổi — chỉ đổi cơ chế Integration Layer nạp module (route-based
qua `rewrites()` thay vì runtime import qua Module Federation), đúng như D3 §5 đã dự kiến trước
cho chính tình huống này.
