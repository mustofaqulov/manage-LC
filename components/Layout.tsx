
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
      <nav 
        className="max-w-7xl mx-auto pointer-events-auto flex justify-between items-center py-3 px-6 md:px-10 rounded-full border border-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(246, 246, 246, 0.85))'
        }}
      >
        <Link to="/" className="text-2xl font-black flex items-center gap-1 group">
          <span className="text-[#ff7300] tracking-tight">MANAGE</span>
          <span className="text-[#222222]">LC</span>
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
              className={`relative py-1 text-sm tracking-wide transition-all duration-300 ${isActive(link.path) ? 'text-[#ff7300]' : 'text-[#555555] hover:text-[#222222]'}`}
            >
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
                <p className={`text-[9px] uppercase tracking-widest font-black ${user.isSubscribed ? 'text-green-600' : 'text-red-500'}`}>
                  {user.isSubscribed ? 'Premium' : 'Standard'}
                </p>
              </div>
              <button 
                onClick={onLogout}
                className="bg-zinc-100 hover:bg-zinc-200 text-[#222222] px-5 py-2 rounded-full text-sm font-bold transition-all border border-zinc-200/50"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-[#ff7300] hover:bg-[#e66700] text-white px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_4px_15px_rgba(255,115,0,0.2)] hover:shadow-[0_8px_20px_rgba(255,115,0,0.3)] active:scale-95"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-[#111111] text-white py-20 px-6 md:px-12 border-t border-zinc-900 mt-auto">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <h3 className="text-2xl font-black mb-6 text-[#ff7300]">Manage LC</h3>
        <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
          The international standard for CEFR and IELTS preparation in Uzbekistan. Empowering students with AI-driven technology.
        </p>
        <div className="flex gap-4">
          {['IG', 'TG', 'FB'].map(social => (
            <a key={social} href="#" className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center hover:bg-[#ff7300] hover:text-white transition-all duration-300 border border-white/5">
              {social}
            </a>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase text-xs tracking-[0.2em] text-zinc-600">Quick Links</h4>
        <ul className="space-y-3 text-zinc-400">
          <li><Link to="/" className="hover:text-[#ff7300] transition-colors">Main Page</Link></li>
          <li><Link to="/about" className="hover:text-[#ff7300] transition-colors">About Us</Link></li>
          <li><Link to="/mock-exam" className="hover:text-[#ff7300] transition-colors">Mock Exam</Link></li>
          <li><Link to="/custom-exam" className="hover:text-[#ff7300] transition-colors">Custom Test</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase text-xs tracking-[0.2em] text-zinc-600">Contact</h4>
        <ul className="space-y-4 text-zinc-400">
          <li className="flex items-start gap-3">
            <span className="text-[#ff7300]">📍</span>
            <span>Tashkent City, <br/>Uzbekistan</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-[#ff7300]">📞</span>
            <span>+998 90 123 45 67</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-[#ff7300]">✉️</span>
            <span>info@managelc.uz</span>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm">
      <p>&copy; {new Date().getFullYear()} Manage LC. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
      </div>
    </div>
  </footer>
);

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f9fafb]">
      <Navbar user={user} onLogout={onLogout} />
      {/* Spacer for floating navbar */}
      <div className="h-24 md:h-28"></div>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
