import React from 'react';
import Header from './Header';
import Footer from './Footer';
import PhoneFloating from '@/components/PhoneFloating.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f9fafb]">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <PhoneFloating></PhoneFloating>
    </div>
  );
};

export default Layout;
