---
title: The anatomy of an agent
summary: What an autonomous agent is made of, as a conceptual system design, the order I built it in, and the six rules I followed.
verdict: An agent is a model in a loop plus seven things around it. The loop, memory and toolbox are the spine; the rest is where I rebuilt the most.
date: 2026-06-03
---

I set out to build a **multi-agent system that runs on its own**. This series takes it apart one component at a time, in the order I built them, with what I tried, what I deleted and what already exists. This post is the map.

<div class="stats">
<div><b>9</b><span>components around one model</span></div>
<div><b>3</b><span>components I rebuilt from scratch: memory, waking, execution</span></div>
<div><b>6</b><span>design rules that survived every rewrite</span></div>
<div><b>Memory</b><span>the component I started with</span></div>
</div>

## What an agent is

A language model only produces text. An agent is that model in a loop where it can also act:

```python
messages = [user_request]
while True:
    reply = model(messages, tools)          # decide the next step
    if not reply.tool_calls:                # no tool asked for: done
        return reply.text
    for call in reply.tool_calls:           # the harness does the work
        messages.append(run(call))          # the result goes back in
```

Everything else in this series is what it takes to make that loop **remember, reach the world, survive failure, run safely, act unprompted and be trusted**. The picture below is the design as a concept. The posts that follow go into how each piece is actually built.

## The design

