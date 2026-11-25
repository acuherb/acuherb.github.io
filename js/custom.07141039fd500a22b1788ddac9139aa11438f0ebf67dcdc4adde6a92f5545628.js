/**
 * Custom JavaScript for Lruihao blog.
 * @author @Lruihao https://lruihao.cn
 */
class Blog {
  /**
   * console blog information
   * @returns {Blog}
   */
  blogInfo() {
    console.log(
      '%c 观颐斋 | acuherb.xyz %c mail: acuherb@foxmail.com %c\n\n您好！\n欢迎光顾我的博客，\n请多多指教。\n',
      'color: #FF0000; background: #4bffba; padding:5px 0; border-radius: 5px 5px 5px 5px;',
      'background: #fadfa3; padding:5px 0; border-radius: 5px 5px 5px 5px;',
      ''
    );
    return this;
  }

  /**
   * Rest in Peace. R.I.P 🕯️
   * @returns {Boolean} 是否有 R.I.P 事件
   */
  RIP() {
    /**
     * 昔人已乘白云去，兹地空余黄鹤楼。逝者安息 🕯️
     * @type {Array<Object>} R.I.P events
     */
    const RIP_EVENTS = [
      {
        date: '*-9-18',
        content: '九一八事变，又称奉天事变、柳条湖事件...',
        duration: 1, // 仅当天生效
      },
      {
        date: '*-12-13',
        content: '南京大屠杀死难者国家公祭日',
        duration: 1,
      },
      {
        date: '*-5-12',
        content: '汶川大地震纪念日',
        duration: 1,
      },
    ];
    const now = new Date();
    const today = { 
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: now.getDate(),
    };
    const todayEvents = RIP_EVENTS.filter(event => {
      const [ eventYear, eventMonth, eventDate] = event.date.split('-');
      const eventEndDate = new Date(
        eventYear === '*' ? today.year : eventYear,
        (eventMonth === '*' ? today.month : eventMonth) - 1,
        eventDate === '*' ? today.date : eventDate
      );
      eventEndDate.setDate(eventEndDate.getDate() + event.duration);
      return (
        (eventYear === '*' || parseInt(eventYear) === today.year) &&
        (eventMonth === '*' || parseInt(eventMonth) === today.month) &&
        (eventDate === '*' || parseInt(eventDate) === today.date || (today.date >= parseInt(eventDate) && now <= eventEndDate))
      )
    });

    if (todayEvents.length) {
      document.querySelector('html').style.filter = 'grayscale(100%)';
      console.table(todayEvents);
    }
    return todayEvents.length;
  }

  /**
   * 喜庆节日特效
   * @returns {Blog}
   */
  FESTIVAL() {
    const FESTIVAL_EVENTS = [
      { date: '1-1', type: 'confetti', message: '元旦快乐！' },
      { date: '2-10', type: 'confetti', message: '春节快乐！' }, // 示例：春节日期需每年调整
      { date: '10-1', type: 'confetti', message: '国庆节快乐！' },
      { date: '5-1', type: 'confetti', message: '劳动节快乐！' },
    ];

    const now = new Date();
    const today = { 
      month: now.getMonth() + 1,
      date: now.getDate(),
    };

    const todayFestivals = FESTIVAL_EVENTS.filter(event => {
      const [eventMonth, eventDate] = event.date.split('-').map(Number);
      return eventMonth === today.month && eventDate === today.date;
    });

    if (todayFestivals.length) {
      // 动态加载 canvas-confetti 库
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js';
      script.onload = () => {
        todayFestivals.forEach(festival => {
          if (festival.type === 'confetti') {
            this.launchConfetti(festival.message);
          }
        });
      };
      document.head.appendChild(script);
    }
    return this;
  }

  /**
   * 发射彩带特效
   * @param {string} message 祝福语
   */
  launchConfetti(message) {
    // 页面加载后延迟启动，避免影响首屏渲染
    setTimeout(() => {
      // 从页面两侧发射彩带
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        // 左侧发射
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
        });
        // 右侧发射
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // 控制台输出祝福语
      console.log(`%c ${message} %c`, 'font-size: 20px; font-weight: bold; color: #FF6B6B;', '');

    }, 1000);
  }

  /**
   * initialize
   * @returns {Blog}
   */
  init() {
    // custom settings
    if (!this.RIP()) {
      this.blogInfo();
    }
    // 喜庆节日特效
    this.FESTIVAL();
    return this;
  }
}

function detectHomePondLight() {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'light' || theme === 'dark') {
    return theme === 'light';
  }
  return matchMedia('(prefers-color-scheme: light)').matches;
}

