import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Custom fallback UI. If omitted a minimal inline error card is shown. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary
 *
 * Catches render-phase exceptions in any child component tree so the rest of
 * the page keeps working. React requires this to be a class component.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<p>Custom error UI</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console (replace with your error-reporting service in production)
    console.error(
      "[ErrorBoundary] Caught render error:",
      error,
      info.componentStack,
    );
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-3 text-center bg-bg-card rounded shadow-betting-card">
        <span className="text-2xl">⚠️</span>
        <p className="text-sm font-semibold text-neutral-gray-800">
          Something went wrong
        </p>
        {this.state.error?.message && (
          <p className="text-xs text-neutral-gray-500 font-mono max-w-xs break-words">
            {this.state.error.message}
          </p>
        )}
        <button
          onClick={this.handleReset}
          className="text-xs bg-brand-primary text-brand-text px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    );
  }
}
