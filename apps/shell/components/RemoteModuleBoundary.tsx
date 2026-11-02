"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface RemoteModuleBoundaryProps {
  moduleName: string;
  children: ReactNode;
}

interface RemoteModuleBoundaryState {
  error: Error | null;
}

/**
 * Error boundary quanh remote Module Federation (spec FR5/AC5): remote không tải được (server down,
 * lỗi mạng, container lỗi) thì hiển thị thông báo rõ ràng thay vì crash cả Shell. Nút thử lại tải
 * lại cả trang vì next/dynamic ghi nhớ kết quả nạp lỗi trong phiên (reset boundary là không đủ).
 */
export class RemoteModuleBoundary extends Component<
  RemoteModuleBoundaryProps,
  RemoteModuleBoundaryState
> {
  state: RemoteModuleBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RemoteModuleBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[RemoteModuleBoundary] ${this.props.moduleName}`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="dq-panel"
          style={{
            padding: "var(--dq-space-4)",
            color: "var(--dq-color-fg)",
            backgroundColor: "var(--dq-color-bg)",
          }}
        >
          <p style={{ fontWeight: 700 }}>
            Không tải được module &ldquo;{this.props.moduleName}&rdquo;.
          </p>
          <p
            style={{
              marginTop: "var(--dq-space-1)",
              color: "var(--dq-color-muted)",
            }}
          >
            {this.state.error.message}
          </p>
          <button
            type="button"
            style={{
              marginTop: "var(--dq-space-3)",
              padding: "var(--dq-space-2) var(--dq-space-4)",
              border: "2px solid var(--dq-color-primary)",
              background: "var(--dq-color-primary)",
              color: "var(--dq-color-primary-fg)",
              fontWeight: 600,
              borderRadius: 0,
              cursor: "pointer",
            }}
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
