import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Small artificial delay so it doesn't feel instant
    await new Promise(r => setTimeout(r, 500));
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('hv_admin', '1');
      navigate('/admin');
    } else {
      toast.error('Incorrect password.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}><Lock size={28} /></div>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.sub}>Enter your password to manage portfolio content.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="pw">Password</label>
            <input
              id="pw" type="password" className="form-input"
              placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} autoFocus
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? <span className="spinner" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
