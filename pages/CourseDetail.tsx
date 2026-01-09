import React from 'react';
import { Link } from 'react-router-dom';
import Teacher from '../assets/images/Jakhongir.jpg';

const CourseDetail: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#222222] text-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <nav className="flex gap-2 text-zinc-400 text-sm mb-6 font-medium">
              <Link to="/" className="hover:text-[#ff7300]">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">English Mastery</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Master the <span className="text-[#ff7300]">English Language</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
              From foundational grammar to advanced CEFR/IELTS preparation. Join the most effective
              English course in Uzbekistan designed for rapid progress and real-world confidence.
            </p>
            <div className="mt-8 flex gap-4">
              <button className="bg-[#ff7300] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66700] transition-colors shadow-lg">
                Join the Course
              </button>
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Next group starts: June 1st
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Course Overview</h2>
            <p className="text-zinc-600 leading-relaxed mb-6">
              Our English Mastery program is meticulously designed to take students from any level
              to C1/C2 fluency. We combine traditional academic excellence with modern communicative
              techniques, ensuring you don't just "know" English, but can actually "use" it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Interactive Speaking Workshops',
                'CEFR & IELTS Focused Curriculum',
                'Advanced Grammar Mastery',
                'Academic Writing Skills',
                'Weekly Performance Tracking',
                'Immersive Media Lab',
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[#ff7300] font-bold">✓</span>
                  <span className="font-medium text-zinc-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Curriculum Structure</h2>
            <div className="space-y-4">
              {[
                {
                  level: 'Level 1: Foundation',
                  topics: 'Essentials of structure, daily communication, and phonetics.',
                },
                {
                  level: 'Level 2: Intermediate',
                  topics: 'Complex tenses, opinion essays, and business discussions.',
                },
                {
                  level: 'Level 3: Upper Intermediate',
                  topics: 'Advanced idiomatic language, debate, and report writing.',
                },
                {
                  level: 'Level 4: Exam Readiness',
                  topics: 'Intensive mock exams, speed reading, and exam psychology.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 border border-zinc-200 rounded-2xl hover:border-[#ff7300] transition-colors group">
                  <h4 className="font-bold text-xl group-hover:text-[#ff7300] transition-colors">
                    {item.level}
                  </h4>
                  <p className="text-zinc-500 mt-2">{item.topics}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-zinc-50 rounded-3xl p-8 border border-zinc-200">
            <h3 className="text-xl font-bold mb-6 uppercase tracking-widest text-zinc-400 text-sm">
              Lead Instructor
            </h3>
            <div className="relative mb-6 rounded-2xl overflow-hidden shadow-xl aspect-square">
              <img
                src={Teacher}
                alt="Jahongir Shahabov"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';
                }}
              />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-black">Jahongir Shahabov</h4>
                <p className="text-[#ff7300] font-bold uppercase text-xs tracking-wider">
                  LC Founder & Senior Teacher
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Experience</span>
                  <span className="font-bold">7 Years</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">IELTS Score</span>
                  <span className="font-bold bg-zinc-800 text-white px-2 py-0.5 rounded">7.5</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">CEFR Certification</span>
                  <span className="font-bold text-[#ff7300]">C1 Level</span>
                </div>
              </div>

              <p className="text-sm text-zinc-500 italic leading-relaxed pt-4">
                "My mission is to break the language barrier for every student in Uzbekistan.
                English isn't just a subject; it's the key to your global future."
              </p>

              <button className="w-full mt-6 bg-[#222222] text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                Book a Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-900 py-20 px-6 text-white text-center">
        <h2 className="text-3xl font-bold mb-12">What our students achieve</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-4xl font-black text-[#ff7300]">8.0</p>
            <p className="text-zinc-500 text-sm">Top IELTS Score</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#ff7300]">C1</p>
            <p className="text-zinc-500 text-sm">Avg. CEFR Result</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#ff7300]">500+</p>
            <p className="text-zinc-500 text-sm">Students monthly</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#ff7300]">100%</p>
            <p className="text-zinc-500 text-sm">Satisfaction Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
