import * as React from 'react';
import { DSCrashFallback } from '../components/design-system/DSStatus';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0C12] text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <DSCrashFallback
              errorMsg={this.state.error?.stack || this.state.error?.message || 'React render boundary caught an unhandled runtime error.'}
              onReset={this.handleReset}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
