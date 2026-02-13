import { getLogger } from '../infrastructure/logging/index.js';

const logger = getLogger();

/**
 * Retry options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Delay between retries in milliseconds */
  delay: number;
  /** Exponential backoff multiplier */
  backoffMultiplier?: number;
  /** Maximum delay between retries */
  maxDelay?: number;
  /** Callback before each retry */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
};

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this is the last attempt
      if (attempt < opts.maxAttempts - 1) {
        // Calculate delay with exponential backoff
        const delay = opts.backoffMultiplier
          ? Math.min(
              opts.delay * Math.pow(opts.backoffMultiplier, attempt),
              opts.maxDelay || Infinity
            )
          : opts.delay;

        logger.debug(`Retrying after ${delay}ms (attempt ${attempt + 1}/${opts.maxAttempts})`, {
          error: lastError.message,
        });

        // Call onRetry callback if provided
        if (opts.onRetry) {
          opts.onRetry(attempt + 1, lastError);
        }

        // Wait before retrying
        await sleep(delay);
      }
    }
  }

  // All retries failed
  throw lastError;
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with specific error condition
 */
export async function retryIf<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    onRetry: (attempt, error) => {
      if (!shouldRetry(error)) {
        throw error; // Don't retry if condition not met
      }
      if (options.onRetry) {
        options.onRetry(attempt, error);
      }
    },
  });
}
