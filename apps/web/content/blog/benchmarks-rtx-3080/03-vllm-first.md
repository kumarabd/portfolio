---
title: vLLM first, and why it did not stay
summary: April to September. The serious serving engine took the whole card, sharing the card did not hold, and the budget explains both.
verdict: vLLM claimed 8.5 of 10 GiB for a 7B model and sharing failed twice, so Ollama became the single GPU tenant.
date: 2026-04-19
---

The goal from [post 1](/blog/benchmarks-rtx-3080/the-chip-and-the-goal) was one card carrying many jobs. The first engine I reached for was the one built for serious inference, and it taught me the most important rule about this card quickly.

<div class="stats">
<div><b>8.5 <small>GiB</small></b><span>claimed by vLLM at <code>gpu_memory_utilization=0.90</code></span></div>
<div><b>1.5 <small>GiB</small></b><span>left for everything else</span></div>
<div><b>4</b><span>weeks that GPU time-slicing lasted</span></div>
<div><b>0</b><span>requests a resident chat model received in 72 hours</span></div>
</div>

<div class="chart">
<div class="cap">VRAM budget over time <small>GiB of the 10 GiB card. From my GPU budget notes: Aug and Sep are planned allocations, Oct is measured and derived parts.</small></div>
<div class="vram"><span class="k">Jun · vLLM</span><div class="stack"><i style="--g:8.5;--bg:#a16207">vLLM 8.5</i><i class="free" style="--g:1.5">1.5 free</i></div></div>
<div class="vram"><span class="k">Aug · Ollama + STT</span><div class="stack"><i style="--g:4;--bg:#1c1a24">OCR 4.0</i><i style="--g:.4;--bg:#0f766e"></i><i style="--g:1.7;--bg:#6b6677">KV 1.7</i><i style="--g:3;--bg:#be185d">WhisperLive 3.0</i><i class="free" style="--g:.9"></i></div></div>
<div class="vram"><span class="k">Sep · Ollama</span><div class="stack"><i style="--g:4;--bg:#1c1a24">OCR 4.0</i><i style="--g:.4;--bg:#0f766e"></i><i style="--g:1.7;--bg:#6b6677">KV 1.7</i><i class="free" style="--g:3.9">3.9 free</i></div></div>
<div class="vram"><span class="k">Oct · Qwen3 8B</span><div class="stack"><i style="--g:4.7;--bg:#1c1a24">weights 4.7</i><i style="--g:3;--bg:#4338ca">KV 3.0</i><i style="--g:.6;--bg:#6b6677"></i><i style="--g:.3;--bg:#0f766e"></i><i class="free" style="--g:1.4">1.4 free</i></div></div>
<div class="legend"><span><i style="--bg:#a16207"></i>vLLM (all in)</span><span><i style="--bg:#1c1a24"></i>model weights</span><span><i style="--bg:#4338ca"></i>KV cache</span><span><i style="--bg:#6b6677"></i>overhead</span><span><i style="--bg:#0f766e"></i>embedder</span><span><i style="--bg:#be185d"></i>real-time STT</span></div>
</div>


<ol class="timeline">
<li><b>Ray Serve + vLLM.</b> An inference image built in CI, served through KubeRay, with OpenTelemetry and monitoring from day one.</li>
<li><b>Tuned and pinned.</b> Serving Qwen2.5-7B-Instruct (AWQ 4-bit): memory from 0.85 to 0.90, prefix caching on, context capped at 4,096, concurrency limit 8 to 128. vLLM pinned back from 0.8.5 to 0.7.3.</li>
<li><b>Ollama arrives.</b> Added next to vLLM as a multi-model server, first for the embedder. The notes already say one 7B model saturates the card.</li>
<li><b>Chat out, OCR in.</b> A general chat model on Ollama had seen zero requests in 72 hours, so its slot became an OCR model. By then vLLM is disabled.</li>
<li><b>A second GPU tenant.</b> Real-time speech to text added alongside Ollama using GPU time-slicing.</li>
<li class="end"><b>Removed again.</b> Ollama alone did not need time-slicing, so both went.</li>
</ol>

## The physics: where the memory goes

A model on a GPU needs three kinds of memory:

- **Weights**: parameters × bytes per parameter. A 7B model is 14 GB in FP16 and roughly a third of that at 4 bits.
- **KV cache**: the attention keys and values for every token in the context, which grows with context length and with the number of requests in flight.
- **Overhead**: the CUDA context, framework buffers and activations, commonly several hundred megabytes up to a gigabyte.

Only the first is fixed. The KV cache is a budget you choose, and that is where engines differ.

## Round 1: vLLM on its own

vLLM is built for throughput: continuous batching, a paged KV cache, many concurrent requests. On paper it is the serious option. On this card it had one visible problem.

The top row of the chart above is the whole story of round 1. `gpu_memory_utilization=0.90` tells vLLM to claim 90% of the card up front and carve its own pool for the KV cache. That is good engineering for a dedicated server and the wrong shape for a shared card: **the weights of a 7B 4-bit model are a fraction of the 8.5 GiB it took, and the rest was reserved for concurrency I was not using.**

## Round 2: sharing the card

Ollama loads and unloads models on demand, so several can coexist. I had put an embedder on it earlier, then an OCR model, then added real-time speech to text through GPU time-slicing, which makes the cluster report two GPUs so two pods can each request one.

| Gotcha | What happened | What I do now |
|---|---|---|
| Time-slicing does not isolate memory | Both pods became schedulable, but they still shared one 10 GiB pool. The 3 GiB for speech to text was never verified under load | Treat the budget as a sum I must check with `nvidia-smi` running both |
| Config outside the chart | The device-plugin patch lived in `kube-system`, not in Helm | Document it, or avoid it |
| A resident model nobody called | The chat model had zero requests in 72 hours | Measure traffic before assigning VRAM. `keepAlive` went from 24 h to 10 min |

The experiment lasted about four weeks and was then removed. It was a useful failure: it showed that "schedulable" and "fits" are different questions.

## What I produced

- A GPU budget document stating every allocation and how to verify it (`ollama ps`, `nvidia-smi`).
- A rule: nothing gets VRAM without measured traffic.
- The decision to make Ollama the single GPU tenant.

## Where it stands, and my verdict

Against the starting position from [post 1](/blog/benchmarks-rtx-3080/the-chip-and-the-goal):

| Criterion | Status | |
|---|---|---|
| Fits, resident, shareable | vLLM took 8.5 of 10 GiB. Time-slicing shared the schedule, not the memory | <span class="pill bad">sharing failed twice</span> |
| Fast enough | Not measured yet. vLLM was never benchmarked head to head | <span class="pill">untested</span> |
| Decisions I would trust | Not measured yet | <span class="pill">untested</span> |
| Easy to run | vLLM needed Ray, KubeRay, a custom image and a version pin. Ollama is one deployment | <span class="pill warn">Ollama simpler</span> |

| Need | vLLM + Ray | Ollama |
|---|---|---|
| Share the GPU with other models | <span class="pill bad">wants the whole card</span> | <span class="pill good">loads on demand</span> |
| Several models resident | <span class="pill bad">no</span> | <span class="pill good">up to two</span> |
| Many concurrent requests | <span class="pill good">its strength (not benchmarked here)</span> | <span class="pill warn">one parallel request per model</span> |

**Verdict: Ollama, for operational reasons.** I never benchmarked vLLM, so I will not claim it is slower. What I can say is that it wants the whole card, my workload is one user plus agents, and everything else on this GPU got simpler once it left. vLLM would win on a dedicated card with many concurrent users.

Next: with one engine chosen, which model fits.
