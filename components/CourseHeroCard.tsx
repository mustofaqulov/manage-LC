import React from 'react';
import { Link } from 'react-router-dom';

interface CourseHeroCardProps {
  level: string;
  title: string;
  description: string;
  overlayGradient: string;
  bg: string;
}

const CourseHeroCard: React.FC<CourseHeroCardProps> = ({
  level,
  title,
  description,
  overlayGradient,
  bg,
}) => {
  return (
    <div
      className="relative w-full min-h-[620px] rounded-[40px] overflow-hidden
      bg-cover bg-center border border-white/20
      backdrop-blur-2xl shadow-[0_40px_140px_rgba(0,0,0,0.9)]"
      style={{ backgroundImage: `url(${bg})` }}>
      {/* Dark base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/85 via-[#0e0e0e]/80 to-black/90" />

      {/* Course accent gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${overlayGradient}`} />

      {/* Grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-14">
        <span className="inline-block mb-4 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm w-max">
          {level}
        </span>

        <h2 className="text-5xl font-black text-white mb-4">{title}</h2>

        <p className="text-white/70 max-w-xl mb-8">{description}</p>

        <div className="flex gap-4">
          <Link
            to="/mock-exam"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-400 font-bold text-white shadow-xl hover:scale-105 transition">
            Take Mock Exam
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition">
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseHeroCard;
