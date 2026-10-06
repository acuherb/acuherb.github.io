# 召唤神龙

《召唤神龙》是一款基于 Cocos Creator 构建的网页小游戏。点击屏幕串起珠子，让两个相同级别的珠子合成为更高级的珠子，一步步召唤神龙。

## 开始游戏

可以直接访问项目部署后的网页游玩。若要在本地运行，请在项目根目录启动一个静态 HTTP 服务器：

```bash
python3 -m http.server 8000
```

然后在浏览器中打开 <http://localhost:8000>。游戏默认使用竖屏布局，建议在手机浏览器中游玩；桌面浏览器也可以通过点击屏幕操作。

> 请通过 HTTP 服务器访问，不要直接用 `file://` 打开 `index.html`，否则浏览器可能无法正确加载游戏资源。

## 项目结构

```text
.
├── index.html              # 游戏网页入口
├── main.js                 # Cocos Creator 启动逻辑
├── cocos2d-js-min.js       # Cocos2d-JS 运行时
├── style-mobile.css        # 页面及移动端样式
├── src/settings.js         # 游戏启动配置
├── assets/
│   ├── internal/           # 引擎内部资源
│   ├── main/               # 游戏主要资源
│   └── resources/          # 通用资源
└── res/                    # 加载及分享图片
```

本仓库包含可运行的 Web 构建文件；目前没有包含原始 Cocos Creator 编辑器工程或单独的构建脚本。
