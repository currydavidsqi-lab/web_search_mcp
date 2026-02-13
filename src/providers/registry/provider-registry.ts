import type { ISearchProvider } from '../../types/search.js';
import { DuckDuckGoProvider } from '../duckduckgo/index.js';
import { getLogger } from '../../infrastructure/logging/index.js';
import type { DuckDuckGoConfig, HttpConfig } from '../../types/config.js';

const logger = getLogger();

/**
 * Provider registry
 * Manages available search providers
 */
export class ProviderRegistry {
  private providers: Map<string, ISearchProvider> = new Map();

  /**
   * Register DuckDuckGo provider
   */
  registerDuckDuckGo(config: {
    duckDuckGoConfig: DuckDuckGoConfig;
    httpConfig: HttpConfig;
    userAgent?: string;
    proxyConfig?: { protocol: string; host: string; port: number };
  }): void {
    const provider = new DuckDuckGoProvider(config);
    this.providers.set(provider.getName().toLowerCase(), provider);

    logger.info('Registered search provider', {
      name: provider.getName(),
    });
  }

  /**
   * Get provider by name
   */
  getProvider(name: string): ISearchProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  /**
   * Get default provider (DuckDuckGo)
   */
  getDefaultProvider(): ISearchProvider {
    const provider = this.providers.get('duckduckgo');

    if (!provider) {
      throw new Error('Default provider (DuckDuckGo) is not registered');
    }

    return provider;
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): ISearchProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if provider is registered
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }

  /**
   * Get number of registered providers
   */
  getProviderCount(): number {
    return this.providers.size;
  }
}
