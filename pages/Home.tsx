import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <section className="relative py-24 px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#222222]">
              Master Your <span className="text-[#ff7300]">CEFR</span> Speaking.
            </h1>
            <p className="text-xl text-zinc-600 max-w-lg leading-relaxed">
              Experience the most realistic mock exams in Uzbekistan. Automated timing, AI-powered
              prompts, and comprehensive analytics.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/mock-exam"
                className="bg-[#ff7300] hover:bg-[#e66700] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
                Take a Mock Exam
              </Link>
              <Link
                to="/about"
                className="bg-[#222222] hover:bg-zinc-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="w-full h-[400px] bg-zinc-200/50 rounded-3xl overflow-hidden shadow-2xl relative border border-white/20 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                alt="Student studying"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ff7300]/20 to-transparent"></div>
            </div>
            {/* Stats Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 hidden lg:block">
              <p className="text-[#ff7300] text-4xl font-black">98%</p>
              <p className="text-zinc-500 font-medium">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Professional Courses</h2>
            <div className="w-20 h-1 bg-[#ff7300] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              onClick={() => navigate('/courses/english')}
              className="group bg-white/60 backdrop-blur-md border border-white/50 p-8 rounded-3xl hover:border-[#ff7300] transition-all cursor-pointer shadow-sm hover:shadow-xl">
              <div className="w-16 h-16 bg-[#ff7300]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#ff7300] transition-colors">
                <span className="text-[#ff7300] group-hover:text-white text-3xl font-bold">EN</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">English Language</h3>
              <p className="text-zinc-500 mb-6">
                From beginner to IELTS/CEFR mastery. Our curriculum is designed by Jahongir Shahabov
                to make you fluent and confident.
              </p>
              <button className="text-[#ff7300] font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                Learn more <span>&rarr;</span>
              </button>
            </div>

            <div className="group bg-white/40 backdrop-blur-md border border-white/30 p-8 rounded-3xl opacity-60 transition-all cursor-not-allowed shadow-sm">
              <div className="w-16 h-16 bg-[#222222]/10 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-[#222222] text-3xl font-bold">MA</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Mathematics</h3>
              <p className="text-zinc-500 mb-6">
                Master the art of numbers. Perfect for school preparation and national university
                entrance exams.
              </p>
              <button className="text-[#222222] font-bold flex items-center gap-2 transition-all">
                Coming soon...
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-24 bg-[#222222]/95 backdrop-blur-lg text-white px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8">
              Why Students Choose <span className="text-[#ff7300]">Manage LC</span>?
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: 'AI-Powered Assessment',
                  desc: 'Real-time feedback on your speaking performance using cutting-edge models.',
                },
                {
                  title: 'Official Exam Simulation',
                  desc: 'Timing and structure exactly like the real CEFR Multi-level exam.',
                },
                {
                  title: 'Track Your Progress',
                  desc: 'Detailed history and statistics to visualize your improvements over time.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff7300] flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              <img
                src="https://picsum.photos/seed/learn1/400/400"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                alt="LC Classroom"
              />
            </div>
            <div className="h-64 bg-zinc-800 rounded-2xl mt-8 overflow-hidden shadow-2xl border border-white/5">
              <img
                src="https://picsum.photos/seed/learn2/400/400"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                alt="Student Life"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
