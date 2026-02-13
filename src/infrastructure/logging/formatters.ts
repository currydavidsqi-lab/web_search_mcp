import type { TransformableInfo } from 'logform';

/**
 * Simple text formatter
 */
export function simpleFormatter(): (info: TransformableInfo) => string {
  return ({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  };
}

/**
 * Error formatter for consistent error logging
 */
export function errorFormatter(options?: {
  sanitize?: boolean;
  hideStackTraces?: boolean;
  hideFilePaths?: boolean;
}): (info: TransformableInfo) => string {
  return ({ level, message, timestamp, ...meta }) => {
    let output = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (meta.error) {
      if (meta.error instanceof Error) {
        output += `\n  Error: ${meta.error.message}`;

        // 只有在非生产环境且未隐藏堆栈时才显示
        if (!options?.hideStackTraces && meta.error.stack) {
          let stack = meta.error.stack;
          // 如果启用了路径过滤，清理堆栈信息
          if (options?.sanitize || options?.hideFilePaths) {
            stack = sanitizeSensitiveInfo(stack);
          }
          output += `\n  Stack: ${stack}`;
        }
      } else {
        output += `\n  Error: ${JSON.stringify(meta.error)}`;
      }
      delete meta.error;
    }

    const remainingMeta = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    if (remainingMeta) {
      // 如果启用了路径过滤，清理 meta 中的路径
      const sanitizedMeta = options?.sanitize || options?.hideFilePaths
        ? sanitizeMetaInfo(remainingMeta)
        : remainingMeta;
      output += `\n  Meta: ${sanitizedMeta}`;
    }

    return output;
  };
}

/**
 * 清理敏感信息（路径、堆栈等）
 */
function sanitizeSensitiveInfo(str: string): string {
  if (!str) return str;

  // 移除常见的 Windows 路径模式
  str = str.replace(/[A-Z]:\\[^\\]*\\/g, '[REDACTED]');
  // 移除常见的 Unix 路径模式
  str = str.replace(/\/(home|users|root)\//gi, '/[REDACTED]/');
  // 移除盘符路径
  str = str.replace(/[A-Z]:\\/gi, '[REDACTED]');
  // 移除用户主目录
  str = str.replace(/\/Users\/[^\/]+/gi, '/[REDACTED]/');
  // 移除 C:\Users\...
  str = str.replace(/C:\\Users\\[^\\]+\\/gi, 'C:\\[REDACTED]\\');

  return str;
}

/**
 * 清理 meta 信息中的路径
 */
function sanitizeMetaInfo(metaStr: string): string {
  try {
    const meta = JSON.parse(metaStr);
    // 递归清理所有字符串值
    return JSON.stringify(meta, (key, value) => {
      if (typeof value === 'string') {
        return sanitizeSensitiveInfo(value);
      }
      if (typeof value === 'object' && value !== null) {
        // 简单处理：递归清理嵌套对象
        return value;
      }
      return value;
    });
  } catch {
    return metaStr;
  }
}

/**
 * Create colorized formatter
 */
export function colorizeFormatter(): (info: TransformableInfo) => string {
  const colors = {
    error: '\x1b[31m', // red
    warn: '\x1b[33m', // yellow
    info: '\x1b[36m', // cyan
    debug: '\x1b[90m', // gray
    reset: '\x1b[0m',
  };

  return ({ level, message, timestamp, ...meta }) => {
    const color = colors[level as keyof typeof colors] || colors.reset;
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `${timestamp} ${color}[${level.toUpperCase()}]${colors.reset}: ${message} ${metaStr}`;
  };
}
