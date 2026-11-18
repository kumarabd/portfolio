---
title: Engines head to head
summary: Ollama against the llama.cpp server underneath it, then a third engine that did not reuse a prompt in my run. Decode speed, first-token time and load.
verdict: Stay on Ollama: it costs 2 to 8% decode speed. In my run Strata did not reuse a prompt, which made a warm start 42x slower.
date: 2026-11-11
---

[Post 3](/blog/benchmarks-rtx-3080/vllm-first) chose Ollama for operations and left a doubt: does it cost speed compared with the llama.cpp server it runs on? I put the same model, prompts and client in front of both, then later added a third engine.

<div class="stats">
<div><b>2–8%</b><span>decode speed Ollama gives up to llama.cpp</span></div>
<div><b>&lt; 6%</b><span>first-token time Ollama gives up</span></div>
<div><b>2.5×</b><span>aggregate throughput from a 4-slot llama.cpp server</span></div>
<div><b>42×</b><span>slower warm first token on Strata, which did not reuse a prompt in my run</span></div>
</div>

| Engine | Decode at 1k | Warm first token, 14k | 4 requests at once | |
|---|---|---|---|---|
| Ollama, 8B | 101 tok/s | 0.20 s | 77 tok/s aggregate | <span class="pill good">keep</span> |
| llama.cpp server, 8B | 109 tok/s | 0.16 s | 226 tok/s with 4 slots | <span class="pill good">if agents run in parallel</span> |
| Strata, 35B | 54 tok/s | 8.27 s | 47 tok/s, flat | <span class="pill bad">no prompt reuse in this run</span> |


<ol class="timeline">
<li><b>Ollama against llama.cpp</b> on Qwen3 8B, then llama.cpp with 4 parallel slots.</li>
<li class="end"><b>A third engine, Strata</b>, running the 35B mixture-of-experts model, through the same harness.</li>
</ol>

## Ollama against llama.cpp

Same model, same prompts, same client:

| Context | Prompt tokens | Decode: Ollama | Decode: llama.cpp | Cold first token: Ollama | Cold first token: llama.cpp |
|---|---|---|---|---|---|
| 1k | about 800 | 101.3 tok/s | 109.2 tok/s <span class="pill good">+7.8%</span> | 0.356 s | 0.350 s |
| 8k | 6,138 | 89.0 tok/s | 93.0 tok/s <span class="pill good">+4.5%</span> | 1.879 s | 1.854 s |
| 14k | about 10,460 | 80.2 tok/s | 82.0 tok/s <span class="pill good">+2.1%</span> | 3.430 s | 3.253 s |

A warm first token (the same prompt again, which is what an agent resending its system prompt sees) is 0.16 to 0.20 s on both. Against the 151 tok/s ceiling from [post 5](/blog/benchmarks-rtx-3080/raw-speed):

<div class="chart">
<div class="cap">Decode speed against the bandwidth ceiling <small>Qwen3 8B Q4_K_M; the line is 151 tok/s</small></div>
<div class="row"><span class="k">Ceiling</span><span class="bar"><i style="--w:100%"></i></span><span class="v">151</span></div>
<div class="row"><span class="k">llama-bench, empty</span><span class="bar a3"><i style="--w:79%"></i><u style="--at:100%"></u></span><span class="v">119.3 · 79%</span></div>
<div class="row"><span class="k">llama-server, 1k</span><span class="bar a2"><i style="--w:72.3%"></i><u style="--at:100%"></u></span><span class="v">109.2 · 72%</span></div>
<div class="row"><span class="k">Ollama, 1k</span><span class="bar a4"><i style="--w:67.1%"></i><u style="--at:100%"></u></span><span class="v">101.3 · 67%</span></div>
<div class="row"><span class="k">llama-server, 14k</span><span class="bar a2"><i style="--w:54.3%"></i><u style="--at:100%"></u></span><span class="v">82.0 · 54%</span></div>
<div class="row"><span class="k">Ollama, 14k</span><span class="bar a4"><i style="--w:53.1%"></i><u style="--at:100%"></u></span><span class="v">80.2 · 53%</span></div>
</div>

Speed falls as context grows because every generated token must also read the whole KV cache, so the bytes per token rise even though the weights do not. The gap between engines shrinks for the same reason: at long context the KV reads dominate and the engine matters less.

## Concurrency is where the gap opens

