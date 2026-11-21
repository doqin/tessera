# Spec: UI/UX Redesign & Presentation Features (004-ui-ux-redesign)

- **Status:** Implemented — dùng cho báo cáo/demo cuối kỳ (xem `tasks.md`)
- **Liên quan:** `specs/001-shell-app/`, `specs/002-chat-module/`, `specs/003-dashboard-module/`,
  `.specify/constitution.md` §2, §4, §7, §8
- **Bối cảnh:** PoC đã chạy đúng kiến trúc (Module Federation + Integration Layer) nhưng giao diện
  còn ở mức khung tối thiểu. Spec này nâng phần nhìn và bổ sung tính năng trình diễn **mà không
  thay đổi kiến trúc 3 lớp, không thêm dependency, không mở rộng ngoài Inclusions**.

## 1. WHY — User Story

Là người trình bày đồ án, tôi muốn sản phẩm trông và hoạt động như một ứng dụng AI console thật
(điều hướng rõ ràng, trạng thái sống, phản hồi có cấu trúc, số liệu tool call), để người xem thấy
được giá trị của kiến trúc Micro Frontend chứ không chỉ đọc slide.

Là người dùng cuối, tôi muốn giao diện sáng/tối, tiếng Việt/tiếng Anh, thao tác bàn phím và thông
tin trạng thái nhất quán giữa Shell và các module — dù chúng được build và deploy độc lập.

## 2. Phạm vi

### Trong phạm vi

- **Lớp giao diện mới** phủ lên dqcss (design system đã chốt) bằng cách ghi đè token + thêm class
  `ts-*` trong `packages/shared-ui/src/theme.css` — light-first, dark mode, viền 1px, không gradient.
- **Bản sắc thị giác "instrument"**: nền trung tính (xám nhạt → trắng) + mực + một tín hiệu
  vermilion; hệ chữ Be Vietnam Pro cho display/UI và Roboto Mono cho dữ liệu máy; status bar là dải
  mực neo nhận diện ở đáy mọi trang. Không còn serif/cream "sổ tay".
- **Shell chrome**: top bar 3 ô (ô giữa là ô tìm kiếm mở command palette, bên phải là nút Cài đặt —
  không brand, không breadcrumb, không toggle theme/ngôn ngữ), sidebar thu gọn được về rail icon
  72 px (chỉ nav, không panel phiên/tool call), status bar (route, session, số tool call, tool gần
  nhất, stack). Dưới 900 px nav thành drawer mở bằng nút hamburger; nút Cài đặt luôn bấm được
  (top bar đổi sang `auto · 1fr · auto`).
- **Trang `/settings`**: gom theme + ngôn ngữ + thông tin phiên về một chỗ, để top bar chỉ còn một
  việc.
- **Command palette** (Ctrl/Cmd+K): điều hướng, đổi theme, xoá lịch sử tool, đổi ngôn ngữ.
- **i18n VI/EN** cho Shell và cả 2 remote (dictionary nội bộ, không thêm thư viện).
- **Theme sáng/tối** có lưu lựa chọn, chống nháy trắng khi tải trang.
- **Chat module**: trạng thái rỗng có gợi ý, render Markdown tối giản, sao chép / tạo lại / thử
  lại, dừng stream, timestamp + thời gian xử lý + badge tool, textarea Enter/Shift+Enter, đếm ký tự,
  tự cuộn, **kết quả tool hiển thị ngay trong transcript** (card đọc được: thời tiết, danh sách tài
  liệu, hoặc JSON) và **xuất bản ghi hội thoại ra `.md`**.
- **Dashboard module**: KPI (tổng lượt gọi, tỷ lệ thành công, độ trễ TB, số tool khác nhau), dòng
  thời gian tool call, tìm kiếm + lọc theo trạng thái, panel chi tiết (tham số/kết quả/metadata,
  sao chép JSON), nút xoá lịch sử.
- **Trang `/overview`** trong Shell mô tả kiến trúc 3 lớp dưới dạng **một stack tuần tự** (không phải
  lưới 4 thẻ) + dải luồng chạy 4 bước + danh sách quyết định (phục vụ thuyết trình).
