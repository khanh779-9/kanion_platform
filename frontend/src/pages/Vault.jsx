import { useEffect, useState, useRef } from 'react';
import { api } from '@/api/client';
import { KeyRound, Plus, Trash2, Copy, Eye, EyeOff, Lock } from 'lucide-react';

export default function Vault() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', otp_secret: '', card_number: '', card_expiry: '', card_cvv: '', description: '' });
  const [addType, setAddType] = useState(null); // 'login' | 'identity' | 'card'
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState('');
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (addType === 'menu' && menuRef.current && !menuRef.current.contains(e.target)) setAddType(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addType]);

  async function load() {
    try {
      const { data } = await api.get('/vault/items');
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setErr('');
    if (!form.name) {
      setErr('Name is required');
      return;
    }
    try {
      await api.post('/vault/items', form);
      setForm({ name: '', email: '', password: '', otp_secret: '', description: '' });
      setShowModal(false);
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to add');
    }
  }

  async function deleteItem(id) {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      await api.delete(`/vault/items/${id}`);
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to delete');
    }
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  function toggleReveal(id) {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const types = [
    { value: 'password', label: 'Password' },
    { value: 'card', label: 'Credit Card' },
    { value: 'otp', label: 'OTP Secret' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#17A24B' }}>
              <Lock size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Personal Vault</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Keep your secrets safe with military-grade encryption</p>
            </div>
          </div>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#17A24B' }}
              onClick={e => {
                e.preventDefault();
                setAddType(addType ? null : 'menu');
              }}
            >
              <Plus size={20} />
              Add Item
            </button>
            {addType === 'menu' && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-40 border border-gray-200 dark:border-gray-700" style={{minWidth:'12rem'}}>
                <button className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setAddType('login'); setShowModal(true); }}>
                  Đăng nhập
                </button>
                <button className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setAddType('identity'); setShowModal(true); }}>
                  Danh tính
                </button>
                <button className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setAddType('card'); setShowModal(true); }}>
                  Thẻ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#17A24B' }}></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {addType === 'login' && 'Thêm Đăng nhập'}
                  {addType === 'identity' && 'Thêm Danh tính'}
                  {addType === 'card' && 'Thêm Thẻ'}
                </h2>
              </div>
              <form onSubmit={add} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': '#17A24B' }}
                    placeholder="e.g., Gmail, Facebook, AWS"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                {(addType === 'login' || addType === 'identity') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                        style={{ '--tw-ring-color': '#17A24B' }}
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                {addType === 'login' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': '#17A24B' }}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                )}
                {addType === 'login' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OTP Secret</label>
                    <input
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': '#17A24B' }}
                      placeholder="Enter OTP secret..."
                      value={form.otp_secret}
                      onChange={e => setForm({ ...form, otp_secret: e.target.value })}
                    />
                  </div>
                )}
                {addType === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                      <input
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                        style={{ '--tw-ring-color': '#17A24B' }}
                        placeholder="Card number"
                        value={form.card_number}
                        onChange={e => setForm({ ...form, card_number: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                          style={{ '--tw-ring-color': '#17A24B' }}
                          placeholder="MM/YY"
                          value={form.card_expiry}
                          onChange={e => setForm({ ...form, card_expiry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                          style={{ '--tw-ring-color': '#17A24B' }}
                          placeholder="CVV"
                          value={form.card_cvv}
                          onChange={e => setForm({ ...form, card_cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': '#17A24B' }}
                    placeholder="Optional notes..."
                    rows="3"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                {err && <p className="text-red-600 dark:text-red-400 text-sm font-medium">{err}</p>}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: '#17A24B' }}
                  >
                    Add to Vault
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setAddType(null); }}
                    className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-emerald-500 animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your vault...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <Lock size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Your vault is empty</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: '#17A24B' }}
            >
              <Plus size={18} />
              Add Your First Secret
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center bg-gray-900 dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all border border-gray-800 dark:border-gray-700 p-4 sm:p-5"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-emerald-900/30 mr-4">
                  <KeyRound size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-100 truncate">{item.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">

                    {item.email && (
                      <span className="inline-flex items-center text-xs bg-gray-800/80 text-gray-300 rounded px-2 py-0.5 font-mono">
                        <span className="mr-1">📧</span>
                        {item.email}
                        <button onClick={() => copyToClipboard(item.email, `e-${item.id}`)} className="ml-1 p-0.5 text-gray-400 hover:text-gray-100">
                          {copied === `e-${item.id}` ? '✓' : <Copy size={13} />}
                        </button>
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-2 p-1.5 rounded-full bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-200 transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
