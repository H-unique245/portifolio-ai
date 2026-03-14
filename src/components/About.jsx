import { MapPin, Briefcase, GraduationCap, Users, Code2 } from 'lucide-react';
import styles from './About.module.css';

const INFO = [
  { Icon: MapPin,         label: 'Location',   value: 'Pune, Maharashtra, India' },
  { Icon: Briefcase,      label: 'Current Role', value: 'Team Lead @ Alphaware' },
  { Icon: GraduationCap,  label: 'Education',  value: 'B.E. 2021 + Masai School (MERN + DSA)' },
  { Icon: Users,          label: 'Team',       value: '8 engineers — Frontend, Backend, QA, DevOps' },
  { Icon: Code2,          label: 'Seeking',    value: 'Senior Full Stack / Team Lead roles' },
];

export default function About() {
  return (
    <section id="about" className="section section-alt">
      <div className="sec-label">About Me</div>
      <h2 className="sec-title">Who I Am</h2>

      <div className={styles.grid}>
        <div className={styles.text}>
          <p>I'm a <strong>Full Stack Web Developer & Team Lead</strong> based in Pune, India.
            I graduated with a B.E. in 2021 and sharpened my craft through an intensive{' '}
            <strong>MERN stack & DSA program at Masai School</strong>, before joining Alphaware in April 2023.
          </p>
          <p>Over three years, I've grown from shipping features to <strong>leading an 8-person cross-functional team</strong> —
            driving architecture decisions, mentoring engineers, and delivering three major enterprise platforms on schedule.
          </p>
          <p>I love building systems that are <strong>fast, secure, and maintainable</strong> — whether that's
            a microservices banking solution, an HR platform, or a cross-platform LMS. Currently seeking a{' '}
            <strong>Senior Full Stack Developer or Team Lead role</strong> where I can keep scaling both technically and as a leader.
          </p>
        </div>

        <div className={styles.cards}>
          {INFO.map(({ Icon, label, value }) => (
            <div className={styles.card} key={label}>
              <span className={styles.icon}><Icon size={17} /></span>
              <div>
                <div className={styles.label}>{label}</div>
                <div className={styles.value}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
