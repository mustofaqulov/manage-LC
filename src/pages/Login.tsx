import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useLogin, useUpdateMe } from '../services/hooks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, setUser } from '../store/slices/authSlice';
import type { UserResponse } from '../api/types';
import { debugToken } from '../utils/jwtDebug';

const TELEGRAM_BOT_USERNAME = 'managelcbot'; // Telegram bot username

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<'PHONE' | 'CODE' | 'PROFILE'>('PHONE');

  // Agar user allaqachon authenticated lekin profili to'liq emas bo'lsa,
  // darhol PROFILE step'ga o'tkazamiz
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasIncompleteProfile = !user.firstName?.trim() || !user.lastName?.trim();
      if (hasIncompleteProfile) {
        setStep('PROFILE');
      }
    }
  }, [isAuthenticated, user]);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Profile info - faqat missingInfo === true bo'lganda kerak
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // React Query mutations
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: updateMe, isPending: isUpdating } = useUpdateMe();

  const formatPhone = (digits: string) => {
    if (!digits) return '+998 ';
    const d = digits.slice(0, 9);
    if (d.length <= 2) return `+998 ${d}`;
    if (d.length <= 5) return `+998 ${d.slice(0, 2)} ${d.slice(2)}`;
    if (d.length <= 7) return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
    return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const allDigits = raw.replace(/\D/g, '');
    const digits = allDigits.startsWith('998') ? allDigits.slice(3) : allDigits;
    const value = digits.slice(0, 9);
    setPhone(value);
    setError(null);
  };

  // PHONE step - Telegram bot ochish
  const handleSendCode = () => {
    if (phone.length < 9) {
      setError("Telefon raqam 9 ta raqamdan iborat bo'lishi kerak");
      return;
    }

    const fullPhone = `+998${phone}`;
    const telegramUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=login_${fullPhone.replace('+', '')}`;

    window.open(telegramUrl, '_blank');

    setStep('CODE');
    setError(null);
  };

  // CODE step - Login API chaqirish
  const handleVerify = () => {
    if (code.length !== 5) {
      setError("Kod 5 ta raqamdan iborat bo'lishi kerak");
      return;
    }

    setError(null);
    const fullPhone = `998${phone}`;

    login(
      {
        phone: fullPhone,
        pinCode: code,
      },
      {
        onSuccess: (result) => {
          // User ma'lumotlarini Redux'ga saqlash
          const mappedUser: UserResponse = {
            id: result.id,
            phone: result.phone,
            firstName: result.firstName,
            lastName: result.lastName,
            email: null,
            region: null,
            city: null,
            address: null,
            roles: result.role ? [result.role] : [],
            lastLoginAt: null,
            freeAttemptAvailable: result.freeAttemptAvailable,
          };

          // Token'ni darhol localStorage'ga saqlash (Redux'dan oldin)
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user_data', JSON.stringify(mappedUser));

          // Keyin Redux'ni yangilash
          dispatch(
            setCredentials({
              user: mappedUser,
              token: result.token,
              freeAttemptAvailable: result.freeAttemptAvailable,
            }),
          );

          // ⭐ missingInfo tekshirish - bu kalit!
          if (result.missingInfo) {
            // Birinchi marta - profil ma'lumotlarini so'rash kerak
            setStep('PROFILE');
          } else {
            // Avval ro'yxatdan o'tgan - to'g'ridan mock-exam'ga
            navigate('/mock-exam');
          }
        },
        onError: (err: any) => {
          if (err.response?.status === 401) {
            setError("Noto'g'ri kod. Qaytadan urinib ko'ring.");
          } else if (err.response?.status === 404) {
            setError('Foydalanuvchi topilmadi. Telegram botdan kodni oling.');
          } else {
            setError(
              err.response?.data?.message || "Tizimga kirishda xatolik. Qaytadan urinib ko'ring.",
            );
          }
        },
      },
    );
  };

  // PROFILE step - Profil ma'lumotlarini saqlash
  const handleSaveProfile = () => {
    if (!firstName.trim()) {
      setError('Ism kiritish majburiy');
      return;
    }
    if (!lastName.trim()) {
      setError('Familiya kiritish majburiy');
      return;
    }

    setError(null);

    // Debug: Token tekshirish
    const token = localStorage.getItem('auth_token');

    // JWT tokenni decode qilib ko'rish
    debugToken();

    updateMe(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      },
      {
        onSuccess: (updatedUser: UserResponse) => {
          // Redux'ni yangilangan user bilan yangilash
          dispatch(setUser(updatedUser));
          navigate('/mock-exam');
        },
        onError: (err: any) => {
          console.error('❌ Profile update error:', err);
          console.error('❌ Error response:', err.response?.data);
          console.error('❌ Error status:', err.response?.status);
          setError("Profil saqlashda xatolik. Qaytadan urinib ko'ring.");
        },
      },
    );
  };

  return (
    <div className="relative min-h-screen flex items-start justify-center px-6 pt-32 pb-20 overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#070707] via-[#120c06] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,115,0,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 w-full max-w-md">
        <div
          className="
            relative p-6 sm:p-10 rounded-[1.8rem] sm:rounded-[2.8rem]
            bg-white/5 backdrop-blur-2xl
            border border-white/10
            shadow-[0_30px_120px_rgba(0,0,0,0.9)]
          ">
          <div className="absolute -inset-1 rounded-[3rem] blur-2xl bg-gradient-to-br from-orange-500/30 via-amber-400/20 to-transparent opacity-60" />

          <div className="relative">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {t('login.title')}
              </h2>
              <p className="text-white/55 text-sm">{t('login.subtitle')}</p>
            </div>

            {step === 'PHONE' && (
              /* STEP 1: PHONE - Faqat telefon raqam */
              <div className="space-y-5">
                <div className="text-center mb-2">
                  <p className="text-white/40 text-xs">
                    Telegram orqali tasdiqlash kodi olish
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">
                    Telefon raqam *
                  </label>
                  <input
                    type="tel"
                    value={formatPhone(phone)}
                    onChange={handlePhoneChange}
                    placeholder="+998 "
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-black/40 text-white font-bold text-sm tracking-wide border border-white/15 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSendCode}
                  disabled={phone.length < 9}
                  className="w-full py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_15px_50px_rgba(255,115,0,0.45)] hover:shadow-[0_25px_80px_rgba(255,115,0,0.65)] hover:scale-[1.04] disabled:opacity-40 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  Telegram botdan kod olish
                </button>
              </div>
            )}

            {step === 'CODE' && (
              /* STEP 2: CODE - Kod kiritish */
              <div className="space-y-7">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-3 uppercase tracking-[0.25em]">
                    {t('login.verifyCode')}
                  </label>

                  <input
                    type="text"
                    maxLength={5}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ''));
                      setError(null);
                    }}
                    placeholder={t('login.codePlaceholder')}
                    autoFocus
                    className={`
                      w-full py-4 rounded-2xl text-center
                      bg-black/40 text-white text-3xl sm:text-4xl font-black
                      tracking-[0.5em]
                      border ${error ? 'border-red-500' : 'border-white/15'}
                      focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                      outline-none transition-all
                    `}
                  />

                  <p className="text-xs text-white/40 mt-4 text-center">
                    @{TELEGRAM_BOT_USERNAME} botidan olingan 5 raqamli kodni kiriting
                  </p>

                  {error && (
                    <p className="text-red-400 text-sm mt-3 text-center flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleVerify}
                  disabled={code.length !== 5 || isLoginPending}
                  className="
                    w-full py-4 rounded-2xl font-black text-lg
                    bg-gradient-to-r from-orange-500 to-amber-400
                    text-white
                    shadow-[0_15px_50px_rgba(255,115,0,0.45)]
                    hover:shadow-[0_25px_80px_rgba(255,115,0,0.65)]
                    hover:scale-[1.04]
                    disabled:opacity-40 disabled:hover:scale-100
                    transition-all
                    flex items-center justify-center gap-3
                  ">
                  {isLoginPending && (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tasdiqlash
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep('PHONE');
                      setCode('');
                      setError(null);
                    }}
                    className="flex-1 py-3 rounded-xl text-white/40 text-sm font-bold hover:text-white/70 hover:bg-white/5 transition">
                    ← Orqaga
                  </button>

                  <button
                    onClick={handleSendCode}
                    disabled={isLoginPending}
                    className="flex-1 py-3 rounded-xl text-white/40 text-sm font-bold hover:text-white/70 hover:bg-white/5 transition disabled:opacity-40">
                    Kodni qayta olish
                  </button>
                </div>
              </div>
            )}

            {step === 'PROFILE' && (
              /* STEP 3: PROFILE - Faqat missingInfo === true bo'lganda */
              <div className="space-y-5">
                <div className="text-center mb-2">
                  <p className="text-white/40 text-xs">
                    Profilingizni to'ldiring
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2">
                      Ism *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setError(null);
                      }}
                      placeholder="Ism"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-black/40 text-white text-sm border border-white/15 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-all"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2">
                      Familiya *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setError(null);
                      }}
                      placeholder="Familiya"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 text-white text-sm border border-white/15 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">
                    Email (ixtiyoriy)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 text-white text-sm border border-white/15 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={!firstName.trim() || !lastName.trim() || isUpdating}
                  className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_15px_50px_rgba(255,115,0,0.45)] hover:shadow-[0_25px_80px_rgba(255,115,0,0.65)] hover:scale-[1.04] disabled:opacity-40 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3">
                  {isUpdating && (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Saqlash
                </button>

                <p className="text-xs text-white/40 text-center">
                  * - Majburiy maydonlar
                </p>
              </div>
            )}

            <div className="mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-white/35">{t('loginExtended.termsOfService')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
