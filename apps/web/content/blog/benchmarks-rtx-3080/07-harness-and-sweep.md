---
title: A harness, then the sweep
summary: Three small scripts, 15 planned configurations and one question from last time answered with numbers. Raw speed on the 3080, and what it does to the ceilings from posts 1 to 5.
date: 2026-11-16
---

Post 6 ended with a doubt: is Ollama costing me speed compared with the llama.cpp server it runs on? In November I stopped guessing and built the measuring tools first.

<div class="stats">
<div><b>4,580 <small>tok/s</small></b><span>prompt processing, Qwen3 8B fully on the GPU (pp512)</span></div>
<div><b>119 <small>tok/s</small></b><span>generation, same model (tg128)</span></div>
<div><b>79%</b><span>of the 151 tok/s bandwidth ceiling from post 5</span></div>
<div><b>67 <small>tok/s</small></b><span>a 35B mixture-of-experts model with its experts partly on CPU</span></div>
</div>

<ol class="timeline">
<li><time>Nov 9</time><b><code>llm_bench.py</code></b> checks tool-calling quality and latency against any OpenAI-compatible endpoint.</li>
<li><time>Nov 11</time><b><code>engine_bench.py</code> and <code>sweep.sh</code></b> measure engines against each other and sweep the CPU/GPU split on larger models.</li>
<li class="end"><time>Nov 11–16</time><b>Task evals</b> (Nov 11) and a third engine's speed run (Nov 16), asking whether the bigger model also answers better. That is the next post.</li>
</ol>

## The harness

| Script | It measures | The trick that keeps it honest |
|---|---|---|
| `sweep.sh` | Raw speed with `llama-bench`: prompt processing at 512 and 4,096 tokens, generation of 128 | Matches production: flash attention on, q8_0 KV cache. Each config is its own run so one out-of-memory does not abort the rest. Missing model files are skipped, not fatal |
| `engine_bench.py` | Time to first token (cold and warm), decode speed, aggregate speed with 1, 2 and 4 requests in flight | A random nonce leads every cold prompt so no prefix cache can help. Raw completions, so chat templates and thinking mode cannot skew it. Timed on the client with streaming, identically for every engine |
| `llm_bench.py` | 15 agent-shaped tool cases: tool choice, argument accuracy, restraint, parallel calls, a tool-result follow-up | Includes cases where the right answer is *not* to call a tool |

The sweep command, for reference:

```bash
llama-bench -fa 1 -ctk q8_0 -ctv q8_0 -p 512,4096 -n 128 -r 2 \
  -m Qwen3-8B-Q4_K_M.gguf -ngl 99 -t 8
```

## What was actually run

<div class="chart">
<div class="cap">Planned configurations <small>15 planned in <code>sweep.sh</code></small></div>
<div class="row"><span class="k">Produced numbers</span><span class="bar a3"><i style="--w:40%"></i></span><span class="v">6</span></div>
<div class="row"><span class="k">Skipped: model file missing</span><span class="bar a4"><i style="--w:53%"></i></span><span class="v">8</span></div>
<div class="row"><span class="k">Ran, returned nothing</span><span class="bar a5"><i style="--w:7%"></i></span><span class="v">1</span></div>
<div class="legend"><span>Skipped: both Qwen3-30B-A3B and gpt-oss-20b. The empty one was the 35B model with only 24 layers of experts on CPU, which did not fit</span></div>
</div>

So the findings below cover three things: one dense 8B model, one 35B mixture-of-experts model at several CPU/GPU splits, and two engines. The other two model families are untested.

## Result 1: the dense 8B model

| Qwen3 8B Q4_K_M, 4.68 GiB, all layers on GPU | Speed |
|---|---|
| Prompt processing, 512 tokens | 4,580 ± 10 tok/s |
| Prompt processing, 4,096 tokens | 4,224 ± 2 tok/s |
| Generation, 128 tokens | 119.27 ± 0.05 tok/s |

The spread is tiny, which says the harness and the card are stable. Next, generation against the ceiling from post 5 (760 GB/s ÷ 5.02 GB of weights = 151 tok/s):

