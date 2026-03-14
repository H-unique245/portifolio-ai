import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PortfolioProvider } from './context/PortfolioContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function ProtectedRoute({ children }) {
  if (!sessionStorage.getItem('hv_admin')) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--mono)',
              fontSize: '.82rem',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
            error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg)' } },
          }}
        />
        <Routes>
          {/* Public portfolio */}
          <Route path="/" element={<><Navbar /><Home /></>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute><Admin /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PortfolioProvider>
  );
}
