/**
 * [INPUT]
 * - locales/zh.json, locales/en.json marketing namespace（由 validate 脚本校验）
 *
 * [OUTPUT]
 * - BENTO_KEYS, COMPARE_ROW_KEYS, DEPTH_GROUPS, DEPTH_ITEM_KEYS, depthItemBasePath
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

/** Engineering depth cards — 6 Bento-aligned groups × 3 proof cards each. */
export const DEPTH_ITEM_KEYS = [
  'memoryRecall',
  'knowledgeWiki',
  'skillEvolution',
  'operationConfirm',
  'credentialSafe',
  'pluginPrecheck',
  'kanbanTasks',
  'resilientRuns',
  'unattendedSafe',
  'sandboxChains',
  'leanContext',
  'costDashboard',
  'desktopBrowser',
  'multiAgentView',
  'deliverablePreview',
  'webResearch',
  'omniReach',
  'easyMigration',
] as const;

export type DepthItemKey = (typeof DEPTH_ITEM_KEYS)[number];

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
  'chatHistoryManagement',
  'desktopApp',
  'multimodel',
  'tokenEfficiency',
  'costRouting',
  'promptMode',
  'contextPipeline',
  'extremeAntiExplosion',
  'outputSanitization',
  'mcpToolCoercion',
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
    'outputSanitization',
    'mcpToolCoercion',
    'errorRecovery',
    'multimodel',
    'multiModelConsensus',
    'ptcEngine',
    'cacheObservability',
    'shellCompression',
    'antiBlockingTitle',
  ],
  platform: ['gui', 'chatHistoryManagement', 'desktopApp', 'smartDesktopDistribution', 'appshotFlowPad', 'configRuntime', 'codeGraph'],
};

export interface DepthGroupDef {
  id: BentoKey;
  defaultOpen: boolean;
  items: readonly DepthItemKey[];
}

export const DEPTH_GROUPS: readonly DepthGroupDef[] = [
  {
    id: 'selfEvolution',
    defaultOpen: true,
    items: ['memoryRecall', 'knowledgeWiki', 'skillEvolution'],
  },
  {
    id: 'security',
    defaultOpen: false,
    items: ['operationConfirm', 'credentialSafe', 'pluginPrecheck'],
  },
  {
    id: 'reliability',
    defaultOpen: false,
    items: ['kanbanTasks', 'resilientRuns', 'unattendedSafe'],
  },
  {
    id: 'costEfficiency',
    defaultOpen: false,
    items: ['sandboxChains', 'leanContext', 'costDashboard'],
  },
  {
    id: 'visualControl',
    defaultOpen: false,
    items: ['desktopBrowser', 'multiAgentView', 'deliverablePreview'],
  },
  {
    id: 'taskModes',
    defaultOpen: false,
    items: ['webResearch', 'omniReach', 'easyMigration'],
  },
] as const;

/** Compare table row fields required in both locales. */
export const COMPARE_ROW_FIELDS = ['feature', 'hermes', 'openclaw', 'myrmAgent'] as const;

export function depthItemBasePath(itemKey: DepthItemKey): string {
  return `engineeringDepth.items.${itemKey}`;
}

/** /pricing page plan cards (full feature list). */
export const PRICING_PAGE_PLAN_KEYS = ['free', 'companion', 'pro', 'max'] as const;

export type PricingPagePlanKey = (typeof PRICING_PAGE_PLAN_KEYS)[number];

/** Landing preview cards — subset of pricingPage plans (excludes Max). */
export const PRICING_PREVIEW_PLAN_KEYS = ['free', 'companion', 'pro'] as const;

export type PricingPreviewPlanKey = (typeof PRICING_PREVIEW_PLAN_KEYS)[number];

export const HIGHLIGHT_PRICING_PLAN: PricingPagePlanKey = 'pro';
