import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (phone: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(value);
  };

  const handleSendCode = () => {
    if (phone.length < 9) return;
    setStep('CODE');
  };

  const handleVerify = () => {
    if (code.length === 4) {
      onLogin(phone);
      navigate('/mock-exam');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-zinc-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#222222] mb-2">Welcome Back</h2>
          <p className="text-zinc-500">Log in via Telegram to access mock exams.</p>
        </div>

        {step === 'PHONE' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-widest">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">
                  +998
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="90 123 45 67"
                  className="w-full pl-16 text-zinc-600 font-bold pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-[#ff7300] focus:ring-1 focus:ring-[#ff7300] outline-none transition-all font-bold"
                />
              </div>
            </div>
            <button
              onClick={handleSendCode}
              disabled={phone.length < 9}
              className="w-full bg-[#ff7300] disabled:bg-zinc-300 text-white py-4 rounded-2xl font-black text-lg hover:bg-[#e66700] transition-all transform active:scale-95 shadow-lg">
              Get Code via Telegram
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-widest">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="0000"
                className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-[#ff7300] focus:ring-1 focus:ring-[#ff7300] outline-none transition-all text-center text-4xl font-black tracking-[0.5em]"
              />
              <p className="text-xs text-zinc-400 mt-4 text-center">
                Enter the 4-digit code sent to your Telegram account.
              </p>
            </div>
            <button
              onClick={handleVerify}
              className="w-full bg-[#222222] text-white py-4 rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all transform active:scale-95 shadow-lg">
              Verify & Login
            </button>
            <button
              onClick={() => setStep('PHONE')}
              className="w-full text-zinc-400 text-sm font-bold hover:text-zinc-600 transition-colors">
              Change Phone Number
            </button>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-zinc-100 flex flex-col items-center gap-4">
          <p className="text-xs text-zinc-400">By logging in, you agree to our Terms of Service.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