- **Mở rộng Integration Layer**: `toolCallHistory` (tối đa 50, trong phiên), `locale`, và
  `chatTranscript` (tối đa 200 message, debounce 300 ms) để hội thoại sống qua điều hướng.
- **Xác nhận thao tác phá huỷ**: nút xoá lịch sử ở Dashboard dùng bước xác nhận tại chỗ (lên cò 4 s)
  thay vì xoá ngay.
- **Khung app cao đúng viewport**: `.ts-app` là `100dvh`, chỉ vùng nội dung cuộn — không còn thanh
  cuộn trang phía sau panel chat.

### Ngoài phạm vi

- Thêm thư viện UI/i18n/markdown/icon mới (constitution §4).
- Auth, multi-tenant, backend orchestration, mobile native (Project Charter Exclusions).
- Lưu lịch sử chat/tool bền vững phía server (chỉ localStorage theo phiên).
- Đổi framework/phiên bản Next.js, đổi cơ chế ghép nối Module Federation.

## 3. Functional Requirements

- **FR1 (Design system):** Mọi app PHẢI dùng chung `packages/shared-ui` (theme + component). Không
  app nào tự định nghĩa palette riêng; thay đổi token ảnh hưởng cả Shell và remote. Palette PHẢI là
  bộ trung tính + vermilion trong `theme.css` (không indigo-600 + slate, không cream/beige), chữ PHẢI
  là Be Vietnam Pro + Roboto Mono, và mọi surface PHẢI phẳng (không gradient, không backdrop-blur,
  không bóng mềm nhiều lớp). Font variable PHẢI đặt trên `<html>`, không phải `<body>`.
- **FR2 (Shell chrome):** Shell PHẢI render top bar + sidebar + status bar trên mọi route. Top bar
  PHẢI có ô tìm kiếm ở giữa (mở command palette) và đúng một nút Cài đặt bên phải; KHÔNG brand,
  KHÔNG breadcrumb, KHÔNG toggle theme/ngôn ngữ. Sidebar PHẢI có Chat, Dashboard, Kiến trúc; thu gọn
  được về rail icon 72 px và nhớ trạng thái. Dưới 900 px sidebar PHẢI là drawer mở bằng hamburger
  (đóng bằng scrim, Escape hoặc khi đổi route) thay vì thanh ngang dưới header; nút Cài đặt PHẢI
  hiển thị và bấm được ở 390 px. App cao `100dvh`, chỉ nội dung cuộn.
- **FR3 (Command palette):** Ctrl/Cmd+K PHẢI mở bảng lệnh; hỗ trợ lọc theo từ khoá, ↑/↓, Enter,
  Escape, click ra ngoài để đóng.
- **FR4 (Theme):** Người dùng PHẢI chuyển được sáng/tối từ `/settings` hoặc bảng lệnh; lựa chọn
  PHẢI được lưu và áp lại trước khi React hydrate. Dark theme PHẢI dịu (nền than, không đen tuyền;
  tương phản thân chữ khoảng 10–11:1, không phải 14:1).
- **FR5 (i18n):** Người dùng PHẢI chuyển VI/EN từ `/settings`; toàn bộ chuỗi UI của Shell, Chat và
  Dashboard PHẢI đổi ngay, không cần tải lại trang.
- **FR6 (Chat UX):** Khi chưa có message PHẢI hiện trạng thái rỗng kèm gợi ý bấm được; phản hồi
  agent PHẢI render **đậm/nghiêng/inline code/code block/danh sách/trích dẫn/link an toàn**; mỗi
  message agent PHẢI có sao chép và tạo lại; message lỗi PHẢI có thử lại; đang stream PHẢI có nút
  dừng và con trỏ stream; ô nhập PHẢI hỗ trợ Enter gửi, Shift+Enter xuống dòng, đếm ký tự. Khi
  agent gọi tool, câu trả lời PHẢI đọc được ngay trong transcript (mô tả kết quả) và kèm card kết
  quả tool; KHÔNG được chỉ dẫn người dùng sang Dashboard để xem kết quả.
