import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import type { SearchService } from '../../services/search-service.js';
import type { SearchRequest } from '../../types/search.js';
import { getLogger } from '../../infrastructure/logging/index.js';
import { MCPError, ErrorCode } from '../../infrastructure/errors/index.js';

const logger = getLogger();

/**
 * Search tool handler
 * Handles MCP tool calls for web search
 */
export class SearchHandler {
  private searchService: SearchService;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  /**
   * Handle search tool call
   */
  async handle(request: CallToolRequest): Promise<{
    content: Array<{ type: string; text: string }>;
  }> {
    const { name, arguments: args } = request.params;

    if (name !== 'web_search') {
      throw new MCPError(
        `Unknown tool: ${name}`,
        ErrorCode.MCP_TOOL_NOT_FOUND
      );
    }

    try {
      // Extract and validate arguments
      const searchRequest = this.parseArguments(args);

      logger.info('Handling web_search request', {
        query: searchRequest.query,
        maxResults: searchRequest.maxResults,
      });

      // Perform search
      const response = await this.searchService.search(searchRequest);

      // Format response for MCP
      const formattedResponse = JSON.stringify(response, null, 2);

      return {
        content: [
          {
            type: 'text',
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      logger.error('Search handler error', error);

      // Return user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: errorMessage,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }

  /**
   * Parse and validate request arguments
   */
  private parseArguments(args?: Record<string, unknown>): SearchRequest {
    if (!args) {
      throw new MCPError(
        'Missing required arguments',
        ErrorCode.MCP_INVALID_REQUEST
      );
    }

    const query = args.query as string;

    if (!query) {
      throw new MCPError(
        'Missing required parameter: query',
        ErrorCode.MCP_INVALID_REQUEST
      );
    }

    const request: SearchRequest = {
      query,
    };

    if (args.max_results !== undefined) {
      request.maxResults = args.max_results as number;
    }

    return request;
  }


  /**
   * Get tool schema
   */
  static getToolSchema(): {
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties: Record<string, unknown>;
      required: string[];
    };
  } {
    return {
      name: 'web_search',
      description:
        'Search the internet for information. Uses DuckDuckGo search engine to return relevant web pages with titles, URLs, and descriptions.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keywords or question',
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10, max: 20)',
            default: 10,
            minimum: 1,
            maximum: 20,
          },
        },
        required: ['query'],
      },
    };
  }
}
