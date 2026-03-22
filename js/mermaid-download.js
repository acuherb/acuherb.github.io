/**
 * Mermaid 图表下载功能 - 下载原始 SVG 矢量图
 */

(function() {
  console.log('Mermaid SVG 下载功能加载中...');
  
  // 添加自定义样式
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
  async function downloadAsSVG(svgElement, container) {
    try {
      // 克隆 SVG，避免影响原图
      const clonedSvg = svgElement.cloneNode(true);
      
      // 获取原始 SVG 的尺寸
      const width = svgElement.clientWidth || svgElement.getBBox().width;
      const height = svgElement.clientHeight || svgElement.getBBox().height;
      
      // 设置 viewBox 确保缩放正确
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      clonedSvg.setAttribute('width', width);
      clonedSvg.setAttribute('height', height);
      
      // 获取背景色
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
                        document.body.getAttribute('data-theme') === 'dark';
      const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff';
      
      // 添加背景矩形
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', bgColor);
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
      link.download = `mermaid-diagram-${timestamp}.svg`;
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
  
  // 下载为高清 PNG（备用方案）
  async function downloadAsPNG(svgElement, container) {
    try {
      // 获取 SVG 尺寸
      const bbox = svgElement.getBBox();
      const width = bbox.width;
      const height = bbox.height;
      
      // 使用 4 倍分辨率
      const scale = 4;
      const canvasWidth = width * scale;
      const canvasHeight = height * scale;
      
      // 克隆 SVG
      const clonedSvg = svgElement.cloneNode(true);
      
      // 获取背景色
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
                        document.body.getAttribute('data-theme') === 'dark';
      const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff';
      
      // 添加背景
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', bgColor);
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
      
      // 设置尺寸
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      clonedSvg.setAttribute('width', canvasWidth);
      clonedSvg.setAttribute('height', canvasHeight);
      
      // 转换为 PNG
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
      
      // 下载 PNG
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `mermaid-diagram-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      return true;
    } catch (error) {
      console.error('PNG 下载失败:', error);
      return false;
    }
  }
  
  // 添加下载按钮（提供两种格式选择）
  function addDownloadButton(container, svg) {
    // 查找代码块头部
    const codeBlock = container.closest('.highlight');
    let targetHeader = null;
    
    if (codeBlock) {
      targetHeader = codeBlock.querySelector('.code-header');
    }
    
    if (!targetHeader) return;
    if (targetHeader.querySelector('.mermaid-download-btn')) return;
    
    // 创建按钮组容器
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
      
      // 移动复制按钮到组内
      const copyBtn = targetHeader.querySelector('.copy-code-button');
      if (copyBtn) {
        copyBtn.parentNode.insertBefore(buttonGroup, copyBtn);
        buttonGroup.appendChild(copyBtn);
      }
    }
    
    // 创建下载菜单容器
    const downloadWrapper = document.createElement('div');
    downloadWrapper.style.cssText = 'position: relative; display: inline-block;';
    
    // 创建主下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'mermaid-download-btn';
    downloadBtn.innerHTML = '📸';
    downloadBtn.title = '下载图表';
    downloadBtn.setAttribute('aria-label', '下载图表');
    
    // 创建下拉菜单
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #ddd);
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: none;
      z-index: 1000;
      min-width: 120px;
      overflow: hidden;
    `;
    
    // SVG 选项
    const svgOption = document.createElement('div');
    svgOption.innerHTML = '📄 SVG 矢量图';
    svgOption.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 13px;
    `;
    svgOption.onmouseenter = () => svgOption.style.background = 'rgba(0,0,0,0.05)';
    svgOption.onmouseleave = () => svgOption.style.background = '';
    svgOption.onclick = async (e) => {
      e.stopPropagation();
      menu.style.display = 'none';
      downloadBtn.innerHTML = '⏳';
      downloadBtn.disabled = true;
      const success = await downloadAsSVG(svg, container);
      downloadBtn.innerHTML = success ? '📄' : '❌';
      downloadBtn.disabled = false;
      setTimeout(() => { if (downloadBtn.innerHTML !== '📸') downloadBtn.innerHTML = '📸'; }, 2000);
    };
    
    // PNG 选项
    const pngOption = document.createElement('div');
    pngOption.innerHTML = '🖼️ PNG 高清图';
    pngOption.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 13px;
      border-top: 1px solid var(--border-color, #ddd);
    `;
    pngOption.onmouseenter = () => pngOption.style.background = 'rgba(0,0,0,0.05)';
    pngOption.onmouseleave = () => pngOption.style.background = '';
    pngOption.onclick = async (e) => {
      e.stopPropagation();
      menu.style.display = 'none';
      downloadBtn.innerHTML = '⏳';
      downloadBtn.disabled = true;
      const success = await downloadAsPNG(svg, container);
      downloadBtn.innerHTML = success ? '🖼️' : '❌';
      downloadBtn.disabled = false;
      setTimeout(() => { if (downloadBtn.innerHTML !== '📸') downloadBtn.innerHTML = '📸'; }, 2000);
    };
    
    menu.appendChild(svgOption);
    menu.appendChild(pngOption);
    downloadWrapper.appendChild(downloadBtn);
    downloadWrapper.appendChild(menu);
    
    // 点击主按钮显示/隐藏菜单
    downloadBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = menu.style.display === 'block';
      // 关闭所有其他菜单
      document.querySelectorAll('.mermaid-download-menu').forEach(m => m.style.display = 'none');
      menu.style.display = isVisible ? 'none' : 'block';
    };
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });
    
    // 添加到按钮组
    buttonGroup.appendChild(downloadWrapper);
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