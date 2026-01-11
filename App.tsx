import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { User } from './types';
import { userService } from './services/userService';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const MockExam = lazy(() => import('./pages/MockExam'));
const ExamFlow = lazy(() => import('./pages/ExamFlow'));
const History = lazy(() => import('./pages/History'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Login = lazy(() => import('./pages/Login'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // localStorage'dan user ma'lumotini yuklash
  useEffect(() => {
    const savedUser = userService.getUser();
    if (savedUser && userService.isSubscriptionValid(savedUser)) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (phone: string) => {
    const newUser: User = {
      id: 'usr_1',
      phone,
      isSubscribed: true,
      subscriptionExpiry: '2024-12-31',
    };
    setUser(newUser);
    userService.saveUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    userService.clearUser();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff7300]/20 border-t-[#ff7300] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Suspense fallback={<div className="p-10 text-center text-zinc-500">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/mock-exam" element={<MockExam user={user} />} />
              <Route
                path="/exam-flow/:mode"
                element={user ? <ExamFlow /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/history"
                element={user ? <History /> : <Navigate to="/login" replace />}
              />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/courses/english" element={<CourseDetail />} />
              <Route
                path="/custom-exam"
                element={
                  <div className="p-20 text-center">
                    <h1 className="text-3xl font-bold">Custom Exam Config</h1>
                    <p className="text-zinc-500 mt-4">
                      Module coming soon. Use Full or Random test for now.
                    </p>
                    <button
                      onClick={() => window.history.back()}
                      className="mt-8 bg-[#ff7300] text-white px-6 py-2 rounded">
                      Go Back
                    </button>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
