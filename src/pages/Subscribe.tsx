import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useAuth } from '../hooks/useAuth';

interface Plan {
  id: string;
  title: string;
  duration: string;
  price: string;
  pricePerMonth: string | null;
  saving: string | null;
  popular: boolean;
  gradient: string;
  glow: string;
  icon: React.ReactNode;
}

const Subscribe: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('6month');

  const plans: Plan[] = [
    {
      id: '3month',
      title: '3 oylik',
      duration: '3 oy',
      price: '39,900',
      pricePerMonth: '13,300',
      saving: null,
      popular: false,
      gradient: 'from-blue-500/20 to-cyan-500/10',
      glow: 'rgba(59,130,246,0.4)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: '6month',
      title: '6 oylik',
      duration: '6 oy',
      price: '59,900',
      pricePerMonth: '9,983',
      saving: '25%',
      popular: true,
      gradient: 'from-orange-500/20 to-amber-500/10',
      glow: 'rgba(255,140,0,0.45)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: '1year',
      title: '1 yillik',
      duration: '12 oy',
      price: '79,900',
      pricePerMonth: '6,658',
      saving: '50%',
      popular: false,
      gradient: 'from-purple-500/20 to-violet-500/10',
      glow: 'rgba(139,92,246,0.4)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];


  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Telegram bot ga yo'naltirish
    const telegramUsername = 'ManageLC_admin';
    window.open(`https://t.me/${telegramUsername}`, '_blank');
  };

  return (
    <div className="relative min-h-screen py-20 sm:py-28 md:py-36 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,140,0,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(139,92,246,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Back */}
        <div className="flex items-center mb-8 sm:mb-10 md:mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-white font-semibold transition-all group px-3 sm:px-4 py-2 rounded-xl hover:bg-black/60 backdrop-blur-sm">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white text-sm sm:text-base">{t('common.back')}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-orange-300 to-orange-300 bg-clip-text text-transparent px-4">
            Obuna rejalar
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto px-4">
            O'zingizga mos rejani tanlang va imtihonlarga tayyorlaning
          </p>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 mx-auto rounded-full mt-4 sm:mt-6" />
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group relative cursor-pointer"
              onClick={() => setSelectedPlan(plan.id)}>
              {/* Glow */}
              <div
                className={`absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-gradient-to-br ${plan.gradient} ${
                  selectedPlan === plan.id ? 'opacity-100 scale-105' : 'opacity-40 group-hover:opacity-100 group-hover:scale-105'
                } blur-2xl transition-all duration-700`}
              />

              {/* Card */}
              <div
                className={`relative rounded-[20px] sm:rounded-[24px] md:rounded-[28px] p-6 sm:p-8 md:p-10 backdrop-blur-xl border shadow-[0_15px_50px_rgba(0,0,0,0.8)] md:shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col items-center text-center ${
                  selectedPlan === plan.id
                    ? 'bg-white/[0.08] border-orange-500/30 -translate-y-2 scale-[1.02]'
                    : 'bg-white/5 border-white/10 group-hover:-translate-y-2 group-hover:scale-[1.02]'
                }`}>
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-[0_4px_20px_rgba(255,140,0,0.4)]">
                    Mashhur
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 ${
                    selectedPlan === plan.id ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/60'
                  }`}>
                  {plan.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                  {plan.title}
                </h3>
                <p className="text-white/40 text-xs mb-6">{plan.duration}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-white/40 text-sm font-medium">UZS</span>
                  </div>
                  {plan.pricePerMonth && plan.id !== '3month' && (
                    <p className="text-white/30 text-xs mt-1">{plan.pricePerMonth} UZS / oy</p>
                  )}
                  {plan.saving && (
                    <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">
                      {plan.saving} tejash
                    </span>
                  )}
                </div>

                {/* Subscribe button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(plan.id);
                  }}
                  className={`w-full py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_8px_30px_rgba(255,140,0,0.3)] hover:shadow-[0_12px_40px_rgba(255,140,0,0.5)] hover:scale-105'
                      : 'text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}>
                  {selectedPlan === plan.id ? 'Obuna bo\'lish' : 'Tanlash'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Info */}
        <div className="relative group">
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] blur-xl opacity-20" />
          <div
            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black
            text-white p-6 sm:p-8 md:p-10 rounded-[20px] sm:rounded-[24px] md:rounded-[28px]
            shadow-[0_15px_50px_rgba(0,0,0,0.3)] md:shadow-[0_20px_60px_rgba(0,0,0,0.3)]
            border border-white/5">
            <h4 className="text-lg sm:text-xl font-black mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-base sm:text-lg">
                ?
              </span>
              <span className="text-base sm:text-lg md:text-xl">
                Ko'p beriladigan savollar
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
              <div>
                <h5 className="text-white/80 font-bold mb-1">To'lov qanday amalga oshiriladi?</h5>
                <p className="text-white/40 text-xs leading-relaxed">Click, Payme yoki bank kartasi orqali to'lov qilishingiz mumkin.</p>
              </div>
              <div>
                <h5 className="text-white/80 font-bold mb-1">Obunani bekor qilsa bo'ladimi?</h5>
                <p className="text-white/40 text-xs leading-relaxed">Ha, istalgan vaqtda bekor qilishingiz mumkin. Qolgan kunlar saqlanadi.</p>
              </div>
              <div>
                <h5 className="text-white/80 font-bold mb-1">Bepul sinov bormi?</h5>
                <p className="text-white/40 text-xs leading-relaxed">Ha, birinchi imtihonni bepul topshirishingiz mumkin.</p>
              </div>
              <div>
                <h5 className="text-white/80 font-bold mb-1">Umrbod obuna nima?</h5>
                <p className="text-white/40 text-xs leading-relaxed">Bir marta to'lab, platformadan cheksiz foydalaning. Yangi testlar avtomatik qo'shiladi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;

