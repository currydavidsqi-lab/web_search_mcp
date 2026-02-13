import { HttpClient } from '../../infrastructure/http/index.js';
import { getLogger } from '../../infrastructure/logging/index.js';
import type { DuckDuckGoConfig } from '../../types/config.js';
import { NetworkError, ErrorCode } from '../../infrastructure/errors/index.js';
import { retry } from '../../utils/index.js';

const logger = getLogger();

/**
 * DuckDuckGo fetcher - handles HTTP requests to DuckDuckGo
 */
export class DuckDuckGoFetcher {
  private httpClient: HttpClient;
  private config: DuckDuckGoConfig;

  constructor(httpClient: HttpClient, config: DuckDuckGoConfig) {
    this.httpClient = httpClient;
    this.config = config;
  }

  /**
   * Fetch HTML for search query
   */
  async fetch(query: string, maxResults?: number): Promise<string> {
    const url = this.buildSearchUrl(query, maxResults);

    logger.debug('Fetching DuckDuckGo search results', {
      url: this.sanitizeUrl(url),
      query,
      maxResults,
    });

    try {
      const html = await retry(
        () => this.fetchHtml(url),
        {
          maxAttempts: 3,
          delay: 1000,
          onRetry: (attempt, error) => {
            logger.warn(`Retrying DuckDuckGo fetch (attempt ${attempt}/3)`, {
              error: error.message,
            });
          },
        }
      );

      logger.debug('Successfully fetched DuckDuckGo results', {
        htmlLength: html.length,
      });

      return html;
    } catch (error) {
      logger.error('Failed to fetch DuckDuckGo results', error);
      throw new NetworkError(
        `Failed to fetch search results: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCode.NETWORK_ERROR
      );
    }
  }

  /**
   * Fetch HTML from URL
   */
  private async fetchHtml(url: string): Promise<string> {
    const response = await this.httpClient.get(url);

    if (response.status !== 200) {
      throw new NetworkError(
        `DuckDuckGo returned status ${response.status}`,
        ErrorCode.NETWORK_ERROR
      );
    }

    const html = response.data;

    if (typeof html !== 'string' || html.length === 0) {
      throw new NetworkError(
        'DuckDuckGo returned empty response',
        ErrorCode.NETWORK_ERROR
      );
    }

    return html;
  }

  /**
   * Build search URL from query
   */
  private buildSearchUrl(query: string, maxResults?: number): string {
    const { baseUrl, htmlPath } = this.config;

    // Build URL with query parameter
    const url = new URL(htmlPath, baseUrl);
    url.searchParams.set('q', query);

    // DuckDuckGo doesn't support maxResults in URL, but we can try
    // Note: This may not be respected by DuckDuckGo
    if (maxResults) {
      url.searchParams.set('kl', 'us-en');
    }

    return url.toString();
  }

  /**
   * Sanitize URL for logging (remove sensitive info)
   */
  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove query parameters for logging
      parsed.search = '';
      return parsed.toString();
    } catch {
      return '[URL]';
    }
  }
}
