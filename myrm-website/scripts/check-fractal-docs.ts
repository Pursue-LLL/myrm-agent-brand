/**
 * [INPUT]
 * - myrm-agent-brand 仓内 _ARCH.md 清单与核心路由/脚本路径
 *
 * [OUTPUT]
 * - 分形文档门禁：必检 _ARCH 存在；核心文件含 [INPUT] 头注释
 *
 * [POS]
 * 品牌仓分形自文档 CI 守门。对齐 myrm-agent-server/scripts/check_fractal_docs.py 理念，轻量清单式。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BRAND_ROOT = join(import.meta.dir, '../..');

/** Module _ARCH.md paths relative to myrm-agent-brand root. */
const REQUIRED_ARCH_PATHS = [
  'ARCHITECTURE.md',
  '_ARCH.md',
  'myrm-website/_ARCH.md',
  'myrm-website/DUAL_PAGE_SYSTEM.md',
  'myrm-website/scripts/_ARCH.md',
  'myrm-website/src/app/_ARCH.md',
  'myrm-website/src/hooks/_ARCH.md',
  'myrm-website/src/i18n/_ARCH.md',
  'myrm-website/src/lib/_ARCH.md',
  'myrm-website/src/components/download/_ARCH.md',
  'myrm-website/src/components/i18n/_ARCH.md',
  'myrm-website/src/components/ui/_ARCH.md',
  'myrm-website/src/components/marketing/_ARCH.md',
  'myrm-website/src/components/marketing/cloud/_ARCH.md',
  'myrm-website/src/components/marketing/landing/_ARCH.md',
  'myrm-website/src/components/marketing/landing/colony/_ARCH.md',
  'myrm-docs/_ARCH.md',
  'myrm-docs/scripts/_ARCH.md',
  '.github/_ARCH.md',
  '.github/workflows/_ARCH.md',
] as const;

/** Core source files that must declare fractal [INPUT] headers. */
const CORE_IOP_PATHS = [
  'myrm-website/src/app/page.tsx',
  'myrm-website/src/app/layout.tsx',
  'myrm-website/src/app/cloud/page.tsx',
  'myrm-website/src/app/download/page.tsx',
  'myrm-website/src/app/not-found.tsx',
  'myrm-website/scripts/bake-desktop-release.ts',
  'myrm-website/scripts/check-fractal-docs.ts',
] as const;

const HEADER_SCAN_LINES = 20;
const INPUT_MARKER = '[INPUT]';

export function collectFractalDocViolations(): string[] {
  const errors: string[] = [];

  for (const rel of REQUIRED_ARCH_PATHS) {
    const abs = join(BRAND_ROOT, rel);
    if (!existsSync(abs)) {
      errors.push(`missing required doc: ${rel}`);
    }
  }

  for (const rel of CORE_IOP_PATHS) {
    const abs = join(BRAND_ROOT, rel);
    if (!existsSync(abs)) {
      errors.push(`missing core file for IOP check: ${rel}`);
      continue;
    }
    const head = readFileSync(abs, 'utf8')
      .split('\n')
      .slice(0, HEADER_SCAN_LINES)
      .join('\n');
    if (!head.includes(INPUT_MARKER)) {
      errors.push(`missing ${INPUT_MARKER} in first ${HEADER_SCAN_LINES} lines: ${rel}`);
    }
  }

  return errors;
}

export function assertFractalDocsCompliant(): void {
  const errors = collectFractalDocViolations();
  if (errors.length > 0) {
    throw new Error(`Fractal documentation gate failed:\n${errors.join('\n')}`);
  }
}

if (import.meta.main) {
  const errors = collectFractalDocViolations();
  if (errors.length > 0) {
    console.error('Fractal documentation gate failed:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log(`Fractal docs OK (${REQUIRED_ARCH_PATHS.length} arch paths, ${CORE_IOP_PATHS.length} IOP files)`);
}
