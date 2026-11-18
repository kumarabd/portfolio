---
title: Runtime and sandbox: where agent code runs
summary: An agent that writes code needs somewhere to run it that holds no secrets and no network. Three designs in one day, and the engine that won.
verdict: One execution interface with several light engines, inside a sandbox that has no network and no secrets. I built a microVM per session first and replaced it within a day, because a pure function should not need a VM.
date: 2026-11-14
---

Once the model writes code, that code has to run somewhere. The tempting answer is the machine the agent already lives on, and it is the wrong one. **Runtime** is what executes a program. **Sandbox** is the wall around it. I designed three versions of both on one day, and the third is the one I kept.

<div class="stats">
<div><b>~3 <small>s</small></b><span>to boot a microVM per session, measured on my cluster</span></div>
<div><b>34 <small>ms</small></b><span>to run real Python on WebAssembly, warm</span></div>
<div><b>&lt; 1 <small>ms</small></b><span>to start an embedded interpreter</span></div>
<div><b>0</b><span>secrets or network connections inside the sandbox</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">Code runs in a box with no network and no keys <small>A tool call leaves the box over one socket to the harness, which applies the approval rule and holds the access. The browser lives in a separate box with internet and no data.</small></div>
<svg viewBox="0 0 760 340" role="img" aria-label="The harness sends a program to a sandbox with no network and no secrets, containing the runtime. A tool call goes back to the harness, which applies approvals and calls the toolbox. A separate browser sandbox has internet but no data.">
<path class="de" pathLength="1" style="--d:.8s;--k:#be185d" d="M250 120 H340"/>
<path class="de" pathLength="1" style="--d:.9s;--k:#be185d" d="M340 160 H250"/>
<path class="de" pathLength="1" style="--d:1.1s;--k:#4338ca" d="M145 80 V26 H675 V58"/>
<g class="dn solid" style="--d:.1s"><rect x="40" y="80" width="210" height="160" rx="16"/><text x="145" y="132" text-anchor="middle" style="font-size:16px">Harness</text><text class="sub" x="145" y="154" text-anchor="middle" style="fill:#d8d4e4">holds the access</text><text class="sub" x="145" y="172" text-anchor="middle" style="fill:#d8d4e4">applies approvals</text><text class="sub" x="145" y="190" text-anchor="middle" style="fill:#d8d4e4">answers tool calls</text></g>
<g class="dl" style="--d:.4s"><rect class="box" style="--k:#be185d" x="340" y="40" width="250" height="190" rx="18"/><text class="tag" style="--k:#be185d" x="356" y="62">Sandbox</text></g>
<g class="dn tint" style="--d:.7s;--k:#be185d"><rect x="360" y="76" width="210" height="46" rx="10"/><text x="465" y="97" text-anchor="middle" style="font-size:12.5px">Embedded interpreter</text><text class="sub" x="465" y="113" text-anchor="middle">model's code · under 1 ms</text></g>
<g class="dn tint" style="--d:.8s;--k:#be185d"><rect x="360" y="128" width="210" height="46" rx="10"/><text x="465" y="149" text-anchor="middle" style="font-size:12.5px">Full Python on WebAssembly</text><text class="sub" x="465" y="165" text-anchor="middle">skill scripts · about 34 ms</text></g>
<g class="dn tint" style="--d:.9s;--k:#be185d"><rect x="360" y="180" width="210" height="40" rx="10"/><text x="465" y="205" text-anchor="middle" style="font-size:12.5px">JavaScript on WebAssembly</text></g>
<text class="sub dl" style="--d:1.2s" x="465" y="252" text-anchor="middle">no network · no secrets · only mounted files</text>
<g class="dn tint" style="--d:1.2s;--k:#4338ca"><rect x="615" y="58" width="120" height="52" rx="12"/><text x="675" y="81" text-anchor="middle">Toolbox</text><text class="sub" x="675" y="98" text-anchor="middle">holds the logins</text></g>
<g class="dl" style="--d:1.4s"><rect class="box" style="--k:#6b6677" x="340" y="276" width="250" height="52" rx="14"/><text class="tag" style="--k:#6b6677" x="356" y="296">Separate sandbox</text><text class="sub" x="356" y="316">browser: internet, no data, parses hostile pages</text></g>
<text class="sub dl" style="--d:1.3s" x="295" y="112" text-anchor="middle">program</text><text class="sub dl" style="--d:1.3s" x="295" y="178" text-anchor="middle">tool call</text><text class="sub dl" style="--d:1.4s" x="410" y="20" text-anchor="middle">approved, then attached to the login</text>
<circle class="pk" r="5" style="--k:#be185d"><animateMotion dur="4s" begin="0s" repeatCount="indefinite" path="M250 120 H340 L465 99"/></circle>
<circle class="pk" r="5" style="--k:#4338ca"><animateMotion dur="4s" begin="-2s" repeatCount="indefinite" path="M340 160 H145 V26 H675 V58"/></circle>
</svg>
</div>

