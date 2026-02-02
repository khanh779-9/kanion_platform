import { useEffect, useState, useRef } from 'react';
import { api } from '@/api/client';
import { KeyRound, Plus, Trash2, Copy, Eye, EyeOff, Lock } from 'lucide-react';

import { useContext } from 'react';
import { ThemeContext } from '@/components/ThemeContext.jsx';
import { useTranslate } from '@/locales';
import { getThemeColor } from '../themeColors';
import { showToast } from '@/components/toastService.js';

export default function Vault() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', otp_secret: '', card_number: '', card_expiry: '', card_cvv: '', description: '' });
  const [addType, setAddType] = useState(null); // 'login' | 'identity' | 'card'
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
      showToast(e?.response?.data?.error || t('vault.failedToLoad'), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!form.name) {
      showToast(t('vault.nameRequired'), 'error');
      return;
    }
    try {
      await api.post('/vault/items', form);
      setForm({ name: '', email: '', password: '', otp_secret: '', description: '' });
      setShowModal(false);
      load();
    } catch (e) {
      showToast(e?.response?.data?.error || t('vault.failedToAdd'), 'error');
    }
  }

  async function deleteItem(id) {
    if (!confirm(t('vault.deleteConfirm'))) return;
    try {
      await api.delete(`/vault/items/${id}`);
      load();
    } catch (e) {
      showToast(e?.response?.data?.error || t('vault.failedToDelete'), 'error');
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
    { value: 'password', label: t('vault.typePassword') },
    { value: 'card', label: t('vault.typeCard') },
    { value: 'otp', label: t('vault.typeOtp') },
    { value: 'other', label: t('vault.typeOther') }
  ];

  // Use themeColors.js for all theme-dependent color classes
  let mainClass = 'min-h-screen ' + getThemeColor(theme, 'background');
  const modalBg = getThemeColor(theme, 'backgroundSecondary');
  const borderClass = getThemeColor(theme, 'border');
  const btnClass = 'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ' + getThemeColor(theme, 'button');
  const menuBtnClass = 'block w-full text-left px-4 py-3 transition-colors ' + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'textSecondary') + ' hover:' + getThemeColor(theme, 'background');
  const iconBgClass = getThemeColor(theme, 'accent');
  const headingClass = getThemeColor(theme, 'cardTitle');
  const subheadingClass = getThemeColor(theme, 'cardDesc');
  return (
    <main className={mainClass}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-lg ${iconBgClass}`}>
              <Lock size={32} className={getThemeColor(theme, 'accentText')} />
            </div>
            <div>
              <h1 className={`text-4xl font-bold ${headingClass}`}>{t('vault.personalVault')}</h1>
              <p className={`${subheadingClass} mt-1`}>{t('vault.vaultDesc')}</p>
            </div>
          </div>
          <div className="relative">
            <button
              className={btnClass}
              onClick={e => {
                e.preventDefault();
                setAddType(addType ? null : 'menu');
              }}
            >
              <Plus size={20} />
              {t('vault.addItem')}
            </button>
            {addType === 'menu' && (
              <div ref={menuRef} className={`absolute right-0 mt-2 w-48 ${modalBg} rounded-lg shadow-lg z-40 border ${borderClass}`} style={{minWidth:'12rem'}}>
                <button className={menuBtnClass} onClick={() => { setAddType('login'); setShowModal(true); }}>
                  {t('vault.addLogin')}
                </button>
                <button className={menuBtnClass} onClick={() => { setAddType('identity'); setShowModal(true); }}>
                  {t('vault.addIdentity')}
                </button>
                <button className={menuBtnClass} onClick={() => { setAddType('card'); setShowModal(true); }}>
                  {t('vault.addCard')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${modalBg} rounded-2xl shadow-2xl max-w-2xl w-full p-8 border ${borderClass}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={"w-1 h-8 rounded-full " + getThemeColor(theme, 'accent')}></div>
                <h2 className={`text-2xl font-bold ${headingClass}`}>
                  {addType === 'login' && t('vault.addLoginModal')}
                  {addType === 'identity' && t('vault.addIdentityModal')}
                  {addType === 'card' && t('vault.addCardModal')}
                </h2>
              </div>
              <form onSubmit={add} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium ${subheadingClass} mb-2`}>{t('vault.name')} *</label>
                  <input
                    className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                    placeholder={t('vault.namePlaceholder')}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                {(addType === 'login' || addType === 'identity') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={"block text-sm font-medium mb-2 " + getThemeColor(theme, 'textSecondary')}>{t('vault.email')}</label>
                      <input
                        className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                        placeholder={t('login.emailPlaceholder')}
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                {addType === 'login' && (
                  <div>
                    <label className={"block text-sm font-medium mb-2 " + getThemeColor(theme, 'textSecondary')}>{t('vault.password')}</label>
                    <input
                      type="password"
                      className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                      placeholder={t('login.passwordPlaceholder')}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                )}
                {addType === 'login' && (
                  <div>
                    <label className={"block text-sm font-medium mb-2 " + getThemeColor(theme, 'textSecondary')}>{t('vault.otpSecret')}</label>
                    <input
                      className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                      placeholder={t('vault.otpPlaceholder')}
                      value={form.otp_secret}
                      onChange={e => setForm({ ...form, otp_secret: e.target.value })}
                    />
                  </div>
                )}
                {addType === 'card' && (
                  <>
                    <div>
                      <label className={"block text-sm font-medium mb-2 " + getThemeColor(theme, 'textSecondary')}>{t('vault.cardNumber')}</label>
                      <input
                        className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                        placeholder={t('vault.cardNumberPlaceholder')}
                        value={form.card_number}
                        onChange={e => setForm({ ...form, card_number: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={"block text-sm font-medium mb-2 " + getThemeColor(theme, 'textSecondary')}>{t('vault.cardExpiry')}</label>
                        <input
                          className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                          placeholder={t('vault.cardExpiryPlaceholder')}
                          value={form.card_expiry}
                          onChange={e => setForm({ ...form, card_expiry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={"block text-sm font-medium mb-2 " + getThemeColor(theme, 'textSecondary')}>{t('vault.cardCvv')}</label>
                        <input
                          className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                          placeholder={t('vault.cardCvvPlaceholder')}
                          value={form.card_cvv}
                          onChange={e => setForm({ ...form, card_cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className={"block text-sm font-medium mb-2 " + getThemeColor(theme, 'textSecondary')}>{t('vault.description')} {t('messages.optional')}</label>
                  <textarea
                    className={"w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all " + getThemeColor(theme, 'input')}
                    placeholder={t('vault.descriptionPlaceholder')}
                    rows="3"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className={"flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all " + getThemeColor(theme, 'button')}
                  >
                    {t('vault.add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setAddType(null); }}
                    className={"flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm " + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'textSecondary')}
                  >
                    {t('notes.cancel')}
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
              <div className="flex justify-center items-end gap-1 mb-6">
                <div className={`w-1.5 h-6 rounded-sm animate-bounce ${getThemeColor(theme, 'accent')}`} style={{animationDelay: '0s'}}></div>
                <div className={`w-1.5 h-8 rounded-sm animate-bounce ${getThemeColor(theme, 'accent')}`} style={{animationDelay: '0.2s'}}></div>
                <div className={`w-1.5 h-10 rounded-sm animate-bounce ${getThemeColor(theme, 'accent')}`} style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className={`${getThemeColor(theme, 'textSecondary')} font-medium`}>{t('vault.loading')}</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className={"text-center py-20 rounded-2xl border-2 border-dashed " + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'border')}>
            <Lock size={48} className={"mx-auto mb-4 " + getThemeColor(theme, 'textSecondary')} />
            <p className={getThemeColor(theme, 'textSecondary') + " text-lg mb-6"}>{t('vault.noItems')}</p>
            <button
              onClick={() => setShowModal(true)}
              className={"inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold " + getThemeColor(theme, 'button')}
            >
              <Plus size={18} />
              {t('vault.addFirst')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className={"flex items-center rounded-xl shadow hover:shadow-lg transition-all p-4 sm:p-5 " + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'border')}
              >
                <div className={"flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mr-4 " + getThemeColor(theme, 'accent')}>
                  <KeyRound size={20} className={getThemeColor(theme, 'accentText')} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={"text-base font-bold truncate " + getThemeColor(theme, 'cardTitle')}>{item.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">

                    {item.email && (
                      <span className={"inline-flex items-center text-xs rounded px-2 py-0.5 font-mono " + getThemeColor(theme, 'background') + ' ' + getThemeColor(theme, 'textSecondary')}>
                        <span className="mr-1">📧</span>
                        {item.email}
                        <button onClick={() => copyToClipboard(item.email, `e-${item.id}`)} className={"ml-1 p-0.5 " + getThemeColor(theme, 'textSecondary') + ' hover:' + getThemeColor(theme, 'text')}>
                          {copied === `e-${item.id}` ? '✓' : <Copy size={13} />}
                        </button>
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className={"text-xs mt-2 line-clamp-2 " + getThemeColor(theme, 'cardDesc')}>{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className={"ml-2 p-1.5 rounded-full transition-all " + getThemeColor(theme, 'buttonDanger')}
                  title={t('notes.delete')}
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
