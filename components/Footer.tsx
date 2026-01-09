import React from 'react';
import { Link } from 'react-router-dom';
import LogoLight from '../assets/images/logo-light.png';

const Footer: React.FC = () => (
  <footer className="bg-[#111111] text-white py-20 px-6 md:px-12 border-t border-zinc-900 mt-auto">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <img src={LogoLight} alt="Manage LC Logo" className="w-32 h-12" />
        <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed mt-4">
          The international standard for CEFR and IELTS preparation in Uzbekistan. Empowering
          students with AI-driven technology.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase text-xs tracking-[0.2em] text-zinc-600">
          Quick Links
        </h4>
        <ul className="space-y-3 text-zinc-400">
          <li>
            <Link to="/" className="hover:text-[#ff7300] transition-colors">
              Main Page
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-[#ff7300] transition-colors">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/mock-exam" className="hover:text-[#ff7300] transition-colors">
              Mock Exam
            </Link>
          </li>
          <li>
            <Link to="/custom-exam" className="hover:text-[#ff7300] transition-colors">
              Custom Test
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase text-xs tracking-[0.2em] text-zinc-600">Contact</h4>
        <ul className="space-y-4 text-zinc-400">
          <li className="flex items-start gap-3">
            <span className="text-[#ff7300]">📍</span>
            <span>Kashkadarya Region</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-[#ff7300]">📞</span>
            <span>+998 90 870 3154</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-[#ff7300]">✉️</span>
            <span>mustofaqulov.dev@gmail.com</span>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm">
      <p>&copy; {new Date().getFullYear()} Manage LC. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-zinc-400 transition-colors">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-zinc-400 transition-colors">
          Terms of Service
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
