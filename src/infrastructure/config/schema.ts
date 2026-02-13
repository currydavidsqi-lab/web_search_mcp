import { z } from 'zod';

/**
 * Server configuration schema
 */
const ServerConfigSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

/**
 * Search configuration schema
 */
const SearchConfigSchema = z.object({
  maxResults: z.number().int().min(1).max(20).default(10),
  timeout: z.number().int().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
  retryDelay: z.number().int().min(0).default(1000),
});

/**
 * DuckDuckGo configuration schema
 */
const DuckDuckGoConfigSchema = z.object({
  baseUrl: z.string().url().default('https://duckduckgo.com'),
  htmlPath: z.string().startsWith('/').default('/html/'),
  userAgent: z.string().min(1).default(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  ),
});

/**
 * HTTP configuration schema
 */
const HttpConfigSchema = z.object({
  timeout: z.number().int().positive().default(30000),
  maxRedirects: z.number().int().min(0).default(5),
});

/**
 * Logging configuration schema
 */
const LoggingConfigSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  format: z.enum(['json', 'simple']).default('json'),
  colorize: z.boolean().default(false),
  sanitize: z.boolean().default(false), // 过滤敏感信息（路径、堆栈等）
  hideStackTraces: z.boolean().default(false), // 隐藏错误堆栈跟踪
  hideFilePaths: z.boolean().default(false), // 隐藏文件路径信息
});

/**
 * Application configuration schema
 */
const AppConfigSchema = z.object({
  server: ServerConfigSchema,
  search: SearchConfigSchema,
  duckduckgo: DuckDuckGoConfigSchema,
  http: HttpConfigSchema,
  logging: LoggingConfigSchema,
  security: z.object({
    sanitizeLogs: z.boolean().default(false),
    hideStackTraces: z.boolean().default(false),
    hideFilePaths: z.boolean().default(false),
    showFullErrors: z.boolean().default(false),
  }).strict().optional(), // 可选的安全配置
});

/**
 * Environment variable schema
 */
const EnvConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  HTTP_PROXY: z.string().url().optional(),
  HTTPS_PROXY: z.string().url().optional(),
  http_proxy: z.string().url().optional(),
  https_proxy: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  MAX_RESULTS: z.string().transform(Number).pipe(z.number().int().min(1).max(20)).optional(),
  SEARCH_TIMEOUT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

/**
 * Type inference from schemas
 */
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type SearchConfig = z.infer<typeof SearchConfigSchema>;
export type DuckDuckGoConfig = z.infer<typeof DuckDuckGoConfigSchema>;
export type HttpConfig = z.infer<typeof HttpConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema> & {
  sanitize?: boolean;
  hideStackTraces?: boolean;
  hideFilePaths?: boolean;
  showFullErrors?: boolean;
};
export type AppConfig = z.infer<typeof AppConfigSchema> & {
  security?: {
    sanitizeLogs?: boolean;
    hideStackTraces?: boolean;
    hideFilePaths?: boolean;
    showFullErrors?: boolean;
  };
};
export type EnvConfig = z.infer<typeof EnvConfigSchema>;

/**
 * Export schemas for validation
 */
export {
  ServerConfigSchema,
  SearchConfigSchema,
  DuckDuckGoConfigSchema,
  HttpConfigSchema,
  LoggingConfigSchema,
  AppConfigSchema,
  EnvConfigSchema,
};
