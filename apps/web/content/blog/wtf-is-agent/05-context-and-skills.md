---
title: Context and skills: what the model reads
summary: The prompt is a view over everything that was said, not a copy. How I keep it small without losing anything, and how skills turn procedure into scripts.
verdict: Keep everything, show the model a summarised view, store big results as files, and compact in two tiers. Put mechanical steps in skill scripts, because an agent's latency is its number of model steps.
date: 2026-08-23
---

A model only knows what is in its prompt on this call. Everything the agent does well or badly follows from what I put there. **Context** is the working memory of one conversation. **Skills** are the procedures it can follow. Both are about spending a small window wisely.

<div class="stats">
<div><b>22 vs 4</b><span>model steps for one planning task: observed, and what a script should need</span></div>
<div><b>0–5%</b><span>of that task's wall time was tool execution</span></div>
<div><b>50 / 85%</b><span>soft and hard compaction thresholds of the window</span></div>
<div><b>0</b><span>messages ever deleted</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">The prompt is a view over everything <small>Everything said is kept. The prompt shows summaries of old turns, this turn in full, and references to big results. The gauge shows when it compacts.</small></div>
<svg viewBox="0 0 760 330" role="img" aria-label="The prompt is built from a standing guide and skill, recalled memory, summaries of older turns, the current turn verbatim and tool results as references. A gauge shows soft compaction at fifty percent and hard compaction at eighty-five percent. Everything said is kept in an immutable store.">
<g class="dl" style="--d:.1s"><text class="tag" x="40" y="22" style="--k:#4338ca">The prompt</text></g>
<g class="dn tint" style="--d:.2s;--k:#4338ca"><rect x="40" y="34" width="260" height="38" rx="9"/><text x="170" y="58" text-anchor="middle" style="font-size:12.5px">Standing guide · pinned skill</text></g>
<g class="dn tint" style="--d:.3s;--k:#0f766e"><rect x="40" y="78" width="260" height="38" rx="9"/><text x="170" y="102" text-anchor="middle" style="font-size:12.5px">Recalled memory</text></g>
<g class="dn tint" style="--d:.4s;--k:#6b6677"><rect x="40" y="122" width="260" height="64" rx="9"/><text x="170" y="150" text-anchor="middle" style="font-size:12.5px">Summaries of older turns</text><text class="sub" x="170" y="168" text-anchor="middle">a tree: summaries of summaries</text></g>
<g class="dn solid" style="--d:.5s"><rect x="40" y="192" width="260" height="62" rx="9"/><text x="170" y="228" text-anchor="middle" style="font-size:12.5px">This turn, verbatim</text></g>
<g class="dn tint" style="--d:.6s;--k:#be185d"><rect x="40" y="260" width="260" height="38" rx="9"/><text x="170" y="284" text-anchor="middle" style="font-size:12.5px">Big results: head, tail, file link</text></g>
<rect x="340" y="34" width="22" height="264" rx="8" style="fill:#1c1a2412;stroke:var(--rule)"/>
<rect class="gfill" style="--d:.9s;fill:#a16207" x="340" y="148" width="22" height="150" rx="8"/>
<path class="de" pathLength="1" style="--d:1.4s;--k:#a16207" d="M340 166 H374"/><path class="de" pathLength="1" style="--d:1.5s;--k:#be185d" d="M340 72 H374"/>
<text class="sub dl" style="--d:1.5s" x="380" y="160">soft 50%: summarise in the background</text><text class="sub dl" style="--d:1.6s" x="380" y="76">hard 85%: stop and compact</text>
<g class="dn" style="--d:1s;--k:#6b6677"><rect x="540" y="190" width="200" height="110" rx="14" stroke-dasharray="6 5"/><text class="tag" x="556" y="212" style="--k:#6b6677">Immutable store</text><text x="640" y="246" text-anchor="middle" style="font-size:13px">every message and result</text><text class="sub" x="640" y="266" text-anchor="middle">never edited, never deleted</text><text class="sub" x="640" y="284" text-anchor="middle">the prompt is a view over this</text></g>
<path class="de dash" style="--d:1.7s;--k:#6b6677" d="M540 246 C450 246 390 232 300 224"/>
<circle class="pk" r="5" style="--k:#6b6677"><animateMotion dur="3.4s" begin="0s" repeatCount="indefinite" path="M540 246 C450 246 390 232 300 224"/></circle>
</svg>
</div>

## Context decisions

