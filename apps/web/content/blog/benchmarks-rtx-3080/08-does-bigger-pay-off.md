---
title: Does a bigger model pay off?
summary: Speed is not the question that matters. I ran my agent's decision suite on Qwen3 8B and on a 35B mixture-of-experts model, then put every number from the series in one place.
date: 2026-11-16
---

Post 7 left a doubt. The 35B mixture-of-experts model runs on this card, but at 1.8× slower generation and 5.4× slower prompts than the 8B. That is only worth paying if its answers are better. So I stopped measuring speed and measured **decisions**.

<div class="stats">
<div><b>58.9<small>%</small></b><span>35B-A3B on the decision suite, 258 of 438</span></div>
<div><b>62.8<small>%</small></b><span>Qwen3 8B, 275 of 438 (61.6% on a repeat run)</span></div>
<div><b>2.2–2.5×</b><span>longer to run the whole suite on the 35B: 128 min against 52 and 57</span></div>
<div><b>42×</b><span>slower to re-read a 10k-token prompt it has seen before, on the new engine</span></div>
</div>

## What I ran, and why

My agent harness makes one decision when a request arrives: **start a task with a skill, ask a question, schedule it for later, answer directly, or do the work itself.** A wrong decision wastes a whole run, so this is the model behaviour I care about most, and it is a better test than any leaderboard.

| Suite | Cases | What it asks | Modes |
|---|---|---|---|
| Triage | 32 × 3 samples | Pick one of nine decisions from a short prompt | fast, thinking |
| Freeform | 32 × 3 samples | The same decisions with the full tool catalog in context (about 10k tokens) | fast, thinking |
| Delegate | 18 × 3 samples | Act, delegate, ask, schedule or answer | fast |

Each case is run three times, so a suite is 96 samples (54 for delegate). I ran the 8B twice to see how much a result moves by itself.

<ol class="timeline">
<li><time>Nov 11</time><b>Baseline.</b> Qwen3 8B through Ollama, fast and thinking.</li>
<li><time>Nov 11</time><b>Candidate.</b> Qwen3.6 35B-A3B on a different engine, Strata, with the same suites.</li>
<li><time>Nov 11</time><b>Baseline again.</b> Same 8B, same suites, to measure run-to-run noise.</li>
<li class="end"><time>Nov 16</time><b>Candidate speed.</b> The Strata engine through the same speed harness as post 7.</li>
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

| Category | Cases × 3 | 8B | 35B |
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

Thinking is cheap for the 8B (about 9× the fast time on triage) and very expensive for the 35B (about 17×). And the large freeform gap in fast mode has a specific cause, found in the engine's own speed run:

<div class="chart">
<div class="cap">Seconds to the first token on a prompt it has seen before <small>Warm start: what an agent loop sees when it resends the same system prompt</small></div>
<div class="row"><span class="k">8B on Ollama, 1k</span><span class="bar a2"><i style="--w:1.9%"></i></span><span class="v">0.16</span></div>
<div class="row"><span class="k">35B on Strata, 1k</span><span class="bar a4"><i style="--w:9.1%"></i></span><span class="v">0.75</span></div>
<div class="row"><span class="k">8B on Ollama, 14k</span><span class="bar a2"><i style="--w:2.4%"></i></span><span class="v">0.20</span></div>
<div class="row"><span class="k">35B on Strata, 14k</span><span class="bar a4"><i style="--w:100%"></i></span><span class="v">8.27</span></div>
<div class="legend"><span>Axis 0 to 8.3 s</span></div>
</div>

On Strata a warm first token costs the same as a cold one at every length (4.58 s against 4.58 s at 8k), so it does not reuse the cached prompt. Ollama does, which is why its warm figure stays near 0.2 s. For an agent that resends a 10k-token catalog every turn, that is a **42× difference** at 14k. This, not generation speed, is why the freeform suite takes 5× longer.

The generation speed of the 35B on this engine compares like this:

