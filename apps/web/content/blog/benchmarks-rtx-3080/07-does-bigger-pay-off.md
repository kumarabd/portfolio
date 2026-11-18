---
title: Does a bigger model pay off?
summary: Speed is settled, so I measured decisions. The earlier suite said stay on the 8B, but its 9 of 24 ceiling was a measurement fault; the corrected journey suite reverses the verdict.
verdict: Stay on the 35B: on the corrected journey suite it passes 72 of 81 and the 8B 32 of 81. The earlier suite's 9 of 24 ceiling was a measurement fault, and the analysis below is kept as its record.
date: 2026-11-11
---

> **Update, 18 Nov:** The "9 of 24" ceiling below was not a model limit. The cases in that category that no skill matched could not be passed by any model, and triage was also scoring capability and live-data cases it has no tools for. The corrected suite drops unreachable cases and adds a 95% interval; the new journey suite checks what the agent actually does. On 27 journeys, the 35B passes 72 of 81 and the 8B 32 of 81, so the verdict below is reversed. See [Knowing it works: evals](/blog/wtf-is-agent/knowing-it-works). The analysis below is kept as the record of the earlier suite.

[Post 5](/blog/benchmarks-rtx-3080/raw-speed) left the 35B model at 1.8× slower generation and 5.4× slower prompts than the 8B. That is only worth paying if its answers are better. So I stopped measuring speed and measured **decisions**, with the suite from [post 2](/blog/benchmarks-rtx-3080/the-tests).

<div class="stats">
<div><b>58.9<small>%</small></b><span>35B-A3B on the decision suite, 258 of 438</span></div>
<div><b>62.8<small>%</small></b><span>Qwen3 8B, 275 of 438 (61.6% on a repeat run)</span></div>
<div><b>2.2–2.5×</b><span>longer to run the whole suite on the 35B: 128 min against 52 and 57</span></div>
<div><b>9 / 24</b><span>"start a task now" score that no run ever beat by more than one</span></div>
</div>

| Setup | Decisions correct | Suite time | |
|---|---|---|---|
| Qwen3 8B on Ollama | 62.8% and 61.6% (two runs) | 52 and 57 min | <span class="pill good">keep</span> |
| 35B-A3B on Strata | 58.9% | 128 min | <span class="pill bad">not worth it</span> |
| Goal: fully local agents | hardware fits and is fast enough | decision quality unproven | <span class="pill warn">partly there</span> |


<ol class="timeline">
<li><b>Baseline.</b> Qwen3 8B through Ollama, fast and thinking.</li>
<li><b>Candidate.</b> Qwen3.6 35B-A3B on Strata, same suites.</li>
<li class="end"><b>Baseline again.</b> Same 8B, same suites, to measure run-to-run noise.</li>
</ol>

## Result 1: accuracy

<div class="chart">
<div class="cap">Share of samples correct <small>8B bars show the mean of two runs; the values show run 1 and run 2</small></div>
<div class="row"><span class="k">Triage · fast, 8B</span><span class="bar a2"><i style="--w:53.1%"></i></span><span class="v">52 · 50</span></div>
<div class="row"><span class="k">Triage · fast, 35B</span><span class="bar a4"><i style="--w:52.1%"></i></span><span class="v">50</span></div>
<div class="row"><span class="k">Triage · thinking, 8B</span><span class="bar a2"><i style="--w:49%"></i></span><span class="v">47 · 47</span></div>
<div class="row"><span class="k">Triage · thinking, 35B</span><span class="bar a4"><i style="--w:54.2%"></i></span><span class="v">52</span></div>
<div class="row"><span class="k">Freeform · fast, 8B</span><span class="bar a2"><i style="--w:65.6%"></i></span><span class="v">63 · 63</span></div>
<div class="row"><span class="k">Freeform · fast, 35B</span><span class="bar a4"><i style="--w:51%"></i></span><span class="v">49</span></div>
<div class="row"><span class="k">Freeform · thinking, 8B</span><span class="bar a2"><i style="--w:63%"></i></span><span class="v">62 · 59</span></div>
<div class="row"><span class="k">Freeform · thinking, 35B</span><span class="bar a4"><i style="--w:55.2%"></i></span><span class="v">53</span></div>
<div class="row"><span class="k">Delegate, 8B</span><span class="bar a2"><i style="--w:94.4%"></i></span><span class="v">51 · 51 of 54</span></div>
<div class="row"><span class="k">Delegate, 35B</span><span class="bar a4"><i style="--w:100%"></i></span><span class="v">54 of 54</span></div>
<div class="legend"><span><i style="--bg:#4338ca"></i>Qwen3 8B on Ollama</span><span><i style="--bg:#a16207"></i>35B-A3B on Strata</span></div>
</div>

