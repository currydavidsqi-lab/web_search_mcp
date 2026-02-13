import type { SearchRequest, SearchResponse, ISearchProvider } from '../../types/search.js';
import { getLogger } from '../../infrastructure/logging/index.js';
import { SearchError, ErrorCode } from '../../infrastructure/errors/index.js';

const logger = getLogger();

/**
 * Abstract base class for search providers
 * Provides common functionality for all search provider implementations
 */
export abstract class BaseSearchProvider implements ISearchProvider {
  protected userAgent: string;
  protected timeout: number;
  protected maxResults: number;

  constructor(config: {
    userAgent?: string;
    timeout?: number;
    maxResults?: number;
  }) {
    this.userAgent = config.userAgent || 'Mozilla/5.0';
    this.timeout = config.timeout || 30000;
    this.maxResults = config.maxResults || 10;
  }

  /**
   * Perform search - must be implemented by subclasses
   */
  abstract search(request: SearchRequest): Promise<SearchResponse>;

  /**
   * Get provider name - must be implemented by subclasses
   */
  abstract getName(): string;

  /**
   * Check if provider is available
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Validate search request
   */
  protected validateRequest(request: SearchRequest): void {
    if (!request.query || typeof request.query !== 'string') {
      throw new SearchError(
        'Invalid query: must be a non-empty string',
        ErrorCode.INVALID_QUERY
      );
    }

    if (request.query.trim().length === 0) {
      throw new SearchError(
        'Invalid query: cannot be empty or whitespace only',
        ErrorCode.INVALID_QUERY
      );
    }

    const maxResults = request.maxResults || this.maxResults;
    if (maxResults < 1 || maxResults > 20) {
      throw new SearchError(
        'Invalid maxResults: must be between 1 and 20',
        ErrorCode.INVALID_PARAMETER
      );
    }
  }

  /**
   * Build error response
   */
  protected buildErrorResponse(
    query: string,
    error: unknown,
    customMessage?: string
  ): SearchResponse {
    const errorMessage =
      customMessage || (error instanceof Error ? error.message : String(error));

    logger.error('Search error', error, {
      provider: this.getName(),
      query,
    });

    return {
      success: false,
      query,
      error: errorMessage,
    };
  }

  /**
   * Build success response
   */
  protected buildSuccessResponse(
    query: string,
    results: Array<{
      title: string;
      url: string;
      snippet: string;
    }>
  ): SearchResponse {
    logger.info('Search successful', {
      provider: this.getName(),
      query,
      resultCount: results.length,
    });

    return {
      success: true,
      query,
      resultCount: results.length,
      results,
    };
  }

  /**
   * Build empty results response
   */
  protected buildEmptyResponse(query: string): SearchResponse {
    logger.warn('Search returned no results', {
      provider: this.getName(),
      query,
    });

    return {
      success: false,
      query,
      error: 'No results found',
    };
  }

  /**
   * Normalize URL
   */
  protected normalizeUrl(url: string): string {
    // Remove whitespace
    url = url.trim();

    // Ensure protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    return url;
  }

  /**
   * Validate URL
   */
  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
