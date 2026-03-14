import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import styles from './Navbar.module.css';

const NAV_LINKS = ['about', 'experience', 'projects', 'skills', 'contact'];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive]     = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const { settings }            = usePortfolio();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ['hero', ...NAV_LINKS].forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <a href="#hero" className={styles.logo}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="20" stroke="#63dcff" stroke-width="0.5" opacity="0.4"/>
        <text x="5" y="30" font-family="'Space Mono',monospace" font-weight="700" font-size="18" fill="#63dcff">H</text>
        <text x="23" y="30" font-family="'Space Mono',monospace" font-weight="700" font-size="18" fill="#e8eaf0" opacity="0.9">A</text>
      </svg>
        </a>

        <ul className={styles.links}>
          {NAV_LINKS.map(l => (
            <li key={l}>
              <a href={`#${l}`} className={`${styles.link} ${active === l ? styles.active : ''}`}>{l}</a>
            </li>
          ))}
        </ul>

        <div className={styles.right}>
          {settings?.open_to_work && (
            <span className={styles.badge}>
              <span className={styles.dot} /> Open to Work
            </span>
          )}
          <a href="#contact" className={styles.cta}>Hire Me</a>
          <button className={styles.hbg} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mmenu} ${menuOpen ? styles.open : ''}`}>
        {NAV_LINKS.map(l => (
          <a key={l} href={`#${l}`} className={styles.mlink} onClick={() => setMenuOpen(false)}>{l}</a>
        ))}
        <a href="#contact" className="btn-primary" style={{ marginTop: '12px' }} onClick={() => setMenuOpen(false)}>
          Hire Me
        </a>
      </div>
    </>
  );
}