<div class="chart">
<div class="cap">Generation speed against the bandwidth ceiling <small>Qwen3 8B Q4_K_M, tokens per second; the line is 151, the ceiling</small></div>
<div class="row"><span class="k">Ceiling (post 5)</span><span class="bar"><i style="--w:100%"></i></span><span class="v">151</span></div>
<div class="row"><span class="k">llama-bench, empty context</span><span class="bar a3"><i style="--w:79%"></i><u style="--at:100%"></u></span><span class="v">119.3 · 79%</span></div>
<div class="row"><span class="k">llama-server, 1k context</span><span class="bar a2"><i style="--w:72.3%"></i><u style="--at:100%"></u></span><span class="v">109.2 · 72%</span></div>
<div class="row"><span class="k">Ollama, 1k context</span><span class="bar a4"><i style="--w:67.1%"></i><u style="--at:100%"></u></span><span class="v">101.3 · 67%</span></div>
<div class="row"><span class="k">llama-server, 14k context</span><span class="bar a2"><i style="--w:54.3%"></i><u style="--at:100%"></u></span><span class="v">82.0 · 54%</span></div>
<div class="row"><span class="k">Ollama, 14k context</span><span class="bar a4"><i style="--w:53.1%"></i><u style="--at:100%"></u></span><span class="v">80.2 · 53%</span></div>
</div>

Everything stays under the ceiling, as it should. Speed falls as context grows because every generated token must also read the whole KV cache, so the bytes per token rise even though the weights do not.

## Result 2: Ollama against llama.cpp

Same model, same prompts, same client:

| Context | Prompt tokens | Decode: Ollama | Decode: llama.cpp | Cold first token: Ollama | Cold first token: llama.cpp |
|---|---|---|---|---|---|
| 1k | about 800 | 101.3 tok/s | 109.2 tok/s <span class="pill good">+7.8%</span> | 0.356 s | 0.350 s |
| 8k | 6,138 | 89.0 tok/s | 93.0 tok/s <span class="pill good">+4.5%</span> | 1.879 s | 1.854 s |
| 14k | about 10,460 | 80.2 tok/s | 82.0 tok/s <span class="pill good">+2.1%</span> | 3.430 s | 3.253 s |

A warm first token (same prompt again, what an agent loop resending its system prompt sees) is 0.16 to 0.20 s on both. The gap is small and shrinks as context grows, because at long context the KV reads dominate and the engine matters less.

### Concurrency is where the gap opens

<div class="chart">
<div class="cap">Aggregate tokens per second with N requests in flight <small>1k-token prompts</small></div>
<div class="row"><span class="k">Ollama, 1 / 2 / 4</span><span class="bar a4"><i style="--w:33%"></i></span><span class="v">83 · 75 · 77</span></div>
<div class="row"><span class="k">llama-server, default</span><span class="bar a2"><i style="--w:35%"></i></span><span class="v">79 · 82 · 82</span></div>
<div class="row"><span class="k">llama-server, 4 slots</span><span class="bar a3"><i style="--w:98%"></i></span><span class="v">89 · 158 · 226</span></div>
<div class="legend"><span>Bars show the 4-in-flight case. Axis 0 to 230 tok/s</span></div>
</div>

With one slot per model, extra requests just queue: aggregate speed stays flat at about 80 tok/s. With four slots, 4 requests in flight deliver **226 tok/s, 2.5 times a single stream**, while each request slows from 89 to about 57 tok/s. This is post 5's logic in practice: one pass over the weights can serve several streams, so batching buys throughput at the cost of per-request speed.

## Result 3: a 35B model on a 10 GB card

Qwen3.6 35B-A3B is a mixture-of-experts model: 34.7B parameters in a 20.6 GiB file, but only about 3B are active per token. `-ncmoe N` keeps the experts of the first N layers on the CPU so the rest fits. The more experts on CPU, the slower:

| Experts on CPU (layers) | Prompt 512 | Prompt 4096 | Generation | vs best |
|---|---|---|---|---|
| 24 | no result | no result | no result | <span class="pill bad">did not fit</span> |
| 28 | 852 tok/s | 840 tok/s | 67.5 tok/s | <span class="pill good">best</span> |
| 32 | 784 tok/s | 766 tok/s | 62.6 tok/s | −7% |
| 40 | 670 tok/s | 654 tok/s | 54.0 tok/s | −20% |

