/**
 * Gợi ý tải sớm `remoteEntry.js` của một remote ngay khi HTML về, thay vì đợi Shell parse xong
 * framework + webpack rồi mới `import()` (đo 2026-11-21: remoteEntry chỉ bắt đầu ở ~1,6–2,0 s, kéo
 * LCP của `/chat` lên 4,1–4,7 s — xem `specs/001-shell-app/tasks.md` T017).
 *
 * Không dùng `crossOrigin` cho `preload as="script"`: runtime Module Federation tạo thẻ `<script>`
 * cổ điển (no-cors), nên preload cũng phải là no-cors thì trình duyệt mới dùng lại cache thay vì tải
 * hai lần.
 */
export function RemotePreload({ entryUrl }: { entryUrl: string }) {
  if (!entryUrl) return null;

  const { origin } = new URL(entryUrl);

  return (
    <>
      <link rel="preconnect" href={origin} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={origin} />
      <link rel="preload" href={entryUrl} as="script" />
    </>
  );
}
