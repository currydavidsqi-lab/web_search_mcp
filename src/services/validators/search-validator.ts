import type { SearchRequest } from '../../types/search.js';
import { ValidationError, ErrorCode } from '../../infrastructure/errors/index.js';

/**
 * Validator options
 */
export interface ValidatorOptions {
  /** Allow empty queries */
  allowEmptyQuery?: boolean;
  /** Minimum query length */
  minQueryLength?: number;
  /** Maximum query length */
  maxQueryLength?: number;
  /** Maximum results allowed */
  maxResultsLimit?: number;
}

/**
 * Default validator options
 */
const DEFAULT_VALIDATOR_OPTIONS: Required<ValidatorOptions> = {
  allowEmptyQuery: false,
  minQueryLength: 1,
  maxQueryLength: 1000,
  maxResultsLimit: 20,
};

/**
 * Search request validator
 */
export class SearchValidator {
  private options: Required<ValidatorOptions>;

  constructor(options: ValidatorOptions = {}) {
    this.options = { ...DEFAULT_VALIDATOR_OPTIONS, ...options };
  }

  /**
   * Validate search request
   */
  validate(request: SearchRequest): void {
    // Validate query
    this.validateQuery(request.query);

    // Validate maxResults
    if (request.maxResults !== undefined) {
      this.validateMaxResults(request.maxResults);
    }
  }

  /**
   * Validate query string
   */
  private validateQuery(query: string): void {
    if (!query || typeof query !== 'string') {
      throw new ValidationError(
        'Query must be a non-empty string',
        ErrorCode.INVALID_QUERY
      );
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      throw new ValidationError(
        'Query cannot be empty or whitespace only',
        ErrorCode.INVALID_QUERY
      );
    }

    if (trimmedQuery.length < this.options.minQueryLength) {
      throw new ValidationError(
        `Query must be at least ${this.options.minQueryLength} character(s)`,
        ErrorCode.INVALID_QUERY
      );
    }

    if (trimmedQuery.length > this.options.maxQueryLength) {
      throw new ValidationError(
        `Query must not exceed ${this.options.maxQueryLength} characters`,
        ErrorCode.INVALID_QUERY
      );
    }
  }

  /**
   * Validate maxResults parameter
   */
  private validateMaxResults(maxResults: number): void {
    if (typeof maxResults !== 'number') {
      throw new ValidationError(
        'maxResults must be a number',
        ErrorCode.INVALID_PARAMETER
      );
    }

    if (!Number.isInteger(maxResults)) {
      throw new ValidationError(
        'maxResults must be an integer',
        ErrorCode.INVALID_PARAMETER
      );
    }

    if (maxResults < 1) {
      throw new ValidationError(
        'maxResults must be at least 1',
        ErrorCode.INVALID_PARAMETER
      );
    }

    if (maxResults > this.options.maxResultsLimit) {
      throw new ValidationError(
        `maxResults must not exceed ${this.options.maxResultsLimit}`,
        ErrorCode.INVALID_PARAMETER
      );
    }
  }

  /**
   * Sanitize and normalize request
   */
  sanitize(request: SearchRequest): SearchRequest {
    const sanitized: SearchRequest = {
      query: request.query.trim(),
    };

    if (request.maxResults !== undefined) {
      sanitized.maxResults = Math.min(request.maxResults, this.options.maxResultsLimit);
    }

    return sanitized;
  }

  /**
   * Validate and sanitize in one step
   */
  validateAndSanitize(request: SearchRequest): SearchRequest {
    this.validate(request);
    return this.sanitize(request);
  }

  /**
   * Update validator options
   */
  setOptions(options: Partial<ValidatorOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current options
   */
  getOptions(): Readonly<Required<ValidatorOptions>> {
    return this.options;
  }
}

/**
 * Default validator instance
 */
export const searchValidator = new SearchValidator();
