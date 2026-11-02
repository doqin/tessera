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
        <div role="alert" className="rounded-md border border-border p-6 text-sm">
          <p className="font-semibold">
            Không tải được module &ldquo;{this.props.moduleName}&rdquo;.
          </p>
          <p className="mt-1 text-foreground/70">{this.state.error.message}</p>
          <button
            type="button"
            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
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
