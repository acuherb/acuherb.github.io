/**
 * Mermaid 图表下载功能 - SVG 矢量图（修正版）
 * 修复：1. 下载按钮不再遮挡复制代码按钮  2. 导出 SVG 不再模糊
 */

(function() {
  console.log('Mermaid SVG 下载功能加载中...');

  // 添加样式
  function addCustomStyles() {
    if (document.getElementById('mermaid-download-styles')) return;

    const style = document.createElement('style');
    style.id = 'mermaid-download-styles';
    style.textContent = `
      .mermaid-download-btn {
        background: none !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 1rem !important;
        padding: 0 8px !important;
        margin: 0 !important;
        color: inherit !important;
        opacity: 0.7 !important;
        transition: opacity 0.2s !important;
        line-height: 1 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 28px !important;
        /* 确保不遮挡相邻按钮 */
        position: relative !important;
        z-index: auto !important;
      }

      .mermaid-download-btn:hover {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 收集 SVG 内部用到的所有样式规则（解决外部 CSS 丢失导致导出异常）
  function collectSVGStyles(svgElement) {
    const usedTags = new Set();
    const usedClasses = new Set();
    const usedIds = new Set();

    svgElement.querySelectorAll('*').forEach(function(el) {
      usedTags.add(el.tagName.toLowerCase());
      el.classList.forEach(function(c) { usedClasses.add(c); });
      if (el.id) usedIds.add(el.id);
    });

    var rules = [];
    try {
      for (var s = 0; s < document.styleSheets.length; s++) {
        var sheet = document.styleSheets[s];
        var cssRules;
        try { cssRules = sheet.cssRules || sheet.rules; } catch (_) { continue; }
        if (!cssRules) continue;
        for (var r = 0; r < cssRules.length; r++) {
          var rule = cssRules[r];
          if (!rule.selectorText) continue;
          var sel = rule.selectorText;
          // 粗筛：选择器中包含 SVG 内部用到的类名、标签或 ID
          var dominated = false;
          usedClasses.forEach(function(c) { if (sel.indexOf('.' + c) !== -1) dominated = true; });
          usedIds.forEach(function(id) { if (sel.indexOf('#' + id) !== -1) dominated = true; });
          usedTags.forEach(function(t) { if (sel.indexOf(t) !== -1) dominated = true; });
          if (dominated) rules.push(rule.cssText);
        }
      }
    } catch (_) { /* 跨域样式表忽略 */ }
    return rules.join('\n');
  }

  // 下载为 SVG 矢量图
  function downloadAsSVG(svgElement) {
    try {
      var clonedSvg = svgElement.cloneNode(true);

      // ===== 修复模糊问题：保留原始 viewBox =====
      // Mermaid 渲染的 SVG 自带精确 viewBox，不应覆盖
      if (!clonedSvg.getAttribute('viewBox')) {
        // 仅在缺少 viewBox 时才用 getBBox 计算（getBBox 基于 SVG 坐标系，比 clientWidth 精确）
        var bbox = svgElement.getBBox();
        var padding = 10;
        clonedSvg.setAttribute('viewBox',
          (bbox.x - padding) + ' ' + (bbox.y - padding) + ' ' +
          (bbox.width + padding * 2) + ' ' + (bbox.height + padding * 2)
        );
      }

      // 移除固定的像素宽高，让 SVG 作为矢量图自由缩放
      // 同时保留一个合理的默认显示尺寸
      var viewBox = clonedSvg.getAttribute('viewBox');
      if (viewBox) {
        var parts = viewBox.split(/[\s,]+/);
        var vbWidth = parseFloat(parts[2]) || 800;
        var vbHeight = parseFloat(parts[3]) || 600;
        // 设置为 viewBox 的实际尺寸，确保 1:1 无损
        clonedSvg.setAttribute('width', vbWidth);
        clonedSvg.setAttribute('height', vbHeight);
      } else {
        clonedSvg.removeAttribute('width');
        clonedSvg.removeAttribute('height');
      }

      // 确保 xmlns 声明完整
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // 添加白色背景矩形
      var bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', '#ffffff');
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

      // 内联关键样式到 SVG（确保脱离网页后渲染一致）
      var styleText = collectSVGStyles(svgElement);
      if (styleText) {
        var styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.textContent = styleText;
        // 插入到背景矩形之后
        if (bgRect.nextSibling) {
          clonedSvg.insertBefore(styleEl, bgRect.nextSibling);
        } else {
          clonedSvg.appendChild(styleEl);
        }
      }

      // 序列化
      var serializer = new XMLSerializer();
      var svgString = serializer.serializeToString(clonedSvg);

      // 添加 XML 声明
      svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

      // 创建 Blob 并触发下载
      var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      var timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = 'mermaid-' + timestamp + '.svg';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(function() { URL.revokeObjectURL(url); }, 200);
      return true;
    } catch (error) {
      console.error('SVG 下载失败:', error);
      return false;
    }
  }

  // 添加下载按钮（不再重新组织 DOM 结构）
  function addDownloadButton(container, svg) {
    var codeBlock = container.closest('.highlight');
    if (!codeBlock) return;

    var targetHeader = codeBlock.querySelector('.code-header');
    if (!targetHeader) return;

    // 防止重复添加
    if (targetHeader.querySelector('.mermaid-download-btn')) return;

    // 创建下载按钮
    var downloadBtn = document.createElement('button');
    downloadBtn.className = 'mermaid-download-btn';
    downloadBtn.innerHTML = '📸';
    downloadBtn.title = '下载 SVG 矢量图';
    downloadBtn.setAttribute('aria-label', '下载为 SVG 矢量图');

    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '⏳';
      downloadBtn.disabled = true;

      // 用 requestAnimationFrame 确保 UI 更新后再执行导出
      requestAnimationFrame(function() {
        var success = downloadAsSVG(svg);

        if (success) {
          downloadBtn.innerHTML = '✅';
          setTimeout(function() {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
          }, 1200);
        } else {
          downloadBtn.innerHTML = '❌';
          setTimeout(function() {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
          }, 1500);
        }
      });
    });

    // ===== 修复遮挡问题：不再 reparent 复制按钮 =====
    // 直接将下载按钮插入到复制按钮前面，保留原始 DOM 结构
    var copyBtn = targetHeader.querySelector('.copy-code-button');
    if (copyBtn) {
      copyBtn.parentNode.insertBefore(downloadBtn, copyBtn);
    } else {
      targetHeader.appendChild(downloadBtn);
    }
  }

  // 初始化：扫描所有 Mermaid 元素并添加按钮
  function init() {
    addCustomStyles();

    var mermaidElements = document.querySelectorAll('.mermaid');
    console.log('找到 ' + mermaidElements.length + ' 个 Mermaid 图表');

    mermaidElements.forEach(function(element) {
      if (element.hasAttribute('data-download-btn')) return;
      element.setAttribute('data-download-btn', 'true');

      // 轮询等待 SVG 渲染完成
      var attempts = 0;
      var maxAttempts = 50; // 最多等 5 秒
      var checkForSvg = setInterval(function() {
        attempts++;
        var svg = element.querySelector('svg');
        if (svg) {
          clearInterval(checkForSvg);
          addDownloadButton(element, svg);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkForSvg);
          console.warn('Mermaid SVG 渲染超时，跳过按钮添加');
        }
      }, 100);
    });
  }

  // 监听 DOM 变化，自动为新增的 Mermaid 图表添加按钮
  var debounceTimer = null;
  var observer = new MutationObserver(function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(init, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
