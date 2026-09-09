import styles from "./LegalDoc.module.css";

// 약관·개인정보처리방침이 쓰는 문서 껍데기. 두 화면이 제목과 조항 목록만
// 다르고 레이아웃은 같아서 한곳에 뒀다.
//
// sections: [{ heading, body }] — body는 JSX를 그대로 받는다(목록·링크가
// 조항마다 달라서 문자열로 묶기 어렵다).
export default function LegalDoc({ title, updated, lead, sections }) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>시행일 {updated}</p>
        {lead && <p className={styles.lead}>{lead}</p>}

        <div className={styles.body}>
          {sections.map((s, i) => (
            <section key={s.heading} className={styles.section}>
              <h2 className={styles.heading}>
                {i + 1}. {s.heading}
              </h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

// 조항 안에서 한 번 더 강조할 말(수집 항목 이름 등). 클래스 이름을 각
// 화면에 흘리지 않으려고 여기서 같이 내보낸다.
export function Term({ children }) {
  return <span className={styles.term}>{children}</span>;
}
