# 文章分类脚本 - 按照文件名前缀自动分类
$postsDir = "c:\hugo\my-blog\content\posts"

# 定义分类规则
$categories = @{
    "伤寒-" = "伤寒论"
    "本草-" = "本草经"
    "本草补-" = "本草经"
    "外经" = "黄帝外经"
    "灵枢" = "灵枢经"
    "素问" = "黄帝素问"
    "金匮-" = "伤寒金匮"
    "金匮医案" = "伤寒金匮"
    "针灸" = "针灸穴位"
}

# 获取所有 markdown 文件
$files = Get-ChildItem -Path $postsDir -Filter "*.md" -File

$movedCount = 0
$skippedCount = 0

foreach ($file in $files) {
    $targetDir = $null
    
    # 检查文件名匹配哪个分类
    foreach ($pattern in $categories.Keys) {
        if ($file.Name -like "$pattern*") {
            $targetDir = Join-Path $postsDir $categories[$pattern]
            break
        }
    }
    
    # 如果找到目标目录，则移动文件
    if ($targetDir) {
        $destPath = Join-Path $targetDir $file.Name
        
        # 检查是否已经在子文件夹中
        if ($file.Directory.FullName -ne $targetDir) {
            Move-Item -Path $file.FullName -Destination $destPath -Force
            Write-Host "✓ 已移动: $($file.Name) -> $($categories.Values | Where-Object {$_ -eq (Split-Path $targetDir -Leaf)})"
            $movedCount++
        } else {
            $skippedCount++
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "迁移完成！"
Write-Host "已移动文件: $movedCount"
Write-Host "已跳过文件: $skippedCount"
Write-Host "========================================" -ForegroundColor Green
