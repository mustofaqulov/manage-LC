import React from 'react';
import { User } from '../types';
import Header from './Header';
import Footer from './Footer';
import PhoneFloating from '@/components/PhoneFloating.tsx';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f9fafb]">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-grow">{children}</main>
      <Footer />
      <PhoneFloating></PhoneFloating>
    </div>
  );
};

export default Layout;
