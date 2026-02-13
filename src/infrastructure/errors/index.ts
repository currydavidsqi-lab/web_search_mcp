export {
  AppError,
  ConfigError,
  NetworkError,
  SearchError,
  ValidationError,
  MCPError,
  ErrorCode,
  createErrorFromUnknown,
  isOperationalError,
} from './classes.js';

export { ErrorHandler, errorHandler } from './handler.js';
export type { ErrorHandlerOptions, ErrorHandlerResult } from './handler.js';
