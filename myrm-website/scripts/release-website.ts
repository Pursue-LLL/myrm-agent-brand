/**
 * [INPUT]
 * - git origin/main (POS: 发布源分支)
 *
 * [OUTPUT]
 * - release-website CLI: preflight → git tag + push tag（由 GHA POST Deploy Hook）
 * - normalizeWebsiteTag, resolveTagReleaseAction, assertWorkingTreeClean, mapTagRevParseExitCode, parseCliArgs
 *
 * [POS]
 * 营销站本地应急发布：本地 preflight 后 push `website-v*` tag，由 GHA `website-release.yml` POST CF Deploy Hook。
 * 禁止本地直接 POST Hook、wrangler CLI 上传、Vercel、GHA workflow_dispatch。
 *
 * Prerequisites (CF Dashboard):
 * - Branch control: automatic production + preview deployments disabled
 * - Deploy hook `website-release` on branch `main`（仅 GHA Secret `CF_PAGES_DEPLOY_HOOK` 使用）
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEBSITE_TAG_PATTERN = /^website-v[\d]+(?:\.[\d]+)*(?:[-+][\w.-]+)?$/;

const websiteDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function resolveRepoRoot(): string {
  return execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
    cwd: websiteDir,
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

const repoRoot = resolveRepoRoot();

export function parseCliArgs(argv: string[]): { tag: string | undefined; dryRun: boolean } {
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  return {
    tag: positional[0],
    dryRun: argv.includes('--dry-run') || process.env.RELEASE_WEBSITE_DRY_RUN === '1',
  };
}

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

export function assertWorkingTreeClean(porcelain: string): void {
  if (porcelain.trim()) {
    throw new Error(
      'Working tree is not clean (uncommitted or untracked changes). Commit or stash before release.',
    );
  }
}

function shortSha(commit: string): string {
  return commit.slice(0, 7);
}

export function mapTagRevParseExitCode(exitCode: number | undefined): 'missing' | 'rethrow' {
  if (exitCode === 128) {
    return 'missing';
  }
  return 'rethrow';
}

function usage(): never {
  console.error(
    [
      'Usage: bun run release:website -- website-v1.2.0 [--dry-run]',
      '',
      'Preflight (clean tree, sync main, tag check, build, test) → git tag → push tag.',
      'Tag push triggers GHA website-release.yml → POST CF Deploy Hook (secret only in GitHub).',
      'Use --dry-run to validate preflight without tag push.',
    ].join('\n'),
  );
  process.exit(1);
}

function runInWebsite(command: string): void {
  execSync(command, { stdio: 'inherit', cwd: websiteDir });
}

function gitRun(command: string): string {
  return execSync(command, {
    encoding: 'utf8',
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function gitRunInherit(command: string): void {
  execSync(command, { stdio: 'inherit', cwd: repoRoot });
}

function ensureCleanWorkingTree(): void {
  assertWorkingTreeClean(gitRun('git status --porcelain'));
}

function resolveTagCommit(tag: string): string | null {
  try {
    return execSync(`git rev-parse --verify "refs/tags/${tag}^{commit}"`, {
      encoding: 'utf8',
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (error: unknown) {
    const exitCode =
      typeof error === 'object' && error !== null && 'status' in error
        ? (error as { status: number }).status
        : undefined;
    if (mapTagRevParseExitCode(exitCode) === 'missing') {
      return null;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`git rev-parse failed for tag ${tag}: ${message}`);
  }
}

function ensureMainSyncedWithOrigin(): void {
  const branch = gitRun('git branch --show-current');
  if (branch !== 'main') {
    throw new Error(`Release must run on main (current: ${branch})`);
  }

  gitRunInherit('git fetch origin main');

  const behind = gitRun('git rev-list --count HEAD..origin/main');
  if (behind !== '0') {
    throw new Error(
      `Local main is ${behind} commit(s) behind origin/main. Run: git pull --ff-only origin main`,
    );
  }

  const ahead = gitRun('git rev-list --count origin/main..HEAD');
  if (ahead !== '0') {
    console.info(`[release-website] Pushing ${ahead} local commit(s) on main to origin…`);
    gitRunInherit('git push origin main');
  }
}

function runReleasePreflight(): void {
  console.info('[release-website] Running build + test preflight…');
  runInWebsite('bun run build');
  runInWebsite('bun run test');
}

function deleteRemoteTagIfPresent(tag: string): void {
  try {
    execSync(`git rev-parse --verify "refs/remotes/origin/${tag}^{commit}"`, {
      encoding: 'utf8',
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    console.info(`[release-website] Deleting remote tag ${tag} to retrigger GHA…`);
    gitRunInherit(`git push origin :refs/tags/${tag}`);
  } catch {
    // remote tag absent
  }
}

function pushReleaseTag(tag: string, action: TagReleaseAction): void {
  if (action === 'create') {
    console.info(`[release-website] Creating tag ${tag}…`);
    gitRunInherit(`git tag -a "${tag}" -m "Release myrm-agent-brand ${tag}"`);
  } else {
    deleteRemoteTagIfPresent(tag);
  }

  console.info(`[release-website] Pushing tag ${tag} (triggers GHA → CF Deploy Hook)…`);
  gitRunInherit(`git push origin "${tag}"`);
}

function main(): void {
  const { tag: tagArg, dryRun } = parseCliArgs(process.argv.slice(2));
  if (!tagArg) usage();

  const tag = normalizeWebsiteTag(tagArg);

  ensureCleanWorkingTree();
  ensureMainSyncedWithOrigin();

  const headCommit = gitRun('git rev-parse HEAD');
  const tagCommit = resolveTagCommit(tag);
  const action = resolveTagReleaseAction(tagCommit, headCommit, tag);

  if (action === 'redeploy') {
    console.info(
      `[release-website] Tag ${tag} already at HEAD (${shortSha(headCommit)}); will re-push tag to retrigger GHA.`,
    );
  }

  runReleasePreflight();

  if (dryRun) {
    console.info(
      `[release-website] Dry run OK. ${tag} @ ${shortSha(headCommit)} (action=${action}). Skipping tag push.`,
    );
    return;
  }

  pushReleaseTag(tag, action);

  console.info(
    `[release-website] Done. ${tag} @ ${shortSha(headCommit)} → GHA website-release.yml → myrmagent.ai (after CF build).`,
  );
}

if (import.meta.main) {
  try {
    main();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[release-website] Failed: ${message}`);
    process.exit(1);
  }
}
