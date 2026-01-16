import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { I18nProvider } from './i18n';
import { User } from './types';
import { userService } from './services/userService';
import styles from './App.module.scss';

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
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingInner}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <I18nProvider>
        <Router>
          <Layout user={user} onLogout={handleLogout}>
            <Suspense fallback={<div className={styles.suspenseFallback}>Loading...</div>}>
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
                    <div className={styles.customExamBox}>
                      <h1 className={styles.customExamTitle}>Custom Exam Config</h1>
                      <p className={styles.customExamText}>
                        Module coming soon. Use Full or Random test for now.
                      </p>
                      <button
                        onClick={() => window.history.back()}
                        className={styles.customExamBack}>
                        Go Back
                      </button>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </I18nProvider>
    </ErrorBoundary>
  );
};

export default App;
