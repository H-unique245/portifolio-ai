import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  Settings,
  BarChart2,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  X,
  Globe,
  ExternalLink,
  RefreshCw,
  Tag,
  Upload,
  Link,
  Image,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getVisitorStats,
  getContacts,
  markContactRead,
  updateSettings,
  upsertProject,
  deleteProject,
  getTags,
  upsertTag,
  deleteTag,
  uploadProjectImage,
  deleteProjectImage,
  getProfileImages,
  uploadProfileImage,
  saveProfileImageToDB,
  setActiveProfileImage,
  deleteProfileImage,
  getAllResumes,
  uploadResume,
  saveResumeToDB,
  setActiveResume,
  deleteResume,
} from "../lib/supabase";
import { usePortfolio } from "../context/PortfolioContext";
import styles from "./Admin.module.css";

const TABS = [
  { id: "overview", label: "Overview", Icon: BarChart2 },
  { id: "visitors", label: "Visitors", Icon: Users },
  { id: "messages", label: "Messages", Icon: Mail },
  { id: "projects", label: "Projects", Icon: ExternalLink },
  { id: "tags", label: "Tags", Icon: Tag },
  { id: "settings", label: "Settings", Icon: Settings },
];

const EMPTY_PROJECT = {
  name: "",
  type: "",
  tagline: "",
  details: "",
  tech: "",
  color: "#63dcff",
  deploy: "",
  github: "",
  featured: true,
  sort_order: 99,
  images: [],
  tags: [],
};

const EMPTY_TAG = { name: "", color: "#63dcff" };

