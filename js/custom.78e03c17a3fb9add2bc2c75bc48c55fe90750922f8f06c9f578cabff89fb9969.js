/**
 * Custom JavaScript for Lruihao blog.
 * @author @Lruihao https://lruihao.cn
 */
class Blog {
  constructor() {
    /**
     * current environment is local or not
     * @type {Boolean}
     */
    this.isLocal = window.location.href.startsWith('http://localhost') || window.location.href.startsWith('http://127.0.0.1');
  }

  /**
   * baidu auto push
   * @link https://ziyuan.baidu.com
   * @returns {Blog}
   */
  baiduPush() {
    let bp = document.createElement('script');
    let curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
      bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    } else {
      bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    let s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(bp, s);
    return this;
  }

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
    if (!this.isLocal) {
      this.baiduPush();
    }
    // custom settings
    if (!this.RIP()) {
      this.blogInfo();
    }
    // 喜庆节日特效
    this.FESTIVAL();
    return this;
  }
}

/**
 * immediate.
 */
(() => {
  const blog = new Blog();
  blog.init();
  // it will be executed when the DOM tree is built
  document.addEventListener('DOMContentLoaded', () => {
    //
  });
})();
