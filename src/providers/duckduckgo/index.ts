import type { SearchRequest, SearchResponse } from '../../types/search.js';
import type { DuckDuckGoConfig } from '../../types/config.js';
import { BaseSearchProvider } from '../base/search-provider.js';
import { DuckDuckGoFetcher } from './duckduckgo-fetcher.js';
import { DuckDuckGoParser } from './duckduckgo-parser.js';
import { HttpClient } from '../../infrastructure/http/index.js';
import { getLogger } from '../../infrastructure/logging/index.js';

const logger = getLogger();

/**
 * DuckDuckGo search provider implementation
 */
export class DuckDuckGoProvider extends BaseSearchProvider {
  private fetcher: DuckDuckGoFetcher;

  constructor(
    config: {
      duckDuckGoConfig: DuckDuckGoConfig;
      httpConfig: { timeout: number; maxRedirects: number };
      userAgent?: string;
      proxyConfig?: { protocol: string; host: string; port: number };
    }
  ) {
    super({
      userAgent: config.userAgent || config.duckDuckGoConfig.userAgent,
      timeout: config.httpConfig.timeout,
      maxResults: 10, // Will be overridden by request
    });

    const httpClient = new HttpClient(
      config.httpConfig,
      config.userAgent || config.duckDuckGoConfig.userAgent,
      config.proxyConfig
    );

    this.fetcher = new DuckDuckGoFetcher(httpClient, config.duckDuckGoConfig);
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'DuckDuckGo';
  }

  /**
   * Perform search
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    try {
      logger.info(`Starting ${this.getName()} search`, {
        query: request.query,
        maxResults: request.maxResults || this.maxResults,
      });

      // Validate request
      this.validateRequest(request);

      // Fetch HTML from DuckDuckGo
      const html = await this.fetcher.fetch(
        request.query,
        request.maxResults || this.maxResults
      );

      // Parse HTML to extract results
      const results = DuckDuckGoParser.parse(html, request);

      // Return empty response if no results
      if (results.length === 0) {
        return this.buildEmptyResponse(request.query);
      }

      // Return success response
      return this.buildSuccessResponse(request.query, results);
    } catch (error) {
      return this.buildErrorResponse(request.query, error);
    }
  }
}
