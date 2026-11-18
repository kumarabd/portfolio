---
title: What I deleted
summary: Thirteen things I built and then removed, why each went, and the design rules that were left standing. The finale of the build.
verdict: I deleted nearly as much as I kept, and the reasons repeat: the model did it better, it duplicated something, it sat in the wrong layer, or it was heavier than the job. The design is what survived.
date: 2026-06-03
---

Every post so far described something that exists. This one is about what does not. Going back through my notes I found **thirteen things I built and later removed**. The pattern in why is the real design.

<div class="stats">
<div><b>13</b><span>components built, then deleted</span></div>
<div><b>5</b><span>lived for less than a day</span></div>
<div><b>11</b><span>of the 13 went in the last two months</span></div>
<div><b>5</b><span>months of building covered by this record</span></div>
</div>

## The record

<div class="diagram">
<div class="cap">Built, then removed <small>A dot is the day it was removed. A bar is how long it lived, where I know. A dotted line means it was already there. Most deletions are recent.</small></div>
<svg viewBox="0 0 760 351" role="img" aria-label="Thirteen things I built and then removed between June and November, most of them in the last two months and five on the day they were built."><path d="M270 24 V343" style="stroke:var(--rule);stroke-width:1;fill:none"/><text class="sub" x="274" y="20">Jun</text><path d="M354 24 V343" style="stroke:var(--rule);stroke-width:1;fill:none"/><text class="sub" x="358" y="20">Jul</text><path d="M441 24 V343" style="stroke:var(--rule);stroke-width:1;fill:none"/><text class="sub" x="445" y="20">Aug</text><path d="M527 24 V343" style="stroke:var(--rule);stroke-width:1;fill:none"/><text class="sub" x="531" y="20">Sep</text><path d="M611 24 V343" style="stroke:var(--rule);stroke-width:1;fill:none"/><text class="sub" x="615" y="20">Oct</text><path d="M698 24 V343" style="stroke:var(--rule);stroke-width:1;fill:none"/><text class="sub" x="702" y="20">Nov</text><text class="sub dl" style="--d:0.20s" x="256" y="48" text-anchor="end">Mining and graph pipeline</text><g class="dn" style="--d:0.30s;--k:#6b6677"><rect x="276" y="39" width="285" height="10" rx="5" style="fill:#6b6677;stroke:none"/></g><g class="dn" style="--d:0.30s;--k:#6b6677"><circle cx="561" cy="44" r="6" style="fill:#6b6677;stroke:none"/></g><text class="sub dl" style="--d:0.25s" x="256" y="71" text-anchor="end">Classifier lanes, routing, planner</text><g class="dn" style="--d:0.37s;--k:#4338ca"><rect x="477" y="62" width="73" height="10" rx="5" style="fill:#4338ca;stroke:none"/></g><g class="dn" style="--d:0.37s;--k:#4338ca"><circle cx="550" cy="67" r="6" style="fill:#4338ca;stroke:none"/></g><text class="sub dl" style="--d:0.30s" x="256" y="94" text-anchor="end">Conversational session mode</text><g class="dn" style="--d:0.44s;--k:#4338ca"><rect x="586" y="85" width="22" height="10" rx="5" style="fill:#4338ca;stroke:none"/></g><g class="dn" style="--d:0.44s;--k:#4338ca"><circle cx="609" cy="90" r="6" style="fill:#4338ca;stroke:none"/></g><text class="sub dl" style="--d:0.35s" x="256" y="117" text-anchor="end">Intentions (waking)</text><path class="de dash dl" style="--d:0.51s;--k:#a16207" d="M270 113 H625" stroke-opacity=".35"/><g class="dn" style="--d:0.51s;--k:#a16207"><circle cx="631" cy="113" r="6" style="fill:#a16207;stroke:none"/></g><text class="sub dl" style="--d:0.40s" x="256" y="140" text-anchor="end">Skill category filter</text><g class="dn" style="--d:0.58s;--k:#4338ca"><circle cx="650" cy="136" r="6" style="fill:#4338ca;stroke:none"/></g><text class="sub dl" style="--d:0.45s" x="256" y="163" text-anchor="end">Message kind column</text><path class="de dash dl" style="--d:0.65s;--k:#a16207" d="M270 159 H661" stroke-opacity=".35"/><g class="dn" style="--d:0.65s;--k:#a16207"><circle cx="667" cy="159" r="6" style="fill:#a16207;stroke:none"/></g><text class="sub dl" style="--d:0.50s" x="256" y="186" text-anchor="end">Persona, traits, lenses</text><path class="de dash dl" style="--d:0.72s;--k:#6b6677" d="M270 182 H667" stroke-opacity=".35"/><g class="dn" style="--d:0.72s;--k:#6b6677"><circle cx="673" cy="182" r="6" style="fill:#6b6677;stroke:none"/></g><text class="sub dl" style="--d:0.55s" x="256" y="209" text-anchor="end">Subagents (replaced by tasks)</text><path class="de dash dl" style="--d:0.79s;--k:#a16207" d="M270 205 H672" stroke-opacity=".35"/><g class="dn" style="--d:0.79s;--k:#a16207"><circle cx="678" cy="205" r="6" style="fill:#a16207;stroke:none"/></g><text class="sub dl" style="--d:0.60s" x="256" y="232" text-anchor="end">Harness wake and watch tools</text><path class="de dash dl" style="--d:0.86s;--k:#a16207" d="M270 228 H672" stroke-opacity=".35"/><g class="dn" style="--d:0.86s;--k:#a16207"><circle cx="678" cy="228" r="6" style="fill:#a16207;stroke:none"/></g><text class="sub dl" style="--d:0.65s" x="256" y="255" text-anchor="end">Questions eval suite</text><g class="dn" style="--d:0.93s;--k:#6b6677"><circle cx="681" cy="251" r="6" style="fill:#6b6677;stroke:none"/></g><text class="sub dl" style="--d:0.70s" x="256" y="278" text-anchor="end">MicroVM per session</text><g class="dn" style="--d:1.00s;--k:#0f766e"><circle cx="734" cy="274" r="6" style="fill:#0f766e;stroke:none"/></g><text class="sub dl" style="--d:0.75s" x="256" y="301" text-anchor="end">Sandbox listener, run tokens</text><g class="dn" style="--d:1.07s;--k:#be185d"><circle cx="734" cy="297" r="6" style="fill:#be185d;stroke:none"/></g><text class="sub dl" style="--d:0.80s" x="256" y="324" text-anchor="end">Sandbox types</text><g class="dn" style="--d:1.14s;--k:#be185d"><circle cx="737" cy="320" r="6" style="fill:#be185d;stroke:none"/></g></svg>
<div class="legend"><span><i style="--bg:#4338ca"></i>the model did it better</span><span><i style="--bg:#a16207"></i>it duplicated something</span><span><i style="--bg:#be185d"></i>wrong layer</span><span><i style="--bg:#0f766e"></i>heavier than the job</span><span><i style="--bg:#6b6677"></i>never earned its keep</span></div>
</div>

