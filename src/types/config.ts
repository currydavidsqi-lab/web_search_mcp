/**
 * Server configuration
 */
export interface ServerConfig {
  name: string;
  version: string;
}

/**
 * Search configuration
 */
export interface SearchConfig {
  maxResults: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * DuckDuckGo configuration
 */
export interface DuckDuckGoConfig {
  baseUrl: string;
  htmlPath: string;
  userAgent: string;
}

/**
 * HTTP client configuration
 */
export interface HttpConfig {
  timeout: number;
  maxRedirects: number;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
  colorize: boolean;
}

/**
 * Application configuration
 */
export interface AppConfig {
  server: ServerConfig;
  search: SearchConfig;
  duckduckgo: DuckDuckGoConfig;
  http: HttpConfig;
  logging: LoggingConfig;
}

/**
 * Environment variables
 */
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  HTTP_PROXY?: string;
  HTTPS_PROXY?: string;
  http_proxy?: string;
  https_proxy?: string;
  LOG_LEVEL?: string;
  MAX_RESULTS?: string;
  SEARCH_TIMEOUT?: string;
}
