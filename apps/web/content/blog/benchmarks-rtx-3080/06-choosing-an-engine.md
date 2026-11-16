---
title: Choosing an engine for one 10 GB card
summary: Seven months, three setups, one GPU shared by everything. How I went from vLLM to Ollama, with the VRAM budget at every step.
date: 2026-11-16
---

The first five posts were theory. From here the series follows my own card in the order things happened, starting in April with a simple question: **which engine should serve models on a single RTX 3080 that other things also need?**

<div class="stats">
<div><b>8.5 <small>GiB</small></b><span>taken by vLLM at <code>gpu_memory_utilization=0.90</code></span></div>
<div><b>3</b><span>setups tried: vLLM, Ollama with sharing, Ollama alone</span></div>
<div><b>12.3 <small>tok/s</small></b><span>a 14B model with 21% pushed onto the CPU</span></div>
<div><b>~90 <small>tok/s</small></b><span>Qwen3 8B at 40k context, fully on the GPU</span></div>
</div>

## The path, in order

<ol class="timeline">
<li><time>Apr 19–20</time><b>Ray Serve + vLLM.</b> An inference image built in CI, served through KubeRay, with OpenTelemetry and monitoring from day one.</li>
<li><time>May 17</time><b>Tuned and pinned.</b> Serving Qwen2.5-7B-Instruct (AWQ 4-bit): memory raised from 0.85 to 0.90, prefix caching on, context capped at 4,096, concurrency limit 8 to 128. vLLM pinned back from 0.8.5 to 0.7.3.</li>
<li><time>Jun 1</time><b>Ollama arrives.</b> Added next to vLLM as a multi-model server, first for the embedder. The notes already say one 7B model saturates the card, with about 1.5 GiB free.</li>
<li><time>Aug 1</time><b>Chat out, OCR in.</b> A general chat model on Ollama had seen zero requests in 72 hours, so its slot became an OCR model. By the Aug 25 notes vLLM is disabled.</li>
<li><time>Aug 25–26</time><b>A second GPU tenant.</b> Real-time speech-to-text added alongside Ollama using GPU time-slicing.</li>
<li><time>Sep 23</time><b>Removed again.</b> Ollama alone did not need time-slicing, so both went.</li>
<li><time>Oct</time><b>Back to a general model.</b> 14B, then a 9B, then Qwen3 8B.</li>
<li class="end"><time>Nov 11</time><b>Embeddings and rerankers move to CPU</b>, leaving the GPU to one LLM.</li>
</ol>

## Round 1: vLLM on its own

vLLM is built for throughput: continuous batching, paged KV cache, many concurrent requests. On paper that is the serious option. On this card it had one problem I could see immediately in the budget.

<div class="chart">
<div class="cap">VRAM budget over time <small>GiB of the 10 GiB card. Figures from my GPU budget notes; Aug and Sep are planned allocations, Oct is the sum of measured and derived parts.</small></div>
<div class="vram"><span class="k">Jun · vLLM</span><div class="stack"><i style="--g:8.5;--bg:#a16207">vLLM 8.5</i><i class="free" style="--g:1.5">1.5 free</i></div></div>
<div class="vram"><span class="k">Aug · Ollama + STT</span><div class="stack"><i style="--g:4;--bg:#1c1a24">OCR 4.0</i><i style="--g:.4;--bg:#0f766e"></i><i style="--g:1.7;--bg:#6b6677">KV 1.7</i><i style="--g:3;--bg:#be185d">WhisperLive 3.0</i><i class="free" style="--g:.9"></i></div></div>
<div class="vram"><span class="k">Sep · Ollama</span><div class="stack"><i style="--g:4;--bg:#1c1a24">OCR 4.0</i><i style="--g:.4;--bg:#0f766e"></i><i style="--g:1.7;--bg:#6b6677">KV 1.7</i><i class="free" style="--g:3.9">3.9 free</i></div></div>
<div class="vram"><span class="k">Oct · Qwen3 8B</span><div class="stack"><i style="--g:4.7;--bg:#1c1a24">weights 4.7</i><i style="--g:3;--bg:#4338ca">KV 3.0</i><i style="--g:.6;--bg:#6b6677"></i><i style="--g:.3;--bg:#0f766e"></i><i class="free" style="--g:1.4">1.4 free</i></div></div>
<div class="legend"><span><i style="--bg:#a16207"></i>vLLM (all in)</span><span><i style="--bg:#1c1a24"></i>model weights</span><span><i style="--bg:#4338ca"></i>KV cache</span><span><i style="--bg:#6b6677"></i>overhead</span><span><i style="--bg:#0f766e"></i>embedder</span><span><i style="--bg:#be185d"></i>real-time STT</span></div>
</div>

The first row is the whole story of round 1. `gpu_memory_utilization=0.90` tells vLLM to claim 90% of the card up front and carve its own pool for the KV cache. That is good engineering for a dedicated inference server, and the wrong shape for a card I wanted to share: **a 7B 4-bit model's weights are a fraction of the 8.5 GiB it took, and all of the rest was reserved for concurrency I wasn't using.** Post 4 predicted this: the KV cache, not the weights, is the budget you actually tune.

## Round 2: sharing the card

Ollama loads and unloads models on demand, so several can coexist. I had put an embedder on it in June, then an OCR model, then added real-time speech-to-text through GPU time-slicing, which makes the cluster report two GPUs so two pods can each request one.

