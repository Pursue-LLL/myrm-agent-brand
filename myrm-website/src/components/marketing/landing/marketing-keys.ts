/**
 * [INPUT]
 * - locales/zh.json, locales/en.json marketing namespace（由 validate 脚本校验）
 *
 * [OUTPUT]
 * - BENTO_KEYS, COMPARE_ROW_KEYS, HIGHLIGHT_SLIDE_KEYS, USE_CASE_KEYS, FAQ_ITEM_KEYS, highlightSlideBasePath
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

/** Marketing carousel slides — narrative highlights (not Bento taxonomy). */
export const HIGHLIGHT_SLIDE_KEYS = [
  'aiWorkstation',
  'agentSandbox',
  'memoryKnowsYou',
  'memoryPoisonGuard',
  'deepResearch',
  'desktopComputerUse',
  'multiAgent',
  'omniChannel',
  'tokenSmart',
] as const;

export type HighlightSlideKey = (typeof HIGHLIGHT_SLIDE_KEYS)[number];

export const COMPARE_ROW_KEYS = [
  'memory',
  'knowledgeGraph',
  'wikiKnowledgeBase',
  'smartForgetting',
  'incognitoMode',
  'privacySafeShare',
  'cascadeDeletion',
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
  'toolProfileSsot',
  'unifiedToolGateway',
  'computerUse',
  'browserEngine',
  'multimodalGeneration',
  'webFetch',
  'tunnel',
  'mobileRemote',
  'agentTemplates',
  'companion',
  'multiModelConsensus',
  'fileEditSafety',
  'ptcEngine',
  'cjkMigration',
  'workspaceRulesCompat',
  'configRuntime',
  'cacheObservability',
  'shellCompression',
  'toolOutputIntelligence',
  'pixelDiff',
  'toolSecurity',
  'credentialVault',
  'visionFusion',
  'codeGraph',
  'searchIntelligence',
  'smartDesktopDistribution',
  'antiBlockingTitle',
  'steerToken',
  'threeDGraph',
  'chatOpsIM',
  'serverless',
  'datasetsExport',
  'agentSkills',
  'appshotFlowPad',
  'crossPlatformHandoff',
  'configSync',
  'taskResilience',
  'kanbanUI',
  'kanbanConcurrentQueue',
  'projectMilestone',
  'modelArenaRanking',
  'dynamicArtifacts',
  'officialDocuments',
  'localIotBridge',
  'longTaskOrchestration',
  'harnessUpgradeContract',
  'benchmarkProfile',
  'gitPrPipeline',
  'securePushCredential',
  'autoCommitIdentity',
  'webhookSelfService',
  'worktreeIsolation',
] as const;

export type CompareRowKey = (typeof COMPARE_ROW_KEYS)[number];

export const COMPARE_TAB_KEYS = ['all', 'coding', 'memory', 'security', 'automation', 'reliability', 'platform'] as const;

export type CompareTabKey = (typeof COMPARE_TAB_KEYS)[number];

/** Rows shown per compare-table tab (`all` = every row). */
export const COMPARE_TAB_ROWS: Record<CompareTabKey, readonly CompareRowKey[]> = {
  all: COMPARE_ROW_KEYS,
  coding: [
    'gitPrPipeline',
    'securePushCredential',
    'autoCommitIdentity',
    'webhookSelfService',
    'worktreeIsolation',
  ],
  memory: [
    'memory',
    'knowledgeGraph',
    'wikiKnowledgeBase',
    'smartForgetting',
    'incognitoMode',
    'companion',
    'cjkMigration',
    'workspaceRulesCompat',
    'searchIntelligence',
    'agentTemplates',
  ],
  security: ['sandbox', 'securityLayers', 'toolSecurity', 'credentialVault', 'fileEditSafety', 'privacySafeShare', 'cascadeDeletion', 'toolIntegration', 'toolProfileSsot', 'unifiedToolGateway'],
  automation: [
    'subAgent',
    'kanbanUI',
    'kanbanConcurrentQueue',
    'projectMilestone',
    'dynamicWorkflow',
    'dynamicDiscovery',
    'multiChannel',
    'voiceInteraction',
    'computerUse',
    'browserEngine',
    'multimodalGeneration',
    'webFetch',
    'tunnel',
    'mobileRemote',
    'cron',
    'goalMode',
    'skillEvolution',
    'pixelDiff',
    'visionFusion',
    'longTaskOrchestration',
    'dynamicArtifacts',
    'officialDocuments',
  ],
  reliability: [
    'tokenEfficiency',
    'costRouting',
    'modelArenaRanking',
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
    'toolOutputIntelligence',
    'antiBlockingTitle',
    'datasetsExport',
    'agentSkills',
    'benchmarkProfile',
  ],
  platform: ['gui', 'chatHistoryManagement', 'desktopApp', 'smartDesktopDistribution', 'appshotFlowPad', 'configRuntime', 'harnessUpgradeContract', 'codeGraph', 'crossPlatformHandoff', 'configSync', 'taskResilience', 'localIotBridge', 'steerToken', 'threeDGraph', 'chatOpsIM', 'serverless'],
};

export function highlightSlideBasePath(slideKey: HighlightSlideKey): string {
  return `highlightsCarousel.slides.${slideKey}`;
}

/** Compare table row fields required in both locales. */
export const COMPARE_ROW_FIELDS = ['feature', 'hermes', 'openclaw', 'myrmAgent'] as const;

export const USE_CASE_KEYS = ['research', 'coding', 'automation', 'content'] as const;

export type UseCaseKey = (typeof USE_CASE_KEYS)[number];

export const FAQ_ITEM_KEYS = ['what', 'pronounce', 'local', 'data'] as const;

export type FaqItemKey = (typeof FAQ_ITEM_KEYS)[number];
