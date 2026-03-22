/**
 * Mermaid 图表下载功能
 * 为所有 Mermaid 图表添加下载按钮
 */

(function() {
  // 等待 Mermaid 渲染完成
  function addDownloadButtons() {
    // 查找所有 Mermaid 图表容器
    const mermaidElements = document.querySelectorAll('.mermaid');
    
    mermaidElements.forEach((element, index) => {
      // 避免重复添加按钮
      if (element.parentElement.querySelector('.mermaid-download-btn')) return;
      
      // 为图表生成唯一 ID
      if (!element.id) {
        element.id = `mermaid-chart-${Date.now()}-${index}`;
      }
      
      // 创建按钮容器
      const buttonWrapper = document.createElement('div');
      buttonWrapper.className = 'mermaid-download-wrapper';
      buttonWrapper.style.cssText = `
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
        margin-bottom: 16px;
      `;
      
      // 创建下载按钮
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'mermaid-download-btn';
      downloadBtn.innerHTML = '📥 下载为图片';
      downloadBtn.style.cssText = `
        padding: 6px 12px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
        opacity: 0.7;
      `;
      
      downloadBtn.onmouseover = () => {
        downloadBtn.style.opacity = '1';
      };
      downloadBtn.onmouseout = () => {
        downloadBtn.style.opacity = '0.7';
      };
      
      // 下载功能
      downloadBtn.onclick = async () => {
        await downloadMermaidAsImage(element.id);
      };
      
      buttonWrapper.appendChild(downloadBtn);
      
      // 将按钮插入到图表后面
      element.parentNode.insertBefore(buttonWrapper, element.nextSibling);
    });
  }
  
  // 下载 Mermaid 图表为图片
  async function downloadMermaidAsImage(chartId) {
    try {
      const mermaidElement = document.getElementById(chartId);
      if (!mermaidElement) {
        console.error('未找到 Mermaid 图表');
        return;
      }
      
      // 获取 SVG 元素
      const svgElement = mermaidElement.querySelector('svg');
      if (!svgElement) {
        console.error('未找到 SVG 元素');
        return;
      }
      
      // 克隆 SVG 元素
      const clonedSvg = svgElement.cloneNode(true);
      
      // 获取 SVG 尺寸
      const width = svgElement.clientWidth || svgElement.getBBox().width;
      const height = svgElement.clientHeight || svgElement.getBBox().height;
      
      // 检测深色模式
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
                        document.body.getAttribute('data-theme') === 'dark';
      const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff';
      
      // 创建 canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // 填充背景
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      
      // 将 SVG 转换为图片
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
      
      // 下载图片
      const link = document.createElement('a');
      link.download = `mermaid-chart-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  }
  
  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver(function(mutations) {
    // 检查是否有新的 Mermaid 图表添加
    const hasNewMermaid = Array.from(mutations).some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === 1) {
          return node.querySelector && (node.querySelector('.mermaid') || 
                 (node.classList && node.classList.contains('mermaid')));
        }
        return false;
      });
    });
    
    if (hasNewMermaid) {
      setTimeout(addDownloadButtons, 100);
    }
  });
  
  // 监听整个文档
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDownloadButtons);
  } else {
    addDownloadButtons();
  }
  
  // 如果使用 Mermaid 动态渲染，监听 Mermaid 渲染完成事件
  document.addEventListener('mermaid-rendered', addDownloadButtons);
})();