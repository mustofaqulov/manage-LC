import React, { useState, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { useGetSubscriptionQuery } from '../store/api';
import { useTheme } from '../context/ThemeContext';
import Logo from '../assets/images/logo.svg';
import LanguageSwitcher from './LanguageSwitcher';
import FreeAttemptBanner from './FreeAttemptBanner';
import AvatarFeatureBanner from './AvatarFeatureBanner';
import LeaderboardAnnouncementBanner from './LeaderboardAnnouncementBanner';
import AvatarUpload from './AvatarUpload';

const Header: React.FC = memo(() => {
  const { user, logout: onLogout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  useTheme(); // dark mode always on
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  // Subscription status
  const { data: subscription } = useGetSubscriptionQuery(undefined, {
    skip: !user, // Faqat login qilgan bo'lsa chaqir
  });

  // Detect exam context for minimal mode - only during actual exam flow
  const isExamContext = location.pathname.includes('/exam-flow');

  const navLinks = [
    { key: 'home', path: '/', essential: false },
    { key: 'about', path: '/about', essential: true },
    { key: 'courses', path: '/courses/english', essential: false },
    { key: 'exams', path: '/mock-exam', essential: true },
    { key: 'history', path: '/history', essential: true },
    { key: 'chat', path: '/chat', essential: true },
    { key: 'subscription', path: '/subscribe', essential: false },
    { key: 'leaderboard', path: '/leaderboard', essential: true },
  ];

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <LeaderboardAnnouncementBanner />
      <FreeAttemptBanner />
      <AvatarFeatureBanner />
      <div className="px-3 sm:px-4 md:px-8 pt-4">
      <nav
        className={`max-w-[1540px] mx-auto pointer-events-auto flex justify-between items-center py-2.5 sm:py-3 px-4 sm:px-6 md:px-10 rounded-2xl sm:rounded-3xl border transition-all duration-500 ${
          isExamContext
            ? 'bg-white/[0.05] dark:bg-black/60 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
            : 'bg-white/[0.08] dark:bg-black/40 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
        }`}>
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <img
            src={Logo}
            alt="Manage LC Logo"
            width="112"
            height="40"
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
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 dark:from-orange-400 dark:via-amber-400 dark:to-orange-300'
                    : 'text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white/90'
                }`}>
                {t(`common.${link.key}`)}
                {isActive(link.path) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
                )}
              </Link>
            ))}
        </div>

        {/* Right Side: Mobile Menu, Language Switcher, Theme Toggle, User or Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.06] dark:bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] dark:border-white/[0.1] hover:bg-white/[0.1] dark:hover:bg-white/[0.1] hover:border-white/20 dark:hover:border-white/20 transition-all duration-300 flex items-center justify-center"
            aria-label="Toggle menu">
            {isMobileMenuOpen ? (
              <svg
                className="w-5 h-5 text-white/80 dark:text-white/80"
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
                className="w-5 h-5 text-white/80 dark:text-white/80"
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
              <div className="hidden md:flex items-center">
                {/* Profile card */}
                <Link
                  to="/profile"
                  className="relative flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-l-2xl bg-gradient-to-r from-white/[0.07] to-white/[0.04] border border-r-0 border-white/10 hover:border-orange-500/30 hover:from-orange-500/[0.08] hover:to-white/[0.04] transition-all duration-200 group">
                  <AvatarUpload size={40} className="w-10" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-white leading-none">
                      {user.firstName || user.phone}
                    </span>
                    <span className={`text-[10px] font-medium leading-none ${
                      subscription?.isSubscribed ? 'text-green-400' : 'text-orange-400/80'
                    }`}>
                      {subscription?.isSubscribed ? 'Pro obuna' : 'Bepul'}
                    </span>
                  </div>
                </Link>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  title={t('common.logout')}
                  className="flex items-center justify-center px-2.5 self-stretch rounded-r-2xl border border-white/10 bg-white/[0.04] hover:bg-red-500/10 hover:border-red-500/20 text-white/25 hover:text-red-400 transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
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
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-[60] bg-black/60 dark:bg-black/60 backdrop-blur-sm
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
              className="h-full rounded-l-3xl bg-white/[0.95] dark:bg-white/[0.1]
  backdrop-blur-[30px] border-l border-gray-300 dark:border-white/[0.15]
  shadow-[0_8px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-y-auto">
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
            text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 active:bg-gray-300 dark:active:bg-white/15
            transition">
                      {t(`common.${link.key}`)}
                    </Link>
                  ))}
              </div>

              {/* User info + avatar */}
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mx-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-orange-400/30 transition-all">
                  <AvatarUpload size={40} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.phone}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${subscription?.isSubscribed ? 'text-green-400' : 'text-orange-400'}`}>
                      {subscription?.isSubscribed ? 'Pro' : 'Free'}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-white/25 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* Logout */}
              {user && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="m-4 px-4 py-2 rounded-xl w-[calc(100%-2rem)]
        text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10
        hover:bg-gray-200 dark:hover:bg-white/10 transition">
                  {t('common.logout')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

Header.displayName = 'Header';

export default Header;

