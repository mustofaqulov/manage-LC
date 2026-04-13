import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setUser } from '../store/slices/authSlice';
import { useUpdateMe } from '../services/hooks';
import { useGetAttemptHistory } from '../services/hooks';
import { showToast } from '../utils/configs/toastConfig';
import AvatarUpload from '../components/AvatarUpload';
import { Link, useNavigate } from 'react-router-dom';

const CEFR_LEVELS = [
  { level: 'A2', label: 'Elementary',         min: 0,  max: 37,  color: 'bg-blue-400',   text: 'text-blue-400',   border: 'border-blue-400/30' },
  { level: 'B1', label: 'Intermediate',        min: 38, max: 50,  color: 'bg-cyan-400',   text: 'text-cyan-400',   border: 'border-cyan-400/30' },
  { level: 'B2', label: 'Upper Intermediate',  min: 51, max: 64,  color: 'bg-green-400',  text: 'text-green-400',  border: 'border-green-400/30' },
  { level: 'C1', label: 'Advanced',            min: 65, max: 75,  color: 'bg-orange-400', text: 'text-orange-400', border: 'border-orange-400/30' },
];

const scoreToLevel = (pct: number | null | undefined) => {
  if (pct == null) return null;
  const p = Math.round(pct);
  if (p <= 37) return CEFR_LEVELS[0];
  if (p <= 50) return CEFR_LEVELS[1];
  if (p <= 64) return CEFR_LEVELS[2];
  if (p <= 75) return CEFR_LEVELS[3];
  return { ...CEFR_LEVELS[3], level: 'C1+', label: 'Proficiency' };
};

