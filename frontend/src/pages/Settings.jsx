
import React, { useState } from 'react';
import { api } from '@/api/client';

const TABS = [
  { key: 'appearance', label: 'Giao diện' },
  { key: 'account', label: 'Tài khoản' },
  { key: 'sessions', label: 'Phiên đăng nhập' },
  { key: 'devices', label: 'Thiết bị' },
  { key: 'users', label: 'Người dùng' },
];

export default function Settings() {
  const [tab, setTab] = useState('appearance');
  return (
    <div className="mx-auto mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 max-w-full md:max-w-3xl lg:max-w-4xl min-w-0 overflow-hidden flex flex-col md:flex-row" style={{height:'600px',minHeight:'600px'}}>
      {/* Tab bar ngang trên mobile, sidebar dọc trên desktop */}
      <div className="w-full md:w-[220px] lg:w-[240px] xl:w-[260px] bg-gray-50 dark:bg-gray-900 shrink-0">
        {/* Mobile: tab bar ngang, vuốt ngang */}
        <div className="flex md:hidden overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 border-b border-gray-200 dark:border-gray-700">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`min-w-[120px] px-4 py-3 text-sm font-semibold transition-colors ${tab === t.key ? 'border-b-2 border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Desktop: sidebar dọc */}
        <div className="hidden md:flex flex-col gap-1 h-full border-r border-gray-200 dark:border-gray-700 py-8 rounded-tl-2xl rounded-bl-2xl">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full text-left px-6 py-3 text-sm font-semibold rounded-l-xl transition-colors ${tab === t.key ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* Tabpage */}
      <div className="flex-1 p-4 md:p-8 min-w-0 h-full rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl bg-white dark:bg-gray-900 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {tab === 'account' && <AccountSettings />}
        {tab === 'sessions' && <SessionsSettings />}
        {tab === 'devices' && <DevicesSettings />}
        {tab === 'users' && <UsersSettings />}
        {tab === 'appearance' && <AppearanceSettings />}
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState('auto');
  const [fontType, setFontType] = useState('sans-serif');
  const [fontName, setFontName] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Lấy settings từ backend khi mở tab
  React.useEffect(() => {
    setLoading(true);
    api.get('/user/appearance-settings')
      .then(res => {
        if (res.data.theme) setTheme(res.data.theme);
        if (res.data.font_type) setFontType(res.data.font_type);
        if (res.data.font_name) setFontName(res.data.font_name);
        if (res.data['font-size']) setFontSize(res.data['font-size']);
        // Áp dụng theme/font ngay khi load settings
        const themeVal = res.data.theme || 'auto';
        if (themeVal === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        document.body.style.fontFamily = (res.data.font_name || res.data.font_type || 'sans-serif');
        document.body.style.fontSize = (res.data['font-size'] || '16') + 'px';
      })
      .finally(() => setLoading(false));
  }, []);

  const fontTypeOptions = [
    { value: 'sans-serif', label: 'Sans-serif' },
    { value: 'serif', label: 'Serif' },
    { value: 'monospace', label: 'Monospace' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Sáng' },
    { value: 'dark', label: 'Tối' },
    { value: 'auto', label: 'Tự động' },
  ];

  function handleSave(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    // Gửi toàn bộ state lên backend
    const data = {
      theme,
      font_type: fontType,
      font_name: fontName,
      'font-size': fontSize
    };
    api.post('/user/appearance-settings', data)
      .then(() => {
        setMessage('Đã lưu cài đặt giao diện!');
        // Áp dụng theme ngay
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // Áp dụng font
        document.body.style.fontFamily = fontName || fontType;
        document.body.style.fontSize = fontSize + 'px';
      })
      .catch(() => setMessage('Lưu thất bại!'))
      .finally(() => setLoading(false));
  }

  if (loading) return <div>Đang tải cài đặt giao diện...</div>;
  return (
    <form className="space-y-6 max-w-lg mx-auto" onSubmit={handleSave}>
      <div>
        <label className="block text-sm font-medium mb-2">Chủ đề</label>
        <div className="flex gap-4">
          {themeOptions.map(opt => (
            <label key={opt.value} className="inline-flex items-center gap-1">
              <input type="radio" name="theme" value={opt.value} checked={theme === opt.value} onChange={() => setTheme(opt.value)} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Loại font</label>
        <select className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={fontType} onChange={e => setFontType(e.target.value)}>
          {fontTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Tên font (tùy chọn)</label>
        <input className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={fontName} onChange={e => setFontName(e.target.value)} placeholder="VD: Roboto, Arial, Times New Roman..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Cỡ chữ</label>
        <input type="number" min="10" max="48" className="w-32 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={fontSize} onChange={e => setFontSize(e.target.value)} />
        <span className="ml-2">px</span>
      </div>
      <button type="submit" className="w-full py-2 rounded-md bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors">Lưu cài đặt</button>
      {message && <div className="text-center text-sm mt-2 text-emerald-700 dark:text-emerald-400">{message}</div>}
    </form>
  );
}


function AccountSettings() {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  // Đã loại bỏ các trường profile
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Lấy thông tin user (bỏ profile)
  useEffect(() => {
    setProfileLoading(true);
    api.get('/user/profile')
      .then(res => {
        const user = res.data || {};
        setEmail(user.email || '');
      })
      .finally(() => setProfileLoading(false));
  }, []);

  function handleDeleteAccount() {
    if (!window.confirm('Bạn chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị xóa vĩnh viễn!')) return;
    setLoading(true);
    api.delete('/user/delete-account')
      .then(() => {
        setMessage('Tài khoản đã được xóa. Đăng xuất...');
        setTimeout(() => {
          localStorage.removeItem('ks_token');
          window.location.href = '/login';
        }, 1500);
      })
      .catch(err => setMessage(err?.response?.data?.error || 'Không thể xóa tài khoản!'))
      .finally(() => setLoading(false));
  }

  function handleUpdate(e) {
    e.preventDefault();
    setMessage('');
    if (newPassword && newPassword !== repeatPassword) {
      setMessage('Mật khẩu mới nhập lại không khớp!');
      return;
    }
    setLoading(true);
    // Gửi cập nhật chỉ email/mật khẩu
    api.post('/user/settings', {
      email: email || undefined,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    })
      .then(() => {
        setMessage('Cập nhật thành công!');
        setCurrentPassword(''); setNewPassword(''); setRepeatPassword('');
      })
      .catch(err => {
        setMessage(err?.response?.data?.error || 'Có lỗi xảy ra!');
      })
      .finally(() => setLoading(false));
  }

  if (profileLoading) return <div>Đang tải thông tin...</div>;

  return (
    <form className="space-y-5" onSubmit={handleUpdate}>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
      </div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium mb-2">Đổi mật khẩu</label>
        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Mật khẩu hiện tại" className="w-full px-3 py-2 mb-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" className="w-full px-3 py-2 mb-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
        <input type="password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
      </div>
      <button type="submit" disabled={loading} className="w-full py-2 rounded-md bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors">
        {loading ? 'Đang cập nhật...' : 'Cập nhật'}
      </button>
      {message && <div className="text-center text-sm mt-2 text-emerald-700 dark:text-emerald-400">{message}</div>}
      <fieldset className="mt-8 border-2 border-red-400 dark:border-red-600 rounded-xl bg-red-50 dark:bg-red-900/30 p-5">
        <legend className="px-2 text-base font-semibold text-red-700 dark:text-red-300">Xóa tài khoản</legend>
        <div className="mb-3 text-sm text-red-700 dark:text-red-300">
          <strong>Cảnh báo:</strong> Hành động này sẽ xóa vĩnh viễn tài khoản và <b>toàn bộ dữ liệu</b> của bạn khỏi hệ thống (bao gồm ghi chú, vault, thiết bị, phiên đăng nhập, hồ sơ, ...). Không thể khôi phục lại sau khi xóa!
        </div>
        <button
          type="button"
          className="w-full py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          Xóa tài khoản vĩnh viễn
        </button>
      </fieldset>
    </form>
  );
}


import { useEffect } from 'react';
function SessionsSettings() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [removing, setRemoving] = useState(null);

  function load() {
    setLoading(true);
    api.get('/user/sessions')
      .then(res => setSessions(res.data))
      .catch(() => setErr('Không tải được danh sách phiên.'))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function revoke(id) {
    if (!window.confirm('Bạn chắc chắn muốn đăng xuất phiên này?')) return;
    setRemoving(id);
    api.delete(`/user/sessions/${id}`)
      .then(() => load())
      .catch(() => setErr('Không thể xóa phiên.'))
      .finally(() => setRemoving(null));
  }

  if (loading) return <div>Đang tải danh sách phiên...</div>;
  if (err) return <div className="text-red-500">{err}</div>;
  if (!sessions.length) return <div>Không có phiên đăng nhập nào.</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Các phiên đăng nhập gần đây:</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-3 py-2 border">IP</th>
              <th className="px-3 py-2 border">Thiết bị</th>
              <th className="px-3 py-2 border">Bắt đầu</th>
              <th className="px-3 py-2 border">Hoạt động cuối</th>
              <th className="px-3 py-2 border">Trạng thái</th>
              <th className="px-3 py-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className={s.revoked_at ? 'opacity-60' : ''}>
                <td className="px-3 py-2 border">{s.ip_address || '-'}</td>
                <td className="px-3 py-2 border max-w-[180px] truncate" title={s.user_agent}>{s.user_agent?.slice(0, 40) || '-'}</td>
                <td className="px-3 py-2 border">{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                <td className="px-3 py-2 border">{s.last_activity_at ? new Date(s.last_activity_at).toLocaleString() : '-'}</td>
                <td className="px-3 py-2 border">{s.revoked_at ? 'Đã đăng xuất' : 'Đang hoạt động'}</td>
                <td className="px-3 py-2 border">
                  {!s.revoked_at && (
                    <button
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                      onClick={() => revoke(s.id)}
                      disabled={removing === s.id}
                    >
                      {removing === s.id ? 'Đang xóa...' : 'Đăng xuất'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function DevicesSettings() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [removing, setRemoving] = useState(null);

  function load() {
    setLoading(true);
    api.get('/user/devices')
      .then(res => setDevices(res.data))
      .catch(() => setErr('Không tải được danh sách thiết bị.'))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function remove(id) {
    if (!window.confirm('Bạn chắc chắn muốn xóa thiết bị này?')) return;
    setRemoving(id);
    api.delete(`/user/devices/${id}`)
      .then(() => load())
      .catch(() => setErr('Không thể xóa thiết bị.'))
      .finally(() => setRemoving(null));
  }

  if (loading) return <div>Đang tải danh sách thiết bị...</div>;
  if (err) return <div className="text-red-500">{err}</div>;
  if (!devices.length) return <div>Không có thiết bị nào.</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Các thiết bị đã đăng nhập:</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-3 py-2 border">Tên thiết bị</th>
              <th className="px-3 py-2 border">Dấu vân tay</th>
              <th className="px-3 py-2 border">Tin cậy</th>
              <th className="px-3 py-2 border">Lần dùng cuối</th>
              <th className="px-3 py-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id}>
                <td className="px-3 py-2 border">{d.name || '-'}</td>
                <td className="px-3 py-2 border max-w-[180px] truncate" title={d.fingerprint}>{d.fingerprint?.slice(0, 40) || '-'}</td>
                <td className="px-3 py-2 border">{d.trusted ? '✔️' : ''}</td>
                <td className="px-3 py-2 border">{d.last_used_at ? new Date(d.last_used_at).toLocaleString() : '-'}</td>
                <td className="px-3 py-2 border">
                  <button
                    className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    onClick={() => remove(d.id)}
                    disabled={removing === d.id}
                  >
                    {removing === d.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function UsersSettings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  function load() {
    setLoading(true);
    api.get('/user/users')
      .then(res => setUsers(res.data))
      .catch(() => setErr('Không tải được danh sách người dùng.'))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  if (loading) return <div>Đang tải danh sách người dùng...</div>;
  if (err) return <div className="text-red-500">{err}</div>;
  if (!users.length) return <div>Không có người dùng nào.</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Danh sách người dùng:</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Tên</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Trạng thái</th>
              <th className="px-3 py-2 border">Tạo lúc</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-3 py-2 border">{u.id}</td>
                <td className="px-3 py-2 border">{u.name}</td>
                <td className="px-3 py-2 border">{u.email}</td>
                <td className="px-3 py-2 border">{u.status}</td>
                <td className="px-3 py-2 border">{u.created_at ? new Date(u.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
