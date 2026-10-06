# 召唤神龙 (Dragon Merge)

一个基于 **Cocos Creator 2.x** 构建的 HTML5 合成类小游戏。玩家通过触摸/鼠标控制神龙移动，吞噬低等级生物，同类合并进化，从蝌蚪一路合成到龙。

> 当前仓库中的 `index.html` 是 **Cocos Creator 构建后的产物**，并非源码工程。如需二次开发，请在 Cocos Creator 中打开对应的源码项目。

---

## 玩法说明

- **操作**：触摸屏幕或按住鼠标拖动，控制神龙移动。
- **吞噬**：神龙可以吃掉等级低于自己的生物，获得分数并成长。
- **合成**：两只同级生物相撞会合成为更高一级的生物。
- **等级链**：蝌蚪 → 青蛙 → 乌龟 → 小金鱼 → 锦鲤 → 电鳗 → 鲨鱼 → 鲸鱼 → 蛇 → 龙。
- **失败条件**：被更高等级的生物吃掉则游戏结束。
- **目标**：不断合成，最终召唤出神龙。

---

## 技术栈

- **引擎**：Cocos Creator 2.x（构建产物为 2.x 格式）
- **语言**：JavaScript
- **渲染**：HTML5 Canvas / WebGL
- **音频**：Web Audio / HTML5 Audio
- **资源**：内嵌 base64（当前构建方式）

---

## 快速开始

### 环境要求

- 现代浏览器（Chrome / Safari / Edge / 移动端 WebView）
- 本地静态服务器（推荐，避免 `file://` 协议限制）

### 本地运行

1. 将 `index.html` 放在任意目录。
2. 启动一个本地服务器，例如：

   ```bash
   # Python 3
   python -m http.server 8080

   # 或 Node.js
   npx serve .
   ```

3. 浏览器访问 `http://localhost:8080/index.html`。

> 直接双击打开 `index.html` 也可能运行，但部分浏览器会因 `file://` 协议限制音频播放或跨域资源加载，建议使用本地服务器。

### 部署

将 `index.html` 上传至任意静态托管服务（如 Nginx、GitHub Pages、Vercel、Netlify、对象存储等）即可。注意：

- 确保服务器返回正确的 MIME 类型。
- 如果宿主平台需要广告/分享 SDK，请参考下方「外部接口依赖」进行对接。

---

## 目录结构

当前构建产物为单文件内嵌模式，所有资源（配置、图片、音频、Spine 动画）均以 base64 形式嵌入在 `index.html` 中。

```
.
└── index.html          # 游戏入口，包含全部资源与逻辑
```

Cocos Creator 标准构建通常还会生成 `assets/`、`src/` 等目录，但本产物已全部内联。如需分离资源，请在 Creator 构建面板中关闭「内联所有资源」选项。

---

## 外部接口依赖

游戏逻辑中调用了若干宿主环境提供的全局函数，部署到具体平台时需要实现或替换：

| 函数 / 变量 | 说明 |
|---|---|
| `showMyAds()` | 展示广告 |
| `adBreak(options)` | 广告中断，`options` 包含 `type`、`name`、`beforeBreak`、`afterBreak` |
| `preloader` | 预加载器对象，用于判断广告是否加载完成 |
| `noAdGoToScene()` | 无广告时跳转场景 |
| `resCompleteFlag` / `adCompleteFlag` | 资源/广告完成标记 |
| `window.location.href = o.moreGameUrl` | 跳转「更多游戏」链接 |

如果未接入对应平台，这些调用可能报错或静默失败。建议在本地测试时提供空实现，例如：

```html
<script>
  window.showMyAds = function () {};
  window.adBreak = function (opts) {
    if (opts && opts.afterBreak) opts.afterBreak();
  };
  window.preloader = null;
  window.noAdGoToScene = function () {};
  window.resCompleteFlag = true;
  window.adCompleteFlag = true;
</script>
```

---

## 配置与修改

由于 `index.html` 是压缩后的构建产物，**不建议直接修改其中的 JS**。如需调整玩法、数值、资源，请在 Cocos Creator 源码工程中进行：

- **数值平衡**：搜索 `speedNum`、`addSpeed`、`maxTypeID`、`standScore` 等字段。
- **碰撞调试**：`MainGameJS.onLoad` 中有 `cc.director.getCollisionManager().enabledDebugDraw = !0`，正式发布前应改为 `false`。
- **日志清理**：代码中存在大量 `console.log`，可在构建时通过 Creator 的「调试模式」关闭。
- **资源内嵌**：若包体过大，可在构建面板中关闭「内联所有资源」，改为分离加载。

---

## 已知问题 / TODO

- [ ] 资源全部内嵌，首屏体积较大，加载较慢。
- [ ] 碰撞调试绘制默认开启，正式包需关闭。
- [ ] 大量调试日志未清理。
- [ ] 无 sourcemap，构建产物难以调试。
- [ ] 外部广告/分享 SDK 需按平台对接。
- [ ] 建议增加真正的加载进度条（当前 splash 仅为白底图）。
- [ ] 建议将硬编码数值抽为配置表，便于平衡调整。

---

## 许可

本项目仅供学习与交流使用。如需商用，请确认所使用的美术、音频、代码资源的授权情况，并遵循原项目或素材提供方的许可协议。

---

## 致谢

- [Cocos Creator](https://www.cocos.com/creator) 提供引擎支持。
- 感谢所有开源资源与工具的作者。

---

如有问题或建议，欢迎提 Issue 或 PR。
