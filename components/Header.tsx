import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import Logo from '../assets/images/logo.png';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
      <nav className="max-w-7xl mx-auto pointer-events-auto flex justify-between items-center py-3 px-6 md:px-10 rounded-full border border-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 backdrop-blur-xl">
        <Link to="/" className="text-2xl font-black flex items-center gap-1 group">
          <img src={Logo} alt="Manage LC Logo" className="w-32 h-12" />
        </Link>

        <div className="hidden md:flex items-center gap-10 font-semibold">
          {[
            { name: 'Home', path: '/' },
            { name: 'About Us', path: '/about' },
            { name: 'Mock Exam', path: '/mock-exam' },
            { name: 'History', path: '/history' },
            { name: 'Leaderboard', path: '/leaderboard' },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative py-1 text-sm tracking-wide transition-all duration-300 ${
                isActive(link.path) ? 'text-[#ff7300]' : 'text-[#555555] hover:text-[#222222]'
              }`}>
              {link.name}
              {isActive(link.path) && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#ff7300] rounded-full"></span>
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-[#222222]">{user.phone}</p>
                <p
                  className={`text-[9px] uppercase tracking-widest font-black ${
                    user.isSubscribed ? 'text-green-600' : 'text-red-500'
                  }`}>
                  {user.isSubscribed ? 'Premium' : 'Standard'}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="bg-zinc-100 hover:bg-zinc-200 text-[#222222] px-5 py-2 rounded-full text-sm font-bold transition-all border border-zinc-200/50">
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#ff7300] hover:bg-[#e66700] text-white px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_4px_15px_rgba(255,115,0,0.2)] hover:shadow-[0_8px_20px_rgba(255,115,0,0.3)] active:scale-95">
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;
