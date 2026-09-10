import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Ha ocurrido un problema</h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono break-all">
                {this.state.error?.message || 'Error inesperado de ejecución'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar Pantalla</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
