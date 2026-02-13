#!/usr/bin/env node

/**
 * Web Search MCP Server - Main Entry Point
 * Refactored with clean architecture
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getConfigManager } from './infrastructure/config/index.js';
import { initLogger, getLogger, resetLogger } from './infrastructure/logging/index.js';
import { ProviderRegistry } from './providers/index.js';
import { SearchService } from './services/index.js';
import { MCPServer } from './server/index.js';
import { errorHandler } from './infrastructure/errors/index.js';

/**
 * Application initialization
 */
async function initialize() {
  // Load configuration
  const configManager = await getConfigManager();
  const config = configManager.getConfig();

  // Initialize logger
  const logger = await initLogger(config.logging);
  logger.info('Initializing Web Search MCP Server', {
    environment: configManager.getEnvironment(),
    version: config.server.version,
  });

  // Register search providers
  const providerRegistry = new ProviderRegistry();
  providerRegistry.registerDuckDuckGo({
    duckDuckGoConfig: config.duckduckgo,
    httpConfig: config.http,
    proxyConfig: configManager.getProxyConfig(),
  });

  // Create search service with default provider
  const searchService = new SearchService({
    provider: providerRegistry.getDefaultProvider(),
  });

  // Create and connect MCP server
  const mcpServer = new MCPServer(searchService, config);

  logger.info('Server starting...');

  const transport = new StdioServerTransport();
  await mcpServer.getServer().connect(transport);

  logger.info('Web Search MCP Server running', {
    name: config.server.name,
    version: config.server.version,
    provider: searchService.getProvider().getName(),
  });
}

/**
 * Main function with error handling
 */
async function main() {
  try {
    await initialize();
  } catch (error) {
    errorHandler.handle(error, 'main');

    // Try to use logger if available, otherwise use console
    try {
      const logger = getLogger();
      logger.error('Server failed to start', error);
    } catch {
      console.error('Server failed to start:', error);
    }

    // Exit with error code
    process.exit(1);
  }
}

/**
 * Handle shutdown gracefully
 */
async function shutdown(signal: string) {
  const logger = getLogger();
  logger.info(`Received ${signal} signal, shutting down gracefully...`);

  try {
    // Clean up resources
    await resetLogger();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }

  process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  const logger = getLogger();
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const logger = getLogger();
  logger.error('Unhandled rejection', reason, { promise });
  process.exit(1);
});

// Start the server
main();
