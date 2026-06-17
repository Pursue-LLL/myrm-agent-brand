# GitHub Actions（营销站发布）

| 文件 | 职责 |
|------|------|
| `website-release.yml` | `website-v*` tag push（仅此触发）→ preflight → **assert origin/main == tag commit** → POST `CF_PAGES_DEPLOY_HOOK` → post-deploy curl smoke |

Secrets：`CF_PAGES_DEPLOY_HOOK`（必填）；`GITHUB_TOKEN`（内置，供 bake GitHub API 限额）。

本地应急：`bun run release:website`（preflight + push tag，Hook 仅由 GHA 触发）。禁止 `workflow_dispatch`、`wrangler pages deploy`、Vercel、本地 POST Hook。