<div class="chart">
<div class="cap">Aggregate tokens per second with N requests in flight <small>1k-token prompts</small></div>
<div class="row"><span class="k">Ollama, 1 / 2 / 4</span><span class="bar a4"><i style="--w:33%"></i></span><span class="v">83 · 75 · 77</span></div>
<div class="row"><span class="k">llama-server, default</span><span class="bar a2"><i style="--w:35%"></i></span><span class="v">79 · 82 · 82</span></div>
<div class="row"><span class="k">llama-server, 4 slots</span><span class="bar a3"><i style="--w:98%"></i></span><span class="v">89 · 158 · 226</span></div>
<div class="legend"><span>Bars show the 4-in-flight case. Axis 0 to 230 tok/s</span></div>
</div>

With one slot per model, extra requests queue and aggregate speed stays flat near 80 tok/s. With four slots, 4 requests in flight deliver **226 tok/s, 2.5 times a single stream**, while each request slows from 89 to about 57 tok/s. One pass over the weights can serve several streams, so batching buys throughput at the cost of per-request speed. The 4-slot run covered only the 1k context point.

## A third engine: Strata

In a later run I ran Strata, a CUDA inference engine, on the 35B model through the same harness. The model differs from the other runs, so compare engine behaviour and not absolute speed.

| | Ollama, 8B | llama.cpp, 35B best split | Strata, 35B |
|---|---|---|---|
| Decode at 1k | 101.3 tok/s | 67.5 tok/s | 54.1 tok/s |
| Decode at 14k | 80.2 tok/s | not measured | 44.2 tok/s |
| Cold first token, 8k | 1.88 s | not measured | 4.58 s |
| Warm first token, 14k | 0.20 s | not measured | 8.27 s |
| Aggregate, 4 in flight | 77 tok/s | not measured | 47 tok/s, flat |

<div class="chart">
<div class="cap">Seconds to the first token on a prompt it has seen before <small>Warm start: what an agent loop sees when it resends the same system prompt</small></div>
<div class="row"><span class="k">8B on Ollama, 1k</span><span class="bar a2"><i style="--w:1.9%"></i></span><span class="v">0.16</span></div>
<div class="row"><span class="k">35B on Strata, 1k</span><span class="bar a4"><i style="--w:9.1%"></i></span><span class="v">0.75</span></div>
<div class="row"><span class="k">8B on Ollama, 14k</span><span class="bar a2"><i style="--w:2.4%"></i></span><span class="v">0.20</span></div>
<div class="row"><span class="k">35B on Strata, 14k</span><span class="bar a4"><i style="--w:100%"></i></span><span class="v">8.27</span></div>
<div class="legend"><span>Axis 0 to 8.3 s</span></div>
</div>

On Strata a warm first token costs the same as a cold one at every length (4.58 s against 4.58 s at 8k). In this run it did not reuse a cached prompt, while Ollama does. I ran only the 35B pack, so I cannot say whether that is the engine, the pack or a setting, and I have not checked. For an agent that resends a 10k-token catalog every turn, that is a **42× difference** at 14k. Strata does process long prompts about 1.5 times faster than llama.cpp's best split (about 1,300 against 840 tok/s) and generates about 20% slower, with a different quantization, so treat that as rough.

### Gotchas

| Gotcha | Effect |
|---|---|
| The GPU is shared | Run `ollama ps` first and make sure it is empty, and delete the benchmark pod afterwards |
| Strata plans from the whole node's RAM | The pod has no memory limit, a real risk on a shared node |
| First start downloads the model | A 40 GiB volume and a long first boot |
| Model differs between engines | Strata ran the 35B model, the others the 8B |

## Where it stands, and my verdict

| Question | Answer | |
|---|---|---|
| Fits | 8B at 40k, 8.3 GB ([post 4](/blog/benchmarks-rtx-3080/fitting-a-model)) | <span class="pill good">held</span> |
| Generation | 79% of the ceiling empty, 53 to 72% in real use | <span class="pill good">held</span> |
| Prompt speed | Over 4,000 tok/s, ceiling assumption was wrong ([post 5](/blog/benchmarks-rtx-3080/raw-speed)) | <span class="pill bad">corrected</span> |
| What does Ollama cost? | 2 to 8% decode, under 6% first token | <span class="pill good">small</span> |
| Can an engine reuse a prompt? | Ollama and llama.cpp yes. Strata, with the 35B pack in this run, no | <span class="pill bad">decides it</span> |

**Verdict: stay on Ollama.** It costs 2 to 8% against the engine underneath, and gives me model management for free. If agents ever run in parallel, a llama-server with 4 slots gives 2.5× the aggregate. Strata, as I ran it, is out for agent loops until a prompt can be reused, because that single behaviour turns a 0.2 s step into 8 s. On the models I have run, speed is settled. Whether a bigger model is worth its cost is a quality question, and that is next.
