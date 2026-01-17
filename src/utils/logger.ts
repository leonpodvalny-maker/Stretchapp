/**
 * Logger utility for consistent logging across the app
 * In production, this could be extended to send logs to a remote service
 */

const IS_DEV = __DEV__;

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (IS_DEV) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (IS_DEV) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (IS_DEV) {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In production, could send to error tracking service
  },

  error: (message: string, error?: any, ...args: any[]) => {
    if (IS_DEV) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
    // In production, could send to error tracking service like Sentry
  },
};
