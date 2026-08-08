# myrm-website/src/lib 模块架构

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `cloud-paths.ts` | 核心 | 云页 App 跳转（`getCloud*Href(appLocale)`，`appLocale` 为 `zh|en|ko`）+ UTM | ✅ |
| `deploy-mode.ts` | 核心 | 外链域名；`getAppUrl(path, appLocale?)` 营销→App locale 接力（`appLocale` 为 `zh|en|ko`） | ✅ |
| `docs-contract.ts` | 核心 | 营销站 → Mintlify 路径契约；`localizedDocsPath()`、`DocsLocale` en/zh/ko | ✅ |
| `deploy-paths.ts` | 核心 | 部署路径 registry（tauri + localWebui） | ✅ |
| `cloud-marketing-nav.ts` | 核心 | SaaS 页 Nav 链接 | ✅ |
| `desktop-release.ts` | 核心 | 安装包元数据 SSOT；GitHub Releases parse + bake | ✅ |
| `marketing-nav.ts` | 核心 | OSS 页 Nav DRY | ✅ |
| `landing-fonts.ts` | 辅助 | Landing 字体 className | ✅ |
| `utils/classnameUtils.ts` | 辅助 | `cn()` Tailwind class merge | — |
