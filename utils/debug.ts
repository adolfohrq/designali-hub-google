// Debug utility with flag control
// Set DEBUG=true in environment or localStorage to enable debug logging

const isDebugEnabled = (): boolean => {
  // Check localStorage first (can be set in browser console: localStorage.setItem('DEBUG', 'true'))
  if (typeof window !== 'undefined') {
    const localDebug = localStorage.getItem('DEBUG');
    if (localDebug === 'true') return true;
  }

  // Check if running in development mode
  return import.meta.env.DEV || false;
};

export const debug = {
  log: (...args: any[]) => {
    if (isDebugEnabled()) {
      console.log('[DEBUG]', ...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDebugEnabled()) {
      console.warn('[DEBUG WARN]', ...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, but with debug prefix when enabled
    if (isDebugEnabled()) {
      console.error('[DEBUG ERROR]', ...args);
    } else {
      console.error(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDebugEnabled()) {
      console.info('[DEBUG INFO]', ...args);
    }
  },

  table: (data: any) => {
    if (isDebugEnabled()) {
      console.table(data);
    }
  },
};

// Helper to enable/disable debug from console
if (typeof window !== 'undefined') {
  (window as any).enableDebug = () => {
    localStorage.setItem('DEBUG', 'true');
    console.log('Debug mode enabled. Reload the page to see debug logs.');
  };

  (window as any).disableDebug = () => {
    localStorage.setItem('DEBUG', 'false');
    console.log('Debug mode disabled. Reload the page.');
  };
}
