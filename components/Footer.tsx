import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import { Instagram, Send } from 'lucide-react';
import LogoLight from '../assets/images/logo-light.png';

const Footer: React.FC = memo(() => {
  const { t } = useTranslation();
  return (
    <footer className="relative overflow-hidden bg-[#040404] text-white pt-28 pb-16 px-6 md:px-12">
      {/* Dark premium background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0b0704] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,115,0,0.14),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(124,58,237,0.16),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-14">
        {/* Brand */}
        <div className="md:col-span-2">
          <img
            src={LogoLight}
            alt="Manage LC Logo"
            className="w-40 mb-6 drop-shadow-[0_0_40px_rgba(255,115,0,0.6)]"
          />
          <div className="flex gap-4">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/manage_lc/"
              target="_blank"
              rel="noopener noreferrer"
              className="
            group w-12 h-12 rounded-full
            bg-white/5 backdrop-blur-xl
            border border-white/10
            flex items-center justify-center
            transition-all duration-500
            hover:scale-110 hover:-translate-y-1
            hover:border-orange-400/40
            hover:shadow-[0_0_45px_rgba(255,115,0,0.6)]
          ">
              <Instagram
                size={20}
                className="text-white/70 group-hover:text-orange-400 transition"
              />
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/manage_lc"
              target="_blank"
              rel="noopener noreferrer"
              className="
            group w-12 h-12 rounded-full
            bg-white/5 backdrop-blur-xl
            border border-white/10
            flex items-center justify-center
            transition-all duration-500
            hover:scale-110 hover:-translate-y-1
            hover:border-indigo-400/40
            hover:shadow-[0_0_45px_rgba(124,58,237,0.6)]
          ">
              <Send size={20} className="text-white/70 group-hover:text-indigo-400 transition" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-bold mb-6 uppercase text-xs tracking-[0.35em] text-white/40">
            {t('common.home')}
          </h4>
          <ul className="space-y-4 text-white/65">
            {[
              { name: t('common.home'), to: '/' },
              { name: t('about.title'), to: '/about' },
              { name: t('mockExam.title'), to: '/mock-exam' },
              { name: t('common.courses'), to: '/courses/english' },
            ].map((link, i) => (
              <li key={i}>
                <Link
                  to={link.to}
                  className="hover:text-orange-400 transition-all hover:tracking-wider">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold mb-6 uppercase text-xs tracking-[0.35em] text-white/40">
            {t('footer.contact')}
          </h4>
          <ul className="space-y-5 text-white/65">
            <li className="flex gap-4 items-center">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Kashkadarya Region
            </li>
            <li className="flex gap-4 items-center">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              +998 (90) 733-33-36
            </li>
          </ul>
        </div>
      </div>

      {/* Social Icons */}
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
