---
title: The toolbox: one door to every tool
summary: Hundreds of tools cannot all sit in a prompt. A catalog that holds the logins, shows tools on demand and lets the model write code against it.
verdict: One door that holds every login, a typed catalog the model searches, and code instead of one tool call per turn. The agent never holds a secret.
date: 2026-07-13
---

A model that can only talk is not an agent. Reaching the world means tools, and the more of them you connect, the worse it gets: definitions fill the prompt and the model picks badly. The toolbox is my answer, built second, right after memory.

<div class="stats">
<div><b>0</b><span>secrets the agent or its sandbox ever holds</span></div>
<div><b>1</b><span>door: search, call, and a catalog behind it</span></div>
<div><b>3</b><span>detail levels the catalog serves: name, summary, full</span></div>
<div><b>98.7%</b><span>tokens saved by Anthropic's code-over-tools example</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">The toolbox sits between the agent and every service <small>The agent searches, picks, and calls. The toolbox attaches the login. The dots are a search and then a call.</small></div>
<svg viewBox="0 0 760 330" role="img" aria-label="The agent searches and calls through one toolbox, which holds the catalog, the logins and an audit trail, and reaches mail, calendar, maps, files and a cluster.">
<path class="de" pathLength="1" style="--d:.7s;--k:#4338ca" d="M150 138 H270"/>
<path class="de" pathLength="1" style="--d:.8s;--k:#4338ca" d="M270 182 H150"/>
<path class="de" pathLength="1" style="--d:1s;--k:#4338ca" d="M490 70 C540 70 540 62 600 62"/>
<path class="de" pathLength="1" style="--d:1.05s;--k:#4338ca" d="M490 120 C540 120 540 112 600 112"/>
<path class="de" pathLength="1" style="--d:1.1s;--k:#4338ca" d="M490 165 H600"/>
<path class="de" pathLength="1" style="--d:1.15s;--k:#4338ca" d="M490 210 C540 210 540 212 600 212"/>
<path class="de" pathLength="1" style="--d:1.2s;--k:#4338ca" d="M490 258 C540 258 540 262 600 262"/>
<g class="dn solid" style="--d:.1s"><rect x="20" y="110" width="130" height="100" rx="14"/><text x="85" y="156" text-anchor="middle" style="font-size:16px">Agent</text><text class="sub" x="85" y="176" text-anchor="middle" style="fill:#d8d4e4">asks, never holds keys</text></g>
<g class="dn tint" style="--d:.3s;--k:#4338ca"><rect x="270" y="40" width="220" height="250" rx="16"/><text class="tag" x="286" y="62" style="--k:#4338ca">Toolbox</text></g>
<g class="dn" style="--d:.6s;--k:#4338ca"><rect x="288" y="78" width="184" height="58" rx="10"/><text x="380" y="102" text-anchor="middle">Catalog</text><text class="sub" x="380" y="120" text-anchor="middle">typed · searchable · hints</text></g>
<g class="dn" style="--d:.7s;--k:#be185d"><rect x="288" y="148" width="184" height="58" rx="10" style="stroke:#be185d"/><text x="380" y="172" text-anchor="middle">Logins</text><text class="sub" x="380" y="190" text-anchor="middle">OAuth and tokens live here</text></g>
<g class="dn" style="--d:.8s;--k:#6b6677"><rect x="288" y="218" width="184" height="58" rx="10"/><text x="380" y="242" text-anchor="middle">Audit</text><text class="sub" x="380" y="260" text-anchor="middle">every call recorded</text></g>
<g class="dn tint" style="--d:1s;--k:#4338ca"><rect x="600" y="45" width="140" height="34" rx="9"/><text x="670" y="67" text-anchor="middle" style="font-size:12.5px">Mail</text></g>
<g class="dn tint" style="--d:1.05s;--k:#4338ca"><rect x="600" y="95" width="140" height="34" rx="9"/><text x="670" y="117" text-anchor="middle" style="font-size:12.5px">Calendar</text></g>
<g class="dn tint" style="--d:1.1s;--k:#4338ca"><rect x="600" y="148" width="140" height="34" rx="9"/><text x="670" y="170" text-anchor="middle" style="font-size:12.5px">Maps</text></g>
<g class="dn tint" style="--d:1.15s;--k:#4338ca"><rect x="600" y="195" width="140" height="34" rx="9"/><text x="670" y="217" text-anchor="middle" style="font-size:12.5px">Files</text></g>
<g class="dn tint" style="--d:1.2s;--k:#4338ca"><rect x="600" y="245" width="140" height="34" rx="9"/><text x="670" y="267" text-anchor="middle" style="font-size:12.5px">Cluster</text></g>
<text class="sub dl" style="--d:1.3s" x="210" y="128" text-anchor="middle">search</text>
<text class="sub dl" style="--d:1.3s" x="210" y="200" text-anchor="middle">call</text>
<circle class="pk" r="5" style="--k:#4338ca"><animateMotion dur="3.6s" begin="0s" repeatCount="indefinite" path="M150 138 H270 L380 107"/></circle>
<circle class="pk" r="5" style="--k:#be185d"><animateMotion dur="3.6s" begin="-1.8s" repeatCount="indefinite" path="M270 182 L380 177 L490 165 H600"/></circle>
</svg>
</div>

