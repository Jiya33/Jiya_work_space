#!/bin/bash
# Jiya 智能工作台 — 一键部署到 GitHub Pages (gh-pages 分支)
# 用法: ./deploy.sh <你的GitHub_Token>

set -e

TOKEN="$1"
USER="Jiya33"
REPO="Jiya_work_space"

if [ -z "$TOKEN" ]; then
  echo "❌ 用法: ./deploy.sh <你的GitHub_Token>"
  exit 1
fi

cd "$(dirname "$0")"
REMOTE="https://${USER}:${TOKEN}@github.com/${USER}/${REPO}.git"

echo "==> 1/4 构建生产版本..."
npm run build

echo "==> 2/4 准备部署文件..."
touch dist/.nojekyll

echo "==> 3/4 推送源码到 main 分支..."
git add -A
git commit -m "chore: update $(date '+%Y-%m-%d %H:%M')" || echo "  (无新改动)"
git push "$REMOTE" main --force

echo "==> 4/4 推送构建产物到 gh-pages 分支..."
rm -rf /tmp/gh-pages-deploy
cp -r dist /tmp/gh-pages-deploy
cd /tmp/gh-pages-deploy
git init -q
git config user.name "$USER"
git config user.email "${USER}@users.noreply.github.com"
git add -A
git commit -q -m "deploy $(date '+%Y-%m-%d %H:%M')"
git branch -M gh-pages
git push -q "$REMOTE" gh-pages --force

echo ""
echo "✅ 部署完成！"
echo "   访问: https://${USER}.github.io/${REPO}/"
echo ""
echo "如果是第一次部署，请到 Settings → Pages"
echo "把 Source 设为 Deploy from a branch → gh-pages → / (root)"
