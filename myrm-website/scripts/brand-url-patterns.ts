/**
 * [INPUT]
 * - 无运行时依赖（纯常量与校验 helper）
 *
 * [OUTPUT]
 * - LEGACY_URL_PATTERNS, appendLegacyUrlViolations
 *
 * [POS]
 * 品牌仓对外 URL 禁止项；validate-docs-slugs.ts 与 validate-marketing-locales.ts 共用。
 */

export const LEGACY_URL_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /\bapp\.myrm\.ai\b/, label: 'app.myrm.ai → use app.myrmagent.ai' },
  { pattern: /\bmyrm\.ai\b/, label: 'myrm.ai → use myrmagent.ai' },
  { pattern: /github\.com\/myrm-ai\/myrm\b/, label: 'github.com/myrm-ai/myrm → use Pursue-LLL/myrm-agent' },
  { pattern: /github\.com\/myrm-ai\b/, label: 'github.com/myrm-ai → use Pursue-LLL/myrm-agent' },
];

export function appendLegacyUrlViolations(
  content: string,
  relPath: string,
  errors: string[],
): void {
  for (const { pattern, label } of LEGACY_URL_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`Legacy URL (${label}) in ${relPath}`);
    }
  }
}
