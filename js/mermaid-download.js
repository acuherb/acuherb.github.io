/**
 * Mermaid 图表高清下载功能
 * 不影响原有复制按钮，独立添加下载按钮
 */

(function() {
  console.log('Mermaid 高清下载功能加载中...');
  
  // 等待 DOM 和 Mermaid 渲染完成
  function init() {
    // 查找所有 Mermaid 图表
    const mermaidElements = document.querySelectorAll('.mermaid');
    
    mermaidElements.forEach((element, index) => {
      // 避免重复添加
      if (element.hasAttribute('data-download-btn')) return;
      element.setAttribute('data-download-btn', 'true');
      
      // 等待 SVG 渲染完成
      const checkForSvg = setInterval(() => {
        const svg = element.querySelector('svg');
        if (svg) {
          clearInterval(checkForSvg);
          addDownloadButton(element, svg);
        }
      }, 100);
      
      // 5秒后停止检查
      setTimeout(() => clearInterval(checkForSvg), 5000);
    });
  }
  
  // 添加下载按钮
  function addDownloadButton(container, svg) {
    // 查找代码块头部（FixIt 主题的代码块工具栏）
    const codeBlock = container.closest('.highlight');
    let targetHeader = null;
    
    if (codeBlock) {
      targetHeader = codeBlock.querySelector('.code-header');
    }
    
    // 如果找不到代码块头部，查找图表容器本身
    if (!targetHeader) {
      targetHeader = container.parentElement;
    }
    
    // 避免重复添加
    if (targetHeader.querySelector('.mermaid-download-btn')) return;
    
    // 创建下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'mermaid-download-btn';
    downloadBtn.innerHTML = '📸';
    downloadBtn.title = '下载高清图片';
    downloadBtn.setAttribute('aria-label', '下载为图片');
    downloadBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0 6px;
      margin: 0 2px;
      color: inherit;
      opacity: 0.7;
      transition: opacity 0.2s;
      line-height: 1;
    `;
    
    downloadBtn.onmouseenter = () => downloadBtn.style.opacity = '1';
    downloadBtn.onmouseleave = () => downloadBtn.style.opacity = '0.7';
    
    // 下载功能
    downloadBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await downloadMermaidAsImage(svg, container);
    };
    
    // 查找复制按钮，插入在旁边
    const copyBtn = targetHeader.querySelector('.copy-code-button');
    if (copyBtn) {
      // 插入到复制按钮后面
      copyBtn.parentNode.insertBefore(downloadBtn, copyBtn.nextSibling);
    } else {
      // 如果没有复制按钮，直接添加到头部
      targetHeader.appendChild(downloadBtn);
    }
  }
  
  // 下载高清图片
  async function downloadMermaidAsImage(svgElement, container) {
    try {
      // 显示加载状态
      const btn = container.parentElement?.querySelector('.mermaid-download-btn');
      if (btn) {
        btn.innerHTML = '⏳';
        btn.disabled = true;
      }
      
      // 获取 SVG 的实际尺寸
      const bbox = svgElement.getBBox();
      const width = bbox.width;
      const height = bbox.height;
      
      // 使用 4 倍分辨率，确保清晰
      const scale = 4;
      const canvasWidth = width * scale;
      const canvasHeight = height * scale;
      
      // 克隆 SVG
      const clonedSvg = svgElement.cloneNode(true);
      
      // 获取背景色（根据当前主题）
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
                        document.body.getAttribute('data-theme') === 'dark';
      const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff';
      
      // 添加白色/黑色背景
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', bgColor);
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
      
      // 设置 SVG 的 viewBox 和尺寸
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      clonedSvg.setAttribute('width', canvasWidth);
      clonedSvg.setAttribute('height', canvasHeight);
      
      // 获取所有样式
      const styles = getComputedStyles(svgElement);
      
      // 添加样式定义
      const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleElement.textContent = styles;
      clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);
      
      // 转换为图片
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // 创建 canvas
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      
      // 绘制
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
      
      // 下载
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `mermaid-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // 恢复按钮
      if (btn) {
        btn.innerHTML = '📸';
        btn.disabled = false;
      }
      
    } catch (error) {
      console.error('下载失败:', error);
      const btn = container.parentElement?.querySelector('.mermaid-download-btn');
      if (btn) {
        btn.innerHTML = '❌';
        setTimeout(() => {
          btn.innerHTML = '📸';
          btn.disabled = false;
        }, 2000);
      }
    }
  }
  
  // 获取 SVG 中所有元素的样式
  function getComputedStyles(svgElement) {
    const elements = svgElement.querySelectorAll('*');
    const styleMap = new Map();
    
    elements.forEach(el => {
      const tag = el.tagName.toLowerCase();
      const id = el.id;
      const classes = Array.from(el.classList).join('.');
      
      let selector = tag;
      if (id) selector = `#${id}`;
      else if (classes) selector = `.${classes}`;
      else selector = tag;
      
      if (!styleMap.has(selector)) {
        const computed = window.getComputedStyle(el);
        const styles = {};
        for (let i = 0; i < computed.length; i++) {
          const prop = computed[i];
          const value = computed.getPropertyValue(prop);
          if (value && !prop.startsWith('-webkit')) {
            styles[prop] = value;
          }
        }
        styleMap.set(selector, styles);
      }
    });
    
    let cssString = '';
    styleMap.forEach((styles, selector) => {
      cssString += `${selector} { `;
      for (const [prop, value] of Object.entries(styles)) {
        cssString += `${prop}: ${value}; `;
      }
      cssString += '}\n';
    });
    
    return cssString;
  }
  
  // 监听 DOM 变化
  const observer = new MutationObserver(() => {
    setTimeout(init, 200);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();