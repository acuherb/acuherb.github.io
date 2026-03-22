/**
 * Mermaid 图表下载功能 - 增强版
 */
(function() {
  console.log('Mermaid 下载功能已加载');
  
  // 下载 Mermaid 图表为图片
  async function downloadMermaidAsImage(chartElement) {
    try {
      // 获取 SVG 元素
      const svgElement = chartElement.querySelector('svg');
      if (!svgElement) {
        console.error('未找到 SVG 元素');
        alert('未找到图表，请稍后重试');
        return;
      }
      
      // 获取 SVG 尺寸
      const width = svgElement.clientWidth || svgElement.getBBox().width || 800;
      const height = svgElement.clientHeight || svgElement.getBBox().height || 600;
      
      // 克隆 SVG 元素
      const clonedSvg = svgElement.cloneNode(true);
      
      // 添加白色背景（如果需要）
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', '#ffffff');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);
      
      // 将 SVG 转换为图片
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // 创建 canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // 绘制白色背景
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height);
          
          // 下载图片
          const link = document.createElement('a');
          link.download = `mermaid-chart-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
      
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  }
  
  // 为所有 Mermaid 图表添加下载按钮
  function addDownloadButtons() {
    const mermaidElements = document.querySelectorAll('.mermaid');
    console.log(`找到 ${mermaidElements.length} 个 Mermaid 图表`);
    
    mermaidElements.forEach((element, index) => {
      // 避免重复添加
      if (element.hasAttribute('data-download-btn-added')) return;
      
      // 标记已添加
      element.setAttribute('data-download-btn-added', 'true');
      
      // 为图表添加容器包装（可选）
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-wrapper';
      wrapper.style.cssText = 'position: relative; margin: 20px 0;';
      
      // 创建下载按钮
      const downloadBtn = document.createElement('button');
      downloadBtn.innerHTML = '📥 下载为图片';
      downloadBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        z-index: 100;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      
      // 悬停显示按钮
      downloadBtn.onmouseenter = () => {
        downloadBtn.style.opacity = '1';
      };
      downloadBtn.onmouseleave = () => {
        downloadBtn.style.opacity = '0';
      };
      
      // 点击下载
      downloadBtn.onclick = (e) => {
        e.stopPropagation();
        downloadMermaidAsImage(element);
      };
      
      // 包装元素
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
      wrapper.appendChild(downloadBtn);
      
      // 让按钮在鼠标悬停在包装器上时显示
      wrapper.onmouseenter = () => {
        downloadBtn.style.opacity = '1';
      };
      wrapper.onmouseleave = () => {
        downloadBtn.style.opacity = '0';
      };
    });
  }
  
  // 等待 Mermaid 渲染完成
  function waitForMermaid() {
    // 如果 Mermaid 已定义，等待其渲染完成
    if (typeof mermaid !== 'undefined') {
      // 延迟一点确保渲染完成
      setTimeout(addDownloadButtons, 500);
      setTimeout(addDownloadButtons, 1000); // 双重保险
      setTimeout(addDownloadButtons, 2000);
    } else {
      console.log('Mermaid 未加载，等待...');
      setTimeout(waitForMermaid, 500);
    }
  }
  
  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver(function(mutations) {
    let shouldCheck = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && (node.classList?.contains('mermaid') || node.querySelector?.('.mermaid'))) {
            shouldCheck = true;
            break;
          }
        }
      }
      if (shouldCheck) break;
    }
    if (shouldCheck) {
      setTimeout(addDownloadButtons, 100);
    }
  });
  
  // 开始监听
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForMermaid();
    });
  } else {
    waitForMermaid();
  }
})();