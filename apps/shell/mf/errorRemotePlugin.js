/**
 * Runtime plugin của Module Federation (chạy ở trình duyệt, Shell). Mặc định nextjs-mf nuốt lỗi nạp
 * remote (log "offline" rồi trả về component render `null`) → Shell hiện vùng trống không giải
 * thích. Plugin này đè kết quả đó bằng component ném lỗi để `RemoteModuleBoundary` hiển thị
 * fallback rõ ràng (spec FR5/AC5). Plugin đăng ký sau plugin mặc định nên kết quả của nó thắng.
 */
function errorRemotePlugin() {
  return {
    name: "tessera-error-remote",
    errorLoadRemote(args) {
      const error = new Error(
        `Remote "${args.id}" không truy cập được (server down hoặc lỗi mạng khi tải remoteEntry).`,
      );
      const FailedRemote = function FailedRemote() {
        throw error;
      };
      // from === "build": MF gọi mod() để lấy module; còn lại dùng thẳng object module.
      return args.from === "build"
        ? function () {
            return { __esModule: true, default: FailedRemote };
          }
        : { __esModule: true, default: FailedRemote };
    },
  };
}

module.exports = errorRemotePlugin;
