/**
 * Tag-triggered production deploy for myrm-agent-brand via Cloudflare Pages Deploy Hook.
 *
 * Prerequisites (CF Dashboard, one-time):
 * - Branch control: automatic production + preview deployments disabled
 * - Deploy hook `website-release` on branch `main`
 *
 * Usage:
 *   CF_PAGES_DEPLOY_HOOK=https://api.cloudflare.com/... bun run release:website -- website-v1.2.0
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const TAG_PREFIX = 'website-v';
const hookUrl = process.env.CF_PAGES_DEPLOY_HOOK?.trim();

function usage(): never {
  console.error(
    [
      'Usage: CF_PAGES_DEPLOY_HOOK=<hook-url> bun run release:website -- website-v1.2.0',
      '',
      'Creates git tag, pushes it, then POSTs to Cloudflare Pages deploy hook.',
      'Set CF_PAGES_DEPLOY_HOOK from CF Dashboard → myrm-agent-brand → Settings → Deploy Hooks.',
    ].join('\n'),
  );
  process.exit(1);
}

function normalizeTag(raw: string): string {
  const tag = raw.trim();
  if (!tag) usage();
  if (!/^website-v[\d]+(?:\.[\d]+)*(?:[-+][\w.-]+)?$/.test(tag)) {
    console.error(`Invalid tag "${tag}". Expected format: ${TAG_PREFIX}1.2.0`);
    process.exit(1);
  }
  return tag;
}

function run(command: string): void {
  execSync(command, { stdio: 'inherit' });
}

function tagExists(tag: string): boolean {
  try {
    execSync(`git rev-parse "refs/tags/${tag}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
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
  if (!hookUrl) {
    console.error('Missing CF_PAGES_DEPLOY_HOOK environment variable.');
    usage();
  }

  const tag = normalizeTag(tagArg);

  if (tagExists(tag)) {
    console.info(`[release-website] Tag ${tag} already exists; skipping git tag create.`);
  } else {
    console.info(`[release-website] Creating tag ${tag} on HEAD…`);
    run(`git tag -a "${tag}" -m "Release myrm-agent-brand ${tag}"`);
  }

  console.info(`[release-website] Pushing tag ${tag}…`);
  run(`git push origin "${tag}"`);

  console.info('[release-website] Triggering Cloudflare Pages deploy hook…');
  await triggerDeployHook(hookUrl);

  console.info(`[release-website] Done. Tagged ${tag} → myrmagent.ai (after CF build completes).`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[release-website] Failed: ${message}`);
  process.exit(1);
});
