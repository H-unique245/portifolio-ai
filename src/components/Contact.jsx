import { useState } from "react";
import { Send, Mail, Linkedin, Github, Download } from "lucide-react";
import toast from "react-hot-toast";
import { sendContactEmail } from "../lib/emailjs";
import { saveContact } from "../lib/supabase";
import styles from "./Contact.module.css";
import { usePortfolio } from "../context/PortfolioContext";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { resumeUrl } = usePortfolio();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      // 1. Send email via EmailJS
      await sendContactEmail(form);
      // 2. Save to Supabase for admin tracking
      await saveContact(form);
      toast.success("Message sent! I'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error(
        "Something went wrong. Please try again or email me directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="sec-label">Contact</div>
      <h2 className="sec-title">Let's Connect</h2>

      <div className={styles.grid}>
        {/* Left — info */}
        <div className={styles.info}>
          <p className={styles.desc}>
            I'm <strong>actively looking for new opportunities</strong> — Senior
            Full Stack Developer or Team Lead roles where I can contribute
            technically and lead great teams.
          </p>
          <p className={styles.desc} style={{ marginTop: "14px" }}>
            Whether you have a role, a project, or just want to chat about
            engineering — my inbox is open. I typically respond within 24 hours.
          </p>

          <div className={styles.links}>
            <a href="mailto:a.hemant96@email.com" className={styles.link}>
              <Mail size={18} className={styles.linkIcon} />
              <div>
                <div className={styles.linkLabel}>Email</div>
                <div className={styles.linkVal}>a.hemant96@email.com</div>
              </div>
            </a>
            <a
              href="https://www.linkedin.com/in/hemantaher245/"
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              <Linkedin size={18} className={styles.linkIcon} />
              <div>
                <div className={styles.linkLabel}>LinkedIn</div>
                <div className={styles.linkVal}>
                  linkedin.com/in/hemantaher245
                </div>
              </div>
            </a>
            <a
              href="https://github.com/H-unique245"
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              <Github size={18} className={styles.linkIcon} />
              <div>
                <div className={styles.linkLabel}>GitHub</div>
                <div className={styles.linkVal}>github.com/H-unique245</div>
              </div>
            </a>
          </div>

         {resumeUrl ? (
  <a href={resumeUrl} target="_blank" rel="noreferrer" download className={styles.resumeBtn}>
    <div>
      <div className={styles.resLabel}>Download</div>
      <div className={styles.resTitle}>My Resume →</div>
    </div>
    <Download size={20} style={{ color: 'var(--cyan)' }} />
  </a>
) : (
  <div className={styles.resumeBtn} style={{ opacity: .4, cursor: 'default' }}>
    <div>
      <div className={styles.resLabel}>Resume</div>
      <div className={styles.resTitle}>Not uploaded yet</div>
    </div>
    <Download size={20} style={{ color: 'var(--cyan)' }} />
  </div>
)}
        </div>

        {/* Right — form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="john@company.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className="form-input"
              placeholder="Hi Hemant, I'd love to chat about..."
              value={form.message}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <Send size={14} /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
