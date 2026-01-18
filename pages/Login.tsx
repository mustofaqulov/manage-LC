import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';

interface LoginProps {
  onLogin: (phone: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(value);
  };

  const fakeDelay = () => new Promise((r) => setTimeout(r, 900));

  const handleSendCode = async () => {
    if (phone.length < 9) return;
    setIsLoading(true);
    await fakeDelay();
    setIsLoading(false);
    setStep('CODE');
  };

  const handleVerify = async () => {
    if (code.length !== 4) return;
    setIsLoading(true);
    await fakeDelay();
    onLogin(phone);
    setIsLoading(false);
    navigate('/mock-exam');
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

                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 font-bold">
                      {t('login.phoneCountryCode')}
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder={t('login.phonePlaceholder')}
                      className="
                        w-full pl-16 pr-4 py-4 rounded-2xl
                        bg-black/40 text-white font-bold
                        border border-white/15
                        focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                        outline-none transition-all
                      "
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendCode}
                  disabled={phone.length < 9 || isLoading}
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
                  {isLoading && (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {t('login.sendCode')}
                </button>
              </div>
            ) : (
              <div className="space-y-7">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-3 uppercase tracking-[0.25em]">
                    {t('login.verifyCode')}
                  </label>

                  <input
                    type="text"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('login.codePlaceholder')}
                    className="
                      w-full py-4 rounded-2xl text-center
                      bg-black/40 text-white text-4xl font-black
                      tracking-[0.5em]
                      border border-white/15
                      focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                      outline-none transition-all
                    "
                  />

                  <p className="text-xs text-white/40 mt-4 text-center">
                    {t('login.codeDescription')}
                  </p>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={code.length !== 4 || isLoading}
                  className="
                    w-full py-4 rounded-2xl font-black text-lg
                    bg-gradient-to-r from-zinc-800 to-zinc-900
                    text-white
                    border border-white/10
                    hover:bg-zinc-800
                    hover:scale-[1.04]
                    disabled:opacity-40 disabled:hover:scale-100
                    transition-all
                    flex items-center justify-center gap-3
                  ">
                  {isLoading && (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {t('login.verifyCode')}
                </button>

                <button
                  onClick={() => setStep('PHONE')}
                  className="w-full text-white/40 text-sm font-bold hover:text-white/70 transition">
                  {t('login.resendCode')}
                </button>
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