| Gotcha | What happened | What I do now |
|---|---|---|
| Time-slicing does not isolate memory | Both pods became schedulable, but they still shared one 10 GiB pool. The 3 GiB for speech-to-text was never verified under load | Treat the budget as a sum I must check with `nvidia-smi` running both |
| Config outside the chart | The device-plugin patch lived in `kube-system`, not in Helm | Document it, or avoid it |
| A resident model nobody called | The general chat model had zero requests in 72 hours | Measure traffic before assigning VRAM; `keepAlive` went from 24 h to 10 min |

The whole experiment lasted about four weeks and was removed on Sep 23. It was a useful failure: it showed that "schedulable" and "fits" are different questions.

## Round 3: choosing a general model

With Ollama alone, the question became which model to leave resident. The same card gave very different answers:

<div class="chart">
<div class="cap">Generation speed by model <small>tokens per second, one stream, measured on this card</small></div>
<div class="row"><span class="k">qwen2.5:14b · 16k</span><span class="bar a5"><i style="--w:10%"></i></span><span class="v">12.3</span></div>
<div class="row"><span class="k">ornith-1.5:9b · 64k</span><span class="bar a4"><i style="--w:83%"></i></span><span class="v">~100</span></div>
<div class="row"><span class="k">qwen3:8b · 40k</span><span class="bar a2"><i style="--w:75%"></i></span><span class="v">~90</span></div>
<div class="legend"><span>axis 0 to 120 tok/s</span></div>
</div>

| Model | Context | VRAM | On GPU | Tool-selection suite |
|---|---|---|---|---|
| qwen2.5:14b | 16k | over budget | <span class="pill bad">79%, 21% on CPU</span> | not scored |
| ornith-1.5:9b | 64k | 6.9 GB | <span class="pill good">100%</span> | 4 of 8 (vision, but weak at tools) |
| qwen3:8b | 40k | 8.3 GB | <span class="pill good">100%</span> | 6 of 8 with thinking on |

The 14B model fell off the cliff from post 1: roughly 9 GB of weights before any KV cache, so a fifth of it ran on the CPU and generation dropped to a crawl. The 9B was faster and cheaper in memory, but it picked the wrong tool half the time. Qwen3 8B gave up some speed and all vision for the best tool accuracy, and that is what an agent needs from it.

### Why 40k fits: the KV arithmetic

Qwen3 8B has 36 layers, 8 key/value heads and a head dimension of 128 (from its published config). Using the formula from post 4:

| KV cache type | Per token | At 32k | At 40k | Weights + KV at 40k |
|---|---|---|---|---|
| fp16 | 147,456 B | 4.50 GiB | 5.62 GiB | <span class="pill bad">10.3 GiB, does not fit</span> |
| q8_0 | 78,336 B | 2.39 GiB | 2.99 GiB | <span class="pill good">7.7 GiB, fits</span> |

Weights are 4.68 GiB. Adding the q8_0 cache gives 7.07 GiB at 32k and 7.67 GiB at 40k. I measured 7.6 and 8.3, so the implied overhead is 0.5 to 0.6 GiB, right in the range post 4 allowed. **The q8_0 cache is the setting that makes 40k context possible at all.** The server settings that came out of this:

```text
OLLAMA_CONTEXT_LENGTH=40960
OLLAMA_NUM_PARALLEL=1
OLLAMA_FLASH_ATTENTION=1
OLLAMA_KV_CACHE_TYPE=q8_0
OLLAMA_KEEP_ALIVE=10m
```

## What I produced

- A Helm chart with a LiteLLM front door. `local-llm` and `local-llm-think` are the same Qwen3 8B weights, differing only in a per-request thinking flag, so switching never reloads the model.
- A GPU budget document that states every allocation and how to verify it (`ollama ps`, `nvidia-smi`).
- Embeddings and both rerankers moved to CPU so they stop competing with the LLM.

## Where it stands, and my verdict

How the claims from the first five posts held up against what this card actually did:

| Post | What it said | What happened | |
|---|---|---|---|
| 1 | 10 GB is a cliff, not a slope | The 14B model offloaded 21% and ran at 12.3 tok/s | <span class="pill good">held</span> |
| 4 | Weights + KV cache + about 1 GB of overhead | Predicted 7.7 GiB + 0.5 to 1.0, measured 8.3 at 40k | <span class="pill good">held</span> |
| 4 | The KV cache is half the budget | fp16 KV at 40k would need 5.6 GiB and overflow the card | <span class="pill good">held</span> |
| 5 | Decode speed is capped by bandwidth ÷ weights | 760 GB/s ÷ 5.0 GB = 151 tok/s ceiling, measured about 90 | <span class="pill good">held, as a ceiling</span> |

How the engines compare for this machine:

| Need | vLLM + Ray | Ollama |
|---|---|---|
| Share the GPU with other models | <span class="pill bad">wants the whole card</span> | <span class="pill good">loads on demand</span> |
| Several models resident | <span class="pill bad">no</span> | <span class="pill good">up to two</span> |
| Moving parts | <span class="pill warn">Ray, KubeRay, custom image, version pin</span> | <span class="pill good">one deployment</span> |
| Many concurrent requests | <span class="pill good">its strength (I did not benchmark it)</span> | <span class="pill warn">one parallel request per model</span> |

**Verdict: Ollama for this box, for operational reasons, not speed.** I never benchmarked vLLM head to head, so I will not claim it is slower. What I can say is that it wants the entire card, my workload is one user plus agents, and everything else on this GPU became simpler once it left. vLLM would win on a dedicated card serving many concurrent users.

The open question is whether Ollama itself costs speed compared with the llama.cpp server underneath it. That is the next post.
