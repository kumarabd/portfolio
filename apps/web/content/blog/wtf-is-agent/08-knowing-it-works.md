---
title: Knowing it works: evals
summary: A labelled suite for the one decision everything depends on, run on every model before I build on it. What it caught, and the ceiling I still cannot explain.
verdict: Measure a judgement before building on it: labelled cases, several samples, a held-out set. It already killed one design. My own suite has a ceiling I have not explained, so the scores are capped.
date: 2026-10-26
---

An agent makes a judgement on every request: do the work now, ask, schedule it, answer, or something else. Get it wrong and a whole run is wasted. So I do not build on that judgement until I have measured it. **Evals are the component I trust least in my own system, and the one that changed the most decisions.**

<div class="stats">
<div><b>3</b><span>suites: start decisions, routing, delegation</span></div>
<div><b>32 + 30</b><span>labelled cases, the second set held out</span></div>
<div><b>3</b><span>samples per case, because one is noise</span></div>
<div><b>9 / 24</b><span>the score no setup has beaten by more than one on the hardest category</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">One loop, run by hand where the real models and tools are <small>It reads and writes nothing in the real system: no task is started and no message stored.</small></div>
<svg viewBox="0 0 760 130" role="img" aria-label="Labelled cases go to the model under test, which produces a decision; the decision is scored per category and compared across runs, which decides what to build or delete.">
<path class="de" pathLength="1" style="--d:.5s" d="M170 65 H210"/><path class="de" pathLength="1" style="--d:.6s" d="M350 65 H390"/><path class="de" pathLength="1" style="--d:.7s" d="M530 65 H570"/>
<g class="dn tint" style="--d:.1s;--k:#6b6677"><rect x="30" y="35" width="140" height="60" rx="12"/><text x="100" y="62" text-anchor="middle">Cases</text><text class="sub" x="100" y="80" text-anchor="middle">message + accepted answers</text></g>
<g class="dn solid" style="--d:.25s"><rect x="210" y="35" width="140" height="60" rx="12"/><text x="280" y="62" text-anchor="middle">Model under test</text><text class="sub" x="280" y="80" text-anchor="middle" style="fill:#d8d4e4">any tier, any engine</text></g>
<g class="dn tint" style="--d:.4s;--k:#0f766e"><rect x="390" y="35" width="140" height="60" rx="12"/><text x="460" y="62" text-anchor="middle">Score</text><text class="sub" x="460" y="80" text-anchor="middle">per category, 3 samples</text></g>
<g class="dn tint" style="--d:.55s;--k:#a16207"><rect x="570" y="35" width="160" height="60" rx="12"/><text x="650" y="62" text-anchor="middle">Build or delete</text><text class="sub" x="650" y="80" text-anchor="middle">compare runs, then decide</text></g>
<circle class="pk" r="5" style="--k:#a16207"><animateMotion dur="3.6s" begin="0s" repeatCount="indefinite" path="M170 65 H570"/></circle>
</svg>
</div>

## Where the model gets it right

The start-decision suite, in the fast mode, by category. Each cell is correct out of samples, for a small and a large model, with a short prompt (triage) and with the full real prompt and tools (freeform).

<div class="heat" role="img" aria-label="Decision accuracy by category for the 8B and 35B models in triage and freeform modes">
<div class="hh"></div><div class="hh">8B triage</div><div class="hh">8B freeform</div><div class="hh">35B triage</div><div class="hh">35B freeform</div>
<div class="hl">Start a task now</div><div class="hc" style="--r:0.38">9/24</div><div class="hc" style="--r:0.38">9/24</div><div class="hc" style="--r:0.38">9/24</div><div class="hc" style="--r:0.38">9/24</div>
<div class="hl">Start or ask</div><div class="hc hi" style="--r:1.00">3/3</div><div class="hc z" style="--r:0.00">0/3</div><div class="hc hi" style="--r:1.00">3/3</div><div class="hc" style="--r:0.33">1/3</div>
<div class="hl">Wake an old task</div><div class="hc hi" style="--r:0.83">5/6</div><div class="hc hi" style="--r:1.00">6/6</div><div class="hc hi" style="--r:1.00">6/6</div><div class="hc" style="--r:0.50">3/6</div>
<div class="hl">Schedule for later</div><div class="hc hi" style="--r:1.00">12/12</div><div class="hc" style="--r:0.25">3/12</div><div class="hc hi" style="--r:1.00">12/12</div><div class="hc" style="--r:0.50">6/12</div>
<div class="hl">Engine, no task</div><div class="hc hi" style="--r:0.89">8/9</div><div class="hc hi" style="--r:0.67">6/9</div><div class="hc hi" style="--r:0.78">7/9</div><div class="hc hi" style="--r:0.67">6/9</div>
<div class="hl">Do it yourself</div><div class="hc hi" style="--r:1.00">3/3</div><div class="hc z" style="--r:0.00">0/3</div><div class="hc" style="--r:0.33">1/3</div><div class="hc z" style="--r:0.00">0/3</div>
<div class="hl">Answer directly</div><div class="hc hi" style="--r:1.00">12/12</div><div class="hc hi" style="--r:1.00">12/12</div><div class="hc hi" style="--r:1.00">12/12</div><div class="hc hi" style="--r:1.00">12/12</div>
<div class="hl">Capability question</div><div class="hc z" style="--r:0.00">0/12</div><div class="hc hi" style="--r:1.00">12/12</div><div class="hc z" style="--r:0.00">0/12</div><div class="hc hi" style="--r:1.00">12/12</div>
<div class="hl">Live data</div><div class="hc z" style="--r:0.00">0/15</div><div class="hc hi" style="--r:1.00">15/15</div><div class="hc z" style="--r:0.00">0/15</div><div class="hc z" style="--r:0.00">0/15</div>
</div>

