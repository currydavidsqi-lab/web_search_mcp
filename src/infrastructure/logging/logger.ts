import winston from 'winston';
import type { LoggingConfig } from '../../types/config.js';
import { simpleFormatter, colorizeFormatter } from './formatters.js';

/**
 * Logger class
 * Wrapper around Winston logger with application-specific configuration
 */
export class Logger {
  private logger: winston.Logger;
  private securityOptions?: {
    sanitize?: boolean;
    hideStackTraces?: boolean;
    hideFilePaths?: boolean;
  };

  constructor(config: LoggingConfig) {
    const transports: winston.transport[] = [];

    // 保存安全选项
    this.securityOptions = (config as any).sanitize
      ? {
          sanitize: true,
          hideStackTraces: (config as any).hideStackTraces,
          hideFilePaths: (config as any).hideFilePaths,
        }
      : undefined;

    // Console transport
    const format = config.format === 'json'
      ? winston.format.json()
      : winston.format.combine(
          config.colorize
            ? winston.format.colorize()
            : winston.format.uncolorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(config.colorize ? colorizeFormatter() : simpleFormatter())
        );

    // File transport (only in production)
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: 'error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
    }

    // 导入带安全选项的格式化器
    const { errorFormatter } = require('./formatters.js');

    this.logger = winston.createLogger({
      level: config.level,
      transports,
      exceptionHandlers: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(errorFormatter(this.securityOptions))
          ),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(errorFormatter(this.securityOptions))
          ),
        }),
      ],
    });
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
      } : error,
    };
    this.logger.error(message, errorMeta);
  }

  /**
   * Create child logger with additional context
   */
  child(context: string): Logger {
    const childLogger = new Logger({
      level: this.logger.level as 'error' | 'warn' | 'info' | 'debug',
      format: 'simple',
      colorize: false,
    });
    childLogger.logger = this.logger.child({ context });
    return childLogger;
  }

  /**
   * Get current log level
   */
  getLevel(): string {
    return this.logger.level;
  }

  /**
   * Set log level
   */
  setLevel(level: 'error' | 'warn' | 'info' | 'debug'): void {
    this.logger.level = level;
    this.logger.transports.forEach((transport) => {
      transport.level = level;
    });
  }

  /**
   * Close logger (flush and close transports)
   */
  async close(): Promise<void> {
    try {
      this.logger.close();
    } catch (error) {
      // Ignore errors during close
    }
  }
}

/**
 * Global logger instance
 */
let loggerInstance: Logger | undefined;

/**
 * Initialize global logger
 */
export async function initLogger(config: LoggingConfig): Promise<Logger> {
  if (!loggerInstance) {
    loggerInstance = new Logger(config);
  }
  return loggerInstance;
}

/**
 * Get global logger instance
 */
export function getLogger(): Logger {
  if (!loggerInstance) {
    // Create default logger if not initialized
    loggerInstance = new Logger({
      level: 'info',
      format: 'simple',
      colorize: false,
    });
  }
  return loggerInstance;
}

/**
 * Reset global logger (useful for testing)
 */
export function resetLogger(): void {
  if (loggerInstance) {
    loggerInstance.close().catch(() => {
      // Ignore errors during reset
    });
  }
  loggerInstance = undefined;
}
