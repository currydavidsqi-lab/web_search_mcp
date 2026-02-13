import {
  AppError,
  ConfigError,
  NetworkError,
  SearchError,
  ValidationError,
  MCPError,
  ErrorCode,
} from '../../types/errors.js';

/**
 * Re-export error classes for convenience
 */
export {
  AppError,
  ConfigError,
  NetworkError,
  SearchError,
  ValidationError,
  MCPError,
  ErrorCode,
};

/**
 * Create error from unknown error type
 */
export function createErrorFromUnknown(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Try to determine error type from message
    const message = error.message.toLowerCase();

    if (message.includes('timeout')) {
      return new NetworkError(
        `Request timeout: ${error.message}`,
        ErrorCode.NETWORK_TIMEOUT
      );
    }

    if (message.includes('network') || message.includes('ECONNREFUSED')) {
      return new NetworkError(
        `Network error: ${error.message}`,
        ErrorCode.NETWORK_ERROR
      );
    }

    if (message.includes('proxy')) {
      return new NetworkError(
        `Proxy error: ${error.message}`,
        ErrorCode.PROXY_ERROR
      );
    }

    // Default to generic AppError
    return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, false);
  }

  if (typeof error === 'string') {
    return new AppError(error, ErrorCode.UNKNOWN_ERROR, false);
  }

  return new AppError(
    'An unknown error occurred',
    ErrorCode.UNKNOWN_ERROR,
    false
  );
}

/**
 * Check if error is operational (recoverable)
 */
export function isOperationalError(error: unknown): boolean {
  const appError = createErrorFromUnknown(error);
  return appError.isOperational;
}
