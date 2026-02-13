import { createErrorFromUnknown } from './classes.js';

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  /** Show detailed error information */
  detailed?: boolean;
  /** Log error details */
  logErrors?: boolean;
  /** Logger instance */
  logger?: {
    error: (message: string, meta?: unknown) => void;
    warn: (message: string, meta?: unknown) => void;
    debug: (message: string, meta?: unknown) => void;
  };
}

/**
 * Error handler result
 */
export interface ErrorHandlerResult {
  success: false;
  error: {
    message: string;
    code: number;
    details?: string;
  };
}

/**
 * Global error handler class
 */
export class ErrorHandler {
  private options: ErrorHandlerOptions;

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      detailed: false,
      logErrors: true,
      ...options,
    };
  }

  /**
   * Handle error and return user-friendly response
   */
  handle(error: unknown, context?: string): ErrorHandlerResult {
    const appError = createErrorFromUnknown(error);
    const contextMsg = context ? `[${context}] ` : '';

    // Log error if configured
    if (this.options.logErrors && this.options.logger) {
      this.options.logger.error(`${contextMsg}Error occurred`, {
        error: appError.toJSON(),
      });
    }

    // Build user-friendly response
    const result: ErrorHandlerResult = {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
      },
    };

    // Add details in detailed mode (development)
    if (this.options.detailed && appError.stack) {
      result.error.details = appError.stack;
    }

    return result;
  }

  /**
   * Handle error and throw MCP error
   */
  handleMCP(error: unknown, context?: string): never {
    const appError = createErrorFromUnknown(error);
    const contextMsg = context ? `${context}: ` : '';

    // Log error if configured
    if (this.options.logErrors && this.options.logger) {
      this.options.logger.error(`${contextMsg}MCP Error occurred`, {
        error: appError.toJSON(),
      });
    }

    // Throw user-friendly error
    throw new Error(`${contextMsg}${appError.message}`);
  }

  /**
   * Wrap async function with error handling
   */
  async wrap<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<{ success: true; data: T } | ErrorHandlerResult> {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (error) {
      return this.handle(error, context);
    }
  }

  /**
   * Update options
   */
  setOptions(options: Partial<ErrorHandlerOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

/**
 * Default error handler instance
 */
export const errorHandler = new ErrorHandler({
  detailed: process.env.NODE_ENV === 'development',
  logErrors: true,
});