| Suite | 8B run 1 | 8B run 2 | 35B | 35B vs 8B |
|---|---|---|---|---|
| Triage, fast | 52 | 50 | 50 | <span class="pill">level</span> |
| Triage, thinking | 47 | 47 | 52 | <span class="pill good">+5</span> |
| Freeform, fast | 63 | 63 | 49 | <span class="pill bad">−14</span> |
| Freeform, thinking | 62 | 59 | 53 | <span class="pill bad">−6 to −9</span> |
| Delegate | 51 | 51 | 54 | <span class="pill good">+3</span> |
| **All, of 438** | 275 | 270 | 258 | <span class="pill bad">−12 to −17</span> |

The two 8B runs differ by up to 3 samples on a suite, so anything smaller than that is noise. By that measure the 35B wins two suites, ties one and loses two, and loses overall.

### Where the 35B loses

Freeform, fast, by category:

| Category | Samples | 8B | 35B |
|---|---|---|---|
| Live data (weather, scores, news, web search) | 15 | 15 | <span class="pill bad">0</span> |
| Schedule for later | 12 | 3 | 6 |
| Wake an existing task | 6 | 6 | 3 |
| Capability questions | 12 | 12 | 12 |
| Answer directly | 12 | 12 | 12 |
| Start a task now | 24 | 9 | 9 |
| Other | 15 | 6 | 7 |

**The entire deficit is one category.** The 35B scored 0 of 15 on live-data requests, in both fast and thinking modes, and the 8B scored 15 and 14. Elsewhere it is mixed: better at scheduling, worse at waking tasks. Because the model and the engine changed together, I cannot say whether this is the model's behaviour or the engine's chat template. That is a limit of this comparison, not a finding about the model.

### The 9 of 24 that never moved

<div class="chart">
<div class="cap">"Start a task now" cases correct <small>24 samples, every run</small></div>
<div class="row"><span class="k">8B, four runs</span><span class="bar a2"><i style="--w:37.5%"></i></span><span class="v">9 · 9 · 9 · 9</span></div>
<div class="row"><span class="k">35B, four runs</span><span class="bar a4"><i style="--w:37.5%"></i></span><span class="v">9 · 9 · 9 · 10</span></div>
</div>

Both models, both engines, both modes landed on 9 of 24 in 11 of 12 runs. When two very different models hit the same ceiling, the problem is not the model. The failures are all "started a task but chose no skill", for requests like a goal or a league comparison. That points at the suite's expectations or the skill catalog, and fixing it is worth more than any model swap. It also means every score above is capped.

## Result 2: speed, in the setting that matters

| Suite | Seconds per case: 8B | 35B | |
|---|---|---|---|
| Triage, fast | 0.8 · 1.7 | 2.4 | <span class="pill bad">1.4–3×</span> |
| Triage, thinking | 7.2 · 6.3 | 39.8 | <span class="pill bad">5.5–6.3×</span> |
| Freeform, fast | 3.1 · 3.1 | 15.9 | <span class="pill bad">5.1×</span> |
| Freeform, thinking | 20.9 · 24.0 | 20.7 | <span class="pill good">level</span> |
| Delegate | 0.8 · 0.8 | 1.8 | <span class="pill bad">2.3×</span> |

Thinking is cheap for the 8B (about 9× the fast time on triage) and very expensive for the 35B (about 17×). The large freeform gap in fast mode has a cause from [post 6](/blog/benchmarks-rtx-3080/engines-head-to-head): in my run Strata did not reuse the 10k-token catalog between turns, so every case re-read it. That, not generation speed, is why freeform takes 5× longer.

## Gotchas

