# Cost Management: Every Token Counted Exactly Once

Myrm Agent tracks LLM usage and cost down to the message level, so the totals you see on any dashboard — a chat's `total calls / tokens / USD`, the usage radar, daily reports, or budget summaries — are always the true bill. No lag, no loss, no inflation.

## Why Myrm's Usage Accounting Is Exact

| Capability | Myrm Agent | Typical competitors |
|---|---|---|
| **Source of truth** | Message-level SSOT — `Chat.total_calls/total_tokens/total_usd` aggregated solely from each message's `tokenEconomics` snapshot | Session-end snapshot; mid-session totals lag behind, crash loses the whole session |
| **No loss (last message never dropped)** | In-process cache carries `last_message_id` validation — a stale cache auto-recomputes, so the latest message is always counted | TTL caches silently reuse stale aggregates and permanently miss the final message |
| **No inflation (mutations recompute)** | Six mutation points (retry / undo / truncate / rewind / regenerate / switch sibling) re-aggregate after commit — deactivated message cost is removed immediately | Totals stay inflated after message deletion or branch switches |
| **Crash self-healing** | The auto-continue recovery path persists the `tokenEconomics` snapshot it collects from the stream — a rerun turn's cost is re-recorded after a crash | Crashes permanently drop that session's usage |
| **Verified end-to-end** | Real-LLM E2E: two consecutive turns in one chat produce `total_*` exactly equal to the sum of both snapshots (no mocks) | — |

## What This Means in Practice

- **Long sessions stay live.** During a multi-hour task, the chat totals and usage dashboard reflect every new turn in real time — no waiting for a session to close.
- **Undo and branch switches correct the bill.** Retry, undo, truncate, rewind, regenerate, and sibling switching all re-aggregate after the change, so discarded work never leaks into your totals.
- **A crash never erases spend.** If the process dies mid-task, the auto-continue path re-records the rerun turn's cost. The numbers you see are complete, even after restarts.

## Where to See It

- **Chat details / export**: each chat's `usageSummary` (`totalCalls`, `totalTokens`, `totalUsd`) is the message-level aggregate.
- **Usage radar & statistics** (`/statistics/usage/radar` and friends): built on the same exact totals.
- **Budget dashboards**: budget enforcement reads from the same precise accounting, so warnings match real spend.

## Full-Element Runtime Cost Meter: Free Search Quota & Browser Compute

Beyond direct LLM token costs, long-horizon autonomous tasks frequently draw from third-party search API free tiers and local/cloud browser automation infrastructure. Myrm Agent provides end-to-end transparent watermarks and defense guards:

### 1. Search Quota Reservoir
- **Official Baselines & Level Tracking**: Built-in monthly baselines for major providers (Tavily: 1,000 req/mo, Brave: 2,000 req/mo), visualized in Settings with dual progress meters.
- **429 Self-Healing Re-anchor**: When a third-party 429 quota-exceeded error occurs, Myrm automatically recalibrates the local ledger to 100% depleted and seamlessly fails over to backup providers via the Priority Chain without crashing the user's task.
- **Graduated Alerts & Unmetered Exemptions**: Clear warnings at 80% and 95% capacity; self-hosted search engines (e.g. SearXNG) are automatically exempted as unmetered dedicated lines.

### 2. Browser Automation Compute & Network Meter
- **Second-Precision Duration & Bandwidth**: Non-intrusive CDP telemetry captures active compute seconds and transferred network megabytes (MB) across all browser automation tool calls.
- **3-Minute Anti-Runaway Watchdog**: Automatic 180s hard timeout fuses prevent hung JavaScript loops and zombie browser processes from exhausting host CPU and memory.
- **Full-Element Accounting**: Delivers 100% white-box operational observability for developers and enterprise teams running 24/7 background agent workflows.


## Aggregated Gateway Spend Observability: Vercel AI Gateway

For developers and organizations routing multiple models through aggregation gateways like Vercel AI Gateway:
- **Zero-Config First-Class Preset**: Native `vercel_ai_gateway` provider preset in WebUI with preconfigured endpoint (`https://ai-gateway.vercel.sh/v1`).
- **Vendor Prefix Anti-Hijacking**: Automatically isolates multi-vendor identifiers (e.g., `anthropic/claude-3-5-sonnet`) with standard OpenAI routing wrappers to prevent SDK misrouting.
- **Native Attribution Headers**: Transparently injects `HTTP-Referer: https://myrm.ai` and `X-Title: Myrm Agent` headers on all outgoing requests, giving you message-level spend auditing and analytics directly on your Vercel Dashboard.

## Resilient Provider Policy Failover & Honest Guidance

When using commercial frontier subscriptions or direct BYOK providers, upstream policy updates can occasionally block requests (e.g., policy blocks, unexpected subscription revocations):
- **Universal Policy Classification**: The core agent execution engine directly classifies `PROVIDER_POLICY_BLOCKED` and authentication failures into non-fatal, recoverable states.
- **Automatic Fallback LLM Cascade**: Without crashing running tasks or creating recursive retry loops, the runtime seamlessly rebuilds the agent session onto configured fallback models.
- **Honest Actionable Next Steps**: In the UI, users are immediately provided with localized, direct navigation paths (`/settings/models` or `/settings/credentials`) to rectify credentials without guessing error codes.

