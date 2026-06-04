/**
 * [INPUT]
 * - locales/zh.json, locales/en.json marketing namespace（由 validate 脚本校验）
 *
 * [OUTPUT]
 * - BENTO_KEYS, COMPARE_ROW_KEYS, DEPTH_GROUPS, depthItemBasePath
 *
 * [POS]
 * 落地页 i18n 键清单唯一来源；组件与 validate-marketing-locales.ts 均引用此处。
 */

export const BENTO_KEYS = [
  'selfEvolution',
  'security',
  'reliability',
  'costEfficiency',
  'visualControl',
  'taskModes',
] as const;

export type BentoKey = (typeof BENTO_KEYS)[number];

import { COMPETITOR_COMPARISON_DOC_PATH } from '@/lib/docs-contract';

const COMPARE_PAGE = COMPETITOR_COMPARISON_DOC_PATH;

/** Per-theme anchors on the docs competitor comparison page (Mintlify slugs). */
export const BENTO_DOC_PATHS: Record<BentoKey, string> = {
  selfEvolution: `${COMPARE_PAGE}#vs-mempalace--ai-memory-system-149k-stars`,
  security: `${COMPARE_PAGE}#extreme-scenario-anti-explosion-vs-hermes--openclaw`,
  reliability: `${COMPARE_PAGE}#vs-hermes-agent-v015-velocity--multi-agent-platform`,
  costEfficiency: `${COMPARE_PAGE}#token-efficiency--context-pipeline-vs-hermes--openclaw`,
  visualControl: `${COMPARE_PAGE}#vs-360-lobsterai--consumer-agent-platform`,
  taskModes: `${COMPARE_PAGE}#web-search--web-fetch--dual-engine-vs-hermes--openclaw--claude-code`,
};

/** advantages.items keys referenced by engineering depth (not shown on 6 Bento cards). */
export function depthAdvantageItemKeys(): string[] {
  const keys = new Set<string>();
  for (const group of DEPTH_GROUPS) {
    for (const ref of group.items) {
      if (ref.source === 'advantages') {
        keys.add(ref.itemKey);
      }
    }
  }
  return [...keys];
}

export const COMPARE_ROW_KEYS = [
  'memory',
  'knowledgeGraph',
  'wikiKnowledgeBase',
  'smartForgetting',
  'incognitoMode',
  'sandbox',
  'subAgent',
  'dynamicDiscovery',
  'multiChannel',
  'voiceInteraction',
  'securityLayers',
  'goalMode',
  'skillEvolution',
  'cron',
  'gui',
  'desktopApp',
  'multimodel',
  'tokenEfficiency',
  'costRouting',
  'promptMode',
  'contextPipeline',
  'extremeAntiExplosion',
  'errorRecovery',
  'toolIntegration',
  'unifiedToolGateway',
  'computerUse',
  'browserEngine',
  'webFetch',
  'tunnel',
  'agentTemplates',
  'companion',
  'multiModelConsensus',
  'fileEditSafety',
  'ptcEngine',
  'cjkMigration',
  'configRuntime',
  'cacheObservability',
  'shellCompression',
  'pixelDiff',
  'toolSecurity',
  'credentialVault',
  'visionFusion',
  'codeGraph',
  'searchIntelligence',
  'smartDesktopDistribution',
] as const;

export type CompareRowKey = (typeof COMPARE_ROW_KEYS)[number];

export const COMPARE_TAB_KEYS = ['all', 'memory', 'security', 'automation', 'reliability', 'platform'] as const;

export type CompareTabKey = (typeof COMPARE_TAB_KEYS)[number];