| Gotcha | Effect |
|---|---|
| Model and engine changed together | Accuracy differences cannot be attributed to the model alone |
| Three samples, two baseline runs | Anything under 3 samples on a suite is noise |
| Triage has no home for two categories | Capability and live-data cases scored 0 for both models in every triage run, so those 27 of 96 samples look unwinnable by design and triage tops out near 69 |
| Token counts differ | The same freeform prompt reports about 9.6k tokens on one setup and 15.9k on the other, so token figures are not comparable |
| Two skipped model families | Qwen3-30B-A3B and gpt-oss-20b were never run ([post 5](/blog/benchmarks-rtx-3080/raw-speed)) |

## Where it stands, and my verdict

Every post so far, answered:

| Post | Question | Answer |
|---|---|---|
| 1 | Is decode bandwidth-bound on this card? | Yes. It runs at 53 to 79% of the 151 tok/s ceiling <span class="pill good">held</span> |
| 3 | Which engine and why? | Ollama, because vLLM wants the whole card <span class="pill good">held</span> |
| 4 | Can I predict fit? | Yes, to within 0.7 GiB at 40k <span class="pill good">held</span> |
| 5 | What limits prompt processing? | Not FP16. 4-bit kernels beat my ceiling by 25% <span class="pill bad">corrected</span> |
| 6 | What does Ollama cost? | 2 to 8% decode, under 6% first token <span class="pill good">small</span> |
| 7 | Does a bigger model pay off? | No <span class="pill bad">not worth it</span> |

The four setups side by side:

| Setup | Decode at 1k | Cold first token, 8k | Suite score | Suite time |
|---|---|---|---|---|
| Qwen3 8B, Ollama | 101.3 tok/s | 1.88 s | 62.8% · 61.6% | 52 · 57 min |
| Qwen3 8B, llama.cpp server | 109.2 tok/s | 1.85 s | not run | |
| 35B-A3B, llama.cpp, best split | 67.5 tok/s | not measured | not run | |
| 35B-A3B, Strata | 54.1 tok/s | 4.58 s | 58.9% | 128 min |

### The goal, scored

Back to the criteria from [post 1](/blog/benchmarks-rtx-3080/the-chip-and-the-goal):

| Criterion | Result | |
|---|---|---|
| Fits, resident, shareable | One 8B model resident at 40k context, 8.3 GB. Everything else moved to the CPU | <span class="pill good">met, with one LLM</span> |
| Fast enough | About 90 to 109 tok/s, 0.36 s to the first token at 1k, 0.16 to 0.20 s warm | <span class="pill good">met</span> |
| Decisions I would trust | 61.6 to 62.8% on my suite, capped by a 9 of 24 ceiling I have not yet explained | <span class="pill warn">not yet</span> |
| Easy to run | One Ollama deployment, but it ties up the GPU for the one model | <span class="pill good">met</span> |

**Verdict: stay on Qwen3 8B on Ollama.** The 35B model is no better on my workload (58.9% against 61.6 to 62.8%), takes more than twice as long, and in my run its engine did not reuse a prompt. It wins two suites by margins near the noise and loses a whole category I could not explain.

For the goal itself, **the hardware is not the blocker.** The card runs an 8B model fully resident, at interactive speed, with 40k context, and the series' physics predicted that within a known margin. What is unproven is decision quality, and the suite that would settle it has a ceiling I have not found yet. So the honest status of "fully local personal agents" is: possible on this card, not yet trustworthy.

What I would do next, in order of value:

1. **Fix the 9 of 24 ceiling.** It caps every model and is almost certainly the suite or the skill catalog.
2. **Rerun the 35B on llama.cpp with the same chat template**, to separate model from engine on the live-data failure.
3. **Run the two skipped model families** through the speed sweep and the decision suite.
4. **Measure system RAM bandwidth**, to put a ceiling under the CPU-expert speeds.
5. **Put a small, fast candidate through the same suite.** The 8B is the only model that has fitted beside the rest of the stack, so a faster model of that size is the experiment that could change this verdict.

I started with a card on paper and have reached a decision, for now. The question I began with, "which model is fastest?", was the wrong one. Speed never changed the answer. Decision quality per second of agent time did.
