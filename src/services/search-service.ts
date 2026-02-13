import type { SearchRequest, SearchResponse } from '../types/search.js';
import type { ISearchProvider } from '../types/search.js';
import { SearchValidator } from './validators/search-validator.js';
import { getLogger } from '../infrastructure/logging/index.js';
import { SearchError, ErrorCode } from '../infrastructure/errors/index.js';

const logger = getLogger();

/**
 * Search service options
 */
export interface SearchServiceOptions {
  /** Search provider to use */
  provider: ISearchProvider;
  /** Validator instance */
  validator?: SearchValidator;
}

/**
 * Search service
 * Orchestrates search operations using providers
 */
export class SearchService {
  private provider: ISearchProvider;
  private validator: SearchValidator;

  constructor(options: SearchServiceOptions) {
    this.provider = options.provider;
    this.validator = options.validator || new SearchValidator();

    logger.info('Search service initialized', {
      provider: this.provider.getName(),
    });
  }

  /**
   * Perform web search
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    try {
      logger.info('Starting search', {
        query: request.query,
        maxResults: request.maxResults,
        provider: this.provider.getName(),
      });

      // Validate and sanitize request
      const sanitizedRequest = this.validator.validateAndSanitize(request);

      // Check provider availability
      if (!this.provider.isAvailable()) {
        throw new SearchError(
          `Search provider "${this.provider.getName()}" is not available`,
          ErrorCode.SEARCH_PROVIDER_ERROR
        );
      }

      // Perform search through provider
      const response = await this.provider.search(sanitizedRequest);

      logger.info('Search completed', {
        query: request.query,
        success: response.success,
        resultCount: response.resultCount || 0,
        provider: this.provider.getName(),
      });

      return response;
    } catch (error) {
      // Handle known error types
      if (error instanceof SearchError) {
        throw error;
      }

      // Wrap unknown errors
      throw new SearchError(
        `Search failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCode.SEARCH_FAILED
      );
    }
  }

  /**
   * Get current provider
   */
  getProvider(): ISearchProvider {
    return this.provider;
  }

  /**
   * Set new provider
   */
  setProvider(provider: ISearchProvider): void {
    logger.info('Switching search provider', {
      from: this.provider.getName(),
      to: provider.getName(),
    });

    this.provider = provider;
  }

  /**
   * Get validator
   */
  getValidator(): SearchValidator {
    return this.validator;
  }

  /**
   * Set validator
   */
  setValidator(validator: SearchValidator): void {
    this.validator = validator;
  }

  /**
   * Get service status
   */
  getStatus(): {
    available: boolean;
    provider: string;
  } {
    return {
      available: this.provider.isAvailable(),
      provider: this.provider.getName(),
    };
  }
}
