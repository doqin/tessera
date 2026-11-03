# Spec: Application Shell (001-shell-app)

- **Status:** Implemented (foundation) — Module Federation trên Next.js 13.5.11 (xem §11 Lịch sử
  quyết định, `docs/findings/R2-module-federation-nextjs-approuter.md`)
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
- Integration Layer: Shell là **host Module Federation**, route `/chat` nạp remote
  `chat_module/ChatModule` lúc runtime (client-only — §11).
- Áp dụng shared design system (dqcss + theme Groq trong `packages/shared-ui`) ở tầng shell.
- Khởi tạo global store (Zustand) tại Integration Layer, expose: session id hiện tại, tool call
  gần nhất (`lastToolCall`), trạng thái điều hướng.

### Ngoài phạm vi (Exclusions — Project Charter)

- Backend AI agent orchestration đầy đủ.
- Auth/bảo mật cấp production.
- Ứng dụng mobile native.
- Quy mô multi-tenant/enterprise thật.

## 3. Functional Requirements

- **FR1:** Shell PHẢI render header + sidebar navigation trên mọi route.
- **FR2:** Khi điều hướng tới `/chat`, Shell PHẢI nạp remote Chat module (Module Federation) và
  mount vào vùng nội dung bằng điều hướng mềm (soft navigation, không full page reload).
- **FR3:** Khi điều hướng tới `/dashboard`, soft navigation của Next.js App Router áp dụng; nội dung
  là remote thứ hai — Dashboard module (spec 003).
- **FR4:** Shell PHẢI expose một Zustand store dùng chung (`sessionId`, `lastToolCall`,
  `navState`) tại Integration Layer, chia sẻ singleton giữa Shell và các remote qua cấu hình
  `shared` của Module Federation, đồng thời persist qua `localStorage` để giữ giá trị sau khi
  tải lại trang. (Store singleton đã kiểm chứng trong browser 2026-11-03 — Shell và remote cùng
  ghi vào một instance; re-render live khi một component khác đọc `lastToolCall` vẫn chờ Dashboard,
  tasks T016.)
- **FR5:** Nếu remote không nạp được (server down, lỗi mạng, container lỗi), Shell PHẢI hiển thị
  lỗi/fallback rõ ràng thay vì crash hoặc vùng trống không giải thích, và giữ nguyên header/sidebar.

## 4. Non-Functional Requirements (theo Quality Management — Project Charter)

- **NFR1:** First Load < 3 giây.
- **NFR2:** Độ trễ chuyển tiếp giữa các route < 300ms (điều hướng mềm, không reload — gồm cả lần
  nạp remote đã được cache).
- **NFR3:** Lighthouse Performance ≥ 80/100.
- **NFR4:** Responsive, tương thích Chrome/Firefox/Edge, tối thiểu 1366×768.
- **NFR5:** TypeScript strict mode; ESLint + Prettier pass trong CI.
- **NFR6:** Unit test coverage ≥ 70% (Jest + React Testing Library).

## 5. Acceptance Criteria

- **AC1:** Given shell app đã deploy, when người dùng mở URL gốc, then header + sidebar render
  xong trong ngân sách First Load (<3s).
- **AC2:** Given người dùng click mục nav "Chat", when route đổi thành `/chat`, then Chat module
  (remote) được nạp và render đúng nội dung trong vùng nội dung của Shell, header/sidebar giữ
  nguyên, không full page reload.
- **AC3:** Given người dùng click mục nav "Dashboard", when route đổi thành `/dashboard`, then
  trang render xong trong <300ms, không full page reload.
- **AC4:** Given Chat module cập nhật `lastToolCall` trong store dùng chung, when module khác
  (Dashboard — khi có) đang mounted hoặc mount sau đó, then đọc được `lastToolCall` mới nhất (qua
  store singleton chia sẻ; sau khi tải lại trang thì qua `localStorage`). Đã kiểm chứng Shell và
  remote cùng ghi vào một store instance trong browser (2026-11-03); phần đọc live phía Dashboard
  chờ 003 T015.
- **AC5:** Given server Chat module không truy cập được, when người dùng điều hướng tới `/chat`,
  then vùng nội dung hiển thị thông báo lỗi nêu tên module kèm nút tải lại trang, header/sidebar vẫn
  hoạt động (`RemoteModuleBoundary` + runtime plugin báo lỗi của Shell).

## 6. Edge Cases (cần rà soát ở bước Clarify)

- Người dùng điều hướng rất nhanh giữa `/chat` và `/dashboard` trước khi module trước load xong.
- Cả 2 module cùng ghi vào `lastToolCall` gần như đồng thời (race condition).
- Remote bundle version không khớp giữa Shell và module (breaking change ở remote).

## 7. Dependencies / References

- Tech stack: Next.js 13.5.11 (App Router) + TypeScript, **Module Federation**
  (`@module-federation/nextjs-mf`, §11), dqcss, Zustand (UIT.SE.66-D2 §4).
- Kiến trúc: UIT.SE.66-D3 §3–7 (mô hình 3 lớp MFE, MVVM trong module, mô hình chia sẻ state).
- Constitution: `.specify/constitution.md`.

## 8. Tiếp theo

`plan.md` và `tasks.md` cho module này được viết ở bước Plan/Tasks của quy trình SDD, sau khi
spec này qua Clarify + Checklist. `plan.md` và `tasks.md` đã có trong thư mục này.

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
      Module Federation host + Zustand store dùng chung (khớp thiết kế hiện tại — §11).
- [x] Sẵn sàng chuyển sang bước Plan.

## 11. Lịch sử quyết định — cơ chế Integration Layer

1. **Dự kiến ban đầu:** Module Federation (`@module-federation/nextjs-mf`) trên Next.js App Router.
2. **Thử trên Next.js 15.5 → thất bại:** `nextjs-mf` ở chế độ bảo trì (không hỗ trợ App Router) và
   chuỗi lỗi build/runtime không khắc phục được trong ngân sách thời gian. Kích hoạt mitigation R2
   (D2 §3): tạm thời chuyển sang **Next.js Multi-Zones** (`rewrites()` + `basePath`), kéo theo
   việc sửa FR2/FR4/NFR2/AC2/AC4/AC5 (hard navigation, store chỉ hydrate qua `localStorage`).
3. **Thử lại trên Next.js 13.5.11 → thành công (quyết định hiện tại):** Module Federation chạy được
   trên 13.5.11 với một số workaround (bỏ guard App Router của plugin, federation chỉ ở client,
   chia sẻ React vendored của Next, ghim webpack/React…). Do đó **hạ cấp Next.js 15.5 → 13.5.11 và
   quay lại Module Federation**; các yêu cầu bị nới ở bước 2 được khôi phục về dạng gốc (FR2–FR5,
   NFR2, AC2–AC5 ở trên), riêng FR4/AC4/FR5/AC5 viết lại theo cơ chế thật.

**Đánh đổi chấp nhận:** Next.js 13.5/React 18 (không hưởng tính năng 14/15); remote chỉ render phía
client (không SSR); phụ thuộc vào workaround trên nội bộ của `nextjs-mf`/Next.js (mong manh khi nâng
phiên bản); CSS của remote lấy từ dqcss được import toàn cục ở Shell. Mô hình 3 lớp
(Constitution §2, D3 §3) không đổi. Phương án dự phòng Multi-Zones vẫn còn trong lịch sử git
(commit `f942392`). Bằng chứng kỹ thuật đầy đủ, từng workaround và hạn chế còn lại:
`docs/findings/R2-module-federation-nextjs-approuter.md` §13.
