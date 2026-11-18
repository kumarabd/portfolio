---
title: The harness: a loop that survives
summary: The control loop around the model, made durable and interruptible, with almost no opinions of its own. What I kept from an existing agent, what I changed and what I deleted.
verdict: Keep the model's loop, change where it runs: durable, one active turn per conversation, interrupts as signals. Let the model steer and delete the routers, lanes and planners that tried to help.
date: 2026-08-14
---

The harness is everything between "a message arrives" and "the reply is delivered": the loop that calls the model, runs its tools, folds in new input, stops, and survives a crash on the way. I did not invent the loop. I started from an existing open-source agent and changed where it runs.

<div class="stats">
<div><b>1</b><span>active turn per conversation, by construction</span></div>
<div><b>4</b><span>helper layers deleted: classifier lanes, routing, planning, session modes</span></div>
<div><b>2</b><span>layers: a long-lived guard and a short-lived turn</span></div>
<div><b>1</b><span>unit of delegated work: the task</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">One turn, in time <small>A tool call starts, the process dies, the turn resumes where it was. A new message arrives mid-turn and is folded in at the next safe point.</small></div>
<svg viewBox="0 0 760 300" role="img" aria-label="Timeline across person, harness and tools: a message starts a turn, the model calls a tool, the process crashes and resumes without repeating the call, a second message is folded in, and the reply is delivered.">
<g class="dl" style="--d:.1s"><text class="tag" x="20" y="54" style="--k:#6b6677">Person</text><text class="tag" x="20" y="154" style="--k:#6b6677">Harness</text><text class="tag" x="20" y="254" style="--k:#6b6677">Tools</text></g>
<path class="de" pathLength="1" style="--d:.2s;--k:#6b6677;opacity:.25" d="M20 70 H740"/><path class="de" pathLength="1" style="--d:.25s;--k:#6b6677;opacity:.25" d="M20 170 H740"/><path class="de" pathLength="1" style="--d:.3s;--k:#6b6677;opacity:.25" d="M20 270 H740"/>
<path class="de" pathLength="1" style="--d:.6s;--k:#a16207" d="M120 70 V170"/>
<path class="de" pathLength="1" style="--d:.9s;--k:#4338ca" d="M290 170 V270"/>
<path class="de" pathLength="1" style="--d:1.3s;--k:#4338ca" d="M470 270 V170" />
<path class="de" pathLength="1" style="--d:1.7s;--k:#a16207" d="M530 70 V170"/>
<path class="de" pathLength="1" style="--d:2.1s;--k:#0f766e" d="M670 170 V70"/>
<g class="dn" style="--d:.5s;--k:#a16207"><circle cx="120" cy="70" r="9"/></g><text class="sub dl" style="--d:.6s" x="120" y="50" text-anchor="middle">message</text>
<g class="dn tint" style="--d:.8s;--k:#1c1a24"><rect x="145" y="152" width="90" height="36" rx="9"/><text x="190" y="175" text-anchor="middle" style="font-size:12.5px">model</text></g>
<g class="dn tint" style="--d:1s;--k:#4338ca"><rect x="245" y="252" width="90" height="36" rx="9"/><text x="290" y="275" text-anchor="middle" style="font-size:12.5px">tool call</text></g>
<g class="dn" style="--d:1.15s;--k:#be185d"><circle cx="380" cy="170" r="14"/><path d="M372 162 L388 178 M388 162 L372 178" style="stroke:#be185d;stroke-width:2.5;stroke-linecap:round"/></g><circle class="ring" cx="380" cy="170" r="20" style="--k:#be185d;--d:1.5s"/><text class="sub dl" style="--d:1.2s" x="380" y="206" text-anchor="middle">process dies</text>
<g class="dn tint" style="--d:1.4s;--k:#0f766e"><rect x="410" y="152" width="120" height="36" rx="9"/><text x="470" y="175" text-anchor="middle" style="font-size:12.5px">resumes here</text></g>
<text class="sub dl" style="--d:1.5s" x="545" y="236" text-anchor="middle">finished work is not replayed</text>
<g class="dn" style="--d:1.6s;--k:#a16207"><circle cx="530" cy="70" r="9"/></g><text class="sub dl" style="--d:1.7s" x="530" y="50" text-anchor="middle">new message</text>
<g class="dn tint" style="--d:1.9s;--k:#1c1a24"><rect x="555" y="152" width="100" height="36" rx="9"/><text x="605" y="175" text-anchor="middle" style="font-size:12.5px">folded in</text></g>
<g class="dn" style="--d:2s;--k:#0f766e"><circle cx="670" cy="70" r="9" style="fill:#0f766e"/></g><text class="sub dl" style="--d:2.1s" x="670" y="50" text-anchor="middle">reply</text>
<circle class="pk" r="5" style="--k:#a16207"><animateMotion dur="5s" begin="0s" repeatCount="indefinite" path="M120 70 V170 H290 V270 M290 270 V170 H470 H670 V70"/></circle>
</svg>
</div>

