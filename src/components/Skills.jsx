import { Code2, Server, Database, Cloud, Shield, Wrench } from 'lucide-react';
import { SKILLS } from '../data/portfolio';
import styles from './Skills.module.css';

const ICONS = { Frontend: Code2, Backend: Server, Databases: Database, 'DevOps & Cloud': Cloud, 'Auth & Security': Shield, 'Tools & Process': Wrench };

export default function Skills() {
  return (
    <section id="skills" className="section section-alt">
      <div className="sec-label">Skills</div>
      <h2 className="sec-title">My Tech Stack</h2>

      <div className={styles.grid}>
        {SKILLS.map(({ label, items }) => {
          const Icon = ICONS[label] || Code2;
          return (
            <div className={styles.group} key={label}>
              <div className={styles.title}>
                <Icon size={13} /> {label}
              </div>
              <div className={styles.pills}>
                {items.map(s => <span className={styles.pill} key={s}>{s}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
