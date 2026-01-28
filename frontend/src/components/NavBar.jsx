
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { fetchLatestNotifications, fetchAllNotifications } from '@/api/notifications.js';

export default function NavBar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const notifRef = useRef();

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, notifOpen]);

  useEffect(() => {
    if (notifOpen) {
      setNotifLoading(true);
      setNotifError('');
      (showAll ? fetchAllNotifications() : fetchLatestNotifications())
        .then(data => {
          setNotifications(data);
          setNotifLoading(false);
        })
        .catch(() => {
          setNotifError('Failed to load notifications');
          setNotifLoading(false);
        });
    }
  }, [notifOpen, showAll]);

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#17A24B' }}>
            <Lock size={18} className="text-white" />
          </div>
          <span style={{ color: '#17A24B' }}>Kanion Secure Space</span>
        </Link>

        {/* Navigation */}
        {user ? (
          <nav className="flex items-center gap-2 sm:gap-4">
            {/* Notification Button */}
            <div className="relative" ref={notifRef}>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 relative"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-40 p-4 max-h-96 overflow-y-auto">
                  <div className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-between">
                    <span>Notifications</span>
                    {showAll ? (
                      <button className="text-xs text-emerald-600 hover:underline" onClick={() => setShowAll(false)}>Show latest</button>
                    ) : (
                      <button className="text-xs text-emerald-600 hover:underline" onClick={() => setShowAll(true)}>View all</button>
                    )}
                  </div>
                  {notifLoading ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Loading...</div>
                  ) : notifError ? (
                    <div className="text-sm text-red-500 py-4 text-center">{notifError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No notifications.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                      {notifications.map(n => (
                        <li key={n.id} className="py-2 px-1">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{n.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line">{n.content}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {/* Account Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Account"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#17A24B' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={15} className="text-gray-600 dark:text-gray-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-40">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User size={15} />
                    Profile
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Settings size={15} />
                    Settings
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border-t border-gray-200 dark:border-gray-800"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link 
              to="/login" 
              className="px-3 py-1.5 rounded-md text-white text-xs font-medium shadow-sm hover:shadow-md transition-all"
              style={{ backgroundColor: '#17A24B' }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-3 py-1.5 rounded-md text-xs font-medium border-2 transition-colors"
              style={{ borderColor: '#17A24B', color: '#17A24B' }}
            >
              Register
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
