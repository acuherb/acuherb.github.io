#!/bin/bash

# 确保当前在 Hugo 项目的根目录
cd "$(dirname "$0")/.."

# 执行 Git 操作
git add .
git commit -m "Deploy Hugo site"
git push -u origin main

# 提示用户部署完成
echo "Hugo site has been deployed successfully!"
