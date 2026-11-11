# apps/chat-module — Chat/Prompt module (Module Federation remote)

Next.js 13.5.11 (App Router). Remote của Module Federation: expose `./ChatModule`
(`components/ChatModule.tsx`) cho Shell nạp lúc runtime. Vẫn chạy độc lập để dev/test riêng.

```bash
npm run dev -w chat-module   # http://localhost:3001 (trang độc lập)
npm run build -w chat-module # sinh .next/static/chunks/remoteEntry.js
```

- Cấu hình Module Federation + workaround: `next.config.js`.
- Tổ chức MVVM: `components/` (View), `hooks/` (ViewModel), `services/` (Model — gọi `/api/chat`, route handler proxy Groq giữ `GROQ_API_KEY` phía server; xem `.env.local.example`).
- Xem `apps/README.md`, `specs/002-chat-module/plan.md` và
  `docs/findings/R2-module-federation-nextjs-approuter.md` §13.
