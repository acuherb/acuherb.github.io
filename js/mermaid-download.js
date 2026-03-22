/**
 * Mermaid 图表下载功能 - 仅 SVG 矢量图
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
      }
      
      .mermaid-download-btn:hover {
        opacity: 1 !important;
      }
      
      .code-header {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 下载为 SVG 矢量图
  function downloadAsSVG(svgElement) {
    try {
      // 克隆 SVG，避免影响原图
      const clonedSvg = svgElement.cloneNode(true);
      
      // 获取原始尺寸
      const width = svgElement.clientWidth || svgElement.getBBox().width;
      const height = svgElement.clientHeight || svgElement.getBBox().height;
      
      // 设置 viewBox 确保缩放正确
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      clonedSvg.setAttribute('width', width);
      clonedSvg.setAttribute('height', height);
      
      // 添加白色背景（确保导出后背景为白色）
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', '#ffffff');
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
      
      // 序列化 SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);
      
      // 添加 XML 声明
      svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
      
      // 创建 Blob 并下载
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `mermaid-${timestamp}.svg`;
      link.href = url;
      link.click();
      
      // 清理
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      return true;
    } catch (error) {
      console.error('SVG 下载失败:', error);
      return false;
    }
  }
  
  // 添加下载按钮
  function addDownloadButton(container, svg) {
    const codeBlock = container.closest('.highlight');
    if (!codeBlock) return;
    
    const targetHeader = codeBlock.querySelector('.code-header');
    if (!targetHeader) return;
    if (targetHeader.querySelector('.mermaid-download-btn')) return;
    
    // 创建按钮组
    let buttonGroup = targetHeader.querySelector('.mermaid-button-group');
    if (!buttonGroup) {
      buttonGroup = document.createElement('div');
      buttonGroup.className = 'mermaid-button-group';
      buttonGroup.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      `;
      
      const copyBtn = targetHeader.querySelector('.copy-code-button');
      if (copyBtn) {
        copyBtn.parentNode.insertBefore(buttonGroup, copyBtn);
        buttonGroup.appendChild(copyBtn);
      }
    }
    
    // 创建下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'mermaid-download-btn';
    downloadBtn.innerHTML = '📸';
    downloadBtn.title = '下载 SVG 矢量图';
    downloadBtn.setAttribute('aria-label', '下载为 SVG 矢量图');
    
    downloadBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // 显示加载状态
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '⏳';
      downloadBtn.disabled = true;
      
      const success = downloadAsSVG(svg);
      
      // 恢复按钮
      if (success) {
        downloadBtn.innerHTML = '✓';
        setTimeout(() => {
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
        }, 1000);
      } else {
        downloadBtn.innerHTML = '❌';
        setTimeout(() => {
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
        }, 1500);
      }
    };
    
    buttonGroup.appendChild(downloadBtn);
  }
  
  // 初始化
  function init() {
    addCustomStyles();
    
    const mermaidElements = document.querySelectorAll('.mermaid');
    console.log(`找到 ${mermaidElements.length} 个 Mermaid 图表`);
    
    mermaidElements.forEach((element) => {
      if (element.hasAttribute('data-download-btn')) return;
      element.setAttribute('data-download-btn', 'true');
      
      const checkForSvg = setInterval(() => {
        const svg = element.querySelector('svg');
        if (svg) {
          clearInterval(checkForSvg);
          addDownloadButton(element, svg);
        }
      }, 100);
      setTimeout(() => clearInterval(checkForSvg), 5000);
    });
  }
  
  // 监听 DOM 变化
  const observer = new MutationObserver(() => setTimeout(init, 200));
  observer.observe(document.body, { childList: true, subtree: true });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();