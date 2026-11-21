"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RemoteErrorFallback } from "./RemoteErrorFallback";

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
        <RemoteErrorFallback
          moduleName={this.props.moduleName}
          message={this.state.error.message}
        />
      );
    }
    return this.props.children;
  }
}
