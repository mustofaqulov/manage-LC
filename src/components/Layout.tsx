import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PhoneFloating from '@/components/PhoneFloating.tsx';
import { stopAllAudio } from '../services/geminiService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const isLeavingExamFlow = previousPath.includes('/exam-flow') && !location.pathname.includes('/exam-flow');
    if (isLeavingExamFlow) {
      stopAllAudio();
    }
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-[#050505]">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <PhoneFloating></PhoneFloating>
    </div>
  );
};

export default Layout;

