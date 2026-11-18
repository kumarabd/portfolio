---
title: A faster challenger: Gyro-S
summary: A small pack on the same engine decodes at 154 tok/s, reuses a prompt in 0.065 s, and passes 71 of 81 journeys. Speed beats Ollama; fit is the open question.
verdict: Gyro-S decodes 1.5 to 1.7 times faster than Ollama's 8B, restarts a known prompt in 0.065 s, and passes 71 of 81 journeys (the 35B 72, the 8B 32). With the production prompt it falls to 62. The speed is the best in the series; the open question is whether it fits beside the stack.
date: 2026-11-16
---

After the 35B, I ran a different kind of candidate: **Gyro-S**, a lighter pack of Qwen3.8-Flash-Next served by the same engine. If the answer to [post 8](/blog/benchmarks-rtx-3080/parallel-and-vision)'s question is a small, fast model, this is the first test of it.

<div class="stats">
<div><b>154 <small>tok/s</small></b><span>decode at 1k context, 1.5 times Ollama's 8B</span></div>
<div><b>0.065 <small>s</small></b><span>to the first token on a prompt it has seen, at every length</span></div>
<div><b>1.7×</b><span>faster than Ollama at 8k context (155 against 89 tok/s)</span></div>
<div><b>3.2 <small>s</small></b><span>cold first token at 8k, slower than Ollama's 1.9 s</span></div>
</div>

| Measured on the same harness | Ollama, 8B | llama.cpp, 8B | Strata, 35B | Strata, Gyro-S | |
|---|---|---|---|---|---|
| Decode at 1k | 101.3 tok/s | 109.2 tok/s | 54.1 tok/s | **153.7 tok/s** | <span class="pill good">fastest</span> |
| Decode at 8k | 89.0 tok/s | 93.0 tok/s | 48.5 tok/s | **154.8 tok/s** | <span class="pill good">fastest</span> |
| Cold first token at 1k | 0.356 s | 0.350 s | 0.754 s | 1.187 s | <span class="pill bad">slowest</span> |
| Cold first token at 8k | 1.879 s | 1.854 s | 4.581 s | 3.213 s | <span class="pill warn">middle</span> |
| Warm first token | 0.16 to 0.20 s | 0.16 to 0.18 s | equal to cold | **0.065 s** | <span class="pill good">fastest</span> |

## Result 1: decode and the physics

<div class="chart">
<div class="cap">Decode speed at 8k context <small>Tokens per second, one stream, same harness for every engine</small></div>
<div class="row"><span class="k">Strata, 35B</span><span class="bar a5"><i style="--w:31.3%"></i></span><span class="v">48.5</span></div>
<div class="row"><span class="k">Ollama, 8B</span><span class="bar a4"><i style="--w:57.5%"></i></span><span class="v">89.0</span></div>
<div class="row"><span class="k">llama.cpp, 8B</span><span class="bar a2"><i style="--w:60%"></i></span><span class="v">93.0</span></div>
<div class="row"><span class="k">Strata, Gyro-S</span><span class="bar a3"><i style="--w:100%"></i></span><span class="v">154.8</span></div>
</div>

[Post 5](/blog/benchmarks-rtx-3080/raw-speed)'s rule says generation cannot exceed bandwidth divided by the bytes read per token. At 154 tok/s on a 760 GB/s card, Gyro-S can read **at most about 4.9 GB per token** (760 ÷ 154). That is below the 5.0 GB of the 8B in [post 5](/blog/benchmarks-rtx-3080/raw-speed), so it either has fewer active weights or fewer bits per weight. The number is a ceiling on its size, not its size, and I do not yet have the real figure.

Decode also dipped at 4k (133 tok/s) between two runs near 154. I have not explained it, and it may be noise at three repetitions.

## Result 2: a prompt it has seen

<div class="chart">
<div class="cap">Seconds to the first token, a prompt seen before <small>Warm start: what an agent loop sees when it resends the same system prompt</small></div>
<div class="row"><span class="k">Strata, 35B, 8k</span><span class="bar a5"><i style="--w:100%"></i></span><span class="v">4.58</span></div>
<div class="row"><span class="k">Ollama, 8B, 8k</span><span class="bar a4"><i style="--w:4%"></i></span><span class="v">0.18</span></div>
<div class="row"><span class="k">Gyro-S, 8k</span><span class="bar a3"><i style="--w:1.4%"></i></span><span class="v">0.065</span></div>
<div class="legend"><span>Axis 0 to 4.6 s</span></div>
</div>

