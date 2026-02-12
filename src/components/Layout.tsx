import React from 'react';
import Header from './Header';
import Footer from './Footer';
import PhoneFloating from '@/components/PhoneFloating.tsx';
import { BetaBanner } from './BetaBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050505]">
      <BetaBanner />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <PhoneFloating></PhoneFloating>
    </div>
  );
};

export default Layout;

