# 提交清单:让 lovemarkdown-mcp 上架并获取曝光

发布 npm 包 + 提交各目录。**预期管理(2026-10 实测)**:npm 包页和 GitHub
README 的外链均为 nofollow,官方 Registry 无 HTML 页面——传统 dofollow
反链收益基本为零。真实收益是:① AI 引擎(GEO)通过这些索引发现并引用
本工具;② 目录站搜索带来的精准开发者流量。按顺序做:

## 0. 发布 npm(所有目录的前置条件)

```bash
cd mcp-server
npm login          # 用你的 npm 账号
npm publish        # 包名 lovemarkdown-mcp 已确认未被占用(2026-10-20 查询)
```

发布后 `npx -y lovemarkdown-mcp` 即可用。npm 包页带来品牌曝光
(外链为 nofollow,见顶部预期说明)。

## 1. 官方 MCP Registry(权重最高)

- 地址:https://registry.modelcontextprotocol.io
- 方式 A(推荐):用 [mcp-publisher CLI](https://github.com/modelcontextprotocol/registry/blob/main/docs/guides/publishing/publish-server.md)
  ```bash
  npx mcp-publisher init          # 生成 server.json 骨架(仓库里已有手写版可对照)
  npx mcp-publisher login github  # GitHub OIDC 登录
  npx mcp-publisher publish       # 需要 server.json 里 name = io.github.<你的GitHub用户名>/...
  ```
  当前 server.json 用的是 `io.github.coolnico/lovemarkdown-mcp`,如果你
  的 GitHub 用户名不是 coolnico,先改掉。
- 方式 B:给 modelcontextprotocol/registry 仓库提 PR 手工登记。

## 2. modelcontextprotocol/servers 列表(GitHub PR,反链 + 曝光)

- 仓库:https://github.com/modelcontextprotocol/servers
- README 有 community servers 段;按格式提 PR 加一行:
  `- [lovemarkdown-mcp](https://github.com/coolnico/lovemarkdown) — Markdown ⇄ Word (.docx) and Markdown → LaTeX; Word equations (OMML) → LaTeX`
- PR 本身 + 合并后的 README 都是反链来源。

## 3. 第三方目录(2026-10 实测更新)

| 目录 | 状态 | 说明 |
|---|---|---|
| [mcpservers.org](https://mcpservers.org/submit) | ✅ 已免费提交(2026-10-21,审核最长2周) | GitHub 仓库链接 dofollow(实测);$39 付费档=24h审核+徽章 |
| 官方 Registry | ✅ 已发布 | 纯 API 服务、无网页;收录验证:registry.modelcontextprotocol.io/v0/servers/io.github.coolnico%2Flovemarkdown-mcp/versions |
| [Glama](https://glama.ai/mcp/servers) | ✅ 自动同步 | 从官方 Registry 抓取(10.8万 server 均如此);可用 GitHub 登录认领(Claim) |
| [mcp.so](https://mcp.so/submit?type=server) | 💰 $39 付费 | 一次性发布费:即时上线 + Verified 徽章 + 优先展示 + **dofollow 链接**(实测表单确认);免费收录与否取决于其爬虫是否抓取官方 Registry |
| [PulseMCP](https://www.pulsemcp.com) | ⏸️ 暂停收录(2026-09 公告) | 恢复后自动从官方 Registry 抓取 |
| [Smithery](https://smithery.ai) | ❌ 不适用 | 新模型只收远程 HTTP 托管 server,npm/stdio 包不再收录 |
| Cursor Directory | 可选 | 表单提交 |

提交时统一使用:
- 名称:`lovemarkdown-mcp`
- 网站:`https://lovemarkdown.com`
- 仓库:`https://github.com/coolnico/lovemarkdown`(或拆出的独立仓库)
- 描述:README 第一段

## 4. 收尾

- 目录收录后,在 lovemarkdown.com 加一页 "Use LoveMarkdown in Claude /
  MCP"(可选,形成双向链接,GEO 也有用)。
- 发布后在 Google Search Console 提交 npm 页面和收录页 URL,加速索引。

## 待手动提交

- [AgentiC Skills](https://agenticskills.io/submit?type=mcp)(139 server 小站,免费审核制,自动化被前端拦截,手动填):
  - MCP SERVER NAME: `lovemarkdown-mcp`
  - REPOSITORY OR MCP URL: `https://github.com/coolnico/markdown`
  - CATEGORY: `Productivity & PM`
  - DESCRIPTION: `MCP server for AI clients (Claude Desktop, Cursor, ...): Markdown to styled Word .docx, docx to Markdown with native Word equations (OMML) restored as LaTeX, and Markdown to compilable LaTeX. By LoveMarkdown (https://lovemarkdown.com).`
  - TAGS: `markdown, docx, word, latex`
  - Your name: `LoveMarkdown` / Email: `contact@lovemarkdown.com`
- Cursor Directory:cursor.directory/plugins/new,GitHub 登录后填:名称 `lovemarkdown-mcp`、网站 `https://lovemarkdown.com`、仓库 `https://github.com/coolnico/markdown`

## 踩坑记录(2026-10-21 首次发布实录)

- npm 上叫 `mcp-publisher` 的是个无关的第三方包,官方工具是
  modelcontextprotocol/registry Releases 里的 Go 二进制(Windows:
  `mcp-publisher_windows_amd64.tar.gz`)
- 发布官方 Registry 需要 GitHub 设备码授权,国内直连
  github.com 会超时——挂代理:`HTTPS_PROXY=http://127.0.0.1:7890`(按实际端口)
- 新账号发新包会进 npm 暂存扫描,版本几分钟到十几分钟才可见,Registry
  校验会 404,轮询等它出现再发
- Registry 要求 npm 包 package.json 里有 `"mcpName"` 字段,值与
  server.json 的 name 一致,否则 400
- server.json 的 `$schema` 必须是官方格式
  `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`,
  字段为驼形(`registryType`),站点链接字段叫 `websiteUrl`,
  description ≤ 100 字符
- 登录凭证是短效 JWT,过期就重新 `login github`(设备码流程)

## 注意

- `server.json` 的 schema 地址以 registry 文档为准(官方格式偶有更新),
  publish 报 schema 错误时按提示调整字段。
- 若日后把 mcp-server/ 拆成独立仓库,记得同步改 package.json 和
  server.json 里的 repository 字段。
