# apps/shell — Application Shell (Module Federation host)

Next.js 13.5.11 (App Router). Host của Module Federation: route `/chat` nạp remote
`chat_module/ChatModule` từ `apps/chat-module`.

```bash
npm run dev -w shell       # http://localhost:3000 (cần chat-module đang chạy ở :3001 cho /chat)
npm run build -w shell
```

- `NEXT_PUBLIC_CHAT_MODULE_URL` — URL gốc của chat-module (mặc định `http://localhost:3001`); đọc
  lúc build.
- Cấu hình Module Federation + workaround: `next.config.js`; runtime plugin báo lỗi nạp remote:
  `mf/errorRemotePlugin.js`.
- Xem `apps/README.md`, `specs/001-shell-app/plan.md` và
  `docs/findings/R2-module-federation-nextjs-approuter.md` §13.
