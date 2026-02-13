# Web 搜索 MCP 服务器

基于 Model Context Protocol (MCP) 的 Web 搜索服务，使用 DuckDuckGo 搜索引擎提供网络搜索功能。

**版本**: 2.0.0 (重构架构)

## 功能特性

- ✅ **网络搜索**: 使用 DuckDuckGo 搜索互联网
- ✅ **模块化架构**: 清晰的分层架构，易于维护
- ✅ **类型安全**: 完整的 TypeScript 实现，启用严格类型检查（零 `any` 类型）
- ✅ **可配置**: 支持环境变量和配置文件
- ✅ **日志系统**: 使用 Winston 的结构化日志
- ✅ **错误处理**: 完善的错误处理机制，包含自定义错误类型
- ✅ **代理支持**: 内置代理支持，适用于受限网络环境
- ✅ **可扩展**: 轻松添加新的搜索引擎提供商
- 🔒 **隐私安全**: 敏感信息过滤，防止本地路径泄露

## 架构

服务器采用清晰的分层架构：

```
┌─────────────────────────────────┐
│         MCP 层（表面层）              │
│  - 服务器入口                        │
│  - 工具注册                         │
│  - 请求处理                         │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│        服务层（业务层）             │
│  - 搜索服务                         │
│  - 结果验证                         │
│  - 错误处理                         │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│       提供者层（抽象层）           │
│  - DuckDuckGo 提供者               │
│  - HTML 获取                         │
│  - 结果解析                         │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│       基础设施层                    │
│  - HTTP 客户端                       │
│  - 配置管理器                        │
│  - 日志系统                            │
│  - 错误类型                         │
└─────────────────────────────────┘
```

## 安装

```bash
npm install
npm run build
```

## 配置

### 环境变量

```bash
# 代理配置（可选）
HTTP_PROXY=http://127.0.0.1:7897
HTTPS_PROXY=http://127.0.0.1:7897

# 运行环境
NODE_ENV=production  # development | production | test

# 日志配置
LOG_LEVEL=info  # error | warn | info | debug

# 搜索设置
MAX_RESULTS=10  # 1-20
SEARCH_TIMEOUT=30000  # 毫秒
```

### 隐私安全配置（推荐用于生产环境）

```bash
# 敏感信息过滤（推荐在生产环境启用）
SANITIZE_LOGS=true  # 过滤日志中的敏感信息（路径、堆栈等）
HIDE_STACK_TRACES=true  # 隐藏错误堆栈跟踪
HIDE_FILE_PATHS=true  # 隐藏文件路径信息

# 调试选项（仅开发环境）
SHOW_FULL_ERRORS=true  # 显示完整错误信息（包括堆栈）
DEBUG_CONFIG_LOADING=true  # 显示配置加载详情
```

### 配置文件

配置文件位于 `config/` 目录：
- `default.json` - 默认配置
- `development.json` - 开发环境配置
- `production.json` - 生产环境配置（已启用安全选项）
- `test.json` - 测试环境配置

## 使用方法

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm run build
npm start
```

### MCP 工具

服务器提供 `web_search` 工具，模式如下：

```json
{
  "name": "web_search",
  "description": "在互联网上搜索信息。使用 DuckDuckGo 搜索引擎返回相关的网页，包括标题、URL 和描述。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "搜索关键词或问题"
      },
      "max_results": {
        "type": "number",
        "description": "返回结果的最大数量（默认：10，最多：20）",
        "default": 10,
        "minimum": 1,
        "maximum": 20
      }
    },
    "required": ["query"]
  }
}
```

### 响应示例

```json
{
  "success": true,
  "query": "TypeScript",
  "resultCount": 10,
  "results": [
    {
      "title": "TypeScript: JavaScript With Syntax For Types.",
      "url": "https://www.typescriptlang.org/",
      "snippet": "TypeScript 是一种强类型的编程语言，建立在 JavaScript 之上..."
    }
  ]
}
```

## 项目结构

```
web_search/
├── src/
│   ├── server/                    # MCP 服务器层
│   │   ├── mcp-server.ts
│   │   └── handlers/
│   ├── services/                  # 业务逻辑层
│   │   ├── search-service.ts
│   │   └── validators/
│   ├── providers/                 # 搜索提供者
│   │   ├── base/
│   │   ├── duckduckgo/
│   │   └── registry/
│   ├── infrastructure/            # 基础设施层
│   │   ├── config/
│   │   ├── http/
│   │   ├── logging/
│   │   └── errors/
│   ├── types/                    # 类型定义
│   ├── utils/                    # 工具函数
│   ├── main.ts                   # 应用入口
│   └── index.ts                  # 向后兼容
├── tests/                        # 测试
├── config/                       # 配置文件
├── build/                       # 编译输出
└── package.json
```

## 可用脚本

- `npm run build` - 构建项目
- `npm start` - 启动服务器（生产模式）
- `npm run dev` - 启动服务器（开发模式，使用 tsx）
- `npm test` - 运行测试
- `npm run lint` - 运行 ESLint
- `npm run format` - 使用 Prettier 格式化代码
- `npm run type-check` - 检查 TypeScript 类型

## 开发指南

### 添加新的搜索提供者

1. 在 `src/providers/yourprovider/` 中创建新的提供者类
2. 继承 `BaseSearchProvider`
3. 实现 `search()` 方法
4. 在 `ProviderRegistry` 中注册

示例：

```typescript
import { BaseSearchProvider } from '../base/search-provider.js';

