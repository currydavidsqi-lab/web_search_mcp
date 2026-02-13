import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { HttpConfig } from '../../types/config.js';
import { NetworkError, ErrorCode } from '../errors/index.js';
import { getLogger } from '../logging/index.js';

const logger = getLogger();

/**
 * HTTP Client wrapper
 * Provides error handling, retry logic, and logging
 */
export class HttpClient {
  private userAgent: string;
  private timeout: number;
  private maxRedirects: number;
  private proxyConfig?: { protocol: string; host: string; port: number };

  constructor(
    httpConfig: HttpConfig,
    userAgent?: string,
    proxyConfig?: { protocol: string; host: string; port: number }
  ) {
    this.timeout = httpConfig.timeout;
    this.maxRedirects = httpConfig.maxRedirects;
    this.userAgent = userAgent || 'Mozilla/5.0';
    this.proxyConfig = proxyConfig;
  }

  /**
   * Perform GET request
   */
  async get(url: string, config?: Partial<AxiosRequestConfig>): Promise<AxiosResponse> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        url,
        timeout: this.timeout,
        maxRedirects: this.maxRedirects,
        headers: {
          'User-Agent': this.userAgent,
          ...config?.headers,
        },
        ...config,
      };

      // Add proxy if configured
      if (this.proxyConfig) {
        requestConfig.proxy = {
          protocol: this.proxyConfig.protocol as 'http' | 'https',
          host: this.proxyConfig.host,
          port: this.proxyConfig.port,
        };
      }

      logger.debug('HTTP GET request', { url, config: requestConfig });

      const response = await axios(requestConfig);

      logger.debug('HTTP GET response', {
        url,
        status: response.status,
        contentLength: response.data?.length || 0,
      });

      return response;
    } catch (error) {
      this.handleRequestError(error, url);
    }
  }

  /**
   * Perform POST request
   */
  async post(
    url: string,
    data?: unknown,
    config?: Partial<AxiosRequestConfig>
  ): Promise<AxiosResponse> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: 'POST',
        url,
        data,
        timeout: this.timeout,
        maxRedirects: this.maxRedirects,
        headers: {
          'User-Agent': this.userAgent,
          'Content-Type': 'application/json',
          ...config?.headers,
        },
        ...config,
      };

      // Add proxy if configured
      if (this.proxyConfig) {
        requestConfig.proxy = {
          protocol: this.proxyConfig.protocol as 'http' | 'https',
          host: this.proxyConfig.host,
          port: this.proxyConfig.port,
        };
      }

      logger.debug('HTTP POST request', { url, data });

      const response = await axios(requestConfig);

      logger.debug('HTTP POST response', {
        url,
        status: response.status,
      });

      return response;
    } catch (error) {
      this.handleRequestError(error, url);
    }
  }

  /**
   * Handle request errors and convert to NetworkError
   */
  private handleRequestError(error: unknown, url: string): never {
    if (axios.isAxiosError(error)) {
      const message = error.code
        ? `HTTP request failed: ${error.code}`
        : error.message
        ? `HTTP request failed: ${error.message}`
        : 'HTTP request failed';

      // Determine error code based on error type
      let code = ErrorCode.NETWORK_ERROR;

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        code = ErrorCode.NETWORK_TIMEOUT;
      } else if (error.code === 'ECONNREFUSED') {
        code = ErrorCode.NETWORK_ERROR;
      } else if (error.message.includes('proxy')) {
        code = ErrorCode.PROXY_ERROR;
      }

      const networkError = new NetworkError(
        `${message} (URL: ${url})`,
        code
      );

      // Add axios-specific information
      if (error.response) {
        networkError.message += ` [Status: ${error.response.status}]`;
      }

      if (error.config) {
        networkError.message += ` [Method: ${error.config.method?.toUpperCase()}]`;
      }

      throw networkError;
    }

    // Re-throw if already a NetworkError
    if (error instanceof NetworkError) {
      throw error;
    }

    // Wrap unknown errors
    throw new NetworkError(
      `Unknown HTTP error: ${error instanceof Error ? error.message : String(error)}`,
      ErrorCode.NETWORK_ERROR
    );
  }

  /**
   * Update user agent
   */
  setUserAgent(userAgent: string): void {
    this.userAgent = userAgent;
  }

  /**
   * Update timeout
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Get current timeout value
   */
  getTimeout(): number {
    return this.timeout;
  }

  /**
   * Check if proxy is configured
   */
  hasProxy(): boolean {
    return this.proxyConfig !== undefined;
  }

  /**
   * Get proxy configuration
   */
  getProxyConfig() {
    return this.proxyConfig;
  }
}
