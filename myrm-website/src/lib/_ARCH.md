# myrm-website/src/lib 模块架构

## 文件清单

| 文件 | 职责 |
|------|------|
| `deploy-mode.ts` | 外链域名：`app.myrmagent.ai`、`docs.myrmagent.ai` |
| `docs-contract.ts` | 营销站 → Mintlify 路径契约（CI 校验） |
| `deploy-paths.ts` | 部署路径 registry（SaaS / local / desktop） |
| `desktop-release.ts` | GitHub Releases `Pursue-LLL/myrm-agent` |
