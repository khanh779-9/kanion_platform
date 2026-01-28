import { useState } from 'react';
import { api, setAuthToken } from '@/api/client';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login({ onAuthed }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuthToken(data.token);
      onAuthed(data.user);
      nav('/');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="w-full px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: '#17A24B10' }}>
              <LogIn size={32} style={{ color: '#17A24B' }} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to access your secure vault</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': '#17A24B' }}
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': '#17A24B' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {err && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{err}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#17A24B' }}
                onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#138B40'; }}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#17A24B'}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-gray-600 dark:text-gray-400">Don't have an account? <Link to="/register" className="font-semibold" style={{ color: '#17A24B' }}>Create one</Link></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