function initHomePond() {
  const home = document.querySelector('.home.posts');
  const target = home?.closest('main.fi-container');
  if (!target || window.__acuherbHomePond) return;
  window.__acuherbHomePond = true;

  const start = () => {
    const layer = document.createElement('div');
    layer.className = 'home-pond-layer';
    target.prepend(layer);
    const small = matchMedia('(max-width: 680px)').matches;
    const pond = window.__acuherbPondMount(layer, {
      species: [{ type: 'koi', count: small ? 3 : 4, young: small ? 0 : 1 }],
      theme: detectHomePondLight() ? 'light' : 'dark',
      avoid: '.home-avatar, .home-title, .home-subtitle, .links, .profile-ghchart, .contribution-graph',
      palette: {
        light: {
          page: [250, 250, 248],
          bg: [246, 245, 250],
          water: [60, 10, 30],
          shadow: [60, 10, 30],
        },
        dark: {
          page: [37, 39, 42],
          bg: [42, 44, 52],
          water: [195, 245, 215],
          shadow: [0, 0, 0],
        },
      },
    });

    const syncTheme = () => pond.setTheme(detectHomePondLight());
    new MutationObserver(syncTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', syncTheme);
  };

  if (window.__acuherbPondMount) {
    start();
    return;
  }

  document.addEventListener('ascii-pond:ready', start, { once: true });
  const bootstrap = document.createElement('script');
  bootstrap.type = 'module';
  bootstrap.textContent = `
    (async () => {
      // 网络波动（GitHub/Cloudflare）时重试，失败也不影响正文。
      for (const delay of [0, 1000, 2000]) {
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        try {
          const { mount } = await import('/ascii-pond/pond.js');
          window.__acuherbPondMount = mount;
          document.dispatchEvent(new Event('ascii-pond:ready'));
          return;
        } catch (error) {
          // 继续下一次重试
        }
      }
    })();
  `;
  document.head.appendChild(bootstrap);
}

/**
 * 在奶油的 8 个下垂尖端生成滴落元素：越靠下的尖端越容易滴落。
 * 位置根据 ::after 的实际尺寸换算，跟随视口变化。
 */
function initCreamDrips() {
  const header = document.querySelector('#header-desktop');
  if (!header || header.querySelector('.cream-drips')) return;

  // 从 SVG 路径采样得到的下垂尖端最低点（viewBox 778.95 x 302.64），
  // 液滴从这些点长出，而不是从轮廓中段凭空冒出。
  const tips = [
    { x: 173, y: 302 }, { x: 474, y: 276 },
    { x: 679, y: 175 }, { x: 382, y: 173 },
    { x: 627, y: 157 }, { x: 237, y: 154 },
    { x: 516, y: 134 }, { x: 343, y: 125 },
  ];
  const maxY = 302, minY = 125;

  const layer = document.createElement('div');
  layer.className = 'cream-drips';
  const drops = tips.map(() => {
    const drop = document.createElement('span');
    drop.className = 'cream-drop';
    layer.appendChild(drop);
    return drop;
  });
  header.appendChild(layer);

  const place = () => {
    const after = getComputedStyle(header, '::after');
    const boxW = parseFloat(after.width) || 360;
    const boxH = parseFloat(after.height) || 110;
    const top = parseFloat(after.top) || 56;
    const scale = Math.min(boxW / 778.95, boxH / 302.64);
    const offsetX = (boxW - 778.95 * scale) / 2;
    tips.forEach((tip, i) => {
      // ::after 被 scaleX(-1) 水平翻转，尖端 x 也要翻转。
      const x = boxW - (offsetX + tip.x * scale);
      const y = top + tip.y * scale;
      const depth = (tip.y - minY) / (maxY - minY);
      const duration = 10 - depth * 4;           // 越深越快：6s ~ 10s，给静置期留足时间
      const delay = -((i * 1.37) % duration);    // 黄金比错峰，整排不会同时滴落
      const size = 5 + depth * 4;                // 越深越大：5px ~ 9px
      const drop = drops[i];
      // 液滴中心对准尖端；顶部嵌入 1px，避免与轮廓之间出现缝隙
      drop.style.left = `${x - size / 2}px`;
      drop.style.top = `${y - 1}px`;
      drop.style.width = `${size}px`;
      drop.style.height = `${size * 1.5}px`;
      drop.style.animationDuration = `${duration}s`;
      drop.style.animationDelay = `${delay}s`;
    });
  };

  place();
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(place, 150);
  }, { passive: true });
}

/**
 * immediate.
 */
(() => {
  const blog = new Blog();
  blog.init();
  const boot = () => {
    initCreamDrips();
    initHomePond();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
