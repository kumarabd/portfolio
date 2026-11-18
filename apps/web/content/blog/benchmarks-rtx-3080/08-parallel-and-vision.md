---
title: The 35B with parallel slots and image input
summary: Four more speed runs on the big model. Extra slots lift throughput but not by much, image input costs nothing in text speed, and benchmarking it takes the whole local stack offline.
verdict: Parallel slots raise the 35B's throughput from 47 to 71 tok/s at four requests, and image input costs nothing in text speed. It still cannot reuse a prompt and still needs the rest of the stack switched off — but on the corrected journey suite it passes 72 of 81, against the 8B's 32.
date: 2026-11-16
---

[Post 7](/blog/benchmarks-rtx-3080/does-bigger-pay-off) ended with the 35B model out. Two things were still open: whether more parallel slots rescue its throughput, and whether image input, which the 8B on Ollama does not have, changes the picture. I ran both on Strata, the same engine as [post 6](/blog/benchmarks-rtx-3080/engines-head-to-head).

<div class="stats">
<div><b>71 <small>tok/s</small></b><span>aggregate with 4 slots and 4 requests, up from 47 with one</span></div>
<div><b>18 <small>tok/s</small></b><span>what each of those 4 requests gets</span></div>
<div><b>54 <small>tok/s</small></b><span>single-stream decode, unchanged by slots or image input</span></div>
<div><b>~11 <small>GB</small></b><span>of resident services that must be paused to run it</span></div>
</div>

| Measured, 35B on Strata | 1 slot ([post 6](/blog/benchmarks-rtx-3080/engines-head-to-head)) | 2 slots, image input | 4 slots, image input | |
|---|---|---|---|---|
| Decode at 1k | 54.1 tok/s | 54.4 tok/s | 54.4 tok/s | <span class="pill good">unchanged</span> |
| Cold first token at 1k | 0.754 s | 0.754 s | 0.754 s | <span class="pill good">unchanged</span> |
| Warm first token at 1k | 0.753 s | 0.753 s | 0.753 s | <span class="pill bad">still no reuse</span> |
| Aggregate, 1 request | 46.9 tok/s | 46.9 tok/s | 46.5 tok/s | |
| Aggregate, 2 requests | 47.2 tok/s | 56.6 tok/s | 57.0 tok/s | <span class="pill warn">+20%</span> |
| Aggregate, 4 requests | 47.1 tok/s | 57.0 tok/s | 70.8 tok/s | <span class="pill warn">+50%</span> |

## Result 1: parallel slots

<div class="chart">
<div class="cap">Aggregate tokens per second with 4 requests in flight <small>1k-token prompts. The last bar is the 8B model from [post 6](/blog/benchmarks-rtx-3080/engines-head-to-head), for scale.</small></div>
<div class="row"><span class="k">35B, 1 slot</span><span class="bar a5"><i style="--w:20.5%"></i></span><span class="v">47.1</span></div>
<div class="row"><span class="k">35B, 2 slots</span><span class="bar a4"><i style="--w:24.8%"></i></span><span class="v">57.0</span></div>
<div class="row"><span class="k">35B, 4 slots</span><span class="bar a4"><i style="--w:30.8%"></i></span><span class="v">70.8</span></div>
<div class="row"><span class="k">8B on llama.cpp, 4 slots</span><span class="bar a3"><i style="--w:98.4%"></i></span><span class="v">226.4</span></div>
<div class="legend"><span>Axis 0 to 230 tok/s. The two models are not comparable in quality, only in how throughput scales.</span></div>
</div>

Slots help, but the gain is modest. Four slots take aggregate throughput to 1.5 times a single stream, against 2.5 times for the 8B in [post 6](/blog/benchmarks-rtx-3080/engines-head-to-head), and each request slows from 46 to about 18 tok/s. A likely reason, if part of the model lives on the CPU as in [post 5](/blog/benchmarks-rtx-3080/raw-speed), is that CPU-side work is limited by memory traffic, and more streams do not make system memory faster. I have not isolated it.

## Result 2: image input costs nothing in text speed

The runs are labelled as vision runs, which I take to mean image input was enabled. Text speed with it on is identical to the run without: 54.4 against 54.1 tok/s decode, and the same 0.754 s cold first token. So enabling image input appears free when no image is sent. The runs sent text prompts; what an image itself costs — image encode plus prompt read — is not measured here.

| Prompt | Cold first token | Prompt speed |
|---|---|---|
| 811 tokens | 0.754 s | about 1,080 tok/s |
| 3,100 tokens | 2.444 s | about 1,270 tok/s |
| 6,150 tokens | 4.581 s | about 1,340 tok/s |

## Result 3: the price of testing it

Running a model this size means making room for it. `bench-mode.sh` scales seven deployments to zero and restores them afterwards.

| Paused while benchmarking | Why |
|---|---|
| The LLM server (GPU) | The 35B needs the card |
| Embeddings and both rerankers | RAM |
| Speech to text and text to speech | RAM |
| The task classifier | RAM |

About 11 GB of resident services go down. Until `bench-mode.sh off`, **the local LLM, embeddings, reranking, speech and the shadow-mode classifier are all unavailable.** This is [post 1](/blog/benchmarks-rtx-3080/the-chip-and-the-goal)'s criterion in practice: a model that cannot coexist with the rest of the stack is not a candidate for an always-on agent, however fast it is.

## Gotchas

| Gotcha | Effect |
|---|---|
| Benchmark mode takes the stack down | Every local service stops until it is switched off. Do not run it while anything depends on them |
| The warm and cold first tokens are identical | The engine does not reuse a prompt, with or without slots |
| Four slots on a CPU-bound model | Throughput rises 50%, but per-request speed falls by more than half |
| Image latency not measured | The speed runs use text prompts; what an image itself costs is a separate experiment |

## Where it stands, and my verdict

How the 35B has fared against the criteria from [post 1](/blog/benchmarks-rtx-3080/the-chip-and-the-goal):

| Criterion | The 35B so far | |
|---|---|---|
| Fits, resident, shareable | Needs about 11 GB of other services paused | <span class="pill bad">no</span> |
| Fast enough | 54 tok/s single, 71 aggregate at 4 slots. Cannot reuse a prompt | <span class="pill warn">partly</span> |
| Decisions I would trust | 72/81 on the corrected journey suite, above the 8B's 32 ([evals](/blog/wtf-is-agent/knowing-it-works)). Not re-run with slots | <span class="pill good">better</span> |
| Easy to run | A separate engine and a mode that stops the stack | <span class="pill bad">no</span> |

**Verdict: slots and vision do not rescue the 35B's fit.** They improve throughput by half and add image input at no text cost. It still cannot reuse a prompt and still needs the stack switched off to run. On decisions, the corrected journey suite reverses the earlier result: the 35B passes 72 of 81 and the 8B 32, so the blocker is fit, not quality. The question for the next post is different: is there a model that is fast enough, small enough, and good enough to sit beside everything else?
