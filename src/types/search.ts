/**
 * Search request parameters
 */
export interface SearchRequest {
  /** Search query string */
  query: string;
  /** Maximum number of results to return (default: 10, max: 20) */
  maxResults?: number;
}

/**
 * Individual search result
 */
export interface SearchResult {
  /** Title of the search result */
  title: string;
  /** URL of the search result */
  url: string;
  /** Snippet/description of the search result */
  snippet: string;
}

/**
 * Search response
 */
export interface SearchResponse {
  /** Indicates if the search was successful */
  success: boolean;
  /** Original query string */
  query: string;
  /** Number of results returned */
  resultCount?: number;
  /** Array of search results */
  results?: SearchResult[];
  /** Error message if search failed */
  error?: string;
}

/**
 * Search provider interface
 */
export interface ISearchProvider {
  /**
   * Perform a web search
   * @param request - Search request parameters
   * @returns Promise resolving to search response
   */
  search(request: SearchRequest): Promise<SearchResponse>;

  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Check if provider is available
   */
  isAvailable(): boolean;
}
