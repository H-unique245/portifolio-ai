import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ExternalLink, User } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import styles from './Hero.module.css';

const TITLES = ['Full Stack Developer', 'Team Lead', 'React Specialist', 'MERN Engineer'];

export default function Hero() {
  const { settings, profileImage } = usePortfolio();
  const [titleIdx, setTitleIdx] = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [display, setDisplay]   = useState('');

  useEffect(() => {
    const cur = TITLES[titleIdx];
    let t;
    if (!deleting && charIdx < cur.length) {
      t = setTimeout(() => { setCharIdx(c => c + 1); setDisplay(cur.slice(0, charIdx + 1)); }, 75);
    } else if (!deleting && charIdx === cur.length) {
      t = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => { setCharIdx(c => c - 1); setDisplay(cur.slice(0, charIdx - 1)); }, 38);
    } else {
      setDeleting(false);
      setTitleIdx(i => (i + 1) % TITLES.length);
    }
    return () => clearTimeout(t);
  }, [charIdx, deleting, titleIdx]);

  const lookingFor = settings?.looking_for || 'Senior Full Stack Developer / Frontend Developer - Team Lead';

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.grid} />

      <div className={styles.content}>
        {/* Status badges */}
        <div className={styles.badges}>
          {settings?.open_to_work && (
            <span className={`${styles.badge} ${styles.badgeGreen}`}>
              <span className={styles.dot} /> Open to Work
            </span>
          )}
          {settings?.available_for_freelance && (
            <span className={`${styles.badge} ${styles.badgeViolet}`}>
              <span className={styles.dotV} /> Available for Freelance
            </span>
          )}
        </div>

        <h1 className={styles.name}>
          Hi, I'm <span className={styles.accent}>Hemant</span>
        </h1>

        <p className={styles.title}>
          <span className={styles.prefix}>{'// '}</span>
          {display}<span className={styles.cursor} />
        </p>

        <p className={styles.desc}>
          Full Stack Developer & Team Lead with <strong>3+ years</strong> building enterprise-grade platforms.
          Currently leading a team of 8 at Alphaware, shipping products that scale.
          {lookingFor && <> Seeking: <strong>{lookingFor}</strong>.</>}
        </p>

        <div className={styles.actions}>
          <a href="#projects" className="btn-primary">
            <ExternalLink size={14} /> View Projects
          </a>
          <a href="#contact" className="btn-secondary">
            <Mail size={14} /> Get in Touch
          </a>
        </div>

        <div className={styles.socials}>
          <a href="https://github.com/H-unique245" target="_blank" rel="noreferrer" className={styles.social} title="GitHub">
            <Github size={16} />
          </a>
          <a href="https://linkedin.com/in/hemantaher245/" target="_blank" rel="noreferrer" className={styles.social} title="LinkedIn">
            <Linkedin size={16} />
          </a>
          <a href="mailto:a.hemant96@email.com" className={styles.social} title="Email">
            <Mail size={16} />
          </a>
        </div>
      </div>

      {/* Profile image */}
      <div className={styles.profileWrap}>
        <div className={styles.profileRing} />
        <div className={styles.profileRing2} />
        {profileImage ? (
          <img src={profileImage} alt="Hemant" className={styles.profileImg} />
        ) : (
          <div className={styles.profilePlaceholder}>
            <User size={52} style={{ color: 'var(--cyan)', opacity: .4 }} />
          </div>
        )}
        <div className={styles.profileGlow} />
      </div>

      {/* Stats sidebar */}
      <div className={styles.stats}>
        {[
          { n: '3+',  l: 'Years Exp' },
          { n: '8',   l: 'Team Size' },
          { n: '5',   l: 'Projects' },
          { n: '20+', l: 'Branches Live' },
        ].map(s => (
          <div className={styles.stat} key={s.l}>
            <span className={styles.statN}>{s.n}</span>
            <span className={styles.statL}>{s.l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}