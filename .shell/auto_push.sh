#!/usr/bin/env bash

echo "============================================"
echo "🚀 Hugo 自动构建 + 推送脚本（AutoPush）"
echo "============================================"

# 项目根目录（脚本位于 .shell/ 内）
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "📍 当前目录：$PROJECT_ROOT"
echo ""

# 1. 检查 Hugo 是否安装
if ! command -v hugo &> /dev/null; then
  echo "❌ 未找到 Hugo，请先安装 Hugo Extended 版本。"
  exit 1
fi

# 2. 清除 Hugo 缓存，避免卡住或输出异常
echo "🧹 清理 Hugo 缓存..."
rm -rf public resources ~/.cache/hugo_cache

# 3. 自动构建
echo "🏗 运行 Hugo 构建..."
hugo --gc --minify

if [ $? -ne 0 ]; then
  echo "❌ Hugo 构建失败，已终止推送。"
  exit 1
fi

echo "✅ Hugo 构建完成！"
echo ""

# 4. 自动添加 Git 提交
echo "📦 正在添加变更..."
git add .

# 自动提交信息
COMMIT_MSG="Auto update: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📝 提交信息：$COMMIT_MSG"

git commit -m "$COMMIT_MSG"

# 5. 推送到 GitHub
echo "⏫ 推送到 GitHub..."
git push

if [ $? -ne 0 ]; then
  echo "❌ 推送失败，请检查网络或权限。"
  exit 1
fi

echo "✅ 推送完成！"
echo ""

echo "============================================"
echo "🌐 你可以通过 GitHub Pages 访问你的博客了"
echo "============================================"
