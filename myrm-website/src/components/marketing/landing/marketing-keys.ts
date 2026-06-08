/**
 * [INPUT]
 * - locales/zh.json, locales/en.json marketing namespace（由 validate 脚本校验）
 *
 * [OUTPUT]
 * - BENTO_KEYS, COMPARE_ROW_KEYS, DEPTH_GROUPS, depthItemBasePath
 * - PRICING_PAGE_PLAN_KEYS, PRICING_PREVIEW_PLAN_KEYS, HIGHLIGHT_PRICING_PLAN
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
  'dynamicWorkflow',
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
  'outputSanitization',
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
  'antiBlockingTitle',
  'appshotFlowPad',
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
    'dynamicWorkflow',
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
    'antiBlockingTitle',
  ],
  platform: ['gui', 'desktopApp', 'smartDesktopDistribution', 'appshotFlowPad', 'configRuntime', 'codeGraph'],
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
      { source: 'extendedHighlights', itemKey: 'multiAgentOrchestration' },
      { source: 'extendedHighlights', itemKey: 'dynamicWorkflow' },
      { source: 'extendedHighlights', itemKey: 'longReportToc' },
      { source: 'highlights', itemKey: 'ptc' },
      { source: 'highlights', itemKey: 'codexParity' },
      { source: 'highlights', itemKey: 'kanbanCollaboration' },
      { source: 'extendedHighlights', itemKey: 'globalReviewer' },
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
      { source: 'extendedHighlights', itemKey: 'antiBlockingTitle' },
      { source: 'extendedHighlights', itemKey: 'resourceThrottling' },
      { source: 'extendedHighlights', itemKey: 'airGappedMode' },
    ],
  },
  {
    id: 'migration',
    defaultOpen: false,
    items: [
      { source: 'highlights', itemKey: 'cjkMigration' },
      { source: 'extendedHighlights', itemKey: 'weSightMigration' },
      { source: 'highlights', itemKey: 'smartDesktopDistribution' },
      { source: 'highlights', itemKey: 'appshotFlowPad' },
      { source: 'extendedHighlights', itemKey: 'multiAgentWorkspace' },
      { source: 'extendedHighlights', itemKey: 'remoteGateway' },
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

/** Landing preview cards — subset of pricingPage plans (excludes Max). */
export const PRICING_PREVIEW_PLAN_KEYS = ['free', 'companion', 'pro'] as const;

export type PricingPreviewPlanKey = (typeof PRICING_PREVIEW_PLAN_KEYS)[number];

export const HIGHLIGHT_PRICING_PLAN: PricingPagePlanKey = 'pro';