export class MyProvider extends BaseSearchProvider {
  getName(): string {
    return 'MyProvider';
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    // 实现代码
  }
}
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式
npm run test:watch
```

## Claude Desktop 配置

在 Claude Desktop 的配置文件中配置：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "web-search": {
      "command": "node",
      "args": ["D:\\03_Code\\AI\\mcp_server\\web_search\\build\\main.js"],
      "env": {
        "HTTPS_PROXY": "http://127.0.0.1:7897",
        "HTTP_PROXY": "http://127.0.0.1:7897"
      }
    }
  }
}
```

## 技术栈

- **TypeScript 5.9+** - 严格类型检查，零 `any` 类型
- **@modelcontextprotocol/sdk** - MCP SDK
- **axios** - HTTP 客户端
- **cheerio** - HTML 解析
- **winston** - 日志系统
- **zod** - 配置验证

## v2.0 主要改进

1. **零硬编码值**: 所有配置均已外部化
2. **类型安全**: 完整的类型覆盖，无 `any` 类型
3. **错误处理**: 自定义错误类型，包含适当的错误码
4. **日志系统**: 支持多种格式的结构化日志
5. **模块化**: 清晰的关注点分离
6. **可测试性**: 通过依赖注入实现完全可测试
7. **可扩展性**: 轻松添加新的搜索提供者

## 🔒 隐私与安全

### 敏感信息保护

本项目包含多项隐私保护措施，确保在开源或共享时不会泄露本地路径信息：

#### 1. 日志清理
- **自动过滤**: 生产环境默认启用敏感信息过滤
- **路径脱敏**: 将本地路径替换为 `[REDACTED]`
- **堆栈隐藏**: 默认隐藏错误堆栈跟踪
- **可配置**: 通过环境变量控制安全级别

#### 2. 配置文件安全
- **.gitignore**: 已配置忽略敏感文件（`.env`、`*.log`）
- **.env.example**: 仅包含示例配置，不含真实凭据
- **无敏感信息**: 配置文件中不包含真实路径或密钥

#### 3. 环境隔离
- **开发/生产**: 测试环境不会影响生产配置
- **错误日志分离**: 错误日志独立存储
- **日志轮转**: 防止日志无限增长

### 安全配置示例

在生产环境启用完整隐私保护：

```bash
# config/production.json
{
  "security": {
    "sanitizeLogs": true,      # 自动清理日志
    "hideStackTraces": true,   # 隐藏堆栈
    "hideFilePaths": true,    # 隐藏路径
    "showFullErrors": false    # 仅显示必要信息
  }
}
```

### 上传到 GitHub/GitCode 之前

✅ **已做好的安全措施**:
- 已创建 `.gitignore` 文件
- `.env.example` 不含敏感信息
- 生产配置默认启用日志清理
- 所有本地路径已在日志中脱敏

⚠️ **建议检查**:
1. 确认 `.env` 文件未提交到版本控制
2. 检查日志中是否包含真实路径
3. 测试启动后的日志输出

### 即插即用步骤

```bash
# 1. 克隆或下载项目
git clone https://github.com/yourusername/web-search-mcp-server.git
cd web-search-mcp-server

# 2. 安装依赖
npm install

# 3. 复制配置文件
cp .env.example .env

# 4. 根据需要编辑配置（可选）
# vim .env 或 config/production.json

# 5. 构建项目
npm run build

# 6. 在 Claude Desktop 中配置路径
# 使用项目绝对路径，不包含敏感信息

# 7. 启动并使用
npm start
```

## 许可证

MIT

## 贡献

欢迎贡献！在提交 PR 之前请阅读贡献指南。
