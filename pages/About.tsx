import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8">
          About <span className="text-[#ff7300]">Manage LC</span>
        </h1>

        <div className="prose prose-lg text-zinc-600 leading-relaxed space-y-6">
          <p>
            Manage LC is Uzbekistan's premier destination for high-quality English and Mathematics
            education. Founded in 2021, our center has helped over 5,000 students achieve their
            academic and professional goals.
          </p>

          <div className="h-64 rounded-3xl overflow-hidden my-12">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-2xl font-bold text-[#222222]">Our Mission</h3>
          <p>
            We believe that education should be accessible, modern, and driven by technology. Our
            mock exam platform is a testament to our commitment to innovation, providing students
            with the most realistic prep experience available in the region.
          </p>

          <h3 className="text-2xl font-bold text-[#222222]">Why CEFR?</h3>
          <p>
            The Common European Framework of Reference for Languages (CEFR) is the international
            standard for describing language ability. In Uzbekistan, mastering the CEFR exam is a
            key gateway to university entrance and professional advancement. We specialize in
            preparing you for every section of this multi-level test.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-black text-[#ff7300]">50+</p>
            <p className="text-zinc-500 text-sm">Expert Teachers</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#ff7300]">10k+</p>
            <p className="text-zinc-500 text-sm">Exams Taken</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#ff7300]">12</p>
            <p className="text-zinc-500 text-sm">Campuses</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#ff7300]">92%</p>
            <p className="text-zinc-500 text-sm">Pass Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
