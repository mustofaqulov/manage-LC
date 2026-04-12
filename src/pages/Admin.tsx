import React, { useState, useEffect, useCallback } from 'react';

const ADMIN_SESSION_KEY = 'admin_session';
const AVATAR_BASE = (import.meta.env.VITE_AVATAR_API_URL as string) || 'https://manage-avatar-production.up.railway.app';

interface AvatarRecord {
  user_id: string;
  avatar_url: string;
  updated_at: string;
}

// ── Login ────────────────────────────────────────────────────────────────────

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'islam' && password === 'islam2006') {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      onLogin();
    } else {
      setError("Login yoki parol noto'g'ri");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <h1 className="text-xl font-black text-white mb-1">Admin Panel</h1>
          <p className="text-white/40 text-sm mb-8">ManageLC Avatar Service</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Login</label>
              <input
                type="text"
                value={login}
                onChange={(e) => { setLogin(e.target.value); setError(''); }}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/20 focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/20 focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 outline-none transition-all"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all">
              Kirish
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [avatars, setAvatars] = useState<AvatarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('auth_token') ?? '';

  const fetchAvatars = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AVATAR_BASE}/admin/avatars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) setError('Bu amal uchun ADMIN huquqi kerak');
        else setError(`Xatolik: ${res.status}`);
        return;
      }
      const data = await res.json();
      setAvatars(data.avatars ?? []);
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAvatars(); }, [fetchAvatars]);

  const handleDelete = async (userId: string) => {
    if (!confirm("Bu foydalanuvchi rasmini o'chirasizmi?")) return;
    setDeleting(userId);
    try {
      const res = await fetch(`${AVATAR_BASE}/admin/avatars/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAvatars((prev) => prev.filter((a) => a.user_id !== userId));
      } else {
        alert("O'chirib bo'lmadi");
      }
    } catch {
      alert('Xatolik yuz berdi');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Avatar Admin</h1>
            <p className="text-white/35 text-[11px]">ManageLC</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs">{avatars.length} ta rasm</span>
          <button
            onClick={fetchAvatars}
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-xs transition">
            Chiqish
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-red-400 text-sm">
            {error}
            {error.includes('ADMIN') && (
              <p className="text-white/35 text-xs mt-1">
                Joriy token'ingiz ADMIN huquqiga ega emas. Avval saytga ADMIN akkaunt bilan kiring.
              </p>
            )}
          </div>
        )}

        {!loading && !error && avatars.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Hali hech qanday rasm yuklanmagan</p>
          </div>
        )}

        {!loading && avatars.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {avatars.map((a) => (
              <div
                key={a.user_id}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden group">
                {/* Image */}
                <div className="aspect-square bg-white/[0.03] relative">
                  <img
                    src={a.avatar_url}
                    alt={a.user_id}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-white/50 text-[10px] font-mono truncate" title={a.user_id}>
                    {a.user_id.slice(0, 8)}...
                  </p>
                  <p className="text-white/25 text-[9px] mt-0.5">
                    {new Date(a.updated_at).toLocaleDateString('uz-UZ')}
                  </p>

                  <button
                    onClick={() => handleDelete(a.user_id)}
                    disabled={deleting === a.user_id}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-bold transition disabled:opacity-40">
                    {deleting === a.user_id ? (
                      <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────

const Admin: React.FC = () => {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true',
  );

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;
