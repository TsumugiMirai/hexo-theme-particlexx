# 静态网站与 Artalk 部署

博客通过 Hexo 生成 `public/`，Web 服务器仅托管这些文件。主题代码、Node.js 构建依赖、Artalk 数据库和密钥不得放进公开目录。

## 网站

- HTML 使用 `Cache-Control: no-cache`；带指纹的 `assets`、图片使用长期缓存。
- 对 CSS、JavaScript、JSON、XML、SVG 启用 gzip。不要依赖压缩来解决原始大图片问题。
- 根路径与子目录部署都需正确填写 Hexo `url` / `root`。
- 先上传到新的 release 目录，校验后原子切换站点软链接；保留上一版本便于回退。
- 配置 HTTPS。若使用受支持的公网 IP 证书，必须配套短期证书自动续期，并放行公网 TCP 443。

## Artalk 2.10

使用官方发行版并校验 SHA256。独立系统用户运行，监听 `127.0.0.1:23366`，SQLite 文件放在可持久化的独立目录。Nginx 同源反向代理示例：

```nginx
location ^~ /comments/ {
    proxy_pass http://127.0.0.1:23366/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 1m;
}
```

Artalk 后端 `trusted_domains` 仅列出实际网站 origin，`site_default` 与主题 `comments.artalk.site` 一致。建议新评论默认进入审核、启用验证码/限流，默认关闭图片上传和未配置的邮件通知。SMTP 凭据和 `app_key` 只能保存在服务端。

精简配置时必须显式设置 `login_timeout: 259200`（秒，即 3 天）。Artalk 2.10.0 在此项缺失时可能使用 0，导致新签发的管理员令牌立即失效。部署后验证登录、待审核评论不可公开读取和删除测试评论，再检查数据库备份。

管理员通过官方 `artalk admin` 命令创建。管理登录应使用 HTTPS；若公网 HTTPS 尚未连通，通过 SSH 隧道管理，不在公开 HTTP 页面传递密码。

Artalk 默认头像、表情及插件可能依赖第三方网络；按读者网络条件配置，必要时使用自己托管的头像与表情。主题不会擅自替换第三方服务的数据地址。

## CSP

自托管 Artalk 的网站可从下列策略开始，再按实际启用的外链内容收紧或扩充：

```text
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

主题不要求 `unsafe-eval`。评论布局需要动态样式。Giscus 则需要额外允许 `https://giscus.app` 的脚本和 iframe；外部图片同样需要明确授权其来源。

## 备份与恢复

使用 SQLite 在线 backup API 获取一致的备份，不直接复制正在写入的数据库。备份配置和数据库时限制文件权限。建议保留至少 14 个每日版本，并另外复制到服务器外部；同盘备份不能应对整机或磁盘丢失。

恢复前停止 Artalk，把已验证的备份恢复到数据目录、恢复正确属主，再启动服务并检查评论。升级前保留二进制版本与数据库备份。Artalk 的 export/import 提供跨系统迁移能力，详见官方文档。