| | 8B, Ollama | 35B, llama.cpp (best split) | 35B, Strata |
|---|---|---|---|
| Decode at 1k | 101.3 tok/s | 67.5 tok/s (empty context) | 54.1 tok/s |
| Decode at 14k | 80.2 tok/s | not measured | 44.2 tok/s |
| First token, cold, 8k | 1.88 s | not measured | 4.58 s |
| Prompt speed, long context | 4,224 tok/s (llama-bench) | 840 tok/s | about 1,300 tok/s |
| Aggregate, 4 in flight | 77 tok/s | not measured | 47 tok/s, flat |

Strata processes long prompts about 1.5 times faster than llama.cpp's best split on the same model, and generates about 20% slower. The quantizations differ, so treat that as a rough comparison.

## Limits and gotchas

| Gotcha | Effect |
|---|---|
| Model and engine changed together | Accuracy differences cannot be attributed to the model alone |
| Three samples, two baseline runs | Anything under 3 samples on a suite is noise |
| A shared GPU | The speed run needs `ollama ps` empty first, and the pod deleted afterwards |
| The engine plans from the whole node's RAM | The pod has no memory limit, which is a real risk on a shared node |
| First start downloads the model | A 40 GiB volume claim and a long first boot |
| Token counts differ | The same freeform prompt reports about 9.6k tokens on one setup and 15.9k on the other, so token figures are not comparable |
| Triage has no home for two categories | Capability and live-data cases scored 0 for both models in every triage run, so those 27 of 96 samples look unwinnable by design and triage tops out near 69 |
| Two skipped model families | Qwen3-30B-A3B and gpt-oss-20b were never run (post 7) |

## Where it stands, and my verdict

Every post in the series, answered:

| Post | Question | Answer |
|---|---|---|
| 1 | Is decode bandwidth-bound on this card? | Yes. It runs at 53 to 79% of the 151 tok/s ceiling <span class="pill good">held</span> |
| 4 | Can I predict whether it fits? | Yes, to within 0.7 GiB at 40k <span class="pill good">held</span> |
| 5 | What limits prompt processing? | Not FP16. 4-bit kernels beat my ceiling by 25% <span class="pill bad">corrected</span> |
| 6 | Which engine for this box? | Ollama, for operations, not speed <span class="pill good">held</span> |
| 7 | What does Ollama cost? | 2 to 8% decode, under 6% first token <span class="pill good">held</span> |
| 7 | Can a 35B model run here? | Yes, at 67.5 tok/s, with experts on CPU <span class="pill good">held</span> |
| 8 | Does it pay off? | No <span class="pill bad">not worth it</span> |

The four setups side by side:

| Setup | Decode at 1k | Cold first token, 8k | Suite score | Suite time |
|---|---|---|---|---|
| Qwen3 8B, Ollama | 101.3 tok/s | 1.88 s | 62.8% · 61.6% | 52 · 57 min |
| Qwen3 8B, llama.cpp server | 109.2 tok/s | 1.85 s | not run | |
| 35B-A3B, llama.cpp, best split | 67.5 tok/s | not measured | not run | |
| 35B-A3B, Strata | 54.1 tok/s | 4.58 s | 58.9% | 128 min |

**Verdict: stay on Qwen3 8B on Ollama.** The 35B model is no better on my workload (58.9% against 61.6 to 62.8%), takes more than twice as long, and its engine cannot reuse a prompt, which is the main cost in an agent loop. It wins on two suites by margins close to the noise, and loses a whole category I could not explain. A file 4.4× larger, much of it living in system RAM, is a lot to pay for that.

What I would do next, in order of value:

1. **Fix the 9 of 24 ceiling.** It caps every model and is almost certainly the suite or the skill catalog.
2. **Rerun the 35B on llama.cpp with the same chat template**, to separate the model from the engine on the live-data failure.
3. **Run the two skipped families**, Qwen3-30B-A3B and gpt-oss-20b, through both the speed sweep and the decision suite.
4. **Measure system RAM bandwidth**, to put a ceiling under the CPU-expert speeds.

The series started with a card on paper and ends with a decision. The most useful result was not a number. It was that the question I started with, "which model is fastest?", was the wrong one: speed did not change the answer, accuracy per second of agent time did.
