'use client'
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Store error details in state for display
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center mb-4">
            <span className="text-red-600 text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
              <p className="text-red-600">The analytics component encountered an error.</p>
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-red-700 font-medium">
                Error Details (Development Mode)
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded text-sm">
                <p className="font-medium text-red-800">Error:</p>
                <pre className="text-red-700 whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                </pre>
                <p className="font-medium text-red-800 mt-2">Stack Trace:</p>
                <pre className="text-red-700 whitespace-pre-wrap text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 