- **FR7 (Dashboard analytics):** Dashboard PHẢI hiển thị KPI tính từ lịch sử với **một điểm vào thị
  giác** (tổng lượt gọi là hero, ba chỉ số còn lại là dải readout — không phải 4 thẻ bằng nhau), dòng
  thời gian các lượt gọi (mới nhất trước), lọc theo trạng thái + tìm kiếm theo tên/tham số/kết quả,
  panel chi tiết có sao chép JSON, và nút xoá lịch sử **có bước xác nhận**.
- **FR8 (Integration Layer):** Store PHẢI giữ `toolCallHistory` (tối đa 50, khử trùng theo `id`,
  mới nhất ở cuối) và `locale`; `setLastToolCall` giữ nguyên hành vi last-write-wins và đồng thời
  ghi vào lịch sử.
- **FR9 (Overview):** Route `/overview` PHẢI mô tả 3 lớp dưới dạng stack tuần tự (thứ bậc lồng nhau,
  không phải lưới thẻ), dải luồng runtime 4 bước và các quyết định thiết kế — song ngữ như phần còn
  lại của UI.
- **FR10 (Accessibility):** Mọi nút chỉ có icon PHẢI có `aria-label`; bảng lệnh PHẢI là dialog có
  `aria-modal`; trạng thái chọn PHẢI dùng `aria-current`/`aria-pressed`; PHẢI tôn trọng
  `prefers-reduced-motion`.
- **FR11 (Responsive):** Ở ≤900 px sidebar thành drawer + hamburger + scrim (nút thu gọn rail ẩn),
  status bar ẩn, top bar dùng `auto · 1fr · auto`; Dashboard về 1 cột; ở ≤640 px nút trong header
  chat chỉ còn icon; Chat/Prompt vẫn dùng được ở 360×640 mà không sinh cuộn trang.
- **FR12 (Không hồi quy):** Toàn bộ FR/AC của 001–003 PHẢI còn đúng: fallback khi remote down, store
  singleton, MVVM, soft navigation không reload, dữ liệu mẫu khi gọi LLM.
- **FR13 (Export transcript):** Khi có ít nhất một message, Chat PHẢI cho tải bản ghi hội thoại dạng
  Markdown, gồm vai trò, thời điểm, tool + thời gian xử lý (nếu có), trạng thái lượt bị ngắt; nội
  dung model giữ nguyên văn, không render HTML.
- **FR14 (Settings):** `/settings` PHẢI chứa theme, ngôn ngữ và thông tin phiên (mã phiên, số tool
  call); mọi thay đổi PHẢI áp ngay và có `aria-pressed` cho lựa chọn hiện tại.

## 4. Non-Functional Requirements

- **NFR1:** Không thêm dependency runtime/build mới (constitution §4). Markdown, i18n, icon, theme
  đều viết trong repo.
- **NFR2:** TypeScript strict; ESLint + Prettier pass.
- **NFR3:** Unit test coverage toàn repo ≥70% (thực đo sau thay đổi: ~96% statements).
- **NFR4:** Không lỗi hydration: mọi giá trị chỉ có ở client (`localStorage`, `navigator`) PHẢI được
  áp sau khi mount hoặc render với giá trị mặc định giống server.
- **NFR5:** Giữ ngân sách hiệu năng của 001: First Load <3 s, điều hướng mềm <300 ms, Lighthouse
  ≥80.
- **NFR6:** Không `dangerouslySetInnerHTML` cho nội dung do model trả về.
- **NFR7 (sửa sau critique):** Text thường phải đạt tương phản ≥4.5:1 trên mọi surface light/dark;
  micro-text chức năng (label, meta, kbd, badge) không nhỏ hơn 12 px (`0.75rem`).