The rule underneath is the one I trust most: **the agent asks, the toolbox holds the keys.** Credentials, OAuth tokens and per-service headers live in the toolbox and are attached when it calls a service. The agent, and the sandbox its code runs in, never see one.

## The journey

<ol class="timeline">
<li><time>Jul 13</time><b>A searchable registry.</b> Each service described by a manifest, every tool stored with an embedding so the agent finds one by meaning.</li>
<li><time>Jul 28</time><b>Skills joined it.</b> Procedures are stored and searched the same way as tools.</li>
<li><time>Aug 3</time><b>OAuth upgrade.</b> Connections sign in once and refresh, so a login belongs to the toolbox and not to an agent.</li>
<li><time>Oct</time><b>More connections.</b> Mail, search and others, each with its own sign-in. A tool named in a query is always returned first.</li>
<li><time>Nov 13</time><b>A cleaner idea.</b> The toolbox is the agent's device: find a capability, use it, let the device hold the sign-in.</li>
<li><time>Nov 14</time><b>Built and removed in a day.</b> A second door for code to call tools directly, with signed tokens. Removed because the executor has no network at all.</li>
<li class="end"><time>Nov 15–16</time><b>New connections and usage.</b> A cluster connection, a browser connection, and a record of every proxied call.</li>
</ol>

## Decisions that held

| Decision | Why |
|---|---|
| A catalog, not a dispatcher | Every operation is a real typed entry with its own schema and hints (read-only, destructive, open-world). Nothing hides behind a generic call |
| The model writes code against the catalog | One model turn per call is slow. A short program loops, filters and joins, and returns only what it needs |
| The toolbox owns credentials | The agent and its sandbox never hold a secret, so a leaked prompt or program cannot leak one |
| Search belongs to the harness | The toolbox serves the catalog at three detail levels. The harness decides what the model is shown |
| A tool's definition is hashed | What the agent sees cannot change silently. The hash exists today; holding a changed tool until I approve it is not built yet |

## What already exists

The idea that tools should not all sit in a prompt is now widely shared. Four approaches, and where mine fits:

| Approach | What it solves | What it leaves |
|---|---|---|
| MCP servers | A standard way to expose tools | You still need to find, secure and combine many of them |
| Gateways and registries ([ContextForge](https://github.com/IBM/mcp-context-forge), [Docker](https://github.com/docker/mcp-gateway), [Microsoft](https://github.com/microsoft/mcp-gateway), [Agentic Community registry](https://github.com/agentic-community/mcp-gateway-registry)) | Aggregate many servers behind one endpoint, with auth and governance | Mostly about routing and control, not about what the model sees |
| Tool search | Loads tool definitions on demand | Intermediate results still pass through the model |
| Code mode ([Cloudflare](https://blog.cloudflare.com/code-mode/), Sep 2025; [Anthropic](https://www.anthropic.com/engineering/code-execution-with-mcp), Nov 2025) | The model writes code against a typed API, so intermediate data stays out of its context | Needs a sandbox to run the code |
| Mine | A catalog with detail levels, logins held in one place, code run in a sandbox with no network | Code mode is built but not yet evaluated on real requests |

<div class="chart">
<div class="cap">Why code beats calling tools one by one <small>Anthropic's own example workflow, tokens used, from their post</small></div>
<div class="row"><span class="k">All definitions up front</span><span class="bar a5"><i style="--w:100%"></i></span><span class="v">150,000</span></div>
<div class="row"><span class="k">Load on demand, code</span><span class="bar a3"><i style="--w:1.4%"></i></span><span class="v">2,000</span></div>
<div class="legend"><span>An example from their post, not a measurement of mine</span></div>
</div>

The research behind it is consistent: the [CodeAct paper](https://arxiv.org/abs/2402.01030) reports up to 20% higher success and 30% fewer actions when a model acts by writing code. I have not reproduced that on my own workload.

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory (post 2) | Built, traceable, no evaluation yet | <span class="pill warn">built, unproven</span> |
| Catalog, search and logins | Running, with usage and audit | <span class="pill good">stable</span> |
| Code against the catalog | Built behind a switch, not evaluated on real requests | <span class="pill bad">unproven</span> |
| A second door for code | Built and removed in one day | <span class="pill warn">deleted</span> |
| Holding a changed tool definition for approval | Hashing is built, the hold is not | <span class="pill">later</span> |

**Verdict: the door and the key-holding are right; the code idea is still a bet.** Keeping secrets out of the agent has held up under every redesign. The claim that code beats one-call-per-turn rests on other people's results until I measure it on my own requests. Next: the harness, the loop that decides when to call any of this.