| Decision | Why |
|---|---|
| Context is the whole conversation, not one turn | Starting each turn blind to the one before was a real gap, found by reading the code |
| Summaries form a tree, the current turn stays verbatim | Old content folds into summaries of summaries as it ages, so the window stays bounded |
| Big tool results go to a file | The model sees the head, the tail, a short summary and a path, and reads more on demand |
| Two compaction tiers | A soft tier summarises in the background at 50%. A hard tier blocks at 85% because the window is about to overflow |
| Compaction always converges | Try a careful summary, then an aggressive one, then plain truncation with no model. The last step cannot fail to shrink |
| Nothing is deleted | The prompt is a derived view over an immutable store, so compaction changes what is shown, not what is kept |
| Memory enters on two triggers only | At the start of a conversation, or when the model asks. Re-judging relevance on every call would break the prompt cache, and cache stability won |

## Skills

A **skill** is a directory: a procedure the model follows, short prompt files, and scripts it can call as functions. The reason is a measurement, not a taste.

<div class="chart">
<div class="cap">Model steps for one planning task <small>What I observed, and what moving the mechanical steps into a script should need</small></div>
<div class="row"><span class="k">Observed, no script</span><span class="bar a5"><i style="--w:100%"></i></span><span class="v">22</span></div>
<div class="row"><span class="k">Expected, with a script</span><span class="bar a3"><i style="--w:18%"></i></span><span class="v">about 4</span></div>
<div class="legend"><span>One task took 570 s. Running the tools was 0 to 5% of that. The rest was the model deciding, one step at a time.</span></div>
</div>

**Latency is the number of model steps, not the cost of the tools.** The steps were mechanical: finding tools, reading a catalog, hand-building a batch with its own ids, retrying a failing call. Prose in a prompt cannot make those deterministic. A script can. So the model asks what is missing, writes a plan, and calls one function that checks everything, builds the batch, dry-runs it and applies it all or nothing.

| Skill rule | Why |
|---|---|
| The prompt says when, the script does how | The model keeps the judgement, the function keeps the arithmetic |
| Fail loudly, and list every problem at once | No fallback path hides a failure. The model sees what to fix in one go |
| A script cannot start a process or open a socket | It runs in the sandbox from [post 6](/blog/wtf-is-agent/runtime-and-sandbox) and reaches the world only through the toolbox |
| The agent can write a skill from a source I point it at | It goes live without a restart. Learning skills automatically from transcripts is banned |
| No category filter on skill search | I built one and removed it the same day: labels describe the shape of a process, not the domain, so filtering excluded relevant skills |

## The journey

<ol class="timeline">
<li><b>A session-wide context design.</b> Summary tree, big-result files, two compaction tiers, informed by a published design.</li>
<li><b>Skill search.</b> Skills found by meaning, loaded on demand. A category pre-filter was added and removed within the day.</li>
<li><b>The 22-step task.</b> A planning task took 570 s, and the trace showed why.</li>
<li><b>Skills with scripts.</b> A procedure plus functions the model calls.</li>
<li><b>Soft compaction.</b> Background summarising added at the 50% tier.</li>
<li class="end"><b>Scripts as modules.</b> Skill scripts moved from a shell to code run in the sandbox.</li>
</ol>

## What already exists

| Idea | Source | What I took |
|---|---|---|
| Page memory in and out like an OS | [MemGPT](https://arxiv.org/abs/2310.08560) | The split between what is in the prompt and what is stored |
| An immutable store plus a summary tree | [LCM: Lossless Context Management](https://arxiv.org/abs/2605.04050) | The shape of my prompt. The authors' benchmarks are their own results |
| Skills with progressive disclosure | [Anthropic's Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) | Load a skill's body only when it applies |

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory ([post 2](/blog/wtf-is-agent/memory)) | Built, traceable; two memory journeys pass | <span class="pill warn">thin</span> |
| Tools ([post 3](/blog/wtf-is-agent/the-toolbox)) | Running; journey suite measures discovery, chaining and failure | <span class="pill good">measured</span> |
| Harness ([post 4](/blog/wtf-is-agent/the-harness)) | Running, shrinking | <span class="pill good">stable</span> |
| Context | Tree, big-result files, both compaction tiers built | <span class="pill good">stable</span> |
| Skills | One skill built to cut a 22-step task to about 4. Not re-measured yet | <span class="pill warn">unproven</span> |

**Verdict: the context design is sound and the skill idea is promising, not proven.** The 22 steps were measured; the 4 is what the script should need, and I have not re-run it. Most skills I wanted are not written. The principle generalises: find where the steps are mechanical and give them to code. Next: where that code runs.
