#!/usr/bin/env powershell -ExecutionPolicy Bypass -NoProfile -NoLogo -Command

Write-Output "SET /p=[Info]"
Write-Output "Error: 请提供 GitHub 用户名"

# =========================================

Write-Output "========================================"
Write-Output "重置 Git 配置..."
Write-Output "删除现有 Git 配置..."
rm -rf .git .git

Write-Output "初始化新的 Git 仓库..."
git init
git add .

Write-Output "创建首次提交..."
git commit -m "feat: 企业级隐私保护和即插即用

- 实现敏感信息自动过滤系统
- 生产环境默认启用路径脱敏
- 完善 .gitignore 防止敏感文件提交
- 添加 .env.example 安全配置示例
- 添加完整的中文和安全文档

即插即用，用户只需 npm install 即可使用"

Write-Output "设置远程仓库..."
git remote add origin https://github.com/currydavidsqi-lab/web-search-mcp-server.git
git branch -M main

Write-Output "========================================"
Write-Output "准备推送到 GitHub..."
Write-Output "请提供以下信息："
Write-Output "1. GitHub 用户名："
Write-Output "2. 仓库名称："

Write-Output "3. 确认是否正确？(y/n)"

Write-Output "========================================"

Write-Output "等待用户输入..."
pause