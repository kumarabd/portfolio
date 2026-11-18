---
title: Knowing it works: evals
summary: The first suite hit a 9/24 ceiling that looked like a model limit. It was the instrument. The fix, the regression tests that keep it honest, and what 27 journeys say about the models.
verdict: A suite can cap every model by counting cases no model can pass. Exclude the unreachable, put an interval on the score, and make every scenario pass its own oracle. With that fixed, the journey suite separates the models: 72 of 81 for the 35B, 32 for the 8B.
date: 2026-10-26
---

An agent makes a judgement on every request: do the work now, ask, schedule it, answer, or something else. Get it wrong and a whole run is wasted. So I do not build on that judgement until I have measured it. **Evals are the component I trust least in my own system, and the one that changed the most decisions.** The first version looked like it had found a ceiling no model could beat. It had found a hole in the instrument.

<div class="stats">
<div><b>4</b><span>suites: start decisions, routing, delegation, journeys</span></div>
<div><b>150</b><span>cases across them, each with a held-out set</span></div>
<div><b>3</b><span>samples per case, because one is noise</span></div>
<div><b>72 / 81</b><span>journeys passed by the 35B; the 8B passed 32</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">One loop, run by hand where the real models and tools are <small>The journey suite runs in a fake world: no task is started and no message stored in the real system.</small></div>
<svg viewBox="0 0 760 130" role="img" aria-label="Labelled cases and a fake world go to the model under test, which acts; the actions are checked, and the result decides what to build or delete.">
<path class="de" pathLength="1" style="--d:.5s" d="M170 65 H210"/><path class="de" pathLength="1" style="--d:.6s" d="M350 65 H390"/><path class="de" pathLength="1" style="--d:.7s" d="M530 65 H570"/>
<g class="dn tint" style="--d:.1s;--k:#6b6677"><rect x="30" y="35" width="140" height="60" rx="12"/><text x="100" y="62" text-anchor="middle">Cases</text><text class="sub" x="100" y="80" text-anchor="middle">request + fake world</text></g>
<g class="dn solid" style="--d:.25s"><rect x="210" y="35" width="140" height="60" rx="12"/><text x="280" y="62" text-anchor="middle">Model under test</text><text class="sub" x="280" y="80" text-anchor="middle" style="fill:#d8d4e4">any tier, any engine</text></g>
<g class="dn tint" style="--d:.4s;--k:#0f766e"><rect x="390" y="35" width="140" height="60" rx="12"/><text x="460" y="62" text-anchor="middle">Checks</text><text class="sub" x="460" y="80" text-anchor="middle">calls · world · answer</text></g>
<g class="dn tint" style="--d:.55s;--k:#a16207"><rect x="570" y="35" width="160" height="60" rx="12"/><text x="650" y="62" text-anchor="middle">Build or delete</text><text class="sub" x="650" y="80" text-anchor="middle">compare runs, then decide</text></g>
<circle class="pk" r="5" style="--k:#a16207"><animateMotion dur="3.6s" begin="0s" repeatCount="indefinite" path="M170 65 H570"/></circle>
</svg>
</div>

## The ceiling that was not a ceiling

The first suite had 32 cases in nine categories, plus 30 held out. Its hardest category was "start a task now". The runs I had landed on 9 of 24. The natural reading was a model limit: two very different models, the same score, so the problem must be the task.

It was not. A task needs a skill to follow. Some of those cases asked for work no skill in the catalog matched, so the right answer could not be given; the suite counted the miss against the model anyway. Triage had a second, larger version of the same fault: it was scoring capability and live-data cases, which need a tool to answer, in a mode with no tools. The ceiling was the suite counting unwinnable cases as failures.

The fix is not a prompt tweak:

| What the old suite did | Why it misled | The fix |
|---|---|---|
| Counted capability and live cases in triage | Triage has no tools, so those cases cannot be answered | Triage leaves out the categories it cannot score |
| Counted a start case with no matching skill | A task needs a skill to follow; with none matched, no model could pass | The case is marked unreachable and left out of the totals |
| Reported a score without an interval | The repeats of one case are not independent, so a sample count overstates precision | The 95% interval resamples cases, not samples |
| Scored the first move only | A right first move can still leave the task undone | The journey suite checks the calls, the world and the answer |
| Had no check on itself | A case nobody can pass looks like a model limit | Every scenario carries an oracle, and a lazy answer must fail |

