/**
 * [INPUT]
 * - .env.local CF_PAGES_DEPLOY_HOOK (POS: 本地 Deploy Hook secret，gitignored)
 * - git origin/main (POS: 发布源分支)
 *
 * [OUTPUT]
 * - release-website CLI: preflight → git tag + push tag + POST CF Deploy Hook
 *
 * [POS]
 * 营销站 tag 触发生产部署；Dashboard automatic deployments 关闭后唯一上线入口。
 *
 * Prerequisites (CF Dashboard):
 * - Branch control: automatic production + preview deployments disabled
 * - Deploy hook `website-release` on branch `main`
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEBSITE_TAG_PATTERN = /^website-v[\d]+(?:\.[\d]+)*(?:[-+][\w.-]+)?$/;

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnvLocal(): void {
  const envPath = path.join(rootDir, '.env.local');
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional
  }
}

loadEnvLocal();

export function normalizeWebsiteTag(raw: string): string {
  const tag = raw.trim();
  if (!tag) {
    throw new Error('Missing tag argument. Expected: website-v1.2.0');
  }
  if (!WEBSITE_TAG_PATTERN.test(tag)) {
    throw new Error(`Invalid tag "${tag}". Expected format: website-v1.2.0`);
  }
  return tag;
}

export type TagReleaseAction = 'create' | 'redeploy';

export function resolveTagReleaseAction(
  tagCommit: string | null,
  headCommit: string,
  tag: string,
): TagReleaseAction {
  if (tagCommit === null) {
    return 'create';
  }
  if (tagCommit !== headCommit) {
    throw new Error(
      `Tag ${tag} points to ${shortSha(tagCommit)} but HEAD is ${shortSha(headCommit)}. Use a new tag version.`,
    );
  }
  return 'redeploy';
}

function shortSha(commit: string): string {
  return commit.slice(0, 7);
}

function usage(): never {
  console.error(
    [
      'Usage: bun run release:website -- website-v1.2.0',
      '',
      'Preflight (clean tree, sync main, build, test) → git tag → push tag → POST CF Deploy Hook.',
      'Set CF_PAGES_DEPLOY_HOOK in myrm-website/.env.local or env.',
    ].join('\n'),
  );
  process.exit(1);
}

function runInherit(command: string): void {
  execSync(command, { stdio: 'inherit', cwd: rootDir });
}

function gitRun(command: string): string {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

function ensureCleanWorkingTree(): void {
  try {
    execSync('git diff --quiet', { stdio: 'ignore' });
    execSync('git diff --cached --quiet', { stdio: 'ignore' });
  } catch {
    throw new Error('Working tree has uncommitted changes. Commit or stash before release.');
  }
}

function resolveTagCommit(tag: string): string | null {
  try {
    return gitRun(`git rev-parse "refs/tags/${tag}^{commit}"`);
  } catch {
    return null;
  }
}

function ensureMainSyncedWithOrigin(): void {
  const branch = gitRun('git branch --show-current');
  if (branch !== 'main') {
    throw new Error(`Release must run on main (current: ${branch})`);
  }

  runInherit('git fetch origin main');

  const behind = gitRun('git rev-list --count HEAD..origin/main');
  if (behind !== '0') {
    throw new Error(
      `Local main is ${behind} commit(s) behind origin/main. Run: git pull --ff-only origin main`,
    );
  }

  const ahead = gitRun('git rev-list --count origin/main..HEAD');
  if (ahead !== '0') {
    console.info(`[release-website] Pushing ${ahead} local commit(s) on main to origin…`);
    execSync('git push origin main', { stdio: 'inherit' });
  }
}

function runReleasePreflight(): void {
  console.info('[release-website] Running build + test preflight…');
  runInherit('bun run build');
  runInherit('bun run test');
}

async function triggerDeployHook(url: string): Promise<void> {
  const response = await fetch(url, { method: 'POST' });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Deploy hook failed: ${response.status} ${response.statusText}${body ? `\n${body}` : ''}`);
  }
  console.info('[release-website] Deploy hook accepted. Check CF Pages → Deployments for build status.');
}

async function main(): Promise<void> {
  const tagArg = process.argv[2];
  if (!tagArg) usage();

  const hookUrl = process.env.CF_PAGES_DEPLOY_HOOK?.trim();
  if (!hookUrl) {
    console.error('Missing CF_PAGES_DEPLOY_HOOK (.env.local or env).');
    usage();
  }

  const tag = normalizeWebsiteTag(tagArg);

  ensureCleanWorkingTree();
  ensureMainSyncedWithOrigin();
  runReleasePreflight();

  const headCommit = gitRun('git rev-parse HEAD');
  const tagCommit = resolveTagCommit(tag);
  const action = resolveTagReleaseAction(tagCommit, headCommit, tag);

  if (action === 'redeploy') {
    console.info(`[release-website] Tag ${tag} already at HEAD; redeploy only.`);
  } else {
    console.info(`[release-website] Creating tag ${tag} on HEAD…`);
    execSync(`git tag -a "${tag}" -m "Release myrm-agent-brand ${tag}"`, { stdio: 'inherit' });
  }

  console.info(`[release-website] Pushing tag ${tag}…`);
  execSync(`git push origin "${tag}"`, { stdio: 'inherit' });

  console.info('[release-website] Triggering Cloudflare Pages deploy hook…');
  await triggerDeployHook(hookUrl);

  console.info(`[release-website] Done. Tagged ${tag} → myrmagent.ai (after CF build completes).`);
}

if (import.meta.main) {
  void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[release-website] Failed: ${message}`);
    process.exit(1);
  });
}