### Threads: more is not better

On the best split (28), changing only the CPU thread count:

<div class="chart">
<div class="cap">Generation speed by thread count <small>35B-A3B, 28 layers of experts on CPU; the CPU has 8 physical cores</small></div>
<div class="row"><span class="k">6 threads</span><span class="bar a3"><i style="--w:97.8%"></i></span><span class="v">67.4</span></div>
<div class="row"><span class="k">8 threads</span><span class="bar a3"><i style="--w:98%"></i></span><span class="v">67.5</span></div>
<div class="row"><span class="k">16 threads</span><span class="bar a5"><i style="--w:72.6%"></i></span><span class="v">50.0 · −26%</span></div>
<div class="legend"><span>Prompt processing did not care: 862, 852 and 863 tok/s. Axis 0 to 69 tok/s</span></div>
</div>

Using all 16 hardware threads on 8 physical cores cost a quarter of the generation speed. Generation that runs on the CPU is limited by memory traffic, and extra threads contend for it instead of helping. I did not record system RAM bandwidth, so I cannot give that ceiling yet.

### Dense 8B against the 35B model

| | Qwen3 8B, all GPU | 35B-A3B, best split | Ratio |
|---|---|---|---|
| File size | 4.68 GiB | 20.60 GiB | 4.4× |
| Prompt speed | 4,580 tok/s | 852 tok/s | 5.4× slower |
| Generation | 119.3 tok/s | 67.5 tok/s | 1.8× slower |

## Gotchas along the way

| Gotcha | Effect |
|---|---|
| Qwen3 thinks by default | A chat endpoint spends the token budget on thinking. The engine benchmark uses raw completions so numbers compare |
| Prefix caching | Without a random nonce at the front, "cold" prompts are not cold |
| One OOM aborts a loop | One `llama-bench` run per configuration |
| Only 2 repetitions per config | Dense results are tight (±0.05), but MoE prompt speed varied by up to ±28 tok/s. Treat small gaps there as noise |
| The 4-slot run covered only the 1k context point | No 4-slot numbers at 8k or 14k yet |

## Where it stands, and my verdict

Everything so far against the first six posts:

| Post | Claim | Measured | |
|---|---|---|---|
| 1 | Balance of about 39 FLOP per byte makes decode bandwidth-bound | Decode at 53 to 79% of the bandwidth ceiling | <span class="pill good">held</span> |
| 4 | Weights + KV + 0.5 to 1 GiB overhead | 7.7 GiB predicted, 8.3 measured at 40k (post 6) | <span class="pill good">held</span> |
| 5 | Decode ceiling is bandwidth ÷ weights | 151 tok/s ceiling, best measurement 119.3 | <span class="pill good">held</span> |
| 5 | Prompt processing ceiling about 3,700 to 4,300 tok/s | **4,580 tok/s measured** | <span class="pill bad">wrong</span> |
| 6 | Ollama is enough for this box | Costs 2 to 8% decode and under 6% first-token time | <span class="pill good">held</span> |

**Correcting post 5.** My prompt-processing ceiling assumed the card's FP16 tensor rate of about 60 TFLOPS. This model needs about 16.4 GFLOP per token, so 4,580 tok/s means **about 75 TFLOPS of useful work**, 25% above my ceiling. The likely explanation is that llama.cpp's 4-bit kernels run on the tensor cores' integer path, which has a higher peak than FP16. I have not confirmed this with a profiler. The decode ceiling is unaffected. I have added a correction note to post 5.

**Verdict.**

<div class="stats">
<div><b>Keep Ollama</b><span>its cost is 2 to 8% decode, for operational simplicity</span></div>
<div><b>4 slots</b><span>if agents ever run in parallel, a llama-server with 4 slots gives 2.5× aggregate</span></div>
<div><b>6–8 threads</b><span>never all 16 on the 8-core CPU</span></div>
<div><b>Not yet</b><span>the 35B model: 1.8× slower generation and 5.4× slower prompts, worth it only if answers are better</span></div>
</div>

Whether the 35B model's answers are good enough to pay for that is a quality question, not a speed one, and it is what the next post tests.
