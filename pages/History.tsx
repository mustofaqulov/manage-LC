import React from 'react';
import { ExamMode } from '../types';

const History: React.FC = () => {
  const mockHistory = [
    { id: '1', date: '2023-11-20', mode: ExamMode.FULL, score: 8.5, recordings: 10 },
    { id: '2', date: '2023-11-15', mode: ExamMode.RANDOM, score: 7.0, recordings: 3 },
    { id: '3', date: '2023-11-10', mode: ExamMode.FULL, score: 6.5, recordings: 10 },
  ];

  return (
    <div className="bg-zinc-50 py-20 px-6 md:px-12 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-12">Exam History & Performance</h1>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">
              Total Exams
            </p>
            <p className="text-4xl font-black">12</p>
          </div>
          <div className="bg-[#ff7300] text-white p-8 rounded-3xl shadow-lg">
            <p className="text-orange-200 text-xs font-bold uppercase tracking-widest mb-1">
              Avg Score
            </p>
            <p className="text-4xl font-black">7.2</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">
              Improvement
            </p>
            <p className="text-4xl font-black text-green-500">+0.7</p>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-8 py-4 text-xs font-bold uppercase text-zinc-500">Date</th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-zinc-500">Mode</th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-zinc-500">Recordings</th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-zinc-500">
                  Estimated Score
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-zinc-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {mockHistory.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-8 py-6 font-medium">{item.date}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.mode === ExamMode.FULL
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                      {item.mode}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-zinc-500">{item.recordings} files</td>
                  <td className="px-8 py-6 font-bold">{item.score}</td>
                  <td className="px-8 py-6">
                    <button className="text-[#ff7300] font-bold hover:underline">
                      Review &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
