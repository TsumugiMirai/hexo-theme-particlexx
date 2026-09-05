# 从 ParticleX 迁移到 1.0

1. 保留现有主题和博客内容；在新的 `themes/particlexx` 目录安装。
2. 将 `_config.particlex.yml` 中需要保留的配置转移到 `_config.particlexx.yml`。头像、背景、菜单、签名、社交链接与 footer 命名基本保留。
3. 将个人图片从旧主题目录复制到博客的 `source/images`；主题目录应可独立升级。
4. 修改博客配置 `theme: particlexx`、`syntax_highlighter: ''`。确认 `url`、`root`、`index_generator.per_page` 正确。
5. 更新评论配置为 `comments.provider` 和 `comments.artalk` / `comments.giscus`。旧 Gitalk、Twikoo、Waline 配置不会自动启用；不要将客户端密钥复制到新配置。
6. 清理后重新生成，检查首页、文章、搜索、目录、About、分页和评论。确认无误再切换线上版本。

## 明确的行为变化

- 不支持旧版浏览器端文章密码功能。发现 `secret` 会中止构建，避免明文进入摘要和其他生成物。它不能代替服务端权限控制。
- 首页使用第一张背景图片；不再随机选择背景。需要响应式版本时使用 `src` 和 `mobile`。
- 首页默认使用纯文本自动摘要，不输出整篇正文。可以填写文章 `description` 控制摘要。
- 不再加载 Vue、整套图标字体、远程字体或 polyfill 服务；可选图标名称见 `tools/assets.mjs`。
- 图片预览仅绑定文章正文，不影响头像和友情链接；键盘 Escape 关闭。
- 数学公式没有内置浏览器端 KaTeX。需要时选择可信的 Hexo 构建时数学渲染插件，并补充相应样式。
- 支持简体中文 / 英文；其他语言暂回退英文。
- 内置 RSS / sitemap 与第三方同路径插件不要同时开启，可用 `rss.enable: false` / `sitemap.enable: false` 交给已有插件。
- `menu`、`card.iconLinks`、`card.friendLinks` 仍遵守 Hexo 配置合并规则。删除主题默认菜单项需要将默认配置一起管理。

## 发布前建议

检查中文路径、超长标题、未知代码语言、浏览器禁用脚本、慢网络、手机横竖屏。将 Node.js 22 / 24 与 Hexo 8 作为支持范围，旧版本没有兼容承诺。
