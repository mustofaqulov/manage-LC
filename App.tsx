
import React, { useState } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import MockExam from './pages/MockExam';
import ExamFlow from './pages/ExamFlow';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import CourseDetail from './pages/CourseDetail';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (phone: string) => {
    // Simulate user session
    setUser({
      id: 'usr_1',
      phone,
      isSubscribed: true, // Mocking subscribed status
      subscriptionExpiry: '2024-12-31'
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/mock-exam" element={<MockExam user={user} />} />
          <Route path="/exam-flow/:mode" element={user ? <ExamFlow /> : <Navigate to="/login" replace />} />
          <Route path="/history" element={user ? <History /> : <Navigate to="/login" replace />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/courses/english" element={<CourseDetail />} />
          
          {/* Custom Exam placeholder */}
          <Route path="/custom-exam" element={
            <div className="p-20 text-center">
              <h1 className="text-3xl font-bold">Custom Exam Config</h1>
              <p className="text-zinc-500 mt-4">Module coming soon. Use Full or Random test for now.</p>
              <button onClick={() => window.history.back()} className="mt-8 bg-[#ff7300] text-white px-6 py-2 rounded">Go Back</button>
            </div>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
