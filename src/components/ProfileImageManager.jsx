import { useEffect, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { deleteProfileImage, getProfileImages, setActiveProfileImage } from "../lib/supabase";

export default function ProfileImageManager() {
  const { profileImage, setProfileImage } = usePortfolio();
  const [images, setImages]   = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const data = await getProfileImages();
      setImages(data || []);
    } catch { toast.error('Could not load profile images.'); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProfileImage(file);
      await saveProfileImageToDB(url);
      await load();
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetActive = async (img) => {
    try {
      await setActiveProfileImage(img.id);
      setProfileImage(img.url);
      setImages(imgs => imgs.map(i => ({ ...i, is_active: i.id === img.id })));
      toast.success('Profile photo updated!');
    } catch { toast.error('Failed to set active photo.'); }
  };

  const handleDelete = async (img) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await deleteProfileImage(img.id, img.url);
      if (img.is_active) setProfileImage(null);
      setImages(imgs => imgs.filter(i => i.id !== img.id));
      toast.success('Photo deleted.');
    } catch { toast.error('Failed to delete photo.'); }
  };

  return (
    <div>
      {/* Upload button */}
      <label className={styles.uploadZone} style={{ marginBottom: 20 }}>
        {uploading
          ? <><span className="spinner" /> Uploading...</>
          : <><Upload size={18} style={{ color: 'var(--cyan)' }} /> Click to upload a new photo</>
        }
        <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
      </label>

      {/* Image grid */}
      {images.length === 0
        ? <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>No photos yet. Upload one above.</p>
        : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {images.map(img => (
              <div key={img.id} style={{ position: 'relative', width: 100 }}>
                <img
                  src={img.url} alt="profile"
                  style={{
                    width: 100, height: 100, objectFit: 'cover', borderRadius: '50%',
                    border: `2px solid ${img.is_active ? 'var(--cyan)' : 'var(--border)'}`,
                    display: 'block', cursor: 'pointer',
                    boxShadow: img.is_active ? '0 0 16px rgba(99,220,255,.4)' : 'none',
                  }}
                  onClick={() => handleSetActive(img)}
                  title="Click to set as active"
                />
                {img.is_active && (
                  <span style={{
                    position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--cyan)', color: 'var(--bg)', fontSize: '.58rem',
                    fontFamily: 'var(--mono)', padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap',
                  }}>Active</span>
                )}
                <button
                  onClick={() => handleDelete(img)}
                  style={{
                    position: 'absolute', top: 0, right: 0, width: 22, height: 22,
                    borderRadius: '50%', background: 'var(--red)', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                ><X size={11} /></button>
              </div>
            ))}
          </div>
        )
      }
      <p style={{ fontSize: '.75rem', color: 'var(--dim)', marginTop: 12, fontFamily: 'var(--mono)' }}>
        Click any photo to set it as active on your portfolio.
      </p>
    </div>
  );
}