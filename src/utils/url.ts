import { ValidationError, ErrorCode } from '../infrastructure/errors/index.js';

/**
 * Validate URL string
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Parse and validate URL
 */
export function parseUrl(url: string): URL {
  if (!isValidUrl(url)) {
    throw new ValidationError(
      `Invalid URL: ${url}`,
      ErrorCode.INVALID_PARAMETER
    );
  }
  return new URL(url);
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

/**
 * Clean URL by removing tracking parameters
 */
export function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'msclkid',
    ];

    trackingParams.forEach((param) => {
      parsed.searchParams.delete(param);
    });

    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Check if URL is a redirect URL
 */
export function isRedirectUrl(url: string): boolean {
  const redirectPatterns = [
    '/l/?uddg=',
    '/l/?uddg=',
    'redirect',
    'url?',
  ];

  return redirectPatterns.some((pattern) => url.includes(pattern));
}

/**
 * Decode DuckDuckGo redirect URL
 */
export function decodeDuckDuckGoRedirect(url: string): string {
  try {
    // Check for DuckDuckGo redirect format: //duckduckgo.com/l/?uddg=<encoded_url>
    if (url.includes('//duckduckgo.com/l/?uddg=')) {
      const match = url.match(/uddg=([^&]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }

    // Check for protocol-relative URL
    if (url.startsWith('//')) {
      return 'https:' + url;
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Build search URL with query parameters
 */
export function buildSearchUrl(
  baseUrl: string,
  path: string,
  query: string
): string {
  try {
    const url = new URL(path, baseUrl);
    url.searchParams.set('q', query);
    return url.toString();
  } catch {
    return `${baseUrl}${path}?q=${encodeURIComponent(query)}`;
  }
}