## The journey

<ol class="timeline">
<li><b>Extend, don't replace.</b> Keep an existing agent's loop and tools; fix where it runs. Its loop ran inside the chat process and kept state in one local file.</li>
<li><b>Leverage, don't rebuild.</b> Stop writing file and web tools. Delegate coding to coding agents and orchestrate them.</li>
<li><b>Delete the helpers.</b> Classifier-driven lanes, routing and a planner were removed. The model decides how to handle a request.</li>
<li><b>Delete the modes.</b> A conversational skill and session-mode idea was removed outright.</li>
<li><b>One kind of delegated work.</b> Tasks replaced subagents.</li>
<li class="end"><b>An agent chooses its harness.</b> The platform can host a coding agent for an agent and translate its events, instead of copying it.</li>
</ol>

## Decisions that held

| Decision | What changed | Why |
|---|---|---|
| Keep the loop, move it out of the chat process | The loop became a durable workflow; state moved from one local file to a shared database | One process held the only copy of the conversation guard, and one file serialized every write |
| One active turn per conversation | A long-lived guard per conversation holds only a pointer to the running turn | A new message is forwarded into the running turn, or starts one, with no in-memory lock |
| Interrupt by cancelling, not abandoning | In-flight work is asked to stop and clean up | Abandoned work keeps running unseen. The cost is honest: interrupt latency is bounded, not instant |
| The model steers, code only guards | A handful of rails: approvals, spend, context size, recall | A router or planner decides worse than the model reading the request |
| A failed tool is an observation | The error goes back to the model | The model can reason about a failure like any other result |
| Tasks, not subagents | Delegated work has a durable record, can be cancelled and reports back | "Needs this result first" is a dependency between tasks, not an inline wait |
| Host a harness, don't copy it | A coding agent runs in a sandbox and its events are translated | A dedicated coding agent is better at coding than anything I would write |

## What already exists

| Option | What it gives | What it leaves |
|---|---|---|
| Agent frameworks ([LangGraph](https://www.langchain.com/langgraph), [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)) | A way to express the loop and its branches. LangGraph checkpoints between steps | Crash recovery is lighter than full replay, or comes from a runtime you add |
| Durable runtimes ([Temporal](https://temporal.io), [Restate](https://restate.dev), [Inngest](https://www.inngest.com), [DBOS](https://www.dbos.dev)) | Resume after a crash, retries, long waits | They run work, they do not know what an agent is |
| The agent I started from ([Hermes Agent](https://github.com/NousResearch/hermes-agent)) | A good loop and tools, gateways to many chat platforms | Its loop runs in the chat process and its state is one SQLite file |
| Mine | A durable loop with a conversation guard, interrupts and tasks | A thin layer I maintain myself |

Most comparisons I found are written by the vendors, so I leaned on the design problem and not on their rankings: single-service agents are often fine on a framework's checkpointer, and a durable runtime pays for itself when you need long waits, interruption and recovery across services.

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory ([post 2](/blog/wtf-is-agent/memory)) | Built, traceable; two memory journeys pass | <span class="pill warn">thin</span> |
| Tools ([post 3](/blog/wtf-is-agent/the-toolbox)) | Running; journey suite measures discovery, chaining and failure | <span class="pill good">measured</span> |
| Loop, durability, interrupts | Running through every later change | <span class="pill good">stable</span> |
| Failure handling | A tool that fails once is retried; one that stays down is disclosed | <span class="pill good">checked</span> |
| Router, lanes, planner | Removed. A classifier now only suggests a label the model may ignore | <span class="pill warn">deleted</span> |
| Hosting a coding agent | Designed and partly built; the platform only translates | <span class="pill warn">new</span> |

**Verdict: the harness got smaller every time I touched it.** Each rewrite moved intelligence out of the harness and into the model, and kept the harness for the things that must be guaranteed: not losing work, not running two turns at once, not spending without limit. The journey suite now exercises the failure path: a flaky tool is retried, and a tool that stays down is disclosed rather than invented. Next: what the model actually reads on each turn.
