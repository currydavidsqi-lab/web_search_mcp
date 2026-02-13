/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  server: {
    name: 'web-search-mcp-server',
    version: '1.0.0',
  },
  search: {
    maxResults: 10,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  duckduckgo: {
    baseUrl: 'https://duckduckgo.com',
    htmlPath: '/html/',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  },
  http: {
    timeout: 30000,
    maxRedirects: 5,
  },
  logging: {
    level: 'info' as const,
    format: 'json' as const,
    colorize: false,
    sanitize: false, // 过滤敏感信息（生产环境推荐启用）
    hideStackTraces: true, // 默认隐藏堆栈跟踪
    hideFilePaths: true, // 默认隐藏文件路径
  },
  security: {
    sanitizeLogs: false,
    hideStackTraces: true,
    hideFilePaths: true,
    showFullErrors: false,
  },
};

/**
 * Environment-specific defaults
 */
export const ENVIRONMENT_DEFAULTS = {
  development: {
    logging: {
      level: 'debug' as const,
      format: 'simple' as const,
      colorize: true,
      sanitize: false, // 开发环境可以显示更多信息
      hideStackTraces: false,
      hideFilePaths: false,
    },
    search: {
      timeout: 60000,
    },
    security: {
      sanitizeLogs: false,
      hideStackTraces: false,
      hideFilePaths: false,
      showFullErrors: true, // 开发环境显示完整错误
    },
  },
  production: {
    logging: {
      level: 'info' as const,
      format: 'json' as const,
      colorize: false,
      sanitize: true, // 生产环境过滤敏感信息
      hideStackTraces: true, // 隐藏堆栈
      hideFilePaths: true, // 隐藏路径
    },
    search: {
      timeout: 30000,
    },
    security: {
      sanitizeLogs: true, // 启用日志清理
      hideStackTraces: true, // 隐藏堆栈跟踪
      hideFilePaths: true, // 隐藏文件路径
      showFullErrors: false,
    },
  },
  test: {
    search: {
      maxResults: 5,
      timeout: 10000,
      retryAttempts: 1,
    },
    logging: {
      level: 'error' as const,
      format: 'simple' as const,
      sanitize: true, // 测试也过滤敏感信息
      hideStackTraces: true,
      hideFilePaths: true,
    },
    security: {
      sanitizeLogs: true,
      hideStackTraces: true,
      hideFilePaths: true,
      showFullErrors: false,
    },
  },
};
