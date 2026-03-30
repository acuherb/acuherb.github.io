// mermaid-enhancer.js
(function() {
  // 等待 DOM 和 Mermaid 库加载完成
  function waitForMermaid(callback) {
    if (typeof mermaid !== 'undefined') {
      callback();
    } else {
      setTimeout(() => waitForMermaid(callback), 200);
    }
  }

  // 深色模式检测
  const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 注入基础样式
  function injectMermaidStyles() {
    if (document.getElementById('mermaid-enhancer-style')) return;
    const style = document.createElement('style');
    style.id = 'mermaid-enhancer-style';
    style.textContent = `
      .mermaid-enhanced-container { border: 1px solid #ccc; padding: 8px; margin: 10px 0; background: #fff; }
      .mermaid-enhanced-container.dark { background: #0f172a; border-color: #334155; }
      .mermaid-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px; }
      .mermaid-toolbar .toolbar-left .view-toggle .toggle-btn { margin-right: 4px; }
      .mermaid-toolbar .toggle-btn.active { font-weight: bold; }
      .download-dropdown { position: relative; display: inline-block; }
      .download-dropdown .dropdown-content { display: none; position: absolute; right: 0; top: 100%; background: #fff; border: 1px solid #ccc; z-index: 1000; min-width: 120px; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
      .download-dropdown.open .dropdown-content { display: block; }
      .download-dropdown .dropdown-content a { display: block; padding: 6px 10px; text-decoration: none; color: #333; }
      .download-dropdown .dropdown-content a:hover { background: #f3f4f6; }
      .mermaid-source-code { white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow: auto; }
    `;
    document.head.appendChild(style);
  }

  // 初始化 Mermaid 主题
  function initMermaidTheme() {
    if (typeof mermaid === 'undefined') return;
    const dark = isDarkMode();
    mermaid.initialize({
      startOnLoad: false,
      theme: dark ? 'dark' : 'base',
      themeVariables: dark ? {
        background: '#0f172a',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f1f5f9',
        primaryBorderColor: '#475569',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#334155'
      } : {
        background: '#ffffff',
        primaryColor: '#e2e8f0',
        primaryTextColor: '#1e293b'
      }
    });
  }

  // 强制 SVG 显示样式（保留 viewBox）
  function fixSvgDisplay(svg) {
    if (!svg) return;
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    // 确保 preserveAspectRatio 合适
    if (!svg.getAttribute('preserveAspectRatio')) {
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  }

  // 为单个 mermaid 元素创建增强容器
  function enhanceMermaidElement(originalPre) {
    // 避免重复增强
    if (originalPre.closest('.mermaid-enhanced-container')) return;

    const code = originalPre.textContent;
    const container = document.createElement('div');
    container.className = 'mermaid-enhanced-container';
    container.setAttribute('data-mermaid-code', encodeURIComponent(code));

    // 构建 HTML 结构
    container.innerHTML = `
      <div class="mermaid-toolbar">
        <div class="toolbar-left">
          <div class="view-toggle">
            <button class="toggle-btn active" data-view="diagram">图表</button>
            <button class="toggle-btn" data-view="code">代码</button>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="download-dropdown">
            <button class="download-btn">下载 ▼</button>
            <div class="dropdown-content">
              <a href="#" data-download="svg">下载 SVG</a>
              <a href="#" data-download="png">下载 PNG</a>
              <a href="#" data-download="code">下载代码</a>
            </div>
          </div>
          <div class="dynamic-buttons">
            <div class="diagram-buttons">
              <button class="zoom-in-btn">+</button>
              <button class="zoom-out-btn">-</button>
            </div>
            <div class="code-buttons" style="display: none;">
              <button class="copy-code-btn">复制代码</button>
            </div>
          </div>
          <button class="fullscreen-btn">全屏</button>
        </div>
      </div>
      <div class="diagram-view active">
        <div class="mermaid-diagram-wrapper"></div>
      </div>
      <div class="code-view" style="display: none;">
        <pre class="mermaid-source-code"><code>${escapeHtml(code)}</code></pre>
      </div>
    `;

    // 将原始 pre 移动到 container，并隐藏原始代码块（用于复制/下载）
    const diagramWrapper = container.querySelector('.mermaid-diagram-wrapper');
    originalPre.parentNode.insertBefore(container, originalPre);
    originalPre.style.display = 'none';

    let panZoomInstance = null;

    function renderDiagram() {
      if (typeof mermaid === 'undefined') {
        console.warn('Mermaid 未就绪，无法渲染');
        return;
      }

      const diagramCode = decodeURIComponent(container.dataset.mermaidCode);
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try {
        mermaid.render(diagramId, diagramCode, (svgCode) => {
          diagramWrapper.innerHTML = svgCode;
          const svg = diagramWrapper.querySelector('svg');
          if (svg) {
            fixSvgDisplay(svg);
            initPanZoom(container, svg);
          }
        }, diagramWrapper);
      } catch (err) {
        console.error('Mermaid 渲染失败：', err);
        diagramWrapper.innerHTML = `<pre class="mermaid-error">渲染失败: ${escapeHtml(err.message || err)}</pre>`;
      }
    }

    // 给 container 挂载重新渲染函数，方便暗黑/亮色切换时统一刷新
    container.reRender = renderDiagram;
    renderDiagram();

    // 初始化 panzoom
    function initPanZoom(cont, svg) {
      if (panZoomInstance && panZoomInstance.destroy) panZoomInstance.destroy();
      if (typeof svgPanZoom !== 'undefined') {
        panZoomInstance = svgPanZoom(svg, {
          panEnabled: true,
          controlIconsEnabled: true,
          fit: true,
          center: true,
          minZoom: 0.3,
          maxZoom: 5,
          zoomScaleSensitivity: 0.2,
          dblClickZoomEnabled: true,
          zoomEnabled: true,
          preventMouseEventsDefault: true
        });
        panZoomInstance.isInitialized = true;
        // 绑定缩放按钮
        const zoomIn = cont.querySelector('.zoom-in-btn');
        const zoomOut = cont.querySelector('.zoom-out-btn');
        if (zoomIn) zoomIn.onclick = () => panZoomInstance.zoomIn();
        if (zoomOut) zoomOut.onclick = () => panZoomInstance.zoomOut();
      } else {
        console.warn('svg-pan-zoom 未加载');
      }
    }

    function fitPanZoom() {
      if (panZoomInstance && panZoomInstance.fit) {
        panZoomInstance.fit();
        panZoomInstance.center();
      }
    }

    // 视图切换
    const toggleBtns = container.querySelectorAll('.toggle-btn');
    const diagramView = container.querySelector('.diagram-view');
    const codeView = container.querySelector('.code-view');
    const diagramBtns = container.querySelector('.diagram-buttons');
    const codeBtns = container.querySelector('.code-buttons');

    function setView(view) {
      if (view === 'diagram') {
        diagramView.style.display = 'block';
        codeView.style.display = 'none';
        diagramBtns.style.display = 'flex';
        codeBtns.style.display = 'none';

        const svg = diagramWrapper.querySelector('svg');
        if (svg && (!panZoomInstance || !panZoomInstance.isInitialized)) {
          initPanZoom(container, svg);
        }

        setTimeout(() => fitPanZoom(), 50);
      } else {
        diagramView.style.display = 'none';
        codeView.style.display = 'block';
        diagramBtns.style.display = 'none';
        codeBtns.style.display = 'flex';
        // 可选：销毁 panzoom 实例以节省资源
        if (panZoomInstance && panZoomInstance.destroy) {
          panZoomInstance.destroy();
          panZoomInstance = null;
        }
      }
      toggleBtns.forEach(btn => {
        if (btn.dataset.view === view) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    }

    toggleBtns.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));

    // 全屏
    const fullscreenBtn = container.querySelector('.fullscreen-btn');
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(e => console.warn(e));
      } else {
        document.exitFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === container) {
        setTimeout(() => fitPanZoom(), 100);
        fullscreenBtn.textContent = '✕';
      } else {
        setTimeout(() => fitPanZoom(), 100);
        fullscreenBtn.textContent = '全屏';
      }
    });

    // 下载功能 + 下拉菜单交互
    const downloadBtn = container.querySelector('.download-btn');
    const downloadDropdown = container.querySelector('.download-dropdown');
    const downloadLinks = container.querySelectorAll('.dropdown-content a');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadDropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => downloadDropdown.classList.remove('open'));
    }

    downloadLinks.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const type = link.dataset.download;
        downloadDropdown.classList.remove('open');
        if (type === 'svg') downloadSVG(container);
        else if (type === 'png') downloadPNG(container);
        else if (type === 'code') downloadCode(container);
      });
    });

    async function downloadSVG(cont) {
      const svg = cont.querySelector('svg');
      if (!svg) { alert('未找到图表'); return; }
      const serializer = new XMLSerializer();
      let svgStr = serializer.serializeToString(svg);
      svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgStr;
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
    }

    async function downloadPNG(cont) {
      const svg = cont.querySelector('svg');
      if (!svg) { alert('未找到图表'); return; }
      let viewBox = svg.getAttribute('viewBox');
      let x, y, width, height;
      if (viewBox) {
        [x, y, width, height] = viewBox.split(' ').map(Number);
      } else {
        const bbox = svg.getBBox();
        x = bbox.x;
        y = bbox.y;
        width = bbox.width;
        height = bbox.height;
      }
      if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
        alert('无法获取有效尺寸');
        return;
      }
      const targetWidth = 1600;
      const scale = targetWidth / width;
      const targetHeight = height * scale;

      const clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', targetWidth);
      clone.setAttribute('height', targetHeight);
      clone.setAttribute('viewBox', viewBox || `${x} ${y} ${width} ${height}`);

      const dark = isDarkMode();
      // 强制嵌入字体样式，避免下载 png 时文字丢失
      const computed = window.getComputedStyle(svg);
      const fontFamily = computed.fontFamily || 'Arial, Helvetica, sans-serif';
      const fontSize = computed.fontSize || '12px';
      const fillColor = computed.color || '#000';
      const style = document.createElement('style');
      style.textContent = `
        svg { background-color: ${dark ? '#0f172a' : 'white'}; }
        text, tspan { font-family: ${fontFamily} !important; font-size: ${fontSize} !important; fill: ${fillColor} !important; }
      `;
      clone.prepend(style);

      const svgStr = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = dark ? '#0f172a' : 'white';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, 'image/png');
    }

    function downloadCode(cont) {
      const rawCode = decodeURIComponent(cont.dataset.mermaidCode);
      const blob = new Blob([rawCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.mmd';
      a.click();
      URL.revokeObjectURL(url);
    }

    // 复制代码
    const copyBtn = container.querySelector('.copy-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const rawCode = decodeURIComponent(container.dataset.mermaidCode);
        try {
          await navigator.clipboard.writeText(rawCode);
          const orig = copyBtn.innerText;
          copyBtn.innerText = '已复制！';
          setTimeout(() => { copyBtn.innerText = orig; }, 1500);
        } catch (err) {
          alert('复制失败');
        }
      });
    }

    // 设置默认视图
    setView('diagram');
  }

  // 辅助函数：转义 HTML
  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
      return c;
    });
  }

  // 主函数：找到所有未增强的 mermaid 代码块并增强
  function enhanceAllMermaid() {
    const mermaidPres = document.querySelectorAll('pre.mermaid:not(.mermaid-enhanced)');
    mermaidPres.forEach(pre => {
      // 标记已处理，防止重复
      pre.classList.add('mermaid-enhanced');
      enhanceMermaidElement(pre);
    });
  }

  // 等待 Mermaid 和 svg-pan-zoom 加载后执行
  waitForMermaid(() => {
    injectMermaidStyles();
    initMermaidTheme();
    // 监听深色模式变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        initMermaidTheme();
        document.querySelectorAll('.mermaid-enhanced-container').forEach(c => {
          if (c.reRender) c.reRender();
        });
      });
    }
    // 增强现有的 mermaid 块
    enhanceAllMermaid();
    // 监听动态内容（例如通过 JavaScript 添加的代码块）
    const observer = new MutationObserver(() => enhanceAllMermaid());
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();