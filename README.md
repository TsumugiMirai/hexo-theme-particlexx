# ParticleXX

A Hexo theme continuing ParticleX's animated hero and card layout, with static-first rendering, responsive images, dark mode and lazy-loaded Artalk comments.

**1.0.0 · MIT · Hexo 8 · Node.js 22.12+**

## 安装

在已有 Hexo 博客目录执行：

```sh
git clone https://github.com/TsumugiMirai/hexo-theme-particlexx.git themes/particlexx
git -C themes/particlexx checkout v1.0.0
npm ci --omit=dev --prefix themes/particlexx
```

博客 `_config.yml`：

```yaml
theme: particlexx
syntax_highlighter: ''
url: https://example.com
language: zh-CN
```

将主题 `_config.yml` 复制到博客根目录，命名为 `_config.particlexx.yml` 后修改。主题仓库包含已构建资源，普通安装无需运行 Vite。保留博客的 Hexo 生成器和 Markdown 渲染器；推荐 `hexo-renderer-marked`。

```sh
npx hexo clean
npx hexo generate
```

## 功能

- 静态正文和原生导航；没有全屏加载遮罩，也不依赖整页 Vue。
- 保留 ParticleX 的动态圆形首屏、宽文章卡片和右侧个人卡片。
- 桌面/手机背景源、懒加载正文图片、资源指纹、按需搜索与评论。
- 明暗模式（默认跟随系统）、键盘导航、图片预览、减少动态效果支持。
- 构建时代码高亮、安全复制回退、文章目录与当前位置。
- 全文搜索、置顶排序、分页（支持 `per_page: 0`）、子目录部署。
- Artalk / Giscus 评论适配、独立 About / Friends 页面。
- Atom RSS、站点地图、canonical 和社交分享元数据。
- 简体中文和英文界面；导航名称可自行配置。

## 个人信息与背景

图片放到博客的 `source/images/`，个人数据不要写入主题代码。

```yaml
avatar: /images/avatar.webp
favicon: /images/favicon.webp
background:
  - src: /images/background-desktop.webp
    mobile: /images/background-mobile.webp
    width: 1920
    height: 1186
hero_lines:
  - 第一行签名
  - 第二行签名
card:
  enable: true
  description: "第一行签名\n第二行签名"
  iconLinks:
    GitHub:
      name: github
      link: https://github.com/example
  friendLinks:
    Example: https://example.com
```

`background` 也接受旧版字符串列表，1.0 使用第一张图片，确保稳定构图和及早下载；不再在浏览器随机选择大图。自定义社交图标可用 `icon: /images/custom.svg`。空背景使用主题渐变。

## Artalk

先部署独立 Artalk 服务，再填写：

```yaml
comments:
  provider: artalk
  artalk:
    server: /comments/
    site: My Blog
```

主题附带 Artalk 2.10.0 客户端，按需从自己的站点加载。后端部署、HTTPS、审核、数据库备份和邮件配置见 [部署说明](docs/deployment.md)。主题不会自动创建后端、管理员或发送邮件。

文章 / 页面 front matter：

```yaml
comments: true
comment_id: a-stable-article-id
toc: true
```

`comment_id` 应保持不变；省略时使用站点内路径。关闭某页评论用 `comments: false`。评论加载失败保留重试按钮，文章仍可阅读。Giscus 可选配置见默认配置文件；需要另外放行其 CSP 源。

## About 与友情链接

`source/about/index.md`：

```markdown
---
title: 关于我
type: about
layout: page
comments: false
---
在这里填写个人介绍。
```

`source/friends/index.md` 使用 `type: friends`。链接数据放在 `source/_data/friends.yml`：

```yaml
- name: Example
  url: https://example.com
  avatar: /images/friend.webp
  description: 简短介绍
```

在主题配置 `menu` 中加入对应链接即可。栏目首页可使用 `type: tags` / `type: categories`。站点没有文章时也会生成首页。

## 从 ParticleX 迁移

见 [迁移与兼容性](docs/migration.md)。**旧 `secret` 加密文章会阻止构建**，以避免首页、RSS、搜索等输出泄露正文；请先移出公开内容或迁移到服务端访问控制。不要仅仅删除密码字段。

## 开发与验证

```sh
npm ci
npm run check
```

TypeScript/Vite 源码在 `src/`，模板在 `layout/`，Hexo 扩展在 `scripts/`。构建后的 `source/assets/` 和 `lib/` 应随源码一并提交。`npm test` 使用真实 Hexo 临时站点验证空站、分页、子目录、全文索引、代码转义与加密内容拒绝发布。

默认主题 CSS gzip 约 7 KB、主要交互脚本 gzip 约 3 KB；这不包含用户图片和按需评论客户端，也不是整页加载时间保证。

## License / Credits

ParticleXX is an independent continuation, not an official ParticleX release. ParticleX/Particle copyrights are retained in [LICENSE](LICENSE). Redistributed third-party resources and their licenses are listed in [THIRD_PARTY.md](THIRD_PARTY.md). The example avatar is an original SVG; personal artwork and personal blog content are not included.
