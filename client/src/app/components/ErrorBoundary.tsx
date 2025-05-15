'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  FallbackComponent: React.ComponentType<{ 
    error: Error; 
    resetErrorBoundary: () => void;
  }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle errors in React components
 * This helps prevent the entire application from crashing when a component fails
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  // Update state when an error occurs
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Log error details for debugging
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  // Reset the error state to allow recovery
  private resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render(): ReactNode {
    // If there's an error, render the fallback component
    if (this.state.hasError && this.state.error) {
      return (
        <this.props.FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    // Otherwise, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
