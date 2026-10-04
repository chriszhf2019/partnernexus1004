import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md text-center">
            <div className="w-14 h-14 rounded-full bg-orange-400/10 border border-orange-400/30 flex items-center justify-center mx-auto mb-4 text-orange-300">
              <AlertTriangle size={28} />
            </div>

            <h2 className="font-sans font-semibold text-slate-200 text-base mb-2">
              星光出现了扰动
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              宇宙中出现了一点小波动，部分功能暂时无法正常显示。
              <br />
              请尝试刷新或重置星系状态。
            </p>

            {this.state.error && (
              <div 
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-4 text-left"
                role="alert"
                aria-live="polite"
              >
                <p className="text-[11px] text-slate-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                aria-label="重试恢复"
              >
                <RotateCcw size={12} aria-hidden="true" />
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                aria-label="刷新页面"
              >
                <Home size={12} aria-hidden="true" />
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
