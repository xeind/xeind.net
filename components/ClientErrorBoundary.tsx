"use client";

import React, { useEffect } from "react";

type Props = { children: React.ReactNode };

export default class ClientErrorBoundary extends React.Component<
  Props,
  { hasError: boolean; error?: Error | null }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console and keep the app running; production source maps (if enabled)
    // will help map the stack. This also gives us a place to send errors to an
    // external logging endpoint if you add one later.
    // eslint-disable-next-line no-console
    console.error("ClientErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "#fff1f0",
            color: "#601313",
            padding: "1rem",
            borderRadius: 6,
            margin: 16,
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          }}
        >
          <h2 style={{ margin: 0, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ margin: 0, marginBottom: 8 }}>
            An unexpected error occurred while rendering the page. The app will
            continue running but some UI may behave incorrectly.
          </p>
          <details style={{ marginTop: 8 }}>
            <summary style={{ cursor: "pointer" }}>Show error details</summary>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
              {String(this.state.error)}
            </pre>
          </details>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => location.reload()}
              style={{ marginRight: 8 }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}