- **NFR8 (bản sắc, sửa sau audit "quá AI-generated"):** UI KHÔNG được trùng với khuôn mẫu dashboard
  AI mặc định (indigo-600 + slate + Inter + thẻ bo mềm đổ bóng). Phải kiểm bằng "category-interchangeable
  test": bỏ chữ tiếng Việt đi, giao diện vẫn nhận ra là console quan sát tool call của agent. Không
  lưới thẻ bằng nhau làm cấu trúc trang, không trang trí không mang thông tin (dot-grid, glass blur,
  gradient avatar, icon lấp lánh).

## 5. Acceptance Criteria

- **AC1:** Mở `/chat` → thấy ô tìm kiếm ở giữa top bar, nút Cài đặt bên phải, sidebar 3 mục (mục
  Chat đang active); không có brand/breadcrumb; status bar hiển thị route + phiên + số tool call;
  toàn trang không có thanh cuộn dọc (chat vừa viewport).
- **AC2:** Bấm Ctrl/Cmd+K → bảng lệnh mở, gõ "dash" → chọn Dashboard → điều hướng mềm tới
  `/dashboard`, không reload.
- **AC3:** Vào `/settings`, chọn Tối → toàn bộ UI đổi tối ngay; tải lại trang vẫn ở dark mode và
  không nháy trắng; chữ trên nền tối vẫn đọc thoải mái (không đen tuyền).
- **AC4:** Vào `/settings`, bấm EN → toàn bộ UI (shell, sidebar, status bar, Chat, Dashboard) đổi
  sang tiếng Anh ngay; bấm VI đổi lại.
- **AC5:** Ở trạng thái rỗng của Chat, bấm một gợi ý → prompt được gửi và phản hồi stream hiện dần;
  trong lúc stream có nút Dừng; bấm Dừng → phần đã nhận giữ lại với nhãn "bị ngắt".
