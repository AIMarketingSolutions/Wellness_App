// WebContainer-specific utilities to handle iframe and cross-origin issues

export class WebContainerUtils {
  // Safe alert replacement that won't cause iframe issues
  static showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const colors = {
      success: '#10B981',
      error: '#EF4444',
      info: '#3B82F6'
    };

    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
      ">
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }

  // Safe async operation wrapper
  static async safeAsyncOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      console.error(errorMessage, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : errorMessage 
      };
    }
  }

  // Prevent memory leaks in WebContainer
  static createCleanupEffect(cleanup: () => void) {
    const handleBeforeUnload = () => {
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }

  // Safe state update to prevent race conditions
  static safeStateUpdate<T>(
    setter: React.Dispatch<React.SetStateAction<T>>, 
    value: T | ((prev: T) => T)
  ) {
    try {
      setter(value);
    } catch (error) {
      console.error('State update failed:', error);
    }
  }

  // Handle cross-origin communication safely
  static postMessageSafe(message: any, targetOrigin: string = '*') {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, targetOrigin);
      }
    } catch (error) {
      console.error('PostMessage failed:', error);
    }
  }

  // Debounce function to prevent rapid successive calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Check if running in WebContainer environment
  static isWebContainer(): boolean {
    return window.location.hostname.includes('webcontainer') || 
           window.location.hostname.includes('local-credentialless');
  }

  // Safe localStorage operations
  static safeLocalStorage = {
    getItem(key: string): string | null {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    
    setItem(key: string, value: string): boolean {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    
    removeItem(key: string): boolean {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}

// React hook for WebContainer-safe effects
export function useWebContainerEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList
) {
  React.useEffect(() => {
    try {
      const cleanup = effect();
      return cleanup;
    } catch (error) {
      console.error('Effect error:', error);
    }
  }, deps);
}

// Error boundary for WebContainer
export class WebContainerErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WebContainer Error Boundary caught an error:', error, errorInfo);
    
    // Safe error reporting
    WebContainerUtils.postMessageSafe({
      type: 'error',
      error: error.message,
      stack: error.stack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            An error occurred in the exercise tracking system. Please refresh the page and try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}