import * as cheerio from 'cheerio';
import type { SearchRequest, SearchResult } from '../../types/search.js';
import { getLogger } from '../../infrastructure/logging/index.js';
import {
  decodeDuckDuckGoRedirect,
  cleanSnippet,
  normalizeWhitespace,
} from '../../utils/index.js';
import {
  RESULT_CONTAINER_SELECTORS,
  TITLE_SELECTORS,
  URL_SELECTORS,
  SNIPPET_SELECTORS,
} from './selectors.js';

const logger = getLogger();

/**
 * DuckDuckGo parser - parses HTML to extract search results
 */
export class DuckDuckGoParser {
  /**
   * Parse HTML to extract search results
   */
  static parse(html: string, request: SearchRequest): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    const maxResults = request.maxResults || 10;

    logger.debug('Parsing DuckDuckGo HTML', {
      htmlLength: html.length,
      maxResults,
    });

    // Find result containers
    const containers = $(RESULT_CONTAINER_SELECTORS.join(', '));

    if (containers.length === 0) {
      logger.warn('No result containers found in HTML');
      return [];
    }

    logger.debug(`Found ${containers.length} result containers`);

    // Parse each container
    containers.each((_index, element) => {
      // Stop if we've reached max results
      if (results.length >= maxResults) {
        return false;
      }

      const $el = $(element);
      const result = DuckDuckGoParser.parseResult($el);

      if (result && DuckDuckGoParser.isValidResult(result)) {
        results.push(result);
      }

      return undefined;
    });

    logger.info(`Parsed ${results.length} valid results from ${containers.length} containers`);

    return results;
  }

  /**
   * Parse a single result element
   */
  private static parseResult($el: cheerio.Cheerio<any>): SearchResult | null {
    // Extract title
    const title = DuckDuckGoParser.extractTitle($el);
    if (!title) {
      return null;
    }

    // Extract URL
    const url = DuckDuckGoParser.extractUrl($el);
    if (!url) {
      return null;
    }

    // Extract snippet
    const snippet = DuckDuckGoParser.extractSnippet($el);

    return {
      title,
      url,
      snippet: snippet || 'No description available.',
    };
  }

  /**
   * Extract title from result element
   */
  private static extractTitle($el: cheerio.Cheerio<any>): string | null {
    for (const selector of TITLE_SELECTORS) {
      const $title = $el.find(selector).first();
      const text = $title.text().trim();

      if (text && text.length > 0) {
        return normalizeWhitespace(text);
      }
    }

    return null;
  }

  /**
   * Extract and decode URL from result element
   */
  private static extractUrl($el: cheerio.Cheerio<any>): string | null {
    for (const selector of URL_SELECTORS) {
      const $link = $el.find(selector).first();
      let url = $link.attr('href');

      if (url) {
        // Decode DuckDuckGo redirect URLs
        url = decodeDuckDuckGoRedirect(url);

        // Validate URL
        if (url.startsWith('http') && !url.includes('duckduckgo.com')) {
          return url;
        }
      }
    }

    return null;
  }

  /**
   * Extract snippet from result element
   */
  private static extractSnippet($el: cheerio.Cheerio<any>): string | null {
    for (const selector of SNIPPET_SELECTORS) {
      const $snippet = $el.find(selector).first();
      let text = $snippet.text().trim();

      if (text && text.length > 0) {
        // Clean and normalize snippet
        return cleanSnippet(text);
      }
    }

    return null;
  }

  /**
   * Validate that a result has required fields
   */
  private static isValidResult(result: SearchResult): boolean {
    if (!result.title || result.title.trim().length === 0) {
      logger.debug('Skipping result: empty title');
      return false;
    }

    if (!result.url || result.url.trim().length === 0) {
      logger.debug('Skipping result: empty URL');
      return false;
    }

    if (!result.url.startsWith('http://') && !result.url.startsWith('https://')) {
      logger.debug('Skipping result: invalid URL protocol');
      return false;
    }

    // Skip DuckDuckGo internal links
    if (result.url.includes('duckduckgo.com')) {
      logger.debug('Skipping result: DuckDuckGo internal link');
      return false;
    }

    return true;
  }
}
