# MCP Integration: Plug Any Tool Into Your Agent

The Model Context Protocol (MCP) is the industry standard for connecting AI agents to external tools — databases, CRMs, ticketing systems, cloud platforms, and thousands of community servers. Myrm Agent treats MCP as a first-class citizen: configure once, and every agent can reach your tools with enterprise-grade reliability and security.

## Why Myrm's MCP Is Different

| Capability | Myrm Agent | Typical competitors |
|---|---|---|
| **Connection reuse** | Persistent warm session — one connection, reused for life, auto-healing reconnect | Reconnect per call; high latency, cold starts, flaky failures |
| **Protocol generation** | Native MCP SDK 2.0 (stateless HTTP, cloud load-balancer friendly, auto protocol negotiation, in-house `tool_converter`) | Mostly SDK 1.x with camelCase API drift |
| **Progressive disclosure** | Tool metadata → skill page → full doc loaded on demand; token-efficient | Full tool list dumped into every prompt |
| **Safety pipeline** | 7-layer policy chain (surface → mount → groups → approval → subagent block → MCP filter → plan confirm) + runtime prompt-injection scan | Minimal or no filtering |
| **Failure visibility** | Tool errors surface as structured `is_error` signals the model can read and retry | Failures silently become "success" text |
| **Enterprise distribution** | Org-managed MCP: IT configures once, every employee's agent auto-ready — with config type auto-heal and cloud stdio auto-filter | Static config files shipped via OS-level tooling, no live sync |

## Connect Your First MCP Server

1. Open **Settings → MCP** in the WebUI.
2. Click **Add Server** and choose the transport your server speaks:
   - **SSE / HTTP** — a remote URL (`https://...`), recommended for cloud and shared use.
   - **Stdio** — a local command (only available in Local / Desktop mode).
3. Paste any required headers (e.g., `Authorization: Bearer ...`).
4. Save. Myrm auto-detects the tools, keeps the connection warm, and the agent can call them immediately.

> Missing a `type` field in an existing config? Myrm auto-infers it from the URL (`http(s)` → SSE/HTTP) or command (→ stdio), so legacy configs from other tools migrate without manual fixes.

## Org-Managed MCP for Teams

In Enterprise or Cloud deployments, IT administrators can publish MCP servers from **Settings → Enterprise → Org MCP** (owner/admin only):

- Configure once in the admin console; the control plane pushes the config to every member's sandbox (including sleeping sandboxes — config replays when the sandbox wakes).
- Employees see the org servers read-only in their MCP settings; they cannot alter or remove them.
- The cloud sandbox **rejects local stdio servers** by design — no local-process attack surface in multi-tenant hosting.
- Optionally bind MCP access to **IdP groups** (OIDC auto-sync), so finance gets the ERP connector and engineering gets the CI/CD one — with instant revocation on offboarding.

## Diagnostics & Failure Recovery

- Every MCP call runs with dual-layer timeouts and up to 3 retries; transport errors trigger bounded backoff auto-reconnect instead of a dead tool.
- Tool-level failures are returned as structured `is_error` results, so the agent can see exactly what went wrong and retry intelligently instead of confidently reporting a wrong result.
- Huge responses (>100K chars) are spilled to the artifact vault with a summary pointer, so nothing is truncated and context stays small.
- If a server requests user confirmation (MCP Elicitation), a GUI approval card appears in the chat with a countdown — approve or reject without leaving the conversation.

## Security Notes

- MCP servers are scanned at runtime for prompt injection before every tool freeze; malicious descriptions are blocked (`MCPRuntimePostureError`).
- Each server supports tool include/exclude whitelists, host allowlists, and per-server output caps.
- OAuth token expiry triggers a hot refresh and an in-app re-authorization prompt — no silent failures.
