import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { FileText, Plus, Trash2, Share2, Edit2, Link as LinkIcon } from 'lucide-react';

import { useContext } from 'react';
import { ThemeContext } from '@/components/ThemeContext.jsx';
import { useTranslate } from '@/locales';
import { getThemeColor } from '../themeColors';
import { showToast } from '@/components/toastService.js';

export default function Notes() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslate();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#3b82f6'); // Default blue
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } catch (e) {
      showToast(e?.response?.data?.error || t('notes.failedToLoad'), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveNote(e) {
    e.preventDefault();
    if (!content) {
      showToast(t('notes.contentRequired'), 'error');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/notes/${editingId}`, { title, content, color });
      } else {
        await api.post('/notes', { title, content, color });
      }
      setTitle('');
      setContent('');
      setColor('#3b82f6');
      setEditingId(null);
      setShowModal(false);
      load();
    } catch (e) {
      showToast(e?.response?.data?.error || t('notes.failedToSave'), 'error');
    }
  }

  async function deleteNote(id) {
    if (!confirm(t('notes.deleteConfirm'))) return;
    try {
      await api.delete(`/notes/${id}`);
      load();
    } catch (e) {
      showToast(e?.response?.data?.error || t('notes.failedToDelete'), 'error');
    }
  }

  function editNote(note) {
    setTitle(note.title || '');
    setContent(note.content);
    setColor(note.color || '#3b82f6');
    setEditingId(note.id);
    setShowModal(true);
  }

  function resetForm() {
    setTitle('');
    setContent('');
    setColor('#3b82f6');
    setEditingId(null);
    setShowModal(false);
  }

  // Use themeColors.js for all theme-dependent color classes
  let mainClass = 'min-h-screen ' + getThemeColor(theme, 'background');
  // Modal background and border
  let modalBg = getThemeColor(theme, 'backgroundSecondary');
  let borderClass = getThemeColor(theme, 'border');
  // Button class
  const btnClass = 'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ' + getThemeColor(theme, 'button');
  return (
    <main className={mainClass}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className={"p-3 rounded-xl shadow-lg " + getThemeColor(theme, 'accent')}>
              <FileText size={32} className={getThemeColor(theme, 'accentText')} />
            </div>
            <div>
              <h1 className={"text-4xl font-bold " + getThemeColor(theme, 'text')}>{t('notes.secureNotes')}</h1>
              <p className={getThemeColor(theme, 'textSecondary') + " mt-1"}>{t('notes.notesDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className={btnClass}
          >
            <Plus size={20} />
            {t('notes.newNote')}
          </button>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) resetForm(); }}
          >
            <div className={`${modalBg} rounded-2xl shadow-2xl max-w-md w-full p-6 border ${borderClass}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={"w-1 h-7 rounded-full " + getThemeColor(theme, 'accent')}></div>
                <h2 className={"text-xl font-bold " + getThemeColor(theme, 'cardTitle')}>
                  {editingId ? t('notes.editNote') : t('notes.createNewNote')}
                </h2>
              </div>
              <form onSubmit={saveNote} className="space-y-4">
                <div>
                  <label className={"block text-xs font-medium mb-1 " + getThemeColor(theme, 'textSecondary')}>{t('notes.titleOptional')}</label>
                  <input
                    className={"w-full px-3 py-2 rounded-md border text-sm " + getThemeColor(theme, 'input')}
                    placeholder={t('notes.titlePlaceholder')}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className={"block text-xs font-medium mb-1 " + getThemeColor(theme, 'textSecondary')}>{t('notes.color')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-10 w-16 rounded cursor-pointer border"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                    />
                    <div className="flex gap-2">
                      {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-' + (theme === 'dark' ? 'gray-800' : 'white') : ''}`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className={"block text-xs font-medium mb-1 " + getThemeColor(theme, 'textSecondary')}>{t('notes.content')} *</label>
                  <textarea
                    rows={7}
                    className={"w-full px-3 py-2 rounded-md border text-sm resize-none " + getThemeColor(theme, 'input')}
                    placeholder={t('notes.contentPlaceholder')}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className={"flex-1 py-2 rounded-md font-semibold text-xs shadow hover:shadow-lg transition-all " + getThemeColor(theme, 'button')}
                  >
                    {editingId ? t('notes.update') : t('notes.create')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={"flex-1 py-2 rounded-md font-semibold text-xs " + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'textSecondary')}
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
              <p className={`${getThemeColor(theme, 'textSecondary')} font-medium`}>{t('notes.loading')}</p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className={"text-center py-20 rounded-2xl border-2 border-dashed " + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'border')}>
            <FileText size={48} className={"mx-auto mb-4 " + getThemeColor(theme, 'textSecondary')} />
            <p className={getThemeColor(theme, 'textSecondary') + " text-lg mb-6"}>{t('notes.noNotes')}</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className={"inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold " + getThemeColor(theme, 'button')}
            >
              <Plus size={18} />
              {t('notes.createFirst')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(n => (
              <article
                key={n.id}
                className={"rounded-xl shadow hover:shadow-lg transition-all overflow-hidden " + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'border')}
              >
                <div className="h-2" style={{ backgroundColor: n.color || '#3b82f6' }}></div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: n.color || '#3b82f6', opacity: 0.15 }}>
                      <FileText size={20} style={{ color: n.color || '#3b82f6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={"text-base font-bold truncate " + getThemeColor(theme, 'cardTitle')}>{n.title || t('notes.untitled')}</h3>
                      <p className={"text-xs mt-1 line-clamp-2 " + getThemeColor(theme, 'cardDesc')}>{n.content}</p>
                    </div>
                  </div>
                  <div className={"flex items-center justify-between pt-3 border-t " + getThemeColor(theme, 'border')}>
                    <p className={"text-xs " + getThemeColor(theme, 'textSecondary')}>{new Date(n.updated_at).toLocaleDateString()} {new Date(n.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => editNote(n)}
                        className={"p-1.5 rounded-lg transition-all hover:bg-opacity-10 " + getThemeColor(theme, 'textSecondary')}
                        style={{ color: n.color || '#3b82f6' }}
                        title={t('notes.edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(n.content);
                          showToast(t('notes.copied'), 'success');
                        }}
                        className={"p-1.5 rounded-lg transition-all hover:bg-opacity-10 " + getThemeColor(theme, 'textSecondary')}
                        style={{ color: n.color || '#3b82f6' }}
                        title={t('notes.share')}
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="p-1.5 rounded-lg transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title={t('notes.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
