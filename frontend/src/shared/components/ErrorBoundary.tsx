import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center bg-[#0A0C10]">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sistem Mengalami Kendala</h1>
          <p className="text-sm text-slate-400 mb-8 max-w-sm">
            Terjadi masalah yang tidak terduga di dalam aplikasi. Silakan muat ulang halaman.
          </p>
          
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-lg w-full max-w-md text-left mb-8 overflow-auto max-h-32">
            <p className="text-xs font-mono text-rose-400">
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>

          <Button variant="primary" onClick={this.handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Muat Ulang Aplikasi
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
