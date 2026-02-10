import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './utils/configs/toast.css';
import { store } from './src/store';
import type { RootState } from './src/store';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';
import { I18nProvider, useTranslation } from './i18n';
import { useGetMe } from './services/hooks';
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

// Premium route — faqat obunasi bor foydalanuvchilar uchun
const PremiumRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, legacyUser } = useSelector((state: RootState) => state.auth);

  // Avval auth tekshirish
  if (!isAuthenticated && !legacyUser) {
    return <Navigate to="/login" replace />;
  }

  // Legacy user — o'zining isSubscribed field'i bor
  if (legacyUser) {
    return legacyUser.isSubscribed ? children : <SubscriptionPaywall />;
  }

  // Modern user — useGetMe orqali tekshirish
  return <PremiumCheck>{children}</PremiumCheck>;
};

const PremiumCheck: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user?.isSubscribed) {
    return <SubscriptionPaywall />;
  }

  return children;
};

const SubscriptionPaywall: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#ff7300]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t('premium.title')}
        </h2>
        <p className="text-gray-500 mb-8">
          {t('premium.description')}
        </p>
        <Link
          to="/subscribe"
          className="block w-full py-3 px-6 bg-[#ff7300] hover:bg-[#e56800] text-white font-semibold rounded-xl transition-colors mb-3"
        >
          {t('premium.subscribeButton')}
        </Link>
        <Link
          to="/"
          className="block text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          {t('premium.backHome')}
        </Link>
      </div>
    </div>
  );
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
                <Route path="/exam-flow/:testId" element={<PremiumRoute><ExamFlow /></PremiumRoute>} />
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
