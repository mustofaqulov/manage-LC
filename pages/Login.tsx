import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useLogin } from '../services/hooks';
import { useAppDispatch } from '../src/store/hooks';
import { setCredentials } from '../src/store/slices/authSlice';

const TELEGRAM_BOT_USERNAME = 'managelcbot'; // Telegram bot username

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // React Query mutation
  const { mutate: login, isPending } = useLogin();

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
    // Extract only digits after the +998 prefix
    const allDigits = raw.replace(/\D/g, '');
    // Remove leading 998 if user typed it (we always prepend it)
    const digits = allDigits.startsWith('998') ? allDigits.slice(3) : allDigits;
    const value = digits.slice(0, 9);
    setPhone(value);
    setError(null);
  };

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
          dispatch(
            setCredentials({
              user: result,
              token: result.token,
            }),
          );

          if (result.missingInfo) {
            navigate('/');
          } else {
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

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#070707] via-[#120c06] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,115,0,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 w-full max-w-md">
        <div
          className="
            relative p-10 rounded-[2.8rem]
            bg-white/5 backdrop-blur-2xl
            border border-white/10
            shadow-[0_30px_120px_rgba(0,0,0,0.9)]
          ">
          <div className="absolute -inset-1 rounded-[3rem] blur-2xl bg-gradient-to-br from-orange-500/30 via-amber-400/20 to-transparent opacity-60" />

          <div className="relative">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {t('login.title')}
              </h2>
              <p className="text-white/55 text-sm">{t('login.subtitle')}</p>
            </div>

            {step === 'PHONE' ? (
              <div className="space-y-7">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-3 uppercase tracking-[0.25em]">
                    {t('login.phoneLabel')}
                  </label>

                  <input
                    type="tel"
                    value={formatPhone(phone)}
                    onChange={handlePhoneChange}
                    placeholder="+998 "
                    className={`
                      w-full px-5 py-4 rounded-2xl
                      bg-black/40 text-white font-bold text-lg tracking-wide
                      border ${error ? 'border-red-500' : 'border-white/15'}
                      focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                      outline-none transition-all
                    `}
                  />

                  {error && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
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
                  onClick={handleSendCode}
                  disabled={phone.length < 9 || isPending}
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
                  {isPending && (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  Telegram botdan kod olish
                </button>

                <p className="text-xs text-white/40 text-center mt-4">
                  @{TELEGRAM_BOT_USERNAME} botiga o'tib, tasdiqlash kodini oling
                </p>
              </div>
            ) : (
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
                    className={`
                      w-full py-4 rounded-2xl text-center
                      bg-black/40 text-white text-4xl font-black
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
                  disabled={code.length !== 5 || isPending}
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
                  {isPending && (
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
                    disabled={isPending}
                    className="flex-1 py-3 rounded-xl text-white/40 text-sm font-bold hover:text-white/70 hover:bg-white/5 transition disabled:opacity-40">
                    Kodni qayta olish
                  </button>
                </div>
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-white/35">{t('loginExtended.termsOfService')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
