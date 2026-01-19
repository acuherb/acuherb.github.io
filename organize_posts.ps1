$postsDir = "c:\hugo\my-blog\content\posts"

# 定义分类规则（使用 out-of-order key 避免编码问题）
$categories = @(
    @{ pattern = "伤寒-"; category = "伤寒论" }
    @{ pattern = "本草-"; category = "本草经" }
    @{ pattern = "本草补-"; category = "本草经" }
    @{ pattern = "外经"; category = "黄帝外经" }
    @{ pattern = "灵枢"; category = "灵枢经" }
    @{ pattern = "素问"; category = "黄帝素问" }
    @{ pattern = "金匮-"; category = "伤寒金匮" }
    @{ pattern = "金匮医案"; category = "伤寒金匮" }
    @{ pattern = "针灸"; category = "针灸穴位" }
)

$movedCount = 0
$skippedCount = 0

# 获取所有 markdown 文件
$files = Get-ChildItem -Path $postsDir -Filter "*.md" -File

foreach ($file in $files) {
    $targetDir = $null
    $targetCategory = $null
    
    # 检查文件名匹配哪个分类
    foreach ($cat in $categories) {
        if ($file.Name.StartsWith($cat.pattern)) {
            $targetDir = Join-Path $postsDir $cat.category
            $targetCategory = $cat.category
            break
        }
    }
    
    # 如果找到目标目录，则移动文件
    if ($targetDir) {
        $destPath = Join-Path $targetDir $file.Name
        
        # 检查是否已经在子文件夹中
        if ($file.Directory.FullName -ne $targetDir) {
            Move-Item -Path $file.FullName -Destination $destPath -Force
            Write-Host "已移动: $($file.Name) -> $targetCategory"
            $movedCount++
        }
    } else {
        $skippedCount++
    }
}

Write-Host ""
Write-Host "===============================" -ForegroundColor Green
Write-Host "迁移完成！"
Write-Host "已移动: $movedCount 个文件"
Write-Host "未分类: $skippedCount 个文件"
Write-Host "===============================" -ForegroundColor Green
