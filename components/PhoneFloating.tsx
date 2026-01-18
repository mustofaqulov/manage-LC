import React from 'react';
import { PhoneIcon } from 'lucide-react';

const PhoneFloating: React.FC = () => {
  return (
    <a
      href="tel:+998907333336"
      className="group fixed bottom-10 right-10 z-50 flex items-center gap-3

      text-white rounded-full
      px-2 py-3 transition-all duration-500 overflow-hidden
      hover:pl-6 hover:pr-8 hover:shadow-[0_30px_80px_rgba(51,204,153,0.15)]
]">
      {/* Phone Icon */}
      <>
        <div
          className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center
        backdrop-blur-lg">
          <PhoneIcon />
        </div>

        <div className="max-w-0 group-hover:max-w-[260px] transition-all duration-500 overflow-hidden whitespace-nowrap">
          <span className="text-lg font-bold tracking-wide">+998 (90) 733-33-36</span>
        </div>
      </>
    </a>
  );
};

export default PhoneFloating;
