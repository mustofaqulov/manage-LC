import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { User } from '../types';
import Logo from '../assets/images/logo.svg';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Detect exam context for minimal mode
  const isExamContext =
    location.pathname.includes('/exam') || location.pathname.includes('/mock-exam');

  const navLinks = [
    { key: 'home', path: '/', essential: false },
    { key: 'about', path: '/about', essential: true },
    { key: 'courses', path: '/courses/english', essential: false },
    { key: 'exams', path: '/mock-exam', essential: true },
    { key: 'history', path: '/history', essential: true },
    { key: 'leaderboard', path: '/leaderboard', essential: true },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
      <nav
        className={`max-w-7xl mx-auto pointer-events-auto flex justify-between items-center py-3 px-6 md:px-10 rounded-3xl border transition-all duration-500 ${
          isExamContext
            ? 'bg-black/60 backdrop-blur-xl border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
            : 'bg-black/40 backdrop-blur-xl border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
        }`}>
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src={Logo}
            alt="Manage LC Logo"
            className="w-24 h-9 md:w-28 md:h-10 transition-opacity duration-300 group-hover:opacity-80 drop-shadow-[0_0_12px_rgba(255,115,0,0.3)]"
          />
        </Link>

        {/* Center Menu */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks
            .filter((link) => !isExamContext || link.essential)
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300'
                    : 'text-white/60 hover:text-white/90'
                }`}>
                {t(`common.${link.key}`)}
                {isActive(link.path) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
                )}
              </Link>
            ))}
        </div>

        {/* Right Side: Language Switcher, User or Login */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <>
              {/* Compact User Pill */}
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  <div className="flex flex-col gap-0">
                    <p className="text-xs font-semibold text-white leading-none">{user.phone}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.isSubscribed
                            ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
                            : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          user.isSubscribed ? 'text-green-400/90' : 'text-amber-400/90'
                        }`}>
                        {t(`common.${user.isSubscribed ? 'pro' : 'free'}`)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Ghost Logout Button */}
              <button
                onClick={onLogout}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                {t('common.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:via-amber-400 hover:to-orange-300 text-white shadow-[0_4px_20px_rgba(255,115,0,0.3)] hover:shadow-[0_6px_24px_rgba(255,115,0,0.5)] transition-all duration-300">
              {t('common.login')}
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;