<div class="diagram">
<div class="cap">An autonomous agent, as a system <small>Click a component for its post. Knowledge comes in from the top, actions leave on the right, guardrails sit underneath. The dots are a request travelling through.</small></div>
<svg viewBox="0 0 760 440" role="img" aria-label="Conceptual design: people and triggers feed the harness; context, memory and skills inform it; it acts through tools and a runtime inside a sandbox; governance guards it, evals check it, and durable state underlies everything.">
<path class="de" pathLength="1" style="--d:.6s" d="M150 138 C200 138 200 190 250 190"/>
<path class="de" pathLength="1" style="--d:.7s;--k:#a16207" d="M150 248 C200 248 200 240 250 240"/>
<path class="de" pathLength="1" style="--d:.9s;--k:#4338ca" d="M245 76 C245 110 290 110 290 150"/>
<path class="de" pathLength="1" style="--d:1s;--k:#0f766e" d="M375 76 V150"/>
<path class="de" pathLength="1" style="--d:1.1s;--k:#4338ca" d="M505 76 C505 110 420 110 420 150"/>
<path class="de" pathLength="1" style="--d:1.3s;--k:#4338ca" d="M450 185 C520 185 520 88 600 88"/>
<path class="de" pathLength="1" style="--d:1.4s;--k:#be185d" d="M450 235 H600"/>
<path class="de" pathLength="1" style="--d:1.5s;--k:#a16207" d="M350 322 V280"/>
<path class="de dash" style="--d:1.7s;--k:#6b6677" d="M600 362 H530 V270 H450"/>
<g class="dn" style="--d:.1s"><rect x="20" y="110" width="130" height="56" rx="12"/><text x="85" y="135" text-anchor="middle">People</text><text class="sub" x="85" y="152" text-anchor="middle">web · chat · voice</text></g>
<a href="/blog/wtf-is-agent/autonomy-and-governance"><g class="dn tint" style="--d:.2s;--k:#a16207"><rect x="20" y="220" width="130" height="56" rx="12"/><text x="85" y="245" text-anchor="middle">Triggers</text><text class="sub" x="85" y="262" text-anchor="middle">schedules · events</text><text class="num" x="32" y="236">07</text></g></a>
<a href="/blog/wtf-is-agent/the-harness"><g class="dn solid" style="--d:.4s"><rect x="250" y="150" width="200" height="130" rx="16"/><text x="350" y="195" text-anchor="middle" style="font-size:17px">Harness</text><text class="sub" x="350" y="216" text-anchor="middle" style="fill:#d8d4e4">reason · act · observe</text><text class="sub" x="350" y="236" text-anchor="middle" style="fill:#d8d4e4">steers the model, stays alive</text><text class="num" x="264" y="170" style="fill:#d8d4e4">04</text></g></a>
<a href="/blog/wtf-is-agent/context-and-skills"><g class="dn tint" style="--d:.8s;--k:#4338ca"><rect x="190" y="20" width="110" height="56" rx="12"/><text x="245" y="45" text-anchor="middle">Context</text><text class="sub" x="245" y="62" text-anchor="middle">what it sees now</text><text class="num" x="200" y="36">05</text></g></a>
<a href="/blog/wtf-is-agent/memory"><g class="dn tint" style="--d:.9s;--k:#0f766e"><rect x="320" y="20" width="110" height="56" rx="12"/><text x="375" y="45" text-anchor="middle">Memory</text><text class="sub" x="375" y="62" text-anchor="middle">what it keeps</text><text class="num" x="330" y="36">02</text></g></a>
<a href="/blog/wtf-is-agent/context-and-skills"><g class="dn tint" style="--d:1s;--k:#4338ca"><rect x="450" y="20" width="110" height="56" rx="12"/><text x="505" y="45" text-anchor="middle">Skills</text><text class="sub" x="505" y="62" text-anchor="middle">how it does things</text><text class="num" x="460" y="36">05</text></g></a>
<a href="/blog/wtf-is-agent/the-toolbox"><g class="dn tint" style="--d:1.2s;--k:#4338ca"><rect x="600" y="60" width="140" height="56" rx="12"/><text x="670" y="85" text-anchor="middle">Tools</text><text class="sub" x="670" y="102" text-anchor="middle">one door to the world</text><text class="num" x="612" y="76">03</text></g></a>
<g style="--k:#be185d"><rect class="box dl" style="--d:1.3s" x="580" y="170" width="160" height="124" rx="16"/><text class="tag dl" style="--d:1.3s" x="594" y="190">Sandbox</text></g>
<a href="/blog/wtf-is-agent/runtime-and-sandbox"><g class="dn tint" style="--d:1.4s;--k:#be185d"><rect x="600" y="206" width="120" height="56" rx="12"/><text x="660" y="231" text-anchor="middle">Runtime</text><text class="sub" x="660" y="248" text-anchor="middle">runs its code</text><text class="num" x="612" y="222">06</text></g></a>
<text class="sub dl" style="--d:1.4s" x="660" y="282" text-anchor="middle">no keys · no network</text>
<a href="/blog/wtf-is-agent/autonomy-and-governance"><g class="dn tint" style="--d:1.5s;--k:#a16207"><rect x="250" y="322" width="200" height="56" rx="12"/><text x="350" y="347" text-anchor="middle">Governance</text><text class="sub" x="350" y="364" text-anchor="middle">approvals · budgets · stop</text><text class="num" x="262" y="338">07</text></g></a>
<a href="/blog/wtf-is-agent/knowing-it-works"><g class="dn" style="--d:1.6s;--k:#6b6677"><rect x="600" y="334" width="140" height="56" rx="12" stroke-dasharray="5 4"/><text x="670" y="359" text-anchor="middle">Evals</text><text class="sub" x="670" y="376" text-anchor="middle">does it decide right?</text><text class="num" x="612" y="350">08</text></g></a>
<g class="dn bar-state" style="--d:1.8s"><rect x="20" y="404" width="720" height="26" rx="10"/><text class="sub" x="380" y="421" text-anchor="middle">Durable state under everything: sessions, tasks, memory, results</text></g>
<circle class="pk" r="5" style="--k:#a16207"><animateMotion dur="4.8s" begin="0s" repeatCount="indefinite" path="M150 138 C200 138 200 190 250 190 L450 185 C520 185 520 88 600 88"/></circle>
<circle class="pk" r="5" style="--k:#be185d"><animateMotion dur="4.8s" begin="-2.4s" repeatCount="indefinite" path="M150 248 C200 248 200 240 250 240 L450 235 L600 235"/></circle>
</svg>
</div>

## What each component answers