## The journey: three designs, one day

<ol class="timeline">
<li><b>The model's commands ran in the worker.</b> As subprocesses, with the worker's entire environment: its credentials, its database pool, its model keys. Anything the model wrote, or a web page made it write, ran next to all of it.</li>
<li><b>A microVM per session.</b> Everything the agent runs goes to a sandbox that boots on demand, with its own mounted folders. Built and verified. Cold start about 3 seconds.</li>
<li><b>Code mode in an embedded interpreter.</b> The model writes a Python program against the connected services instead of calling tools one at a time. It runs in a small Rust interpreter that starts in under a millisecond.</li>
<li class="end"><b>One interface, light engines.</b> A skill's real scripts ran byte for byte identically on Python compiled to WebAssembly, in about 34 ms with no VM. The microVM per session was removed.</li>
</ol>

<div class="chart">
<div class="cap">Time to start running code <small>Log scale: each step right is ten times slower</small></div>
<div class="row"><span class="k">Embedded interpreter</span><span class="bar a3"><i style="--w:22%"></i></span><span class="v">&lt; 1 ms</span></div>
<div class="row"><span class="k">Python on WebAssembly</span><span class="bar a2"><i style="--w:56%"></i></span><span class="v">34 ms</span></div>
<div class="row"><span class="k">MicroVM per session</span><span class="bar a5"><i style="--w:100%"></i></span><span class="v">~3,000 ms</span></div>
<div class="legend"><span>Figures from my own spike and cluster. Cold starts depend on hardware.</span></div>
</div>

## Decisions that held

| Decision | Why |
|---|---|
| The worker executes no code the model chose | Whatever runs it next to credentials can be steered by a web page |
| One interface, several engines | A request names the language, the program, what it may touch and its limits. Which engine runs it is not the caller's business |
| The sandbox has no network and no secrets | A compromised engine finds an empty room. A tool call goes out over one socket, to the harness |
| The harness applies the approval rule | A script cannot lift an approval the model would face |
| The browser gets its own sandbox | It needs the internet and parses hostile pages, so it must not share a box with files |
| Do not boot a VM to run a pure function | Most agent code is glue and arithmetic. A 3-second VM is the wrong price for it |
| Access is a connection, not a kind of sandbox | I added sandbox types, one with cluster access, and withdrew them the same day. Privilege belongs with the credential, in the toolbox |

## What already exists

| Option | Isolation | Start | Fit |
|---|---|---|---|
| Containers ([Daytona](https://www.daytona.io) by default) | Shared host kernel | Vendor claims under 90 ms warm; one measured create was 742 ms | Fast, weakest wall |
| User-space kernel ([gVisor](https://gvisor.dev), used by [Modal](https://modal.com)) | Intercepts system calls | Between the two | A middle path |
| MicroVMs ([Firecracker](https://firecracker-microvm.github.io), [Kata](https://katacontainers.io), [E2B](https://e2b.dev)) | A kernel per workload | E2B claims about 150 ms; one measured create was 717 ms | Strongest wall, heaviest start |
| V8 isolates ([Cloudflare Code Mode](https://blog.cloudflare.com/code-mode/)) | An isolate with no general internet | Created on demand, no container | Great for JavaScript glue |
| WebAssembly runtimes and embedded interpreters (wasmtime, [Monty](https://github.com/pydantic/monty)) | A capability sandbox: sees only what it is handed | 1 to 34 ms in my spike | Light and strict, but a subset of the language, or a runtime to maintain |

Published start-up figures conflict between vendors and benchmarks, so treat them as ranges ([one comparison](https://upstash.com/blog/ai-agent-sandbox-providers-compared-2026)). The question that mattered to me was not the number. It was whether a **pure function** should pay for a kernel.

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory ([post 2](/blog/wtf-is-agent/memory)) | Built, traceable; two memory journeys pass | <span class="pill warn">thin</span> |
| Tools ([post 3](/blog/wtf-is-agent/the-toolbox)) | Running; journey suite measures discovery, chaining and failure | <span class="pill good">measured</span> |
| Harness ([post 4](/blog/wtf-is-agent/the-harness)) | Running, shrinking | <span class="pill good">stable</span> |
| Context and skills ([post 5](/blog/wtf-is-agent/context-and-skills)) | Context stable; skills thin | <span class="pill good">stable</span> |
| Runtime and sandbox | Prototype built and tested; code mode off by default; the journeys do not exercise it | <span class="pill warn">new</span> |
| Type check of a program before it runs | Planned, not in the executor yet | <span class="pill">later</span> |

**Verdict: the shape is right and the evidence is thin.** Keeping the sandbox empty of secrets and network is the part I will not change. The engine choice is a day old, code mode has not been evaluated on real requests, the journeys never run code, and the first design I built was thrown away. Next: how the agent wakes up on its own, and what stops it.
