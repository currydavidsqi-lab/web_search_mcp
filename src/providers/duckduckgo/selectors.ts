/**
 * CSS selectors for DuckDuckGo HTML parsing
 * Multiple selectors are provided as fallbacks for potential UI changes
 */

/**
 * Result container selectors
 */
export const RESULT_CONTAINER_SELECTORS = [
  '.web-result', // Primary selector
  '.result', // Fallback
  '.web-result.result--news', // News results
];

/**
 * Title selectors
 */
export const TITLE_SELECTORS = [
  'a.result__a', // Primary selector
  'h2 a', // Fallback
  'h3 a', // Fallback
  'a', // Last resort
];

/**
 * URL selectors
 */
export const URL_SELECTORS = [
  'a.result__a', // Primary selector (same as title)
  'h2 a', // Fallback
  'h3 a', // Fallback
  'a', // Last resort
];

/**
 * Snippet/description selectors
 */
export const SNIPPET_SELECTORS = [
  '.result__snippet', // Primary selector
  '.snippet', // Fallback
  'p', // Last resort
];

/**
 * Get selector from list with multiple fallbacks
 */
export function getSelector(selectors: string[]): string {
  return selectors.join(', ');
}
