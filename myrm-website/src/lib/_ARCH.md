# myrm-website/src/lib 模块架构

## 文件清单

| 文件 | 职责 |
|------|------|
| `deploy-mode.ts` | 外链域名；`getAppUrl(path, locale?)` 营销→App locale 接力 |
| `docs-contract.ts` | 营销站 → Mintlify 路径契约；`localizedDocsPath()`、`DOCS_ZH_URL_PREFIX`（CI 双 locale） |
| `deploy-paths.ts` | 部署路径 registry（tauri 优先 + localWebui）；默认 `tauri`；`getLocalInstallOneliner` / `getLocalInstallOnelinerWindows` |
| `cloud-paths.ts` | SaaS App URL + UTM（`/cloud` 登录/注册/账单） |
| `cloud-marketing-nav.ts` | SaaS 页 Nav 链接 |
| `desktop-release.ts` | GitHub Releases `Pursue-LLL/myrm-agent` |
| `marketing-nav.ts` | 共享 Nav；Header ed-cta `getMarketingRegisterHref` → `/download` |
| `landing-fonts.ts` | Landing 字体 className（layout 引用） |
| `utils/classnameUtils.ts` | `cn()` Tailwind class merge |
