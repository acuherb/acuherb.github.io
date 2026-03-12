"use strict";(()=>{var T=(h,e)=>()=>(e||h((e={exports:{}}).exports,e),e.exports);var S=T((E,d)=>{var a=class{constructor(e={}){this.options={selector:'a[href^="/posts/"]',previewSelector:"body",customCss:{},hideSelector:"header, footer",width:400,height:300,delay:500,hideDelay:500,...e},this.container=null,this.timer=null,this.hideTimer=null,this.init()}init(){this.createStyles(),document.addEventListener("mouseover",this.handleMouseOver.bind(this)),document.addEventListener("mousemove",this.checkMousePosition.bind(this),{passive:!0})}createStyles(){if(document.getElementById("link-preview-styles"))return;let e=document.createElement("style");e.id="link-preview-styles",e.textContent=`
      .lp-container {
        position: absolute;
        z-index: 9999;
        background: #fff;
        border: 1px solid #ddd;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: ${this.options.width}px;
        height: ${this.options.height}px;
        transition: opacity 0.2s ease-in-out;
      }
      .lp-container.lp-hidden {
        opacity: 0;
        pointer-events: none;
      }
      .lp-container.lp-visible {
        opacity: 1;
      }
      [data-theme='dark'] .lp-container {
        background: #1a1a1a;
        border-color: #333;
        color: #f8f9fa;
      }
      [data-theme='dark'] .lp-header,
      [data-theme='dark'] .lp-footer {
        background: #2a2a2a;
        border-color: #333;
        color: #ddd;
      }
      [data-theme='dark'] .lp-btn {
        color: #aaa;
      }
      [data-theme='dark'] .lp-btn:hover {
        background: #333;
      }
      .lp-header {
        padding: 2px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }
      .lp-title {
        font-weight: bold;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 10px;
      }
      .lp-actions {
        display: flex;
        gap: 8px;
      }
      .lp-btn {
        cursor: pointer;
        padding: 2px 5px;
        border-radius: 4px;
        color: #666;
        text-decoration: none;
        font-size: 16px;
      }
      .lp-btn:hover { background: #eee; }
      .lp-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 15px;
        font-size: 14px;
        position: relative;
        -webkit-overflow-scrolling: touch;
      }
      .lp-content::-webkit-scrollbar {
        width: 6px;
      }
      .lp-content::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .lp-content::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }
      .lp-content::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .lp-footer {
        padding: 2px;
        background: #f8f9fa;
        border-top: 1px solid #eee;
        font-size: 12px;
        color: #888;
        display: flex;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .lp-url {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 70%;
      }
      .lp-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }
    `,document.head.appendChild(e)}handleMouseOver(e){let t=e.target.closest(this.options.selector);clearTimeout(this.hideTimer),t&&(clearTimeout(this.timer),this.timer=setTimeout(()=>this.showPreview(t),this.options.delay))}checkMousePosition(e){if(!this.container||this.container.style.display==="none")return;let t=this.container.getBoundingClientRect(),p=e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom,i=document.elementFromPoint(e.clientX,e.clientY)?.closest(this.options.selector);p||i?clearTimeout(this.hideTimer):(clearTimeout(this.hideTimer),this.hideTimer=setTimeout(()=>this.hidePreview(),this.options.hideDelay||500))}async showPreview(e){let t=e.href,p=performance.now();this.container||(this.container=document.createElement("div"),this.container.className="lp-container",document.body.appendChild(this.container));let i=e.getBoundingClientRect(),n=window.scrollX||window.pageXOffset,m=window.scrollY||window.pageYOffset,f=window.innerWidth,b=window.innerHeight,s=i.left+n,u=i.bottom+m+5;s+this.options.width>n+f-20&&(s=n+f-this.options.width-20),s<n+10&&(s=n+10),i.bottom+this.options.height+20>b&&i.top>this.options.height+20&&(u=i.top+m-this.options.height-5),this.container.style.top=`${u}px`,this.container.style.left=`${s}px`,this.container.style.display="flex",this.container.classList.add("lp-visible"),this.container.classList.remove("lp-hidden"),this.container.innerHTML=`
      <div class="lp-header">
        <span class="lp-title">\u52A0\u8F7D\u4E2D...</span>
        <div class="lp-actions">
          <a href="${t}" target="_blank" class="lp-btn" title="\u65B0\u6807\u7B7E\u6253\u5F00">\u2197</a>
          <span class="lp-btn lp-close" title="\u5173\u95ED">\xD7</span>
        </div>
      </div>
      <div class="lp-content"><div class="lp-loading">Loading...</div></div>
      <div class="lp-footer">
        <span class="lp-url">${e.pathname||t}</span>
        <span class="lp-time"></span>
      </div>
    `,this.container.querySelector(".lp-close").onclick=()=>this.hidePreview();try{let y=await(await fetch(t)).text(),r=new DOMParser().parseFromString(y,"text/html");this.options.hideSelector&&r.querySelectorAll(this.options.hideSelector).forEach(o=>{o.style.display!=="none"&&(o.dataset.lpOriginalDisplay=o.style.display,o.style.display="none")});let g=[this.options.previewSelector,"article",".post-content",".content","main"],c=null;for(let l of g)if(l&&(c=r.querySelector(l),c))break;if(this.options.customCss&&typeof this.options.customCss=="object")for(let[l,o]of Object.entries(this.options.customCss))r.querySelectorAll(l).forEach(k=>{k.style.cssText+=o});let v=r.querySelector("h1")?.innerText||r.title||"\u65E0\u6807\u9898",x=((performance.now()-p)/1e3).toFixed(2);this.container&&(this.container.querySelector(".lp-title").innerText=v,this.container.querySelector(".lp-content").innerHTML=c?c.innerHTML:"\u672A\u627E\u5230\u6307\u5B9A\u5185\u5BB9",this.container.querySelector(".lp-time").innerText=`${x}s`)}catch(w){this.container&&(this.container.querySelector(".lp-content").innerHTML="\u52A0\u8F7D\u5931\u8D25: "+w.message)}}hidePreview(){this.container&&(this.container.classList.add("lp-hidden"),this.container.classList.remove("lp-visible"),setTimeout(()=>{this.container&&this.container.classList.contains("lp-hidden")&&(this.container.style.display="none")},200))}clearTimers(){clearTimeout(this.timer),clearTimeout(this.hideTimer)}};typeof d<"u"&&d.exports?d.exports=a:window.LinkPreview=a;window.linkPreview=new a({selector:'a[href^="/posts/"], .article-title a, .post-item a',previewSelector:".post-content",customCss:{article:"width:100% !important; max-width:100% !important; padding:0; margin:0;",".breadcrumb-container":"width:100% !important; top:0 !important; position:relative !important;",".post-content":"padding-top:0 !important; margin-top:0 !important;","header, nav, .header, .navbar":"position:relative !important; top:0 !important; z-index:1 !important;"},hideSelector:"header, footer, aside, .post-meta, .post-tags, .share-buttons, .related-posts, .comments, .breadcrumb",delay:400,hideDelay:300,width:420,height:380})});S();})();
