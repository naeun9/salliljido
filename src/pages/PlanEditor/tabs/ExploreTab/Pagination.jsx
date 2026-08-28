import styles from "./Pagination.module.css";

// 목록 하단 페이지 번호. design은 "더 보기"로 limit을 12씩 늘리는 방식만
// 있었는데(1182줄), 한 페이지 6개로 끊어 보여 달라는 요청에 맞춰 바꿨다.
//
// 페이지가 많아지면 번호를 다 늘어놓을 수 없어 현재 페이지 주변만 보이고
// 사이는 …으로 접는다. 페이지가 1개뿐이면 아무것도 그리지 않는다.
const WINDOW = 2; // 현재 페이지 좌우로 보여 줄 개수

function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total]);
  for (let p = current - WINDOW; p <= current + WINDOW; p++) {
    if (p > 1 && p < total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push({ gap: true, key: `gap-${p}` });
    out.push({ page: p, key: p });
  });
  return out;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const items = pageItems(page, totalPages).map((v) => (typeof v === "number" ? { page: v, key: v } : v));

  return (
    <nav className={styles.wrap} aria-label="목록 페이지">
      <button
        type="button"
        className={styles.arrow}
        disabled={page === 1}
        aria-label="이전 페이지"
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      {items.map((it) =>
        it.gap ? (
          <span key={it.key} className={styles.gap}>
            …
          </span>
        ) : (
          <button
            key={it.key}
            type="button"
            className={`${styles.page} ${it.page === page ? styles.current : ""}`}
            aria-current={it.page === page ? "page" : undefined}
            onClick={() => onChange(it.page)}
          >
            {it.page}
          </button>
        )
      )}

      <button
        type="button"
        className={styles.arrow}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
