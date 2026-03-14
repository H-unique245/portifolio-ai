import { useState } from 'react';
import { ExternalLink, Github, X, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import styles from './Projects.module.css';

/* ── Lightbox ── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <div className={styles.lbOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <button className={styles.lbClose} onClick={onClose}><X size={20} /></button>
      <div className={styles.lbContent}>
        <img src={images[idx]} alt={`Screenshot ${idx + 1}`} className={styles.lbImg} />
        {images.length > 1 && (
          <>
            <button className={`${styles.lbNav} ${styles.lbPrev}`} onClick={prev}><ChevronLeft size={22} /></button>
            <button className={`${styles.lbNav} ${styles.lbNext}`} onClick={next}><ChevronRight size={22} /></button>
            <div className={styles.lbDots}>
              {images.map((_, i) => (
                <span key={i} className={`${styles.lbDot} ${i === idx ? styles.lbDotActive : ''}`} onClick={() => setIdx(i)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Project Card ── */
function ProjectCard({ p }) {
  const [lightbox, setLightbox] = useState(false);

  // Normalize images — could be JSON array string or actual array
  const images = Array.isArray(p.images)
    ? p.images
    : (typeof p.images === 'string' && p.images.startsWith('['))
      ? JSON.parse(p.images)
      : [];

  const coverImage = images[0] || null;

  // Normalize tags
  const tags = Array.isArray(p.tags)
    ? p.tags
    : (typeof p.tags === 'string' && p.tags.startsWith('['))
      ? JSON.parse(p.tags)
      : [];

  // Normalize tech
  const tech = Array.isArray(p.tech)
    ? p.tech
    : (p.tech || '').split(',').map(t => t.trim()).filter(Boolean);

  return (
    <>
      <div className={styles.card} style={{ '--cc': p.color }}>
        {/* Cover image */}
        {coverImage ? (
          <div className={styles.coverWrap} onClick={() => setLightbox(true)}>
            <img src={coverImage} alt={p.name} className={styles.cover} />
            {images.length > 1 && (
              <span className={styles.imgCount}>+{images.length - 1} more</span>
            )}
            <div className={styles.coverOverlay}>
              <span className={styles.expandHint}>Click to expand</span>
            </div>
          </div>
        ) : (
          <div className={styles.coverPlaceholder}>
            <Image size={28} style={{ color: p.color, opacity: .4 }} />
            <span>No image</span>
          </div>
        )}

        <div className={styles.body}>
          {/* Category tags */}
          {tags.length > 0 && (
            <div className={styles.tagRow}>
              {tags.map(t => (
                <span key={t} className={styles.categoryTag} style={{ color: p.color, borderColor: `${p.color}35`, background: `${p.color}0f` }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className={styles.type} style={{ color: p.color }}>{p.type}</div>
          <div className={styles.name}>{p.name}</div>
          <div className={styles.tagline} style={{ color: p.color }}>{p.tagline}</div>
          <p className={styles.desc}>{p.desc}</p>

          {/* Tech pills */}
          <div className={styles.tech}>
            {tech.map(t => (
              <span key={t} className={styles.pill}
                style={{ color: p.color, borderColor: `${p.color}30`, background: `${p.color}09` }}>
                {t}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className={styles.links}>
            {p.deploy && (
              <a href={p.deploy} target="_blank" rel="noreferrer" className={styles.linkBtn}
                style={{ color: p.color, borderColor: `${p.color}35`, background: `${p.color}10` }}>
                <ExternalLink size={12} /> Live Demo
              </a>
            )}
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer" className={styles.linkBtnGhost}>
                <Github size={12} /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {lightbox && images.length > 0 && (
        <Lightbox images={images} startIndex={0} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}

/* ── Section ── */
export default function Projects() {
  const { projects } = usePortfolio();
  const [showAll, setShowAll] = useState(false);

  const featured  = projects.filter(p => p.featured);
  const rest      = projects.filter(p => !p.featured);
  const displayed = showAll ? projects : featured;

  return (
    <section id="projects" className="section">
      <div className="sec-label">Projects</div>
      <h2 className="sec-title">What I've Built</h2>

      <div className={styles.grid}>
        {displayed.map(p => <ProjectCard key={p.id || p.name} p={p} />)}
      </div>

      {rest.length > 0 && (
        <div className={styles.more}>
          <button className="btn-secondary" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Show Less' : `Show ${rest.length} More Projects`}
          </button>
        </div>
      )}
    </section>
  );
}