The suite now has regression tests of its own. Every case must be scorable by some mode; a start case with no matching skill must be marked unreachable; the interval must be deterministic; a target with a thinking setting must send it. The journey suite goes further: every scenario carries a scripted oracle that must pass its own checks, and a test asserts that answering "Sure, done." passes none of them. **A scenario nobody can pass, or one anybody can pass with a lazy answer, cannot be added.** The ceiling was the instrument. Fixing it was worth more than any model swap.

## Where the models get it right

The journey suite is the current test: 27 scenarios in a fake world, each sampled three times. A scenario is a person's request and a small world with real tool results: flights, hotels, weather, a browser, a calendar, tasks, memory, a finance service. A run passes only when every check passes: the calls made, the world afterwards, the final answer, no invented tools, no repeated calls.

<div class="heat" role="img" aria-label="Journey accuracy by category for the 8B and 35B models with thinking off and on">
<div class="hh"></div><div class="hh">8B fast</div><div class="hh">8B thinking</div><div class="hh">35B fast</div><div class="hh">35B thinking</div>
<div class="hl">Travel</div><div class="hc" style="--r:0.67">12/18</div><div class="hc" style="--r:0.61">11/18</div><div class="hc hi" style="--r:1.00">18/18</div><div class="hc" style="--r:0.67">12/18</div>
<div class="hl">Browser</div><div class="hc" style="--r:0.53">8/15</div><div class="hc" style="--r:0.80">12/15</div><div class="hc" style="--r:0.80">12/15</div><div class="hc" style="--r:0.80">12/15</div>
<div class="hl">MCP tools</div><div class="hc" style="--r:0.22">6/27</div><div class="hc" style="--r:0.56">15/27</div><div class="hc hi" style="--r:1.00">27/27</div><div class="hc hi" style="--r:1.00">27/27</div>
<div class="hl">Tasks</div><div class="hc z" style="--r:0.00">0/15</div><div class="hc" style="--r:0.20">3/15</div><div class="hc" style="--r:0.60">9/15</div><div class="hc" style="--r:0.80">12/15</div>
<div class="hl">Memory</div><div class="hc hi" style="--r:1.00">6/6</div><div class="hc" style="--r:0.83">5/6</div><div class="hc hi" style="--r:1.00">6/6</div><div class="hc hi" style="--r:1.00">6/6</div>
</div>

Each cell is passes out of samples: 6 journeys in travel, 5 in browser, 9 in MCP, 5 in tasks and 2 in memory, each run three times.

These are Qwen3 8B and Qwen3.6 35B-A3B, with thinking off and on. The scores are the suite's own short prompt. The faster challenger, Gyro-S, passed 71 of 81 with the same prompt; with the agent's production prompt it falls to 62, while the 35B stays at 72. The 8B production run is still missing. The prompt is part of the result, not a neutral wrapper. One caveat: the 8B ran on Ollama and the 35B and Gyro-S on Strata, so the model and the engine changed together. The 35B against Gyro-S is the clean comparison; the 8B's gap is large enough that I do not think the engine explains all of it, but I have not separated the two. The [benchmarks series](/blog/benchmarks-rtx-3080) has the speed side, and its [post 7](/blog/benchmarks-rtx-3080/does-bigger-pay-off) records the earlier decision suite.

Three things jump out. **The large model is not a small gain: 72 of 81 against 32.** The widest gap is MCP tool use, 27 of 27 against 6. **Thinking is not a free win.** It lifts the 8B from 32 to 46 and costs about seven times the wall time; it lowers the 35B from 72 to 69 and costs about 2.5 times. The 8B with thinking is still worse than the 35B without. **Planning is the hard part.** "Plan my week" failed every 8B and 35B-fast run and passed one of three for Gyro-S; the failure is not calling a tool, it is putting the dentist on the calendar and noticing the clash with the design review.