[Post 6](/blog/benchmarks-rtx-3080/engines-head-to-head) found that Strata could not reuse a prompt, and that this made the 35B a poor fit for agent loops. **Gyro-S does reuse it**: the warm first token is 0.065 s at 1k, 4k and 8k alike, against 1.19 to 3.21 s cold. So the engine can do it. Whether the 35B pack cannot, or was simply run without it, I have not checked, and that changes what [post 6](/blog/benchmarks-rtx-3080/engines-head-to-head) should say about Strata.

The cost is the cold read: Gyro-S takes 1.19 s for an 800-token prompt where Ollama takes 0.36 s. For an agent that mostly resends a long prompt, warm start is the number that matters. For one that starts fresh every time, it is the cold one.

## Result 3: decisions

The corrected journey suite (27 scenarios, 3 samples) and the 15-prompt tool-calling check:

| Check | Gyro-S | 35B-A3B | 8B |
|---|---|---|---|
| Journeys, suite prompt | 71/81 (88%) | 72/81 (89%) | 32/81 (40%) |
| Journeys, production prompt | 62/81 (77%) | 72/81 (89%) | not run |
| Tool calls (15) | 12/15 off, 14/15 on | 15/15 off, 14/15 on | not run on this check |

Gyro-S is level with the 35B on the journey suite and far ahead of the 8B. Its production-prompt run is 62/81, so the prompt is part of the result. Thinking lifts the tool-call score from 12/15 to 14/15. On the journey suite it is a wash: 69/81 against 71 with the suite prompt, and 66/81 against 62 with the production prompt at 25.7 s a case. The old decision-suite percentages in [post 7](/blog/benchmarks-rtx-3080/does-bigger-pay-off) are superseded; the journey suite is the current measure.

## Gotchas

| Gotcha | Effect |
|---|---|
| One request in flight measured 6.5 tok/s | Two requests measured 65 and four 80. The single figure is about 12 times lower than the others would suggest and I believe it is a stall in that run, not the model. I have not rerun it, so do not quote it |
| Aggregate at four requests (80 tok/s) is below single-stream decode (154) | The throughput test includes reading fresh 1k prompts, which are cold every time, so it measures prompt reading as much as generation |
| Size and quantization unknown | The ceiling above bounds the model, but I cannot say what fits beside the other services |
| Fit not measured | It ran with the rest of the stack paused, as the 35B did. Whether it can coexist is the next experiment |

## Where it stands, and my verdict

The setups against the criteria from [post 1](/blog/benchmarks-rtx-3080/the-chip-and-the-goal):

| Setup | Decode at 1k | Warm first token | Decisions | Resident beside the stack |
|---|---|---|---|---|
| Qwen3 8B, Ollama | 101 tok/s | 0.16 s | 32/81 journeys | <span class="pill good">yes</span> |
| Qwen3 8B, llama.cpp | 109 tok/s | 0.16 s | not run | <span class="pill good">yes</span> |
| 35B, Strata | 54 tok/s | 0.75 s | 72/81 journeys | <span class="pill bad">no</span> |
| Gyro-S, Strata | 154 tok/s | 0.065 s | 71/81 journeys; 62/81 with the production prompt | <span class="pill warn">not measured</span> |

The decision column uses the corrected journey suite (27 scenarios, 3 samples), not the old decision suite; [post 7](/blog/benchmarks-rtx-3080/does-bigger-pay-off) has the update.

**Verdict: the best speed result of the series, and the first candidate that is also as good as the 35B on decisions.** Gyro-S beats the 8B on decode and on warm start, and the engine can reuse a prompt after all. It passes 71 of 81 journeys, level with the 35B's 72 and far ahead of the 8B's 32; with the production prompt it falls to 62, so the prompt matters too. It has not been shown to fit beside the stack. The next experiment is fit, not quality.
