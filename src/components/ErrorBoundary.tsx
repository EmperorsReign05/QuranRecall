"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public handleReload = (): void => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/25">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            Something went wrong loading your data.
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Refresh to try again.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
