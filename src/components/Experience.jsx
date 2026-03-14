import { EXPERIENCE } from '../data/portfolio';
import styles from './Experience.module.css';

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="sec-label">Experience</div>
      <h2 className="sec-title">Where I've Worked</h2>

      <div className={styles.timeline}>
        {EXPERIENCE.map((e, i) => (
          <div className={styles.item} key={i}>
            <div className={`${styles.dot} ${e.current ? styles.dotNow : ''}`} />
            <div className={styles.period}>{e.period}</div>
            <div className={styles.role}>{e.role}</div>
            <div className={styles.company}>{e.company}</div>
            <ul className={styles.points}>
              {e.points.map((p, j) => <li key={j}>{p}</li>)}
            </ul>
            <div className={styles.tags}>
              {e.tags.map(t => <span className="tag" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
