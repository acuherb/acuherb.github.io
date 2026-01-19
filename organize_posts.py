#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import shutil
from pathlib import Path

posts_dir = r"c:\hugo\my-blog\content\posts"

# 定义分类规则
categories = {
    "伤寒-": "伤寒论",
    "本草-": "本草经",
    "本草补-": "本草经",
    "外经": "黄帝外经",
    "灵枢": "灵枢经",
    "素问": "黄帝素问",
    "金匮-": "伤寒金匮",
    "金匮医案": "伤寒金匮",
    "针灸": "针灸穴位",
}

moved_count = 0
skipped_count = 0

# 获取所有 markdown 文件
for file in os.listdir(posts_dir):
    if not file.endswith(".md"):
        continue
    
    file_path = os.path.join(posts_dir, file)
    
    # 检查是否已经在子文件夹中，跳过
    if not os.path.isfile(file_path):
        continue
    
    target_dir = None
    target_category = None
    
    # 检查文件名匹配哪个分类
    for pattern, category in categories.items():
        if file.startswith(pattern):
            target_dir = os.path.join(posts_dir, category)
            target_category = category
            break
    
    # 如果找到目标目录，则移动文件
    if target_dir:
        dest_path = os.path.join(target_dir, file)
        os.makedirs(target_dir, exist_ok=True)
        
        try:
            shutil.move(file_path, dest_path)
            print(f"✓ 已移动: {file} -> {target_category}")
            moved_count += 1
        except Exception as e:
            print(f"✗ 失败: {file} - {str(e)}")
    else:
        skipped_count += 1

print("\n" + "="*40)
print("迁移完成！")
print(f"已移动文件: {moved_count}")
print(f"未分类文件: {skipped_count}")
print("="*40)