## Why things went

| Reason | What went | The lesson |
|---|---|---|
| **The model did it better** (3) | Classifier-driven lanes, routing and a planner. A conversational session mode. A category filter on skill search | If the model can read the request, a hand-written helper in front of it only adds a way to be wrong. I delete the helper, not the model |
| **It duplicated something** (4) | Intentions for waking. Subagents next to tasks. A message `kind` column next to role and speaker. Wake and watch tools in the harness | Two ways to do one thing means one is stale. Find the existing mechanism and use it |
| **Wrong layer** (2) | A second door on the toolbox for code. Sandbox types chosen at creation | Put a decision where its information lives. Privilege belongs with the credential, not with a kind of box |
| **Heavier than the job** (1) | A microVM per session | A pure function should not pay for a kernel |
| **Never earned its keep** (3) | The mining and graph memory pipeline. Persona and trait lenses. A suite for supervisors answering questions | If I cannot show it helps, it goes. That is the whole reason evals exist |

## The rules that were left standing

| Rule | Held in |
|---|---|
| The model steers, the harness supports | [Harness](/blog/wtf-is-agent/the-harness), [waking](/blog/wtf-is-agent/waking-asking-stopping) |
| Leverage, don't rebuild | [Harness](/blog/wtf-is-agent/the-harness), [toolbox](/blog/wtf-is-agent/the-toolbox) |
| Everything durable | [Harness](/blog/wtf-is-agent/the-harness), [memory](/blog/wtf-is-agent/memory) |
| Every belief cites its source | [Memory](/blog/wtf-is-agent/memory) |
| The agent never holds the keys | [Toolbox](/blog/wtf-is-agent/the-toolbox), [sandbox](/blog/wtf-is-agent/runtime-and-sandbox) |
| Measure, then delete | [Evals](/blog/wtf-is-agent/knowing-it-works), this post |

## Where it stands, and my verdict

| Component | Status | What is open |
|---|---|---|
| Memory | Built, traceable; two memory journeys pass | No memory benchmark. Do conclusions earn their cost? |
| Tools | Running; journey suite measures discovery, chaining and failure | Code over tools is unevaluated on real requests |
| Harness | Running, smaller than ever | Hosting a coding agent is designed, partly built |
| Context and skills | Running | The skill gain is expected, not re-measured |
| Runtime and sandbox | One day old | A type check before a program runs |
| Waking and asking | Small and live | Rules that stop a run |
| Evals | Four suites; journeys are the main test. 35B 72/81, 8B 32/81 | A memory benchmark, a code-mode eval, and the production prompt on every model |

**Verdict: an agent that runs on its own is mostly a set of things it is not allowed to do, and a set of things I stopped building.** The loop, memory and toolbox kept their shape. Almost everything else was rebuilt or removed, usually within weeks and sometimes within a day, and each deletion made the system easier to reason about. The weakest part was the one that would have saved the most work: measuring earlier. The first eval suite was itself a deletion candidate: its 9 of 24 ceiling was a measurement fault, not a model limit, and fixing it changed the model verdict. If I did this again I would write the evaluation before the component.

What I will do next, in order: **evaluate memory and code mode**, because neither has a dedicated test and two memory journeys are a signal, not a benchmark. **Run the production prompt on every model**, because the suite's own prompt is not the one the agent uses; Gyro-S fell from 71 to 62 on it, and the 8B production run is missing. **Make a rule stop a run**, because today I can only watch the spend.