| Need | Without it | Component | Post |
|---|---|---|---|
| Remember across sessions | It forgets me every morning | Memory | [02](/blog/wtf-is-agent/memory) |
| Reach the world | It can only talk | Tools | [03](/blog/wtf-is-agent/the-toolbox) |
| Survive failure and interruption | A crash loses the task | Harness | [04](/blog/wtf-is-agent/the-harness) |
| Know what to read and how to work | The prompt overflows, or it improvises every time | Context and skills | [05](/blog/wtf-is-agent/context-and-skills) |
| Run code without trusting it | One bad program owns the machine | Runtime and sandbox | [06](/blog/wtf-is-agent/runtime-and-sandbox) |
| Act without being asked, and stay in bounds | It only reacts, or runs away | Triggers and governance | [07](/blog/wtf-is-agent/autonomy-and-governance) |
| Be trusted | No way to check it | Evals | [08](/blog/wtf-is-agent/knowing-it-works) |

## The order I built it in

<ol class="timeline">
<li><b>Memory.</b> Started here, because an agent that forgets is a chatbot.</li>
<li><b>Tools.</b> One hub for tools, skills and logins, so no agent holds a credential.</li>
<li><b>Harness.</b> A durable control loop around the model, extended from an existing open-source agent.</li>
<li><b>Context, skills, triggers.</b> What the model reads, procedures it follows, and how it comes back unprompted.</li>
<li><b>Evals.</b> A suite that checks the one decision everything depends on.</li>
<li><b>Runtime and sandbox.</b> The isolation I had just built was replaced by something lighter, the same day.</li>
<li class="end"><b>Journeys.</b> The 9/24 ceiling was the instrument, not the model. A fake world now checks what the agent does, not just its first decision.</li>
</ol>

## Six rules I kept

| Rule | What it means | Where it shows |
|---|---|---|
| The model steers, the harness supports | No classifier, router or planner decides how a request is handled. Code guards only irreversible actions, spend, context and recall | Harness |
| Leverage, don't rebuild | Delegate to tools and engines that already do a thing well | Harness, tools |
| Everything durable | State lives in a database, never in a process | Harness, memory |
| Every belief cites its source | A summary can be traced to the words it came from, and forgotten with them | Memory |
| The agent never holds the keys | Credentials live with the tools, not in the agent or its sandbox | Tools, sandbox |
| Measure, then delete | If a component does not earn its keep in a test, it goes | Evals, the finale |

## What already exists

I surveyed each area before building. Each post gives the detail; this is the map.

| Component | What exists | What I did |
|---|---|---|
| Harness | Agent frameworks ([LangGraph](https://www.langchain.com/langgraph), [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)) and durable runtimes ([Temporal](https://temporal.io), [Restate](https://restate.dev), [Inngest](https://www.inngest.com)) | A durable runtime for the loop, my own control logic on top |
| Memory | [MemGPT/Letta](https://arxiv.org/abs/2310.08560), [Mem0](https://arxiv.org/abs/2504.19413), [Zep](https://arxiv.org/abs/2501.13956), [A-MEM](https://arxiv.org/abs/2502.12110), [Hindsight](https://arxiv.org/abs/2512.12818) | Followed Hindsight's operations, added layers and provenance |
| Tools | MCP servers, gateways and registries, tool search, [code mode](https://www.anthropic.com/engineering/code-execution-with-mcp) | One hub with search, connections and typed code |
| Runtime and sandbox | Containers, microVMs, user-space kernels, WebAssembly | One execution interface, after two rewrites |
| Coding work | Claude Code, Codex and other coding agents | Hosted, not rebuilt |

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory | Pipeline decommissioned once, rebuilt in layers | <span class="pill warn">rebuilt</span> |
| Tools | Running, with one built-then-removed feature | <span class="pill good">stable</span> |
| Harness | Running; router and planner removed | <span class="pill good">stable</span> |
| Context and skills | Built; skills rewritten once | <span class="pill good">stable</span> |
| Runtime and sandbox | Replaced within a day of the first build | <span class="pill warn">churning</span> |
| Triggers and governance | Waking redesigned three times, now small | <span class="pill warn">churning</span> |
| Evals | Four suites; the 9/24 ceiling was a measurement fault, fixed; journeys now measure whole tasks | <span class="pill good">rebuilt</span> |

**Verdict: the spine held and the edges moved.** The harness, memory and tools kept their shape through every rewrite. Runtime, sandbox and waking were redesigned repeatedly. Evals was the thinnest part and is now the most changed: its first ceiling was a measurement fault, and the journey suite is the first test that checks what the agent actually does. Next: memory, the first thing I built.
