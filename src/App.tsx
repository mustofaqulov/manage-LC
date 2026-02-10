import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './utils/configs/toast.css';
import { store } from './store';
import type { RootState } from './store';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { I18nProvider } from './i18n';
import { toastConfig } from './utils/configs/toastConfig';
import styles from './App.module.scss';

// React Query client yaratish
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Window focus'da avtomatik refetch qilmaslik
      retry: 1, // Xatolik bo'lsa 1 marta qayta urinish
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const MockExam = lazy(() => import('./pages/MockExam'));
const ExamFlow = lazy(() => import('./pages/ExamFlow'));
const History = lazy(() => import('./pages/History'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Login = lazy(() => import('./pages/Login'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const ApiTest = lazy(() => import('./pages/ApiTest'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const CustomExam = lazy(() => import('./pages/CustomExam'));

// Protected route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, legacyUser } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated && !legacyUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <I18nProvider>
            <Router>
              <ScrollToTop />
              <Layout>
              <Suspense fallback={<div className={styles.suspenseFallback}>Loading...</div>}>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mock-exam" element={<MockExam />} />
                <Route path="/exam-flow/:testId" element={<ProtectedRoute><ExamFlow /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/courses/english" element={<CourseDetail />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/api-test" element={<ApiTest />} />
                <Route path="/custom-exam" element={<CustomExam />} />
              </Routes>
              </Suspense>
            </Layout>
          </Router>
        </I18nProvider>
      </ErrorBoundary>
      <ToastContainer {...toastConfig} aria-label="Notifications" />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </Provider>
  );
};

export default App;