/** Rows shown per compare-table tab (`all` = every row). */
export const COMPARE_TAB_ROWS: Record<CompareTabKey, readonly CompareRowKey[]> = {
  all: COMPARE_ROW_KEYS,
  memory: [
    'memory',
    'knowledgeGraph',
    'wikiKnowledgeBase',
    'smartForgetting',
    'incognitoMode',
    'companion',
    'cjkMigration',
    'searchIntelligence',
    'agentTemplates',
  ],
  security: ['sandbox', 'securityLayers', 'toolSecurity', 'credentialVault', 'fileEditSafety', 'toolIntegration', 'unifiedToolGateway'],
  automation: [
    'subAgent',
    'dynamicDiscovery',
    'multiChannel',
    'voiceInteraction',
    'computerUse',
    'browserEngine',
    'webFetch',
    'tunnel',
    'cron',
    'goalMode',
    'skillEvolution',
    'pixelDiff',
    'visionFusion',
  ],
  reliability: [
    'tokenEfficiency',
    'costRouting',
    'promptMode',
    'contextPipeline',
    'extremeAntiExplosion',
    'errorRecovery',
    'multimodel',
    'multiModelConsensus',
    'ptcEngine',
    'cacheObservability',
    'shellCompression',
  ],
  platform: ['gui', 'desktopApp', 'smartDesktopDistribution', 'configRuntime', 'codeGraph'],
};

export type DepthItemSource = 'advantages' | 'highlights' | 'extendedHighlights';

export interface DepthItemRef {
  source: DepthItemSource;
  itemKey: string;
}

export interface DepthGroupDef {
  id: string;
  defaultOpen: boolean;
  items: readonly DepthItemRef[];
}

export const DEPTH_GROUPS: readonly DepthGroupDef[] = [
  {
    id: 'compounding',
    defaultOpen: true,
    items: [
      { source: 'highlights', itemKey: 'memorySystem' },
      { source: 'highlights', itemKey: 'wiki' },
      { source: 'highlights', itemKey: 'companion' },
    ],
  },
  {
    id: 'remote',
    defaultOpen: false,
    items: [
      { source: 'extendedHighlights', itemKey: 'voiceFusion' },
      { source: 'extendedHighlights', itemKey: 'codexEngineering' },
    ],
  },
  {
    id: 'capability',
    defaultOpen: false,
    items: [
      { source: 'highlights', itemKey: 'computerUse' },
      { source: 'highlights', itemKey: 'webSearchFetch' },
      { source: 'extendedHighlights', itemKey: 'enterpriseScenarios' },
      { source: 'extendedHighlights', itemKey: 'artifactDeploy' },
      { source: 'extendedHighlights', itemKey: 'longReportToc' },
      { source: 'highlights', itemKey: 'ptc' },
      { source: 'highlights', itemKey: 'codexParity' },
      { source: 'highlights', itemKey: 'kanbanCollaboration' },
    ],
  },
  {
    id: 'reliability',
    defaultOpen: false,
    items: [
      { source: 'highlights', itemKey: 'extremeAntiExplosion' },
      { source: 'highlights', itemKey: 'modelConsensus' },
      { source: 'highlights', itemKey: 'smartConcurrency' },
      { source: 'highlights', itemKey: 'harnessObservability' },
      { source: 'extendedHighlights', itemKey: 'toolSecurity' },
      { source: 'extendedHighlights', itemKey: 'precisionMultimodal' },
      { source: 'extendedHighlights', itemKey: 'productionEngineIntegrity' },
      { source: 'extendedHighlights', itemKey: 'unifiedToolGateway' },
      { source: 'extendedHighlights', itemKey: 'enterpriseTesting' },
    ],
  },
  {
    id: 'migration',
    defaultOpen: false,
    items: [
      { source: 'highlights', itemKey: 'cjkMigration' },
      { source: 'highlights', itemKey: 'smartDesktopDistribution' }
    ],
  },
] as const;

/** Compare table row fields required in both locales. */
export const COMPARE_ROW_FIELDS = ['feature', 'hermes', 'openclaw', 'myrmAgent'] as const;

export function depthItemBasePath(source: DepthItemSource, itemKey: string): string {
  if (source === 'advantages') return `advantages.items.${itemKey}`;
  if (source === 'highlights') return `highlights.items.${itemKey}`;
  return `extendedHighlights.items.${itemKey}`;
}

/** /pricing page plan cards (full feature list). */
export const PRICING_PAGE_PLAN_KEYS = ['free', 'companion', 'pro', 'max'] as const;

export type PricingPagePlanKey = (typeof PRICING_PAGE_PLAN_KEYS)[number];

export const HIGHLIGHT_PRICING_PLAN: PricingPagePlanKey = 'pro';
