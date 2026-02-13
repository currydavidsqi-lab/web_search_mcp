import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { SearchService } from '../services/search-service.js';
import type { AppConfig } from '../types/config.js';
import { SearchHandler } from './handlers/search-handler.js';
import { getLogger } from '../infrastructure/logging/index.js';

const logger = getLogger();

/**
 * MCP Server
 * Manages Model Context Protocol server lifecycle and handlers
 */
export class MCPServer {
  private server: Server;
  private searchHandler: SearchHandler;
  private config: AppConfig;

  constructor(searchService: SearchService, config: AppConfig) {
    this.config = config;

    // Create MCP server instance
    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Create handlers
    this.searchHandler = new SearchHandler(searchService);

    // Register handlers
    this.registerHandlers();

    logger.info('MCP Server initialized', {
      name: config.server.name,
      version: config.server.version,
    });
  }

  /**
   * Register request handlers
   */
  private registerHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('ListTools request received');

      return {
        tools: [SearchHandler.getToolSchema()],
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      logger.debug('CallTool request received', {
        tool: request.params.name,
      });

      return this.searchHandler.handle(request);
    });

    logger.info('Request handlers registered');
  }

  /**
   * Connect server to transport
   */
  async connect(transport: { close: () => Promise<void> } & { start: () => Promise<void>; send: (message: string) => Promise<void> }): Promise<void> {
    try {
      await this.server.connect(transport as any);
      logger.info('MCP Server connected to transport');
    } catch (error) {
      logger.error('Failed to connect MCP Server to transport', error);
      throw error;
    }
  }

  /**
   * Close server connection
   */
  async close(): Promise<void> {
    try {
      await this.server.close();
      logger.info('MCP Server closed');
    } catch (error) {
      logger.error('Error closing MCP Server', error);
      throw error;
    }
  }

  /**
   * Get server instance
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Get server configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }
}
