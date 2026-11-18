---
title: The chip, and what I want from it
summary: What an RTX 3080 is on paper, the job I bought it for, and the questions this series answers with measurements.
verdict: A 10 GB, 760 GB/s card should fit a quantized 8B model and generate fast on paper. Sharing the card and decision quality are the open risks.
date: 2026-04-19
---

I have one GPU: an RTX 3080 with 10 GB of memory, in the machine that runs my Kubernetes node. This series is the record of finding out what that single card can really do, written in the order it happened. It starts with the chip and the goal, because every later decision only makes sense against them.

<div class="stats">
<div><b>10 <small>GB</small></b><span>GDDR6X on a 320-bit bus</span></div>
<div><b>760 <small>GB/s</small></b><span>memory bandwidth</span></div>
<div><b>29.8 <small>TFLOPS</small></b><span>FP32 peak, 8,704 CUDA cores</span></div>
<div><b>320 <small>W</small></b><span>board power, always on</span></div>
</div>

**The series at a glance**

| Post | Question |
|---|---|
| 2 | What are the tests, and where can you get them? |
| 3 | Which engine runs it, and why did the first one not stay? |
| 4 | Which model fits? |
| 5 | How fast is it against the paper ceilings? |
| 6 | Which engine is fastest and cheapest to run? |
| 7 | Does a bigger model pay off, and did I reach the goal? |


## The chip on paper

| | RTX 3080 (10 GB) |
|---|---|
| Chip | GA102, Ampere |
| Streaming multiprocessors | 68 |
| CUDA cores | 8,704 |
| Tensor cores | 272 (3rd generation) |
| Boost clock | about 1.71 GHz |
| Memory | 10 GB GDDR6X, 320-bit, 19 Gbps |
| Board power | 320 W |

Two figures fall out of that sheet. **Compute** is 8,704 cores × 2 operations × 1.71 GHz, about 29.8 TFLOPS in FP32, with the tensor cores roughly doubling that for FP16. **Memory bandwidth** is a 40-byte-wide bus at 19 Gbps, which is 760 GB/s.

Divide one by the other and you get the card's *balance*: about 39 operations per byte moved. A job that does fewer operations on each byte it reads waits on memory and is **bandwidth-bound**. Generating text one token at a time is exactly that kind of job, so for language models the 760 GB/s matters more than the TFLOPS. The third number, **10 GB**, is a cliff and not a slope: a model that needs 10.5 GB does not run slowly, it does not run.

## The job I bought it for

My goal is **fully local personal agents**: software that works on my email, finances, health data and tasks, running on my own hardware. Three properties matter:

- **Private.** The data never has to leave the house to be read by a model.
- **Always on.** No cold starts, no quota, nothing that stops when a subscription lapses.
- **No per-token meter.** An agent that loops a hundred times to finish a task should cost electricity, not dollars.

The cost is that all of it has to fit on one 10 GB card.

## What I hoped it could carry

I did not start modest. The stack I tried to put on this one GPU, in the order I tried it:

| Workload | Why an agent stack needs it | First tried | Where it lives now |
|---|---|---|---|
| Chat and tool-calling LLM | Every agent decision | Apr | GPU |
| Embeddings and rerankers | Memory and retrieval | Jun | CPU |
| Real-time speech to text | A voice interface | Aug | Removed |
| OCR | Scanned documents | Aug | Removed |
| Speech synthesis, batch speech to text | Voice in and out | by Jun | CPU |

The story of the series is partly in that last column: the card began as the home of everything and ended as the home of one language model.

## What the datasheet predicts

Before measuring anything, the specs already make claims. These are what the rest of the series tests:

| Question | What the paper says | Tested in |
|---|---|---|
| Does a 7 to 8B model fit? | 4-bit weights are 3.5 to 5 GB, which leaves room for context | [Post 4](/blog/benchmarks-rtx-3080/fitting-a-model) |
| How fast can it generate? | At most bandwidth ÷ weight bytes: 217 tok/s for 3.5 GB, 151 for 5 GB | [Post 5](/blog/benchmarks-rtx-3080/raw-speed) |
| How fast can it read a prompt? | Compute ÷ (2 × parameters), roughly 3,700 to 4,300 tok/s on FP16 numbers | [Post 5](/blog/benchmarks-rtx-3080/raw-speed) |
| Can several jobs share the card? | Only if their memory sums to under 10 GB | [Post 3](/blog/benchmarks-rtx-3080/vllm-first) |
| Is a small model good enough to decide? | The paper cannot say | [Post 7](/blog/benchmarks-rtx-3080/does-bigger-pay-off) |

## What would count as done

| Criterion | How I measure it | Instrument |
|---|---|---|
| It fits, stays resident, and can share | VRAM actually used, GPU offload | `ollama ps`, `nvidia-smi` |
| It is fast enough to feel interactive | First-token time, tokens per second, throughput under load | `engine_bench.py`, `sweep.sh` |
| It makes decisions I would trust | Pass rate on tool-calling and routing cases | `llm_bench.py`, the decision suite |
| One person can keep it running | Number of moving parts, what breaks | Notes in each post |

The next post describes the instruments, and the rest follow the optimisation in order (the table at the top maps them).


## Where it stands, and my verdict

Nothing is measured yet, so this is the starting position:

| Criterion | Status |
|---|---|
| Fits, resident, shareable | <span class="pill warn">paper says yes for one model</span> |
| Fast enough | <span class="pill warn">paper gives ceilings, not results</span> |
| Decisions I would trust | <span class="pill">unknown</span> |
| Easy to run | <span class="pill">unknown</span> |

**Verdict: worth testing.** The datasheet says a small quantized model fits with room to spare and generates fast. The two things it cannot tell me, whether the card can be shared and whether a model this small decides well enough, are the ones that decide the goal, and they are what the next six posts are about.
