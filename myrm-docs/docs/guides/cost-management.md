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
