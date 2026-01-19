import React, { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  // Detect exam context for minimal mode - only during actual exam flow
  const isExamContext = location.pathname.includes('/exam-flow');

  const navLinks = [
    { key: 'home', path: '/', essential: false },
    { key: 'about', path: '/about', essential: true },
    { key: 'courses', path: '/courses/english', essential: false },
    { key: 'exams', path: '/mock-exam', essential: true },
    { key: 'history', path: '/history', essential: true },
    { key: 'leaderboard', path: '/leaderboard', essential: true },
  ];

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-4 sm:top-6 md:top-10 left-0 right-0 z-50 px-3 sm:px-4 md:px-8">
      <nav
        className={`max-w-[1540px] mx-auto pointer-events-auto flex justify-between items-center py-2.5 sm:py-3 px-4 sm:px-6 md:px-10 rounded-2xl sm:rounded-3xl border transition-all duration-500 ${
          isExamContext
            ? 'bg-black/60 backdrop-blur-xl border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
            : 'bg-black/40 backdrop-blur-xl border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
        }`}>
        <Link to="/" className="flex items-center group">
          <img
            src={Logo}
            alt="Manage LC Logo"
            className="w-20 h-8 sm:w-24 sm:h-9 md:w-28 md:h-10 transition-opacity duration-300 group-hover:opacity-80 drop-shadow-[0_0_12px_rgba(255,115,0,0.3)]"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks
            .filter((link) => !isExamContext || link.essential)
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleMobileNavClick}
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

        {/* Right Side: Mobile Menu, Language Switcher, User or Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 flex items-center justify-center"
            aria-label="Toggle menu">
            {isMobileMenuOpen ? (
              <svg
                className="w-5 h-5 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
          <LanguageSwitcher />
          {user ? (
            <>
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
                className="hidden sm:block px-4 py-1.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                {t('common.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:via-amber-400 hover:to-orange-300 text-white shadow-[0_4px_20px_rgba(255,115,0,0.3)] hover:shadow-[0_6px_24px_rgba(255,115,0,0.5)] transition-all duration-300">
              {t('common.login')}
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm
  transition-opacity duration-300
  ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Side Drawer */}
          <div
            className={`fixed top-0 right-0 h-full w-[85%] max-w-sm z-[70]
  transform transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]
  ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div
              className="h-full rounded-l-3xl bg-white/[0.1]
  backdrop-blur-[30px] border-l border-white/[0.15]
  shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-y-auto">
              {/* NAV ITEMS */}
              <div className="p-4 space-y-1">
                {navLinks
                  .filter((link) => !isExamContext || link.essential)
                  .map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl
            text-white/80 hover:bg-white/10 active:bg-white/15
            transition">
                      {t(`common.${link.key}`)}
                    </Link>
                  ))}
              </div>

              {/* Logout */}
              {user && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="m-4 px-4 py-2 rounded-xl w-[calc(100%-2rem)]
        text-white/70 hover:text-white border border-white/10
        hover:bg-white/10 transition">
                  {t('common.logout')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
