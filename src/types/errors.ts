/**
 * Error codes enumeration
 */
export enum ErrorCode {
  // Configuration errors (1xxx)
  CONFIG_INVALID = 1001,
  CONFIG_MISSING = 1002,
  CONFIG_VALIDATION_FAILED = 1003,

  // Network errors (2xxx)
  NETWORK_ERROR = 2001,
  NETWORK_TIMEOUT = 2002,
  NETWORK_REDIRECT_ERROR = 2003,
  PROXY_ERROR = 2004,

  // Search errors (3xxx)
  SEARCH_FAILED = 3001,
  SEARCH_NO_RESULTS = 3002,
  SEARCH_PARSING_ERROR = 3003,
  SEARCH_PROVIDER_ERROR = 3004,

  // Validation errors (4xxx)
  VALIDATION_ERROR = 4001,
  INVALID_QUERY = 4002,
  INVALID_PARAMETER = 4003,

  // MCP errors (5xxx)
  MCP_TOOL_NOT_FOUND = 5001,
  MCP_INVALID_REQUEST = 5002,
  MCP_HANDLER_ERROR = 5003,

  // Unknown error
  UNKNOWN_ERROR = 9999,
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Configuration error
 */
export class ConfigError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONFIG_INVALID) {
    super(message, code, true);
    this.name = 'ConfigError';
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.NETWORK_ERROR) {
    super(message, code, true);
    this.name = 'NetworkError';
  }
}

/**
 * Search error
 */
export class SearchError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.SEARCH_FAILED) {
    super(message, code, true);
    this.name = 'SearchError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.VALIDATION_ERROR) {
    super(message, code, true);
    this.name = 'ValidationError';
  }
}

/**
 * MCP error
 */
export class MCPError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.MCP_INVALID_REQUEST) {
    super(message, code, true);
    this.name = 'MCPError';
  }
}
