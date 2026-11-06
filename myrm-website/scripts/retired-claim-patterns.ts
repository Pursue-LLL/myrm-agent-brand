/**
 * [INPUT]
 * - 无运行时依赖（纯常量与校验 helper）
 *
 * [OUTPUT]
 * - RETIRED_CLAIM_PATTERNS, appendRetiredClaimViolations
 *
 * [POS]
 * 已撤回的未实测数字宣称禁止项；validate-docs-slugs.ts 与 validate-marketing-locales.ts 共用。
 */

/**
 * First-turn 86% fewer tokens, 97% cache hit and ~7x task throughput have no
 * reproducible measurement behind them. Feature names (prompt caching, layered
 * compression) stay; only these figures must not come back.
 *
 * `(?<![\d.%])` skips longer numbers such as 186% or 0.86%; the `x` form needs
 * the tilde so range wording like "2×–7×" is not flagged.
 */
export const RETIRED_CLAIM_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /(?<![\d.%])86\s*[%％]/, label: '86% fewer tokens' },
  { pattern: /(?<![\d.%])97\s*[%％]/, label: '97% cache hit or savings' },
  { pattern: /~\s*7\s*[x×]/i, label: '~7x tasks' },
  { pattern: /(?<![\d.%])7\s*[倍배]/, label: '7x tasks, zh/ja/ko wording' },
];

export function appendRetiredClaimViolations(
  content: string,
  relPath: string,
  errors: string[],
): void {
  for (const { pattern, label } of RETIRED_CLAIM_PATTERNS) {
    const match = pattern.exec(content);
    if (match) {
      const line = content.slice(0, match.index).split('\n').length;
      errors.push(
        `Retired claim (${label}) in ${relPath}:${line}; it has no reproducible measurement, drop the number`,
      );
    }
  }
}
