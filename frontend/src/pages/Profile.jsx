
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { api } from '@/api/client';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ display_name: '', avatar_url: '', phone: '', birthday: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/user/profile').then(res => res.data).catch(() => null),
      api.get('/user/profile-detail').then(res => res.data).catch(() => null)
    ]).then(([userData, profileData]) => {
      setUser(userData);
      setProfile({
        display_name: profileData?.display_name || '',
        avatar_url: profileData?.avatar_url || '',
        phone: profileData?.phone || '',
        birthday: profileData?.birthday || '',
        bio: profileData?.bio || ''
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // User info
  const email = user?.email || '';
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
  // Hiển thị tên ưu tiên display_name, fallback là email
  const displayName = profile.display_name || email;

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      // Always send display_name as non-empty string
      const safeProfile = {
        ...profile,
        display_name: (profile.display_name || '').trim() || 'User',
        avatar_url: profile.avatar_url?.trim() ? profile.avatar_url.trim() : null,
        phone: profile.phone?.trim() ? profile.phone.trim() : null,
        birthday: profile.birthday?.trim() ? profile.birthday.trim() : null,
        bio: profile.bio?.trim() ? profile.bio.trim() : null
      };
      // Log URL và dữ liệu gửi đi
      console.log('POST to:', api.defaults.baseURL + '/user/profile-detail', safeProfile);
      const res = await api.post('/user/profile-detail', safeProfile);
      if (res.data?.created) {
        setMessage('Profile created successfully!');
      } else if (res.data?.updated) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Profile saved!');
      }
    } catch (err) {
      console.error('Profile update error:', err, err?.response);
      setMessage(err?.response?.data?.error || `Update failed! (${err?.response?.status || ''})`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 max-w-full md:max-w-3xl lg:max-w-4xl min-w-0 overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-8 pb-0">
        <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-1/3">
          <div className="w-24 h-24 rounded-full bg-emerald-700 flex items-center justify-center text-white text-5xl overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User size={56} />
            )}
          </div>
          <input
            type="text"
            name="avatar_url"
            value={profile.avatar_url}
            onChange={handleChange}
            placeholder="Avatar URL"
            className="w-full text-xs text-center md:text-left text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-emerald-600"
          />
          <div className="text-base font-semibold text-gray-900 dark:text-white mt-2">{displayName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{email}</div>
          <div className="text-xs text-gray-400 mt-1">Account created: {createdAt}</div>
        </div>
        <form onSubmit={handleSave} className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                name="display_name"
                value={profile.display_name}
                onChange={handleChange}
                placeholder="Display Name"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Birthday</label>
              <input
                type="date"
                name="birthday"
                value={profile.birthday}
                onChange={handleChange}
                placeholder="Birthday"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Bio"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          {message && <div className="text-center text-emerald-600 dark:text-emerald-400 font-medium mt-4">{message}</div>}
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-6 py-2.5 px-4 rounded-lg font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#17A24B' }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
