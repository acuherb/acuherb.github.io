#!/bin/bash

# 确保当前在 Hugo 项目的根目录
cd "$(dirname "$0")/.."

# 生成 Hugo 站点
hugo

# 进入 public 目录
cd public

# Git 操作
git add .
git commit -m "Deploy Hugo site"
git push -u origin main  # 如果是部署到 gh-pages 分支，这里需要改成 gh-pages

# 提示用户部署完成
echo "Hugo site has been deployed successfully!"
