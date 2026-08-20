import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("IronLog crashed:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-panel/90 p-6 text-center">
          <p className="display text-2xl text-accent">Something broke</p>
          <p className="mt-2 text-sm text-mist">
            The page hit an unexpected error. Reloading usually clears it.
          </p>
          <p className="mt-4 break-words rounded-xl border border-line bg-ink px-3 py-2 text-left text-xs text-mist">
            {error.message}
          </p>
          <button
            type="button"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-2"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
