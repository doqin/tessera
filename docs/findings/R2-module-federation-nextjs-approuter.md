# Ghi nhận rủi ro R2 (thực tế): Module Federation trên Next.js App Router

- **Liên quan:** Risk Management — Project Charter (R2: "Next.js hỗ trợ Module Federation còn hạn
  chế/thử nghiệm"), `UIT.SE.66-D2-TechStackFoundation` §3 (ma trận đánh giá + mitigation), §7
  (checklist "Cấu hình Module Federation cho Shell (host) và Chat module (remote) — build thử,
  load remote thành công").
- **Mục đích tài liệu:** Ghi lại đầy đủ quá trình thử nghiệm Module Federation thật (không phải
  giả định lý thuyết trong ma trận D2 §3) trong giai đoạn "D2 Foundation Setup" — làm bằng chứng
  cụ thể cho rủi ro R2 đã **xảy ra thật** và mitigation đã được kích hoạt đúng quy trình đề ra.
  Nội dung này dùng được trực tiếp cho phần "Risk Management" / "Bài học kinh nghiệm" của báo cáo
  đồ án.
- **Kết quả cuối:** Pivot sang **Next.js Multi-Zones** (phương án dự phòng đã chốt sẵn ở D2 §3) —
  xem hệ quả kiến trúc ở mục 8.

## 1. Bối cảnh

Tech Stack đã chốt (Project Charter, D2 §4) chọn **Module Federation
(`@module-federation/nextjs-mf`)** làm phương án chính để tích hợp Shell (host) với Chat module
(remote), trên nền **Next.js App Router**. D2 §3 đã đối chiếu 3 phương án và ghi nhận rủi ro R2 với
mitigation: "Next.js Multi-Zones được chuẩn bị sẵn làm phương án dự phòng ... nếu Module Federation
phát sinh lỗi runtime không kiểm soát được trong thời gian cho phép."

Khi thực hiện checklist D2 §7 mục 3 ("Cấu hình Module Federation ... build thử, load remote thành
công"), rủi ro R2 đã xảy ra thật qua một chuỗi vấn đề kỹ thuật cụ thể, trình bày theo thứ tự phát
sinh dưới đây.

## 2. Phát hiện 1 — `@module-federation/nextjs-mf` đã ngừng phát triển cho App Router

`npm view @module-federation/nextjs-mf readme` trả về:

```
# Next.js Support is in maintenance mode
Read about it here: https://github.com/module-federation/core/issues/3153
```

Đọc GitHub issue `module-federation/core#3153` (maintainer của Module Federation xác nhận):

- Next.js core team không hợp tác duy trì tích hợp MF → team MF quyết định ngừng đầu tư.
- **App Router không được hỗ trợ** — chỉ Pages Router còn nhận backport fix nhỏ.
- 3 hướng thay thế được đề xuất chính thức: (a) đổi framework (Modern.js/Remix/TanStack), (b) liên
  hệ trực tiếp Vercel, (c) **dùng thẳng Module Federation runtime** (`@module-federation/runtime`)
  thay vì compiler plugin tiện dụng.

→ Không dùng được `@module-federation/nextjs-mf` như Tech Stack đã ghi (dù vẫn là Module
Federation nói chung — không vi phạm Constitution §4 về mặt "chọn công nghệ", chỉ đổi package cụ
thể trong cùng hướng tiếp cận). Quyết định (được người dùng xác nhận trực tiếp, xem AskUserQuestion
trong phiên làm việc): thử hướng (c) — dùng `@module-federation/enhanced` (package kế thừa,
activel maintained, cung cấp cả webpack plugin gốc lẫn runtime API) thay vì đổi hẳn sang Multi-Zones
ngay — vì đây vẫn là nỗ lực giữ đúng phương án chính đã chốt trước khi kích hoạt phương án dự
phòng.

## 3. Vấn đề — Next.js 16 không tương thích

`npm view @module-federation/nextjs-mf peerDependencies` (và tương tự cho `@module-federation/enhanced`
qua `webpack: ^5.0.0`) cho thấy hỗ trợ `next: "^12 || ^13 || ^14 || ^15"` — **không có Next 16**
(bản `create-next-app@latest` tại thời điểm thực hiện, 2026-09). Scaffold cả 2 app trên **Next.js
15.5.25** (pin cụ thể) để giữ khả năng tương thích.

## 4. Vấn đề — `Cannot find module 'webpack/lib/util/memoize'`

Lần build đầu tiên (`next build` cho `apps/chat-module`) lỗi ngay khi load `next.config.ts`:

```
Error: Cannot find module 'webpack/lib/util/memoize'
Require stack:
- .../node_modules/@module-federation/enhanced/dist/src/utils.js
...
```

Nguyên nhân: `@module-federation/enhanced`'s webpack-plugin code gọi thẳng
`require("webpack/lib/util/memoize")` — một module nội bộ của package `webpack`. Next.js tự bundle
webpack riêng (`next/dist/compiled/webpack/...`), không expose `webpack` như một package thường
resolve được ở `node_modules/webpack`. **Khắc phục:** thêm `webpack@^5.110.3` làm devDependency
tường minh cho app nào thật sự dùng nhánh webpack-plugin (`apps/chat-module`, phía expose).

## 5. Vấn đề — `Module parse failed` cho `packages/shared-ui` / `packages/integration-store`

Sau khi build qua được bước MF plugin, webpack báo lỗi parse cú pháp TypeScript export type khi
import 2 package nội bộ (monorepo, không qua bước build riêng). Next.js mặc định chỉ áp dụng
loader (SWC/TS) cho code trong chính app đó, không cho code ngoài (kể cả package workspace nội bộ
nằm ngoài thư mục app). **Khắc phục:** thêm `transpilePackages: ["@tessera/shared-ui",
"@tessera/integration-store"]` vào `next.config.ts` của cả 2 app — đây là API chính thức của
Next.js cho đúng tình huống monorepo này, không phải hack.

## 6. Vấn đề — Host không resolve được remote lúc `next build`

Sau khi remote (`apps/chat-module`) build thành công (tạo `remoteEntry.js` + DTS liên thông), cấu
hình host (`apps/shell`) với `ModuleFederationPlugin({ remotes: { chat_module: "..." } })` rồi gọi
`import("chat_module/ChatModule")` trong `app/chat/page.tsx` (qua `next/dynamic`) → build báo lỗi:

```
Module not found: Can't resolve 'chat_module/ChatModule'
```

Debug bằng `console.log` trong hook `webpack()` xác nhận plugin **có** được đăng ký đúng cho
compiler `client` (`isServer: false`) — nghĩa là `ContainerReferencePlugin` (phần xử lý `remotes`
của `ModuleFederationPlugin`) không intercept đúng request dạng bare-specifier remote trong build
pipeline của `next build` (App Router), dù cấu hình đúng theo tài liệu webpack5 MF cổ điển.

**Khắc phục:** bỏ hẳn `ModuleFederationPlugin({ remotes })` ở host, chuyển sang
**`@module-federation/enhanced/runtime`** (`init()` + `loadRemote()`) — API JS thuần chạy lúc
runtime trong trình duyệt (fetch + eval `remoteEntry.js` thủ công qua SDK), không cần webpack
build-time resolve chuỗi remote. Đây chính là hướng (c) mà GitHub issue #3153 gợi ý.

## 7. Vấn đề — Type mismatch cho `shared` ở runtime API

`init({ shared: { react: { singleton: true, requiredVersion: false } } })` báo lỗi TypeScript:
`Object literal may only specify known properties, and 'singleton' does not exist in type
'ShareArgs | ShareArgs[]'`. Runtime API (`@module-federation/runtime-core`) dùng shape khác
webpack-plugin: `{ lib: () => <module đã import>, shareConfig: { singleton, requiredVersion } }`
thay vì `{ singleton, requiredVersion }` phẳng. **Khắc phục:** import trực tiếp `react`/`react-dom`
trong host, cung cấp qua `lib: () => ReactRuntime`.

## 8. Vấn đề (mấu chốt, dẫn tới quyết định pivot) — `output.uniqueName` trùng giữa 2 app

Sau khi build qua hết các bước trên, chạy thử thật trên trình duyệt (2 dev server song song, port
3000 + 3001) cho lỗi runtime:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'call')
  at http://localhost:3001/_next/static/chunks/remoteEntry.js:11:61
[ Federation Runtime ]: Failed to get remoteEntry ...
```

Kiểm tra nội dung `remoteEntry.js` thật (`curl`), phát hiện:

```js
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([["chat_module"], {}, ...]);
```

**Nguyên nhân:** `webpackChunk_N_E` là tên biến toàn cục **mặc định** mà MỌI app Next.js dùng cho
cơ chế chunk-loading của webpack (`_N_E` là build-id nội bộ cố định của Next.js, không phải do
project đặt). Vì Shell và Chat module là 2 app Next.js **riêng biệt nhưng cùng chạy trong 1 trang
trình duyệt** (Shell fetch `remoteEntry.js` của remote và thực thi ngay trên trang của Shell), cả
2 đều mặc định ghi vào **cùng một** mảng toàn cục `self.webpackChunk_N_E` trên `window` của trình
duyệt. Khi remote push chunk của nó vào mảng này, runtime chunk-loading **của Shell** (đã cài đặt
sẵn trên trang) nhận nhầm chunk đó là chunk của chính nó, cố gọi `__webpack_require__` bằng
module-id **của remote** — nhưng module-id đó không tồn tại trong module map của Shell →
`undefined.call(...)`.

**Khắc phục:** đặt `config.output.uniqueName` khác nhau, tường minh, cho từng app
(`"shell"` / `"chat_module"`) trong `webpack()` hook của `next.config.ts`. Sau khi sửa, xác nhận
`remoteEntry.js` đổi thành `self["webpackChunkchat_module"]` (đúng như kỳ vọng) — **nhưng lỗi runtime
"Cannot read properties of undefined (reading 'call')" vẫn còn nguyên**, chỉ khác vị trí gốc rễ: dấu
hiệu cho thấy bản thân cơ chế "attach webpack chunk" của `@module-federation/runtime`
(phần script-loader chặn `.push` của mảng chunk để bắc cầu container về runtime SDK) không tương
thích đúng với định dạng container mà `ModuleFederationPlugin` của `@module-federation/enhanced`
sinh ra cho build Next.js/webpack5 App Router cụ thể này — một lớp bug sâu hơn cấu hình project có
thể tự sửa, nằm đúng trong phạm vi "so với Pages Router, App Router chỉ nhận best-effort, không có
phát triển mới" mà issue #3153 đã cảnh báo trước.

## 9. Quyết định

Sau khi xác nhận chuỗi vấn đề trên đều là các giới hạn thật của hệ sinh thái Module Federation +
Next.js App Router (không phải lỗi cấu hình phía project có thể tự sửa thêm trong ngân sách thời
gian hợp lý), và đối chiếu với mitigation đã chốt sẵn từ D2 §3 cho đúng rủi ro R2, quyết định
(xác nhận trực tiếp bởi người dùng): **pivot sang Next.js Multi-Zones**. D3 §5 đã ghi rõ trước:
"Phương án dự phòng (Next.js Multi-Zones) không thay đổi mô hình 3 lớp — chỉ thay cách Integration
Layer nạp module (route-based thay vì runtime import)."

## 10. Hệ quả kiến trúc của việc pivot (quan trọng cho phần Kiến trúc/Đánh giá của báo cáo)

So với D2 §3 ma trận đánh giá, Multi-Zones đã được ghi nhận trước là có hạn chế
("mỗi zone gần như tách biệt, chuyển trang giữa zone là full navigation"). Pivot thật sự làm lộ rõ
hệ quả cụ thể lên spec:

- **FR2/FR3/AC2/AC3 (không full page reload khi chuyển `/chat`):** không còn đúng theo nghĩa đen —
  điều hướng Shell → Chat module giờ là **hard navigation** (Next.js tự động dùng `<a>` thay vì
  `<Link>` khi qua zone khác). Đã cập nhật Clarify trong `spec.md` để ghi nhận đây là hệ quả trực
  tiếp của R2 materializing, không phải sai sót.
- **NFR2 (<300ms chuyển tiếp):** không áp dụng được cho lượt chuyển zone (hard nav luôn tốn hơn);
  vẫn áp dụng đúng cho điều hướng trong cùng 1 zone (VD: giữa các trang nội bộ của Chat module sau
  này).
- **FR4/AC4 (Zustand store dùng chung, Dashboard tự re-render khi Chat cập nhật `lastToolCall`
  "không cần refresh thủ công"):** không còn khả thi ở dạng live-reactive giữa 2 zone khác nhau,
  vì mỗi lần qua zone là một lần nạp lại toàn bộ runtime JS (in-memory Zustand store bị reset).
  **Giải pháp thích nghi:** nâng `packages/integration-store` dùng Zustand `persist` middleware
  (localStorage — cùng origin trình duyệt nên vẫn chia sẻ được giữa các zone dù server khác nhau),
  để zone tải sau **hydrate được giá trị `lastToolCall`/`navState` gần nhất lúc mount** — thoả
  phần "dùng chung dữ liệu" nhưng không còn "tự động re-render tức thời trong khi đang mounted".
- **Giao diện (Header/Sidebar) phải tự nhân bản ở mỗi zone** để giữ cảm giác "1 giao diện thống
  nhất" cho người dùng cuối (đúng như Next.js Multi-Zones guide mô tả: "look the same to the
  user") — chuyển `Header`/`Sidebar` (nav) thành component dùng chung trong `packages/shared-ui`
  thay vì chỉ nằm trong `apps/shell`.

## 11. Vấn đề phụ phát sinh khi pivot — Tailwind v4 không quét `packages/shared-ui`

Sau khi wiring xong Multi-Zones, giao diện thật (browser) cho thấy `AppNav`/`AppHeader` (dùng
chung từ `packages/shared-ui`) mất hết style (`class` đúng trong DOM nhưng không có CSS tương
ứng — `getComputedStyle` trả `padding: 0px`, `background: transparent`) — nhưng **chỉ ở
`apps/shell`**, còn `apps/chat-module` lại hiển thị đúng.

**Nguyên nhân:** Tailwind v4 (CSS-first, không có `tailwind.config.js`/`content` array như v3) tự
động quét class chỉ trong chính thư mục app hiện tại; `packages/shared-ui` là package ngoài
(resolve qua `node_modules/@tessera/shared-ui` — npm workspace symlink), mặc định bị loại khỏi
phạm vi quét. `apps/chat-module` "vô tình" hiển thị đúng vì chính nó cũng dùng trực tiếp các class
trùng tên (`rounded-md`, `px-3`, `bg-primary`...) trong `PromptInput.tsx`/`ChatModule.tsx`, nên
Tailwind sinh CSS cho các class đó vì lý do khác — không phải vì nó quét đúng `shared-ui`. Điều
này khiến bug ẩn đi ở 1 trong 2 app, dễ bị bỏ sót nếu chỉ kiểm tra 1 zone.

**Khắc phục:** thêm `@source "../../../packages/shared-ui/src";` ngay sau `@import "tailwindcss";`
trong `globals.css` của **cả 2 app** (API chính thức Tailwind v4 cho đúng tình huống monorepo —
xem tailwindcss.com/docs/detecting-classes-in-source-files).

**Bài học:** khi tách UI dùng chung ra package riêng trong monorepo dùng Tailwind v4, phải khai
báo `@source` tường minh cho từng app tiêu thụ package đó — test bằng mắt trên **từng zone/app**
riêng biệt, không suy luận "app A đúng thì app B chắc cũng đúng" dù dùng chung component.

## 12. Giá trị cho báo cáo đồ án

Chuỗi sự kiện này là minh chứng thực tế, có bằng chứng kỹ thuật cụ thể (log lỗi, version, số dòng
code) cho:

1. Giá trị của bước **ma trận đánh giá công nghệ + risk mitigation** (O3, D2 §3) trong Project
   Charter — rủi ro R2 được xác định TRƯỚC khi code, có phương án dự phòng rõ ràng, và được kích
   hoạt đúng lúc khi rủi ro xảy ra thật, thay vì phải dừng dự án hoặc panic-fix giữa chừng.
2. Giá trị của quy trình SDD (Constitution §8, §9) — mọi quyết định pivot lớn đều được ghi lại có
   căn cứ (`plan.md`, tài liệu này), không phải thay đổi ngầm không kiểm soát được.
3. Một case study cụ thể, đáng tin cậy về giới hạn thực tế của Module Federation trên Next.js App
   Router tại thời điểm thực hiện đồ án (09/2026) — có thể trích dẫn trực tiếp GitHub issue
   `module-federation/core#3153` làm nguồn tham chiếu học thuật.
