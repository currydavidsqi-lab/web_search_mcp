/**
 * Strip HTML tags from text
 */
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Normalize whitespace in text
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate text to maximum length
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Extract text from Cheerio element
 */
export function extractText(element: {
  text: () => string;
}): string {
  return normalizeWhitespace(element.text() || '');
}

/**
 * Clean snippet text
 */
export function cleanSnippet(snippet: string): string {
  let cleaned = snippet;

  // Remove multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  // Remove common DuckDuckGo artifacts
  cleaned = cleaned.replace(/Jump to.*?$/g, '');
  cleaned = cleaned.replace(/\|.*?$/g, '');

  return cleaned;
}

/**
 * Generate fallback snippet when none is available
 */
export function getFallbackSnippet(): string {
  return 'No description available.';
}

/**
 * Check if text is empty or only whitespace
 */
export function isEmptyText(text: string): boolean {
  return !text || text.trim().length === 0;
}

/**
 * Sanitize text for safe output
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}
