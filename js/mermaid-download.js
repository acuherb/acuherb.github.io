/**
 * Mermaid 图表下载功能 - 修复版
 */

(function() {
  console.log('Mermaid 下载功能加载中...');
  
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
      // 克隆 SVG
      const clonedSvg = svgElement.cloneNode(true);
      
      // 获取尺寸
      const width = svgElement.clientWidth || svgElement.getBBox().width;
      const height = svgElement.clientHeight || svgElement.getBBox().height;
      
      // 设置 viewBox
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      clonedSvg.setAttribute('width', width);
      clonedSvg.setAttribute('height', height);
      
      // 添加白色背景
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', '#ffffff');
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
      
      // 序列化并下载
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);
      svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
      
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `mermaid-${Date.now()}.svg`;
      link.href = url;
      link.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      return true;
    } catch (error) {
      console.error('SVG 下载失败:', error);
      return false;
    }
  }
  
  // 下载为 PNG（修复版）
  async function downloadAsPNG(svgElement) {
    try {
      // 获取 SVG 的实际尺寸
      const width = svgElement.clientWidth;
      const height = svgElement.clientHeight;
      
      if (!width || !height) {
        console.error('无法获取 SVG 尺寸');
        return false;
      }
      
      // 使用 3 倍分辨率
      const scale = 3;
      const canvasWidth = width * scale;
      const canvasHeight = height * scale;
      
      // 克隆 SVG
      const clonedSvg = svgElement.cloneNode(true);
      
      // 设置尺寸
      clonedSvg.setAttribute('width', canvasWidth);
      clonedSvg.setAttribute('height', canvasHeight);
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // 添加白色背景
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', '#ffffff');
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
      
      // 转换为字符串
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      // 创建图片
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // 等待图片加载
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      
      // 创建 canvas 并绘制
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      
      // 填充白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      // 下载 PNG
      const link = document.createElement('a');
      link.download = `mermaid-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // 清理
      URL.revokeObjectURL(url);
      return true;
      
    } catch (error) {
      console.error('PNG 下载失败:', error);
      return false;
    }
  }
  
  // 添加按钮
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
    downloadBtn.title = '下载图表';
    
    // 创建下拉菜单
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: none;
      z-index: 1000;
      min-width: 130px;
    `;
    
    // SVG 选项
    const svgOption = document.createElement('div');
    svgOption.innerHTML = '📄 SVG 矢量图';
    svgOption.style.cssText = 'padding: 8px 12px; cursor: pointer; font-size: 13px;';
    svgOption.onmouseenter = () => svgOption.style.background = '#f5f5f5';
    svgOption.onmouseleave = () => svgOption.style.background = '';
    svgOption.onclick = async (e) => {
      e.stopPropagation();
      menu.style.display = 'none';
      downloadBtn.innerHTML = '⏳';
      const success = downloadAsSVG(svg);
      downloadBtn.innerHTML = success ? '📄' : '❌';
      setTimeout(() => { downloadBtn.innerHTML = '📸'; }, 1500);
    };
    
    // PNG 选项
    const pngOption = document.createElement('div');
    pngOption.innerHTML = '🖼️ PNG 高清图';
    pngOption.style.cssText = 'padding: 8px 12px; cursor: pointer; font-size: 13px; border-top: 1px solid #eee;';
    pngOption.onmouseenter = () => pngOption.style.background = '#f5f5f5';
    pngOption.onmouseleave = () => pngOption.style.background = '';
    pngOption.onclick = async (e) => {
      e.stopPropagation();
      menu.style.display = 'none';
      downloadBtn.innerHTML = '⏳';
      const success = await downloadAsPNG(svg);
      downloadBtn.innerHTML = success ? '🖼️' : '❌';
      setTimeout(() => { downloadBtn.innerHTML = '📸'; }, 1500);
    };
    
    menu.appendChild(svgOption);
    menu.appendChild(pngOption);
    
    // 包装器
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: relative; display: inline-block;';
    wrapper.appendChild(downloadBtn);
    wrapper.appendChild(menu);
    
    downloadBtn.onclick = (e) => {
      e.stopPropagation();
      const isVisible = menu.style.display === 'block';
      document.querySelectorAll('.mermaid-download-menu').forEach(m => {
        if (m !== menu) m.style.display = 'none';
      });
      menu.style.display = isVisible ? 'none' : 'block';
    };
    
    buttonGroup.appendChild(wrapper);
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });
  }
  
  // 初始化
  function init() {
    addCustomStyles();
    
    const mermaidElements = document.querySelectorAll('.mermaid');
    
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