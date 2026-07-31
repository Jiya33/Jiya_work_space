#!/bin/bash
set -e

# ====== Jiya 智能工作台 - 本地构建并部署到 gh-pages 分支 ======
cd /Users/jiya/WorkBuddy/2026-07-31-00-18-51/jiya-smart-workbench

NPM=/Users/jiya/.workbuddy/binaries/node/versions/22.22.2/bin/npm

echo "🔨 第1步：构建项目..."
$NPM run build

echo "🚀 第2步：部署 dist/ 到 gh-pages 分支..."
$NPM run deploy

echo ""
echo "✅ 部署完成！"
echo "   1. 打开 https://github.com/jiya33/Jiya_work_space/settings/pages"
echo "   2. Source 选 'Deploy from a branch'"
echo "   3. Branch 选 'gh-pages'，文件夹选 '/(root)'"
echo "   4. 等待 1 分钟，访问 https://jiya33.github.io/Jiya_work_space/"