Three things jump out. **Start a task now is stuck at 9 of 24 for every setup**, so the problem is not the model. Capability and live-data are **0 in triage for everyone**, because that mode has no way to give those answers. And the larger model is **0 of 15 on live data in freeform** where the small one is perfect. The scores behind this are in [the benchmarks series](/blog/benchmarks-rtx-3080/does-bigger-pay-off).

## What it changed

<ol class="timeline">
<li><time>Oct 26</time><b>Measure before building.</b> The first step of a plan to supervise tasks was to measure the three judgements it would rest on.</li>
<li><time>Oct 26</time><b>The classifier stays a hint.</b> A small classifier labelled requests by shape. It was 0.97 confident on "plan my gameweek" and 0.96 confident on the same request with "in 1 minute" added, but labelled it conversation. A label cannot decide whether to run work now, later or never, so the conversation decides and the label only suggests.</li>
<li><time>Oct 26</time><b>A suite built and removed the same day.</b> It tested supervisors answering questions, until the design dropped that idea.</li>
<li class="end"><time>Nov 11</time><b>Models compared.</b> A small local model against a large candidate on the whole suite.</li>
</ol>

## Decisions that held

| Decision | Why |
|---|---|
| Each case lists every acceptable decision | There is often more than one right answer, such as ask or start |
| A held-out set of 30 | So I do not tune on the cases I score |
| Three samples per case | A difference of one or two cases between runs is not a result |
| Triage output is constrained to a schema | A model cannot invent a skill name that does not exist |
| "Unsure" is a valid answer and is counted | It hands over to a stronger model, and the rate tells me what it costs |
| Run by hand where the real models are | Scoring is unit-tested without a model, so the harness itself is checked |
| One CPU classifier, one message at a time | Twenty-three at once failed its health checks, which an eval must not do |

## What already exists

| Tool | What it is |
|---|---|
| [Inspect AI](https://inspect.aisi.org.uk) | An open-source evaluation framework from the UK AI Security Institute, with sandboxed agent tasks |
| [Promptfoo](https://www.promptfoo.dev) | A configuration-first CLI to compare prompts and providers, with simulated users for agent conversations |
| [LangSmith](https://www.langchain.com/langsmith), [Braintrust](https://www.braintrust.dev) | Hosted platforms built around datasets, experiments and scorers |
| Benchmarks such as [τ-bench](https://github.com/sierra-research/tau-bench) | Fixed tasks for tool-using agents, useful for comparing models, not for testing your own agent's decisions |

Most comparisons of these are written by vendors, so I only kept the shape of each. I wrote my own because the thing I needed to check is one decision in my own system, and its cases are mine. The cost is that nothing outside the suite can tell me it is wrong.

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory (post 2) | Built, traceable, unevaluated | <span class="pill bad">no eval</span> |
| Tools (post 3) | Running; code-over-tools unevaluated | <span class="pill bad">no eval</span> |
| Harness, context, skills (posts 4 and 5) | Running; the skill gain is expected, not re-measured | <span class="pill warn">thin</span> |
| Runtime and sandbox (post 6) | New, code mode not evaluated on real requests | <span class="pill bad">no eval</span> |
| Waking and asking (post 7) | Asking live-verified | <span class="pill good">checked</span> |
| Start decisions | A suite exists. Best score about 62%, capped by a ceiling I have not explained | <span class="pill warn">capped</span> |

**Verdict: evals is the weakest part and the most valuable.** One suite changed what I built: it demoted the classifier. Yet memory, tools and the runtime have none, and my one suite is stuck at 9 of 24 on its hardest category for every model. Fixing that ceiling is worth more than any model swap. Last post: the finale, everything I built and then deleted.