- **AC6:** Phản hồi agent chứa Markdown (`**đậm**`, code fence, danh sách) → hiển thị đúng cấu trúc,
  không hiện ký tự `**`/``` ``.
- **AC7:** Sau khi agent gọi tool → Dashboard tự cập nhật: KPI +1, dòng thời gian có mục mới, panel
  chi tiết hiện tham số/kết quả; nút "Sao chép JSON" copy đúng payload.
- **AC8:** Dashboard: gõ từ khoá vào ô tìm kiếm và/hoặc chọn lọc "Lỗi" → danh sách thu hẹp đúng;
  bấm xoá lịch sử → nút chuyển sang "Xác nhận?" (không xoá ngay); bấm lần hai → về trạng thái rỗng
  và store cũng rỗng; rời đi quá 4 s → nút trở lại bình thường.
- **AC9:** Truy cập `/overview` → thấy 4 lớp dưới dạng stack tuần tự, dải 4 bước luồng, danh sách
  quyết định; đổi ngôn ngữ đổi nội dung.
- **AC10:** Có hội thoại → bấm "Xuất .md" → tải về file Markdown có đủ các lượt và metadata tool;
  bản ghi khớp nội dung đang hiển thị.
- **AC11:** Dừng server Dashboard remote rồi mở `/dashboard` → vẫn thấy fallback như 001 AC5, với
  giao diện mới và nút tải lại.
- **AC12:** Agent gọi `get_weather` → bong bóng trả lời nêu kết quả (ví dụ "Hà Nội hiện 28°C, nhiều
  mây.") và có card kết quả tool ngay dưới; không có câu "xem Dashboard".
- **AC13:** Bấm "Thu gọn menu" ở đáy sidebar → rail thu về 72 px, chỉ còn icon (link vẫn bấm được);
  tải lại trang vẫn thu gọn. Ở ≤900 px nút này ẩn.
- **AC14:** Ở 390×844, nút Cài đặt hiển thị đủ 36×36 và mở được `/settings`; bấm hamburger → drawer
  nav trượt vào, có scrim; bấm một mục → điều hướng và drawer tự đóng.

## 6. Edge Cases (đã xử lý — §9)

- Chuyển ngôn ngữ khi đang stream phản hồi.
- Lịch sử tool vượt 50 phần tử.
- Tool call trùng `id` (retry/regenerate cùng prompt).
- `toolCallHistory` rỗng nhưng `lastToolCall` có (dữ liệu cũ từ localStorage trước khi nâng cấp).
- `localStorage` bị chặn (private mode).
- Link có scheme nguy hiểm trong phản hồi model.
- Màn hình ≤360 px.

## 7. Dependencies / References

- Tech stack: dqcss `@doqin/dqcss` (đã chốt), Next.js 13.5.11, React 18.2, Zustand, Jest + RTL,
  Playwright — không thêm gì mới.
- Kiến trúc: `UIT.SE.66-D3` §3, §6, §7; constitution §2 (Integration Layer), §4 (dependency), §7
  (scope), §8 (SDD).
- Spec liên quan: 001 (shell), 002 (chat), 003 (dashboard).

## 8. Clarify

- **Vì sao locale nằm trong store chứ không phải React context?** Context không đi qua ranh giới
  remote (mỗi remote là bundle riêng). Store `@tessera/integration-store` đã là singleton chia sẻ
  qua Module Federation nên locale đổi ở Shell là đổi ngay trong module.
- **Vì sao vẫn giữ copy tiếng Việt mặc định?** Đồ án và người dùng cuối là người Việt; e2e/unit test
  hiện có bám theo chuỗi tiếng Việt. EN là lựa chọn phụ.
- **Markdown ở mức nào?** Chỉ tập con an toàn (heading, list, quote, code fence, bold/italic/inline
  code/link). Không HTML thô, không bảng, không ảnh — đủ cho phản hồi agent của PoC.
- **Dừng stream xử lý thế nào?** `AbortController` ở ViewModel; phần đã nhận giữ lại với
  `status: "interrupted"` (khớp Clarify 002 §9), không ghi `lastToolCall` cho lượt bị huỷ.
- **Vì sao lịch sử 50 phần tử?** Đủ cho demo và KPI, vẫn là "trong phiên" (không phải kho dữ liệu);
  cắt theo kiểu FIFO để localStorage không phình.
- **Theme chống nháy trắng ra sao?** Script nhỏ trong `<head>` đọc `localStorage` và đặt
  `data-theme` trước khi React hydrate; component toggle chỉ đồng bộ lại state.
- **Trang `/overview` có vi phạm scope?** Không — đây là nội dung tĩnh của Shell, không phải module
  MFE mới, không gọi API, phục vụ chính báo cáo.
- **Vì sao đổi khỏi indigo/slate?** Audit chỉ ra bộ indigo-600 + slate + Inter + thẻ bo mềm là khuôn
  mẫu mặc định của mọi sản phẩm AI; nó không nói gì về sản phẩm này. Giấy ấm + mực + vermilion lấy
  từ chính thế giới của sản phẩm (sổ tay thí nghiệm: quan sát, ghi chép, một dấu hiệu duy nhất khi
  có sự kiện). Tương phản vẫn được kiểm trên mọi surface ở cả hai theme (NFR7).
- **Vì sao KPI không còn 4 thẻ bằng nhau?** Bốn thẻ cùng cỡ khiến mắt không có điểm vào. Tổng lượt
  gọi là câu hỏi chính của màn hình nên được làm hero; ba chỉ số còn lại là readout phụ.
- **Vì sao xoá lịch sử cần xác nhận?** Đây là thao tác không hoàn tác được và phá dữ liệu trình diễn;
  bước xác nhận tại chỗ rẻ hơn modal và không rời ngữ cảnh.

## 9. Checklist

- [x] Mọi FR (1–12) có AC kiểm thử được hoặc có test tương ứng.
- [x] NFR có ngưỡng đo và đã kiểm (coverage, lint, typecheck, build).
- [x] Toàn bộ edge case ở §6 có quyết định ở §8.
- [x] Không thêm dependency; không vượt Project Charter Inclusions.
- [x] Không thay đổi ranh giới 3 lớp / cơ chế Module Federation.
- [x] Spec 001–003 được cập nhật tham chiếu tới spec này.