const UZ_REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Farg\'ona', 'Namangan',
  'Samarqand', 'Buxoro', 'Navoiy', 'Qashqadaryo', 'Surxondaryo',
  'Jizzax', 'Sirdaryo', 'Xorazm', "Qoraqalpog'iston",
];

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, legacyUser } = useAppSelector((s) => s.auth);
  const updateMe = useUpdateMe();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !legacyUser) navigate('/login', { replace: true });
  }, [isAuthenticated, legacyUser, navigate]);

  // Attempt history for stats
  const { data: historyData } = useGetAttemptHistory({ page: 0, size: 100 });
  const attempts = historyData?.items ?? [];
  const scored = attempts.filter((a) => a.status === 'SCORED' && a.scorePercentage != null && !isNaN(Number(a.scorePercentage)));
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((s, a) => s + Number(a.scorePercentage), 0) / scored.length)
    : null;
  const bestScore = scored.length > 0
    ? Math.round(Math.max(...scored.map((a) => Number(a.scorePercentage))))
    : null;
  const currentLevel = scoreToLevel(bestScore ?? avgScore);

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [region, setRegion] = useState(user?.region ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const regionDropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setEmail(user.email ?? '');
      setRegion(user.region ?? '');
      setCity(user.city ?? '');
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!regionDropdownRef.current) return;
      if (!regionDropdownRef.current.contains(event.target as Node)) {
        setRegionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setDirty(true);
  };

  const handleRegionSelect = (value: string) => {
    setRegion(value);
    setDirty(true);
    setRegionDropdownOpen(false);
  };

  const handleSave = () => {
    updateMe.mutate(
      { firstName, lastName, email: email || null, region: region || null, city: city || null },
      {
        onSuccess: (data) => {
          dispatch(setUser(data));
          setDirty(false);
          showToast.success('Profil yangilandi');
        },
      },
    );
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 outline-none transition-all';
  const dropdownBtnCls = 'w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm hover:border-white/20 focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 outline-none transition-all text-left flex items-center justify-between';
  const labelCls = 'block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2';

  return (
    <div className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 md:px-12 bg-[#050505] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,115,0,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-white space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Profil</h1>
            <p className="text-white/40 text-sm mt-1">Ma'lumotlaringizni boshqaring</p>
          </div>
          <Link to="/history" className="text-white/40 hover:text-white/70 text-sm transition">
            ← Tarix
          </Link>
        </div>

        {/* Top card — avatar + stats */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <AvatarUpload size={130} />
              <p className="text-white/35 text-[11px]">Rasmni o'zgartirish uchun bosing</p>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xl font-black text-white">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.lastName || 'Ism kiritilmagan'}
              </p>
              <p className="text-white/40 text-sm mt-1">{user?.phone ?? legacyUser?.phone}</p>
              {user?.email && <p className="text-white/35 text-xs mt-0.5">{user.email}</p>}
              {user?.region && (
                <p className="text-white/30 text-xs mt-0.5">
                  {user.region}{user?.city ? `, ${user.city}` : ''}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">
                <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
                  <p className="text-white text-lg font-black leading-none">{historyData?.totalCount ?? attempts.length}</p>
                  <p className="text-white/35 text-[10px] mt-0.5">Jami imtihon</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
                  <p className="text-white text-lg font-black leading-none">{scored.length}</p>
                  <p className="text-white/35 text-[10px] mt-0.5">Baholangan</p>
                </div>
                {avgScore !== null && (
                  <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
                    <p className="text-white text-lg font-black leading-none">{avgScore}%</p>
                    <p className="text-white/35 text-[10px] mt-0.5">O'rtacha</p>
                  </div>
                )}
                {bestScore !== null && (
                  <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                    <p className="text-orange-400 text-lg font-black leading-none">{bestScore}%</p>
                    <p className="text-orange-400/60 text-[10px] mt-0.5">Eng yuqori</p>
                  </div>
                )}
              </div>
            </div>

            {/* CEFR level badge */}
            {currentLevel && (
              <div className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border ${currentLevel.border} bg-white/[0.03]`}>
                <span className={`text-3xl font-black ${currentLevel.text}`}>{currentLevel.level}</span>
                <span className="text-white/35 text-[9px] font-bold uppercase tracking-wider mt-1 text-center leading-tight px-1">{currentLevel.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* CEFR progress */}
        {avgScore !== null && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <p className="text-[11px] font-black text-white/35 uppercase tracking-widest mb-4">CEFR Darajasi</p>
            <div className="space-y-2.5">
              {CEFR_LEVELS.map((lvl) => {
                const isActive = avgScore >= lvl.min && avgScore <= lvl.max;
                const isPast = avgScore > lvl.max;
                const fillPct = isPast ? 100 : isActive ? Math.round(((avgScore - lvl.min) / (lvl.max - lvl.min)) * 100) : 0;
                return (
                  <div key={lvl.level} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive ? 'bg-white/[0.04] border border-white/[0.07]' : ''}`}>
                    <span className={`w-8 text-xs font-black ${isActive ? lvl.text : isPast ? 'text-white/50' : 'text-white/20'}`}>{lvl.level}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className={`text-[10px] ${isActive ? 'text-white/60' : isPast ? 'text-white/35' : 'text-white/20'}`}>{lvl.label}</span>
                        <span className={`text-[10px] font-bold ${isActive ? lvl.text : isPast ? 'text-white/35' : 'text-white/20'}`}>{lvl.min}–{lvl.max}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isActive ? lvl.color : isPast ? 'bg-white/20' : 'bg-white/5'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                    {isActive && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg bg-white/5 ${lvl.text}`}>
                        {avgScore}%
                      </span>
                    )}
                    {isPast && (
                      <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edit form */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <p className="text-[11px] font-black text-white/35 uppercase tracking-widest mb-5">Shaxsiy ma'lumotlar</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ism</label>
              <input className={inputCls} value={firstName} onChange={handleChange(setFirstName)} placeholder="Ismingiz" />
            </div>
            <div>
              <label className={labelCls}>Familiya</label>
              <input className={inputCls} value={lastName} onChange={handleChange(setLastName)} placeholder="Familiyangiz" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" value={email} onChange={handleChange(setEmail)} placeholder="email@example.com" />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input className={inputCls} value={user?.phone ?? legacyUser?.phone ?? ''} disabled readOnly
                style={{ opacity: 0.4, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label className={labelCls}>Viloyat</label>
              <div className="relative" ref={regionDropdownRef}>
                <button
                  type="button"
                  className={dropdownBtnCls}
                  onClick={() => setRegionDropdownOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={regionDropdownOpen}
                >
                  <span className={region ? 'text-white' : 'text-white/45'}>{region || 'Tanlang...'}</span>
                  <svg
                    className={`w-4 h-4 text-white/45 transition-transform ${regionDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {regionDropdownOpen && (
                  <ul
                    role="listbox"
                    className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-[#101010] border border-white/10 shadow-[0_16px_30px_rgba(0,0,0,0.45)]"
                  >
                    <li
                      role="option"
                      aria-selected={region === ''}
                      onClick={() => handleRegionSelect('')}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${region === '' ? 'bg-orange-500/15 text-orange-400' : 'text-white/75 hover:bg-white/[0.05] hover:text-white'}`}
                    >
                      Tanlang...
                    </li>
                    {UZ_REGIONS.map((r) => (
                      <li
                        key={r}
                        role="option"
                        aria-selected={region === r}
                        onClick={() => handleRegionSelect(r)}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${region === r ? 'bg-orange-500/15 text-orange-400' : 'text-white/75 hover:bg-white/[0.05] hover:text-white'}`}
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Shahar / Tuman</label>
              <input className={inputCls} value={city} onChange={handleChange(setCity)} placeholder="Shahar yoki tuman" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-white/25 text-xs">
              {user?.lastLoginAt
                ? `Oxirgi kirish: ${new Date(user.lastLoginAt).toLocaleDateString('uz-UZ')}`
                : ''}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || updateMe.isPending}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-all disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-2">
              {updateMe.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {updateMe.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { to: '/history',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Imtihon tarixi' },
            { to: '/mock-exam', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Imtihon boshlash' },
            { to: '/subscribe', icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z', label: 'Obuna' },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group">
              <svg className="w-4 h-4 text-orange-400/70 group-hover:text-orange-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
              </svg>
              <span className="text-white/55 group-hover:text-white/80 text-sm font-medium transition-colors">{label}</span>
              <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Profile;