## What it changed

<ol class="timeline">
<li><b>Measure before building.</b> The plan to supervise tasks started by measuring the three judgements it would rest on.</li>
<li><b>The classifier stays a hint.</b> A small classifier labelled requests by shape. It was 0.97 confident on "plan my gameweek" and 0.96 confident on the same request with "in 1 minute" added, but labelled it conversation. A label cannot decide whether to run work now, later or never, so the conversation decides and the label only suggests.</li>
<li><b>A suite built and removed the same day.</b> It tested supervisors answering questions, until the design dropped that idea.</li>
<li><b>Models compared.</b> A small local model against a large candidate on the whole suite.</li>
<li><b>The ceiling was the instrument.</b> Unreachable cases left out, a 95% interval over cases, and regression tests for the suite itself.</li>
<li class="end"><b>Journeys.</b> A fake world, 27 scenarios, 3 samples. The 35B passed 72, Gyro-S 71, the 8B 32.</li>
</ol>

## Decisions that held

| Decision | Why |
|---|---|
| Each case lists every acceptable decision | There is often more than one right answer, such as ask or start |
| A held-out set for every suite | 30 start cases, 12 routing, 12 delegate, 10 journeys; so I do not tune on the cases I score |
| Three samples per case | A difference of one or two cases between runs is not a result |
| A case no model can pass is not a score | Mark it unreachable and leave it out. The old suite's hardest category included cases no skill matched |
| The interval comes from the cases, not the samples | Three repeats of one case are not three independent cases |
| Every scenario carries an oracle, and a lazy answer must fail | A scenario nobody can pass, or one anybody can pass with "done", is a broken test |
| Check the calls, the world and the answer | A right first move can still leave the task undone |
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

Most comparisons of these are written by vendors, so I only kept the shape of each. I wrote my own because the thing I needed to check is one decision in my own system, and its cases are mine. The cost is that nothing outside the suite can tell me it is wrong. The regression tests are the inside check: they make a case nobody can pass, or one anybody can pass with a lazy answer, fail before a model is called.

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory ([post 2](/blog/wtf-is-agent/memory)) | Built, traceable; two memory journeys pass, but there is no memory benchmark | <span class="pill warn">thin</span> |
| Tools ([post 3](/blog/wtf-is-agent/the-toolbox)) | Journey suite measures discovery, chaining and failure: 27/27 on the 35B, 6/27 on the 8B. Code-over-tools still unevaluated | <span class="pill good">measured</span> |
| Harness, context, skills (posts [4](/blog/wtf-is-agent/the-harness) and [5](/blog/wtf-is-agent/context-and-skills)) | Journeys exercise retries, a down tool and a form; the skill gain is still not re-measured | <span class="pill warn">thin</span> |
| Runtime and sandbox ([post 6](/blog/wtf-is-agent/runtime-and-sandbox)) | Not exercised by the journeys; code mode still not evaluated on real requests | <span class="pill bad">no eval</span> |
| Waking and asking ([post 7](/blog/wtf-is-agent/autonomy-and-governance)) | Asking is measured and mixed: the 35B fast asks before an ambiguous booking; Gyro-S books it; the 8B sends an email without the address | <span class="pill warn">partly checked</span> |
| Start decisions | The old suite's 9/24 ceiling was a case-counting fault and is fixed; journeys are now the main test | <span class="pill good">fixed</span> |
| Journeys | 27 scenarios, 3 samples: 35B 72/81, Gyro-S 71/81, 8B 32/81 | <span class="pill good">new</span> |

**Verdict: the instrument was the weakest part, and fixing it changed the answer.** One suite demoted the classifier; the corrected one demoted the 8B. The 35B is worth its cost on multi-step tool work: 72 of 81 against 32, and the gap is tool use and planning, not small talk. Memory and the toolbox's code mode still need their own evals; code mode has none. But the biggest lesson is the one I keep relearning: **check the test before you trust the score.** The 9 of 24 was not a model ceiling. It was the suite counting cases no model could pass. Next: the finale, everything I built and then deleted.
