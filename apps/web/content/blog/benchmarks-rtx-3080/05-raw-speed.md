---
title: Raw speed against the ceilings
summary: November 11. The datasheet drew two ceilings. A sweep measured an 8B model and a 35B mixture-of-experts model against them, and one prediction was wrong.
date: 2026-11-11
---

With the model chosen, I wanted to know how close the card gets to what the datasheet allows. I built the sweep from post 2 and ran it with the GPU free.

<div class="stats">
<div><b>4,580 <small>tok/s</small></b><span>prompt processing, Qwen3 8B fully on the GPU</span></div>
<div><b>119 <small>tok/s</small></b><span>generation, same model</span></div>
<div><b>79%</b><span>of the 151 tok/s bandwidth ceiling</span></div>
<div><b>67 <small>tok/s</small></b><span>a 35B mixture-of-experts model with experts partly on CPU</span></div>
</div>

## The physics: two ceilings

Generating a token needs every weight read from memory once, with almost no arithmetic per byte. So the speed limit is bandwidth over weight bytes:

```text
generation tok/s  ≤  760 GB/s ÷ bytes of weights
```

For Qwen3 8B Q4_K_M, 4.68 GiB or 5.02 GB, that is **151 tok/s**. Reading a prompt is the opposite: all its tokens go through together, so each weight is reused many times and the limit is compute, about 2 operations per parameter per token. For this 8.19B model that is 16.4 GFLOP per token, and at the FP16 tensor rate I assumed in post 1 (about 60 TFLOPS), a ceiling near **3,660 tok/s**.

## What was actually run

<div class="chart">
<div class="cap">Planned configurations <small>15 planned in <code>sweep.sh</code></small></div>
<div class="row"><span class="k">Produced numbers</span><span class="bar a3"><i style="--w:40%"></i></span><span class="v">6</span></div>
<div class="row"><span class="k">Skipped: model file missing</span><span class="bar a4"><i style="--w:53%"></i></span><span class="v">8</span></div>
<div class="row"><span class="k">Ran, returned nothing</span><span class="bar a5"><i style="--w:7%"></i></span><span class="v">1</span></div>
<div class="legend"><span>Skipped: both Qwen3-30B-A3B and gpt-oss-20b. The empty one was the 35B model with only 24 layers of experts on CPU, which did not fit</span></div>
</div>

So the findings cover one dense 8B model and one 35B mixture-of-experts model at several CPU/GPU splits. The other two model families are untested.

## Result 1: the dense 8B model

| Qwen3 8B Q4_K_M, all layers on GPU | Speed | Ceiling | |
|---|---|---|---|
| Generation, 128 tokens | 119.27 ± 0.05 tok/s | 151 | <span class="pill good">79%</span> |
| Prompt processing, 512 tokens | 4,580 ± 10 tok/s | about 3,660 | <span class="pill bad">125%, ceiling wrong</span> |
| Prompt processing, 4,096 tokens | 4,224 ± 2 tok/s | about 3,660 | <span class="pill bad">115%</span> |

<div class="chart">
<div class="cap">Generation speed against the bandwidth ceiling <small>Qwen3 8B Q4_K_M, tokens per second</small></div>
<div class="row"><span class="k">Ceiling</span><span class="bar"><i style="--w:100%"></i></span><span class="v">151</span></div>
<div class="row"><span class="k">Measured, empty context</span><span class="bar a3"><i style="--w:79%"></i><u style="--at:100%"></u></span><span class="v">119.3 · 79%</span></div>
</div>

Generation behaves: 79% of the ceiling is a healthy result. **The prompt ceiling does not.** 4,580 tok/s × 16.4 GFLOP is about 75 TFLOPS of useful work, 25% above the figure I assumed. The likely explanation is that llama.cpp's 4-bit kernels use the tensor cores' integer path, which has a higher peak than FP16. I have not confirmed that with a profiler, but the lesson stands: **a ceiling is only as good as the assumption under it.**

## Result 2: a 35B model on a 10 GB card

Qwen3.6 35B-A3B is a mixture-of-experts model: 34.7B parameters in a 20.6 GiB file, but only about 3B active per token. `-ncmoe N` keeps the experts of the first N layers on the CPU so the rest fits. The more experts on the CPU, the slower:

| Experts on CPU (layers) | Prompt 512 | Prompt 4096 | Generation | vs best |
|---|---|---|---|---|
| 24 | no result | no result | no result | <span class="pill bad">did not fit</span> |
| 28 | 852 tok/s | 840 tok/s | 67.5 tok/s | <span class="pill good">best</span> |
| 32 | 784 tok/s | 766 tok/s | 62.6 tok/s | −7% |
| 40 | 670 tok/s | 654 tok/s | 54.0 tok/s | −20% |

### Threads: more is not better

<div class="chart">
<div class="cap">Generation speed by thread count <small>35B-A3B, 28 layers of experts on CPU; the CPU has 8 physical cores</small></div>
<div class="row"><span class="k">6 threads</span><span class="bar a3"><i style="--w:97.8%"></i></span><span class="v">67.4</span></div>
<div class="row"><span class="k">8 threads</span><span class="bar a3"><i style="--w:98%"></i></span><span class="v">67.5</span></div>
<div class="row"><span class="k">16 threads</span><span class="bar a5"><i style="--w:72.6%"></i></span><span class="v">50.0 · −26%</span></div>
<div class="legend"><span>Prompt processing did not care: 862, 852 and 863 tok/s. Axis 0 to 69 tok/s</span></div>
</div>

Using all 16 hardware threads on 8 physical cores cost a quarter of the generation speed. Generation that runs on the CPU is limited by memory traffic, and extra threads contend for it. I did not record system RAM bandwidth, so I cannot draw that ceiling yet.

### Dense 8B against the 35B model

| | Qwen3 8B, all GPU | 35B-A3B, best split | Ratio |
|---|---|---|---|
| File size | 4.68 GiB | 20.60 GiB | 4.4× |
| Prompt speed | 4,580 tok/s | 852 tok/s | 5.4× slower |
| Generation | 119.3 tok/s | 67.5 tok/s | 1.8× slower |

## Gotchas

| Gotcha | Effect |
|---|---|
| Only 2 repetitions per config | Dense results are tight (±0.05), but MoE prompt speed varied by up to ±28 tok/s. Treat small gaps there as noise |
| Thread count | Using every hardware thread was 26% slower than 6 to 8 |
| One out-of-memory per run | Configurations are separate runs so one failure does not hide the rest |
| Two model families skipped | Nothing was measured for Qwen3-30B-A3B or gpt-oss-20b |

## Where it stands, and my verdict

The datasheet's predictions against the card so far:

| Question from post 1 | Paper said | Measured | |
|---|---|---|---|
| Fits | 7 to 8B at 4-bit with room | 8.3 GB at 40k (post 4) | <span class="pill good">held</span> |
| Generation speed | at most 151 tok/s for this model | 119.3 tok/s, 79% | <span class="pill good">held</span> |
| Prompt speed | about 3,660 tok/s | 4,580 tok/s | <span class="pill bad">wrong, ceiling assumption</span> |
| Sharing | Memory must sum under 10 GB | One LLM stays, the rest left the GPU (post 3) | <span class="pill good">held</span> |

**Verdict: the card is not the bottleneck for an 8B model.** It generates at 79% of the physical limit and reads prompts at over 4,000 tok/s. A 35B model runs but at 1.8× slower generation and 5.4× slower prompts, so it has to buy something to be worth it. That is post 7. First, the question I put off in post 3: how much speed does the engine itself cost?
