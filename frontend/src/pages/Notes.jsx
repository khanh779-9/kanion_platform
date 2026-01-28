import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { FileText, Plus, Trash2, Share2, Link as LinkIcon } from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveNote(e) {
    e.preventDefault();
    setErr('');
    if (!content) {
      setErr('Content is required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/notes/${editingId}`, { title, content });
      } else {
        await api.post('/notes', { title, content });
      }
      setTitle('');
      setContent('');
      setEditingId(null);
      setShowModal(false);
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to save');
    }
  }

  async function deleteNote(id) {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    try {
      await api.delete(`/notes/${id}`);
      load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to delete');
    }
  }

  function editNote(note) {
    setTitle(note.title || '');
    setContent(note.content);
    setEditingId(note.id);
    setShowModal(true);
  }

  function resetForm() {
    setTitle('');
    setContent('');
    setEditingId(null);
    setShowModal(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#17A24B' }}>
              <FileText size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Secure Notes</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Keep your thoughts and ideas private and encrypted</p>
            </div>
          </div>
          <button
            onClick={() => resetForm()}
            onClickCapture={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#17A24B' }}
          >
            <Plus size={20} />
            New Note
          </button>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) resetForm(); }}
          >
            <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-7 rounded-full bg-emerald-700"></div>
                <h2 className="text-xl font-bold text-gray-100">
                  {editingId ? 'Edit Note' : 'Create New Note'}
                </h2>
              </div>
              <form onSubmit={saveNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Title (Optional)</label>
                  <input
                    className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                    placeholder="Give your note a title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Content *</label>
                  <textarea
                    rows={7}
                    className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm resize-none"
                    placeholder="Write your note here. It will be encrypted..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                </div>
                {err && <p className="text-red-400 text-xs font-medium">{err}</p>}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-md font-semibold text-white text-xs shadow hover:shadow-lg transition-all bg-emerald-700 hover:bg-emerald-800"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 rounded-md font-semibold text-gray-300 text-xs bg-gray-700 hover:bg-gray-600 transition-all"
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
              <p className="text-gray-600 dark:text-gray-400">Loading your notes...</p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">No notes yet</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: '#17A24B' }}
            >
              <Plus size={18} />
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(n => (
              <article
                key={n.id}
                className="flex items-center bg-gray-900 dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all border border-gray-800 dark:border-gray-700 p-4 sm:p-5"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-emerald-900/30 mr-4">
                  <FileText size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-100 truncate">{n.title || 'Untitled Note'}</h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">{n.content}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{new Date(n.updated_at).toLocaleDateString()} {new Date(n.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button
                  onClick={() => editNote(n)}
                  className="ml-2 p-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-emerald-800 hover:text-white transition-all"
                  title="Edit"
                >
                  <Share2 size={15} />
                </button>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="ml-1 p-1.5 rounded-full bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-200 transition-all"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
