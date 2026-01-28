import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from '@/components/NavBar.jsx';
import Toast from '@/components/Toast.jsx';
import { ToastContext } from '@/components/ToastContext.js';
import Home from '@/pages/Home.jsx';
import Login from '@/pages/Login.jsx';
import Register from '@/pages/Register.jsx';
import Vault from '@/pages/Vault.jsx';
import Notes from '@/pages/Notes.jsx';
import Profile from '@/pages/Profile.jsx';
import Settings from '@/pages/Settings.jsx';
import { initAuth, setAuthToken } from '@/api/client.js';

function PrivateRoute({ authed, children }) {
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    initAuth();
    const token = localStorage.getItem('ks_token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: decoded.sub, email: decoded.email });
      } catch (e) {
        localStorage.removeItem('ks_token');
      }
    }
    setLoaded(true);
  }, []);

  function onLogout() {
    setUser(null);
    setAuthToken(null);
  }

  function showToast(message, type = 'info') {
    setToast({ message, type });
  }

  function handleToastClose() {
    setToast({ ...toast, message: '' });
  }

  if (!loaded) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ToastContext.Provider value={{ show: showToast }}>
      <div className="min-h-screen">
        <NavBar user={user} onLogout={onLogout} />
        <Toast message={toast.message} type={toast.type} onClose={handleToastClose} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onAuthed={setUser} />} />
          <Route path="/register" element={<Register onAuthed={setUser} />} />
          <Route path="/vault" element={<PrivateRoute authed={!!user}><Vault /></PrivateRoute>} />
          <Route path="/notes" element={<PrivateRoute authed={!!user}><Notes /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute authed={!!user}><Profile /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute authed={!!user}><Settings /></PrivateRoute>} />
        </Routes>
      </div>
    </ToastContext.Provider>
  );
}
