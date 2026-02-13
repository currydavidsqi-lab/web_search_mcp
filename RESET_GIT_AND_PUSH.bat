#!/usr/bin/env bash
set -e

echo "========================================="
echo "重置 Git 配置并重新初始化"
echo "========================================="

# 进入项目目录
cd "D:\\03_Code\\AI\\mcp_server\\web_search" || exit 1

echo "删除现有 Git 配置和仓库"
rm -rf .git .git/config

echo "初始化新的 Git 仓库"
git init
git add .

echo "创建首次提交"
git commit -m "feat: 企业级隐私保护和即插即用

- 实现敏感信息自动过滤系统
- 生产环境默认启用路径脱敏
- 完善 .gitignore 防止敏感文件提交
- 添加 .env.example 安全配置示例
- 添加完整的中文和安全文档

即插即用，用户只需 npm install 即可使用"

echo "设置远程仓库"
git remote add origin https://github.com/currydavidsqi-lab/web-search-mcp-server.git
git branch -M main

echo "推送到 GitHub"
git push -u currydavidsqi-lab main

echo ""
echo "========================================="
echo "完成！"
echo "Git 仓库已初始化并推送到 GitHub"
echo "========================================="
