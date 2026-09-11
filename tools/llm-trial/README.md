# LLM Trial Connection

Trial task theo `UIT.SE.66-D1-SetupAIAgent` §6 (checklist mục 5): "Thiết lập kết nối thử với 1
LLM API bằng dữ liệu mẫu, xác nhận Agent gọi được."

**Provider mặc định: Groq** (free tier, không cần thẻ thanh toán, API tương thích OpenAI
`/chat/completions`) — PoC không có ngân sách nên tránh gọi thẳng API trả phí (OpenAI/Claude)
trong quá trình phát triển/test. OpenAI API và Claude API vẫn được ghi nhận là lựa chọn
production-target (xem `.specify/constitution.md` §5, `UIT.SE.66 - Tech Stack.xlsx`) — script
này vẫn hỗ trợ cả hai nếu bạn chủ động muốn thử và chấp nhận chi phí.

Script không dùng SDK riêng của từng provider (không thêm dependency ngoài Tech Stack đã chốt —
constitution §4), chỉ dùng `fetch` sẵn có trong Node.js — Groq và OpenAI cùng REST shape
`/chat/completions` nên dùng chung một hàm gọi.

## Lấy key Groq (miễn phí)

1. Tạo tài khoản tại https://console.groq.com
2. Vào https://console.groq.com/keys → Create API Key

## Chạy thử

```bash
cp tools/llm-trial/.env.local.example tools/llm-trial/.env.local
# điền GROQ_API_KEY vào .env.local (không commit file này)
node tools/llm-trial/test-llm-connection.mjs
```

Thứ tự ưu tiên provider: `GROQ_API_KEY` → `ANTHROPIC_API_KEY` → `OPENAI_API_KEY`. Nếu không có
key nào, script thoát với hướng dẫn thay vì lỗi crash.

## Cam kết bảo mật (NDA)

Prompt gửi đi là dữ liệu mẫu cố định trong script, không chứa thông tin thật hay nhạy cảm — đúng
`.specify/constitution.md` §5. Không thay prompt mẫu bằng dữ liệu thật khi thử nghiệm.
