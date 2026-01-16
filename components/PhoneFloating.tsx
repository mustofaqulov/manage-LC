import React from 'react';

const PhoneFloating: React.FC = () => {
  return (
    <a
      href="tel:+998787777707"
      className="group fixed bottom-10 right-10 z-50 flex items-center gap-3
      bg-gradient-to-r from-emerald-400 to-green-500
      text-white rounded-full shadow-[0_20px_50px_rgba(34,197,94,0.6)]
      px-2 py-3 transition-all duration-500 overflow-hidden
      hover:pl-6 hover:pr-8 hover:shadow-[0_30px_80px_rgba(34,197,94,0.9)]">
      {/* Phone Icon */}
      <>
        <div
          className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center
        backdrop-blur-lg">
          <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884l2-3.5a1 1 0 011.37-.366l3.24 1.87a1 1 0 01.36 1.366l-1.52 2.63a11.042 11.042 0 005.46 5.46l2.63-1.52a1 1 0 011.366.36l1.87 3.24a1 1 0 01-.366 1.37l-3.5 2a1 1 0 01-.91.07c-7.72-3.04-13.46-8.78-16.5-16.5a1 1 0 01.07-.91z" />
          </svg>
        </div>

        <div className="max-w-0 group-hover:max-w-[260px] transition-all duration-500 overflow-hidden whitespace-nowrap">
          <span className="text-lg font-bold tracking-wide">+998 (90) 733-33-36</span>
        </div>
      </>
    </a>
  );
};

export default PhoneFloating;
