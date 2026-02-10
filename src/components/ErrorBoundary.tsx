import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-black text-[#ff7300] mb-4">Oops!</h1>
            <p className="text-zinc-600 mb-6">Something went wrong. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#ff7300] hover:bg-[#e66700] text-white px-8 py-3 rounded-lg font-bold transition-colors">
              Refresh Page
            </button>
            <p className="text-xs text-zinc-400 mt-6 font-mono">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

