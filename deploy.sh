#!/bin/bash
# Jiya 智能工作台 — 一键部署到 GitHub Pages
# 用法: ./deploy.sh <你的GitHub_Token>
#
# Token 需要 classic token 且勾选 `repo` scope
# 生成地址: https://github.com/settings/tokens/new

set -e

TOKEN="$1"
USER="Jiya33"
REPO="Jiya_work_space"
NODE_BIN="/Users/jiya/.workbuddy/binaries/node/versions/22.22.2/bin"

if [ -z "$TOKEN" ]; then
  echo "❌ 用法: ./deploy.sh <你的GitHub_Token>"
  echo "   生成 token: https://github.com/settings/tokens/new (勾选 repo)"
  exit 1
fi

cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
REMOTE="https://${USER}:${TOKEN}@github.com/${USER}/${REPO}.git"

echo "==> 1/3 构建生产版本..."
export PATH="$NODE_BIN:$PATH"
npm run build

echo "==> 2/3 推送源码到 main 分支..."
git add -A
git commit -q -m "chore: update $(date '+%Y-%m-%d %H:%M')" || echo "    (无新改动，跳过提交)"
git push "$REMOTE" main --force

echo "==> 3/3 推送构建产物到 gh-pages 分支..."
rm -rf /tmp/gh-deploy
cp -r "$PROJECT_DIR/dist" /tmp/gh-deploy
cd /tmp/gh-deploy
touch .nojekyll
git init -q
git config user.name "$USER"
git config user.email "${USER}@users.noreply.github.com"
git add -A
git commit -q -m "deploy $(date '+%Y-%m-%d %H:%M')"
git branch -M gh-pages
git push -q "$REMOTE" gh-pages --force

echo "==> 触发 Pages 重建..."
curl -s -o /dev/null -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${USER}/${REPO}/pages/builds"

echo ""
echo "✅ 部署完成！约 1 分钟后生效"
echo "   访问: https://${USER}.github.io/${REPO}/"
echo ""
echo "⚠️  注意: GitHub Pages 有 CDN 缓存，手机上如果还是旧页面，"
echo "    请强制刷新或清除浏览器缓存"