/* ─────────────────────────────────────────────────────────
   IMAGE MANAGER — used inside project modal
───────────────────────────────────────────────────────── */
function ImageManager({ projectName, images, onChange }) {
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("url"); // 'url' | 'upload'

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith("http")) {
      toast.error("Enter a valid URL starting with http");
      return;
    }
    onChange([...images, url]);
    setUrlInput("");
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (!projectName) {
      toast.error("Enter a project name first.");
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map((f) => uploadProjectImage(f, projectName)),
      );
      onChange([...images, ...urls]);
      toast.success(`${urls.length} image(s) uploaded!`);
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = async (url, idx) => {
    // Try to delete from storage if it's a Supabase URL
    if (url.includes("supabase")) {
      try {
        await deleteProjectImage(url);
      } catch {
        /* ignore */
      }
    }
    onChange(images.filter((_, i) => i !== idx));
  };

  const moveImage = (idx, dir) => {
    const arr = [...images];
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    onChange(arr);
  };

  return (
    <div className={styles.imgManager}>
      <div className={styles.imgTabs}>
        <button
          className={`${styles.imgTab} ${tab === "url" ? styles.imgTabActive : ""}`}
          onClick={() => setTab("url")}
        >
          <Link size={13} /> Paste URL
        </button>
        <button
          className={`${styles.imgTab} ${tab === "upload" ? styles.imgTabActive : ""}`}
          onClick={() => setTab("upload")}
        >
          <Upload size={13} /> Upload File
        </button>
      </div>

      {tab === "url" && (
        <div className={styles.urlRow}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder="https://i.imgur.com/yourimage.png"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button
            className="btn-primary"
            style={{ padding: "11px 18px" }}
            onClick={addUrl}
          >
            Add
          </button>
        </div>
      )}

      {tab === "upload" && (
        <label className={styles.uploadZone}>
          {uploading ? (
            <>
              <span className="spinner" /> Uploading...
            </>
          ) : (
            <>
              <Upload size={20} style={{ color: "var(--cyan)" }} />
              <span>Click to select images</span>
              <span style={{ fontSize: ".72rem", color: "var(--dim)" }}>
                PNG, JPG, WebP supported
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className={styles.imgPreviews}>
          {images.map((url, i) => (
            <div key={i} className={styles.imgPreview}>
              <img src={url} alt={`img-${i}`} />
              {i === 0 && <span className={styles.coverBadge}>Cover</span>}
              <div className={styles.imgActions}>
                <button
                  onClick={() => moveImage(i, -1)}
                  disabled={i === 0}
                  title="Move left"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={() => moveImage(i, 1)}
                  disabled={i === images.length - 1}
                  title="Move right"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  onClick={() => removeImage(url, i)}
                  title="Remove"
                  style={{ color: "var(--red)" }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ─────────────────────────────────────────────────────────
   PROFILE IMAGE MANAGER COMPONENT
───────────────────────────────────────────────────────── */
function ProfileImageManager() {
  const { profileImage, setProfileImage } = usePortfolio();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const data = await getProfileImages();
      setImages(data || []);
    } catch {
      toast.error("Could not load profile images.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProfileImage(file);
      await saveProfileImageToDB(url);
      await load();
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSetActive = async (img) => {
    try {
      await setActiveProfileImage(img.id);
      setProfileImage(img.url);
      setImages((imgs) =>
        imgs.map((i) => ({ ...i, is_active: i.id === img.id })),
      );
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to set active photo.");
    }
  };

  const handleDelete = async (img) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await deleteProfileImage(img.id, img.url);
      if (img.is_active) setProfileImage(null);
      setImages((imgs) => imgs.filter((i) => i.id !== img.id));
      toast.success("Photo deleted.");
    } catch {
      toast.error("Failed to delete photo.");
    }
  };

  return (
    <div>
      {/* Upload button */}
      <label className={styles.uploadZone} style={{ marginBottom: 20 }}>
        {uploading ? (
          <>
            <span className="spinner" /> Uploading...
          </>
        ) : (
          <>
            <Upload size={18} style={{ color: "var(--cyan)" }} /> Click to
            upload a new photo
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </label>

      {/* Image grid */}
      {images.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>
          No photos yet. Upload one above.
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: "relative", width: 100 }}>
              <img
                src={img.url}
                alt="profile"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: `2px solid ${img.is_active ? "var(--cyan)" : "var(--border)"}`,
                  display: "block",
                  cursor: "pointer",
                  boxShadow: img.is_active
                    ? "0 0 16px rgba(99,220,255,.4)"
                    : "none",
                }}
                onClick={() => handleSetActive(img)}
                title="Click to set as active"
              />
              {img.is_active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--cyan)",
                    color: "var(--bg)",
                    fontSize: ".58rem",
                    fontFamily: "var(--mono)",
                    padding: "2px 7px",
                    borderRadius: 10,
                    whiteSpace: "nowrap",
                  }}
                >
                  Active
                </span>
              )}
              <button
                onClick={() => handleDelete(img)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--red)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p
        style={{
          fontSize: ".75rem",
          color: "var(--dim)",
          marginTop: 12,
          fontFamily: "var(--mono)",
        }}
      >
        Click any photo to set it as active on your portfolio.
      </p>
    </div>
  );
}
/* ─────────────────────────────────────────────────────────
   RESUME MANAGER COMPONENT
───────────────────────────────────────────────────────── */

function ResumeManager() {
  const { resumeUrl, setResumeUrl } = usePortfolio();
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setResumes(await getAllResumes());
    } catch {
      toast.error("Could not load resumes.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    try {
      const { url, filename } = await uploadResume(file);
      await saveResumeToDB({ url, filename });
      await load();
      toast.success("Resume uploaded!");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSetActive = async (r) => {
    try {
      await setActiveResume(r.id);
      setResumeUrl(r.url);
      setResumes((rs) => rs.map((i) => ({ ...i, is_active: i.id === r.id })));
      toast.success("Resume updated! Visitors will now download this version.");
    } catch {
      toast.error("Failed to set active resume.");
    }
  };

  const handleDelete = async (r) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await deleteResume(r.id, r.url);
      if (r.is_active) setResumeUrl(null);
      setResumes((rs) => rs.filter((i) => i.id !== r.id));
      toast.success("Resume deleted.");
    } catch {
      toast.error("Failed to delete resume.");
    }
  };

  return (
    <div>
      <label className={styles.uploadZone} style={{ marginBottom: 20 }}>
        {uploading ? (
          <>
            <span className="spinner" /> Uploading...
          </>
        ) : (
          <>
            <Upload size={18} style={{ color: "var(--cyan)" }} /> Click to
            upload a PDF resume
          </>
        )}
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </label>

      {resumes.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>
          No resumes yet. Upload one above.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {resumes.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                background: "var(--bg)",
                border: `1px solid ${r.is_active ? "var(--cyan)" : "var(--border)"}`,
                borderRadius: 10,
                transition: "border-color .2s",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(248,113,113,.1)",
                  border: "1px solid rgba(248,113,113,.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: ".6rem",
                    color: "var(--red)",
                    fontWeight: 700,
                  }}
                >
                  PDF
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: ".88rem",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.filename || "resume.pdf"}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: ".67rem",
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  {new Date(r.uploaded_at).toLocaleString()}
                </div>
              </div>
              {r.is_active && (
                <span
                  style={{
                    padding: "3px 10px",
                    background: "var(--cyan-dim)",
                    border: "1px solid var(--border2)",
                    borderRadius: 4,
                    fontFamily: "var(--mono)",
                    fontSize: ".63rem",
                    color: "var(--cyan)",
                    flexShrink: 0,
                  }}
                >
                  Active
                </span>
              )}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {!r.is_active && (
                  <button
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: ".72rem" }}
                    onClick={() => handleSetActive(r)}
                  >
                    <Check size={12} /> Set Active
                  </button>
                )}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{
                    padding: "6px 12px",
                    fontSize: ".72rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ExternalLink size={12} /> View
                </a>
                <button
                  className="btn-danger"
                  style={{ padding: "6px 12px", fontSize: ".72rem" }}
                  onClick={() => handleDelete(r)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p
        style={{
          fontSize: ".75rem",
          color: "var(--dim)",
          marginTop: 12,
          fontFamily: "var(--mono)",
        }}
      >
        Only the active resume is shown to visitors. Previous versions are kept
        for reference.
      </p>
    </div>
  );
}
/* ─────────────────────────────────────────────────────────
   MAIN ADMIN COMPONENT
───────────────────────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate();
  const {
    settings,
    setSettings,
    projects,
    setProjects,
    tags,
    setTags,
    reload,
  } = usePortfolio();

  const [tab, setTab] = useState("overview");
  const [visitors, setVisitors] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingData, setLD] = useState(false);
  const [editingProject, setEP] = useState(null);
  const [editingTag, setET] = useState(null);
  const [savingSettings, setSS] = useState(false);
  const [localSettings, setLS] = useState(settings);

  useEffect(() => {
    if (!sessionStorage.getItem("hv_admin")) navigate("/admin/login");
  }, [navigate]);

  useEffect(() => {
    setLS(settings);
  }, [settings]);

  const loadVisitors = useCallback(async () => {
    try {
      setVisitors(await getVisitorStats());
    } catch {
      toast.error("Could not load visitors.");
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      setContacts(await getContacts());
    } catch {
      toast.error("Could not load messages.");
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLD(true);
    await Promise.all([loadVisitors(), loadContacts()]);
    setLD(false);
  }, [loadVisitors, loadContacts]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const logout = () => {
    sessionStorage.removeItem("hv_admin");
    navigate("/");
  };

  /* ── Open project modal ── */
  const openProject = (p = null) => {
    if (!p) {
      setEP({ ...EMPTY_PROJECT });
      return;
    }
    // Normalize images & tags to arrays
    const images = Array.isArray(p.images)
      ? p.images
      : typeof p.images === "string" && p.images.startsWith("[")
        ? JSON.parse(p.images)
        : [];
    const ptags = Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === "string" && p.tags.startsWith("[")
        ? JSON.parse(p.tags)
        : [];
    setEP({
      ...p,
      tech: Array.isArray(p.tech) ? p.tech.join(", ") : p.tech || "",
      images,
      tags: ptags,
    });
  };

  /* ── Save project ── */
  const handleSaveProject = async () => {
    if (!editingProject.name) {
      toast.error("Project name is required.");
      return;
    }
    try {
      const { created_at, ...proj } = editingProject;
      if (!proj.id) delete proj.id;
      // Ensure images & tags are stored as JSON arrays
      proj.images = Array.isArray(proj.images) ? proj.images : [];
      proj.tags = Array.isArray(proj.tags) ? proj.tags : [];
      await upsertProject(proj);
      toast.success(editingProject.id ? "Project updated!" : "Project added!");
      setEP(null);
      await reload();
    } catch (err) {
      toast.error("Failed to save project: " + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects((ps) => ps.filter((p) => p.id !== id));
      toast.success("Project deleted.");
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  /* ── Tags ── */
  const handleSaveTag = async () => {
    if (!editingTag.name.trim()) {
      toast.error("Tag name is required.");
      return;
    }
    try {
      const { created_at, ...tag } = editingTag;
      if (!tag.id) delete tag.id;
      await upsertTag(tag);
      toast.success(editingTag.id ? "Tag updated!" : "Tag added!");
      setET(null);
      const fresh = await getTags();
      setTags(fresh);
    } catch (err) {
      toast.error("Failed to save tag: " + err.message);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!confirm("Delete this tag?")) return;
    try {
      await deleteTag(id);
      setTags((ts) => ts.filter((t) => t.id !== id));
      toast.success("Tag deleted.");
    } catch {
      toast.error("Failed to delete tag.");
    }
  };

  /* ── Messages ── */
  const handleMarkRead = async (id) => {
    try {
      await markContactRead(id);
      setContacts((cs) =>
        cs.map((c) => (c.id === id ? { ...c, read: true } : c)),
      );
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  /* ── Settings ── */
  const saveSettings = async () => {
    setSS(true);
    try {
      await updateSettings(localSettings);
      setSettings(localSettings);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSS(false);
    }
  };

  /* ── Stats ── */
  const totalVisitors = visitors.length;
  const todayVisitors = visitors.filter(
    (v) => new Date(v.visited_at).toDateString() === new Date().toDateString(),
  ).length;
  const unreadMessages = contacts.filter((c) => !c.read).length;
  const countryMap = visitors.reduce((acc, v) => {
    if (v.country) acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* ── Project modal tag toggle ── */
  const toggleProjectTag = (name) => {
    if (!editingProject) return;
    const current = editingProject.tags || [];
    setEP((p) => ({
      ...p,
      tags: current.includes(name)
        ? current.filter((t) => t !== name)
        : [...current, name],
    }));
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.logo}>
            <span style={{ color: "var(--dim)" }}>{"<"}</span>Admin
            <span style={{ color: "var(--dim)" }}>{"/>"}</span>
          </div>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`${styles.navBtn} ${tab === id ? styles.navActive : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} /> {label}
              {id === "messages" && unreadMessages > 0 && (
                <span className={styles.badge}>{unreadMessages}</span>
              )}
            </button>
          ))}
        </div>
        <div className={styles.sideBottom}>
          <button
            className={styles.navBtn}
            onClick={() => {
              reload();
              loadAll();
              toast.success("Refreshed!");
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <a href="/" target="_blank" className={styles.navBtn}>
            <ExternalLink size={16} /> View Site
          </a>
          <button
            className={`${styles.navBtn} ${styles.navLogout}`}
            onClick={logout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <div className={styles.statsGrid}>
              {[
                {
                  label: "Total Visitors",
                  value: totalVisitors,
                  color: "var(--cyan)",
                },
                {
                  label: "Today's Visits",
                  value: todayVisitors,
                  color: "var(--green)",
                },
                {
                  label: "Total Messages",
                  value: contacts.length,
                  color: "var(--violet)",
                },
                {
                  label: "Unread Messages",
                  value: unreadMessages,
                  color: "var(--orange)",
                },
              ].map((s) => (
                <div className={styles.statCard} key={s.label}>
                  <div className={styles.statVal} style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Current Status</h2>
              <div className={styles.statusRow}>
                <StatusChip
                  label="Open to Work"
                  active={settings?.open_to_work}
                />
                <StatusChip
                  label="Available for Freelance"
                  active={settings?.available_for_freelance}
                />
                <div className={styles.statusPill}>
                  <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>
                    Seeking:
                  </span>
                  <span style={{ fontSize: ".85rem", marginLeft: "8px" }}>
                    {settings?.looking_for || "—"}
                  </span>
                </div>
              </div>
            </div>

            {topCountries.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Top Visitor Countries</h2>
                <div className={styles.countryList}>
                  {topCountries.map(([country, count]) => (
                    <div key={country} className={styles.countryRow}>
                      <Globe size={14} style={{ color: "var(--cyan)" }} />
                      <span>{country}</span>
                      <div className={styles.bar}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${(count / totalVisitors) * 100}%` }}
                        />
                      </div>
                      <span className={styles.countNum}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VISITORS ── */}
        {tab === "visitors" && (
          <div>
            <h1 className={styles.pageTitle}>
              Visitors <span className={styles.count}>({visitors.length})</span>
            </h1>
            {loadingData ? (
              <div
                className="spinner"
                style={{ margin: "40px auto", display: "block" }}
              />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Country</th>
                      <th>City</th>
                      <th>IP</th>
                      <th>Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v, i) => (
                      <tr key={v.id}>
                        <td>{visitors.length - i}</td>
                        <td>{new Date(v.visited_at).toLocaleString()}</td>
                        <td>{v.country || "—"}</td>
                        <td>{v.city || "—"}</td>
                        <td className={styles.mono}>{v.ip || "—"}</td>
                        <td
                          className={styles.mono}
                          style={{
                            maxWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {v.referrer || "Direct"}
                        </td>
                      </tr>
                    ))}
                    {visitors.length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.emptyCell}>
                          No visitors yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div>
            <h1 className={styles.pageTitle}>
              Messages <span className={styles.count}>({contacts.length})</span>
            </h1>
            <div className={styles.msgList}>
              {contacts.length === 0 && (
                <div className={styles.empty}>No messages yet.</div>
              )}
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className={`${styles.msgCard} ${!c.read ? styles.unread : ""}`}
                >
                  <div className={styles.msgHeader}>
                    <div>
                      <div className={styles.msgName}>{c.name}</div>
                      <div className={styles.msgEmail}>{c.email}</div>
                    </div>
                    <div className={styles.msgMeta}>
                      <span className={styles.msgDate}>
                        {new Date(c.sent_at).toLocaleString()}
                      </span>
                      {!c.read ? (
                        <button
                          className={styles.readBtn}
                          onClick={() => handleMarkRead(c.id)}
                        >
                          <Check size={13} /> Mark Read
                        </button>
                      ) : (
                        <span className={styles.readBadge}>Read</span>
                      )}
                    </div>
                  </div>
                  <p className={styles.msgBody}>{c.message}</p>
                  <a
                    href={`mailto:${c.email}`}
                    className="btn-secondary"
                    style={{
                      marginTop: 14,
                      fontSize: ".75rem",
                      padding: "8px 16px",
                    }}
                  >
                    <Mail size={13} /> Reply
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === "projects" && (
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>Projects</h1>
              <button className="btn-primary" onClick={() => openProject()}>
                <Plus size={15} /> Add Project
              </button>
            </div>
            <div className={styles.projList}>
              {projects.map((p) => {
                const imgs = Array.isArray(p.images)
                  ? p.images
                  : typeof p.images === "string" && p.images.startsWith("[")
                    ? JSON.parse(p.images)
                    : [];
                const ptags = Array.isArray(p.tags)
                  ? p.tags
                  : typeof p.tags === "string" && p.tags.startsWith("[")
                    ? JSON.parse(p.tags)
                    : [];
                return (
                  <div key={p.id || p.name} className={styles.projRow}>
                    {imgs[0] ? (
                      <img
                        src={imgs[0]}
                        alt={p.name}
                        className={styles.projThumb}
                      />
                    ) : (
                      <div className={styles.projThumbEmpty}>
                        <Image size={16} />
                      </div>
                    )}
                    <div className={styles.projInfo}>
                      <div className={styles.projName}>{p.name}</div>
                      <div className={styles.projType}>{p.type}</div>
                      {ptags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            marginTop: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {ptags.map((t) => {
                            const tagObj = tags.find((tg) => tg.name === t);
                            return (
                              <span
                                key={t}
                                className={styles.projTagBadge}
                                style={{
                                  color: tagObj?.color || "var(--muted)",
                                  borderColor: `${tagObj?.color || "var(--border)"}40`,
                                  background: `${tagObj?.color || "transparent"}0f`,
                                }}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className={styles.projMeta}>
                      {p.featured && (
                        <span className={styles.featBadge}>Featured</span>
                      )}
                      <span className={styles.sortBadge}>#{p.sort_order}</span>
                    </div>
                    <div className={styles.projActions}>
                      <button
                        className="btn-secondary"
                        style={{ padding: "7px 14px", fontSize: ".75rem" }}
                        onClick={() => openProject(p)}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: "7px 14px", fontSize: ".75rem" }}
                        onClick={() => handleDeleteProject(p.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Project modal */}
            {editingProject && (
              <div
                className={styles.overlay}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setEP(null);
                }}
              >
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h2>
                      {editingProject.id ? "Edit Project" : "Add Project"}
                    </h2>
                    <button onClick={() => setEP(null)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className={styles.modalBody}>
                    {/* Basic info */}
                    <div className={styles.formRow}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Project Name *</label>
                        <input
                          className="form-input"
                          value={editingProject.name}
                          onChange={(e) =>
                            setEP((p) => ({ ...p, name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Type / Category</label>
                        <input
                          className="form-input"
                          placeholder="e.g. FinTech · Enterprise"
                          value={editingProject.type}
                          onChange={(e) =>
                            setEP((p) => ({ ...p, type: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tagline</label>
                      <input
                        className="form-input"
                        value={editingProject.tagline}
                        onChange={(e) =>
                          setEP((p) => ({ ...p, tagline: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={editingProject.details}
                        onChange={(e) =>
                          setEP((p) => ({ ...p, details: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Tech Stack (comma-separated)
                      </label>
                      <input
                        className="form-input"
                        placeholder="React.js, Node.js, MongoDB"
                        value={editingProject.tech}
                        onChange={(e) =>
                          setEP((p) => ({ ...p, tech: e.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.formRow}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Live Demo URL</label>
                        <input
                          className="form-input"
                          value={editingProject.deploy}
                          onChange={(e) =>
                            setEP((p) => ({ ...p, deploy: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">GitHub URL</label>
                        <input
                          className="form-input"
                          value={editingProject.github}
                          onChange={(e) =>
                            setEP((p) => ({ ...p, github: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className="form-group">
                        <label className="form-label">Accent Color</label>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="color"
                            value={editingProject.color}
                            onChange={(e) =>
                              setEP((p) => ({ ...p, color: e.target.value }))
                            }
                            style={{
                              width: 48,
                              height: 40,
                              background: "none",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          />
                          <input
                            className="form-input"
                            style={{ flex: 1 }}
                            value={editingProject.color}
                            onChange={(e) =>
                              setEP((p) => ({ ...p, color: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Sort Order (1 = first)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="1, 2, 3..."
                          value={editingProject.sort_order}
                          onChange={(e) =>
                            setEP((p) => ({
                              ...p,
                              sort_order: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Category Tags */}
                    <div className="form-group">
                      <label className="form-label">Category Tags</label>
                      {tags.length === 0 ? (
                        <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                          No tags yet. Go to the Tags tab to create some.
                        </p>
                      ) : (
                        <div className={styles.tagPicker}>
                          {tags.map((t) => {
                            const selected = (
                              editingProject.tags || []
                            ).includes(t.name);
                            return (
                              <button
                                key={t.id}
                                type="button"
                                className={`${styles.tagPickerBtn} ${selected ? styles.tagPickerSelected : ""}`}
                                style={
                                  selected
                                    ? {
                                        color: t.color,
                                        borderColor: t.color,
                                        background: `${t.color}18`,
                                      }
                                    : {}
                                }
                                onClick={() => toggleProjectTag(t.name)}
                              >
                                {selected && <Check size={11} />} {t.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    <div className="form-group">
                      <label className="form-label">Project Images</label>
                      <p
                        style={{
                          fontSize: ".75rem",
                          color: "var(--muted)",
                          marginBottom: 10,
                        }}
                      >
                        First image = cover photo on the card. Click it to open
                        lightbox.
                      </p>
                      <ImageManager
                        projectName={editingProject.name}
                        images={editingProject.images || []}
                        onChange={(imgs) =>
                          setEP((p) => ({ ...p, images: imgs }))
                        }
                      />
                    </div>

                    {/* Featured toggle */}
                    <div className={styles.toggleRow}>
                      <label className={styles.toggleLabel}>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={editingProject.featured}
                            onChange={(e) =>
                              setEP((p) => ({
                                ...p,
                                featured: e.target.checked,
                              }))
                            }
                          />
                          <span className="toggle-slider" />
                        </label>
                        <span>
                          Featured on homepage (shown without clicking "Show
                          More")
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button
                      className="btn-secondary"
                      onClick={() => setEP(null)}
                    >
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSaveProject}>
                      <Save size={14} /> Save Project
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAGS ── */}
        {tab === "tags" && (
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>Project Tags</h1>
              <button
                className="btn-primary"
                onClick={() => setET({ ...EMPTY_TAG })}
              >
                <Plus size={15} /> Add Tag
              </button>
            </div>
            <p
              style={{
                color: "var(--muted)",
                fontSize: ".9rem",
                marginBottom: 28,
                marginTop: -16,
              }}
            >
              Create custom tags to categorise your projects — e.g. Personal,
              Professional, Freelance, Client Work.
            </p>

            <div className={styles.tagList}>
              {tags.length === 0 && (
                <div className={styles.empty}>
                  No tags yet. Create your first one!
                </div>
              )}
              {tags.map((t) => (
                <div key={t.id} className={styles.tagRow2}>
                  <span
                    className={styles.tagSwatch}
                    style={{ background: t.color }}
                  />
                  <span className={styles.tagName} style={{ color: t.color }}>
                    {t.name}
                  </span>
                  <div className={styles.projActions}>
                    <button
                      className="btn-secondary"
                      style={{ padding: "7px 14px", fontSize: ".75rem" }}
                      onClick={() => setET({ ...t })}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      className="btn-danger"
                      style={{ padding: "7px 14px", fontSize: ".75rem" }}
                      onClick={() => handleDeleteTag(t.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tag modal */}
            {editingTag && (
              <div
                className={styles.overlay}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setET(null);
                }}
              >
                <div className={styles.modal} style={{ maxWidth: 400 }}>
                  <div className={styles.modalHeader}>
                    <h2>{editingTag.id ? "Edit Tag" : "Add Tag"}</h2>
                    <button onClick={() => setET(null)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className={styles.modalBody}>
                    <div className="form-group">
                      <label className="form-label">Tag Name *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Freelance"
                        value={editingTag.name}
                        onChange={(e) =>
                          setET((t) => ({ ...t, name: e.target.value }))
                        }
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color</label>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="color"
                          value={editingTag.color}
                          onChange={(e) =>
                            setET((t) => ({ ...t, color: e.target.value }))
                          }
                          style={{
                            width: 48,
                            height: 40,
                            background: "none",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        />
                        <input
                          className="form-input"
                          style={{ flex: 1 }}
                          value={editingTag.color}
                          onChange={(e) =>
                            setET((t) => ({ ...t, color: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "14px",
                        background: "var(--bg3)",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: ".72rem",
                          color: "var(--muted)",
                          marginBottom: 8,
                          fontFamily: "var(--mono)",
                        }}
                      >
                        PREVIEW
                      </p>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 100,
                          fontSize: ".75rem",
                          fontFamily: "var(--mono)",
                          color: editingTag.color,
                          borderColor: `${editingTag.color}40`,
                          background: `${editingTag.color}18`,
                          border: "1px solid",
                        }}
                      >
                        {editingTag.name || "Tag name"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button
                      className="btn-secondary"
                      onClick={() => setET(null)}
                    >
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSaveTag}>
                      <Save size={14} /> Save Tag
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div>
            <h1 className={styles.pageTitle}>Portfolio Settings</h1>
            <div className={styles.settingsCard}>
              <h2 className={styles.settingsGroup}>Availability</h2>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Open to Work</div>
                  <div className={styles.settingDesc}>
                    Shows green "Open to Work" badge on hero & navbar.
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={localSettings?.open_to_work || false}
                    onChange={(e) =>
                      setLS((s) => ({ ...s, open_to_work: e.target.checked }))
                    }
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>
                    Available for Freelance
                  </div>
                  <div className={styles.settingDesc}>
                    Shows purple "Available for Freelance" badge on hero.
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={localSettings?.available_for_freelance || false}
                    onChange={(e) =>
                      setLS((s) => ({
                        ...s,
                        available_for_freelance: e.target.checked,
                      }))
                    }
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="form-group" style={{ marginTop: 20 }}>
                <label className="form-label">Looking For</label>
                <input
                  className="form-input"
                  value={localSettings?.looking_for || ""}
                  onChange={(e) =>
                    setLS((s) => ({ ...s, looking_for: e.target.value }))
                  }
                  placeholder="Senior Full Stack Developer / Team Lead"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hero Tagline</label>
                <input
                  className="form-input"
                  value={localSettings?.hero_tagline || ""}
                  onChange={(e) =>
                    setLS((s) => ({ ...s, hero_tagline: e.target.value }))
                  }
                />
              </div>
              <button
                className="btn-primary"
                onClick={saveSettings}
                disabled={savingSettings}
                style={{ marginTop: 8 }}
              >
                {savingSettings ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Save size={14} /> Save Settings
                  </>
                )}
              </button>
            </div>
            {/* ── Profile Image Manager ── */}
            <div className={styles.settingsCard} style={{ marginTop: 24 }}>
              <h2 className={styles.settingsGroup}>Profile Photo</h2>
              <ProfileImageManager />
            </div>
            {/* ── Resume Manager ── */}
            <div className={styles.settingsCard} style={{ marginTop: 24 }}>
              <h2 className={styles.settingsGroup}>Resume</h2>
              <ResumeManager />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusChip({ label, active }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 13px",
        borderRadius: 100,
        fontSize: ".78rem",
        background: active ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.04)",
        border: `1px solid ${active ? "rgba(74,222,128,.3)" : "var(--border)"}`,
        color: active ? "var(--green)" : "var(--muted)",
      }}
    >
      {active ? <Check size={12} /> : <X size={12} />} {label}
    </span>
  );
}
