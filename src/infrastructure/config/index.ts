import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ConfigError, ErrorCode } from '../errors/index.js';
import { AppConfigSchema } from './schema.js';
import { DEFAULT_CONFIG, ENVIRONMENT_DEFAULTS } from './defaults.js';
import type { AppConfig } from '../../types/config.js';

/**
 * Config Manager class
 * Handles loading and validation of configuration from files and environment variables
 */
export class ConfigManager {
  private config: AppConfig;
  private environment: string;

  private constructor(config: AppConfig, environment: string) {
    this.config = config;
    this.environment = environment;
  }

  /**
   * Initialize configuration manager
   * @param environment - Environment name (development/production/test)
   * @returns ConfigManager instance
   */
  static async initialize(environment?: string): Promise<ConfigManager> {
    const env = environment || process.env.NODE_ENV || 'production';
    const config = await ConfigManager.loadConfig(env);
    return new ConfigManager(config, env);
  }

  /**
   * Load configuration from files and environment variables
   */
  private static async loadConfig(environment: string): Promise<AppConfig> {
    let config: Record<string, unknown> = { ...DEFAULT_CONFIG };

    // Load environment-specific defaults
    if (environment in ENVIRONMENT_DEFAULTS) {
      config = this.mergeDeep(
        config,
        ENVIRONMENT_DEFAULTS[environment as keyof typeof ENVIRONMENT_DEFAULTS] as Record<string, unknown>
      );
    }

    // Load config file if exists
    const configPath = join(process.cwd(), 'config', `${environment}.json`);
    if (existsSync(configPath)) {
      try {
        const fileConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
        config = this.mergeDeep(config, fileConfig);
      } catch (error) {
        throw new ConfigError(
          `Failed to load config file: ${error instanceof Error ? error.message : String(error)}`,
          ErrorCode.CONFIG_INVALID
        );
      }
    }

    // Apply environment variable overrides
    config = this.applyEnvOverrides(config);

    // Validate final configuration
    try {
      return AppConfigSchema.parse(config) as AppConfig;
    } catch (error) {
      throw new ConfigError(
        `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCode.CONFIG_VALIDATION_FAILED
      );
    }
  }

  /**
   * Apply environment variable overrides to configuration
   */
  private static applyEnvOverrides(config: Record<string, unknown>): Record<string, unknown> {
    const env = process.env;

    // Apply overrides
    if (env.LOG_LEVEL) {
      const logging = (config.logging as Record<string, unknown>) || {};
      logging.level = env.LOG_LEVEL;
      config.logging = logging;
    }

    if (env.MAX_RESULTS) {
      const maxResults = parseInt(env.MAX_RESULTS, 10);
      if (!isNaN(maxResults)) {
        const search = (config.search as Record<string, unknown>) || {};
        search.maxResults = maxResults;
        config.search = search;
      }
    }

    if (env.SEARCH_TIMEOUT) {
      const timeout = parseInt(env.SEARCH_TIMEOUT, 10);
      if (!isNaN(timeout)) {
        const search = (config.search as Record<string, unknown>) || {};
        search.timeout = timeout;
        config.search = search;
      }
    }

    return config;
  }

  /**
   * Deep merge objects
   */
  private static mergeDeep(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
          result[key] = this.mergeDeep(
            targetValue as Record<string, unknown>,
            sourceValue as Record<string, unknown>
          );
        } else {
          result[key] = sourceValue;
        }
      } else {
        result[key] = sourceValue;
      }
    }

    return result;
  }

  /**
   * Get current environment
   */
  getEnvironment(): string {
    return this.environment;
  }

  /**
   * Get full configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get server configuration
   */
  getServerConfig() {
    return this.config.server;
  }

  /**
   * Get search configuration
   */
  getSearchConfig() {
    return this.config.search;
  }

  /**
   * Get DuckDuckGo configuration
   */
  getDuckDuckGoConfig() {
    return this.config.duckduckgo;
  }

  /**
   * Get HTTP configuration
   */
  getHttpConfig() {
    return this.config.http;
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig() {
    return this.config.logging;
  }

  /**
   * Get proxy configuration from environment
   */
  getProxyConfig(): { protocol: string; host: string; port: number } | undefined {
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
    const proxyUrl = httpsProxy || httpProxy;

    if (!proxyUrl) {
      return undefined;
    }

    try {
      const url = proxyUrl.includes('://') ? new URL(proxyUrl) : undefined;
      const host = url?.hostname || '127.0.0.1';
      const port = url?.port ? parseInt(url.port, 10) : 7897;
      const protocol = url?.protocol?.replace(':', '') || 'http';

      return { protocol, host, port };
    } catch (error) {
      throw new ConfigError(
        `Invalid proxy URL: ${proxyUrl}`,
        ErrorCode.CONFIG_INVALID
      );
    }
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return this.environment === 'development';
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return this.environment === 'production';
  }

  /**
   * Check if running in test mode
   */
  isTest(): boolean {
    return this.environment === 'test';
  }
}

/**
 * Global config manager instance
 */
let configManagerInstance: ConfigManager | undefined;

/**
 * Get or initialize global config manager
 */
export async function getConfigManager(): Promise<ConfigManager> {
  if (!configManagerInstance) {
    configManagerInstance = await ConfigManager.initialize();
  }
  return configManagerInstance;
}

/**
 * Reset global config manager (useful for testing)
 */
export function resetConfigManager(): void {
  configManagerInstance = undefined;
}
