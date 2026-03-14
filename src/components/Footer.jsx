import { Github, Linkedin, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.text}>
        Designed & built by <span className={styles.accent}>Hemant</span> · {new Date().getFullYear()}
      </span>
      <div className={styles.socials}>
        <a href="https://github.com/H-unique245" target="_blank" rel="noreferrer" className={styles.icon}><Github size={15} /></a>
        <a href="https://linkedin.com/in/hemantaher245" target="_blank" rel="noreferrer" className={styles.icon}><Linkedin size={15} /></a>
        <a href="mailto:a.hemant96@email.com" className={styles.icon}><Mail size={15} /></a>
      </div>
      <span className={styles.text}>Built with <span className={styles.accent}>React + Vite</span></span>
    </footer>
  );
}
