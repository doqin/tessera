/**
 * Điểm nạp duy nhất của remote `chat_module` (Module Federation). Tách riêng để unit test mock
 * được (jsdom không resolve được remote); việc nạp thật được kiểm chứng bằng browser/integration
 * test (specs/001-shell-app/tasks.md T016).
 */
export const loadChatRemote = () => import("chat_module/ChatModule");
