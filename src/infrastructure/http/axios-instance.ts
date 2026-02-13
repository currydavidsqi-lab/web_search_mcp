import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { HttpConfig } from '../../types/config.js';
import { getLogger } from '../logging/index.js';

const logger = getLogger();

/**
 * Create configured Axios instance
 */
export function createAxiosInstance(
  httpConfig: HttpConfig,
  proxyConfig?: { protocol: string; host: string; port: number }
): AxiosInstance {
  const config: AxiosRequestConfig = {
    timeout: httpConfig.timeout,
    maxRedirects: httpConfig.maxRedirects,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
  };

  // Add proxy configuration if provided
  if (proxyConfig) {
    config.proxy = {
      protocol: proxyConfig.protocol,
      host: proxyConfig.host,
      port: proxyConfig.port,
    };
    logger.debug(`HTTP client configured with proxy: ${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}`);
  }

  const instance = axios.create(config);

  // Add request interceptor for logging
  instance.interceptors.request.use(
    (config) => {
      logger.debug('HTTP Request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
      });
      return config;
    },
    (error) => {
      logger.error('HTTP Request Error', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for logging
  instance.interceptors.response.use(
    (response) => {
      logger.debug('HTTP Response', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        contentLength: response.data?.length || 0,
      });
      return response;
    },
    (error) => {
      if (error.response) {
        logger.error('HTTP Response Error', error, {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config?.url,
        });
      } else if (error.request) {
        logger.error('HTTP No Response', error);
      } else {
        logger.error('HTTP Request Setup Error', error);
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
