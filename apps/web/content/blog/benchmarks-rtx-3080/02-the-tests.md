---
title: The tests I wrote
summary: Four instruments, 82 decision cases and 15 tool-calling prompts, all published. What each one measures and how I kept it honest.
date: 2026-11-09
until: 2026-11-16
---

Before any result, here is what I measured with. Everything below is published so you can run it on your own card, or argue with it.

<div class="stats">
<div><b>4</b><span>instruments: a sweep, an engine bench, a tool-calling check, a decision suite</span></div>
<div><b>15</b><span>tool-calling prompts</span></div>
<div><b>82</b><span>decision cases: 32 in two modes, plus 18 delegation cases</span></div>
<div><b>15</b><span>speed-sweep configurations planned</span></div>
</div>

**Everything is in one folder:** [`bench/rtx3080`](https://github.com/kumarabd/portfolio/tree/main/bench/rtx3080) in this site's repository.

## The four instruments

| Instrument | Answers | Published |
|---|---|---|
| Speed sweep | How fast is the raw engine, and what do CPU/GPU splits cost? | [`sweep.sh`](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/sweep.sh), [`results`](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/results/sweep-results.txt) |
| Engine bench | How do engines compare on first-token time, decode speed and load? | [`engine_bench.py`](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/engine_bench.py), [`results`](https://github.com/kumarabd/portfolio/tree/main/bench/rtx3080/results) |
| Tool-calling check | Does a model pick the right tool with the right arguments? | [`llm_bench.py`](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/llm_bench.py), [`cases`](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/cases/tool-calling-cases.md) |
| Decision suite | Does the model make the routing decisions my agent needs? | [`cases`](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/cases/decision-suite-cases.md), [`summary`](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/results/decision-suite-summary.md) |

### 1. The speed sweep

Runs `llama-bench` for each configuration: prompt processing at 512 and 4,096 tokens, and generation of 128. Flash attention is on and the KV cache is q8_0, to match how the model runs in production. Each configuration is its own run, so one out-of-memory does not abort the rest, and missing model files are skipped rather than fatal.

### 2. The engine bench

Streams a fixed prompt from any OpenAI-compatible endpoint and times everything on the client, the same way for every engine.

| Metric | What it is |
|---|---|
| Cold first token | Time to first token on a prompt the server has not seen (a random nonce leads it, so no prefix cache can help) |
| Warm first token | The same prompt again, which is what an agent resending its system prompt sees |
| Decode | Tokens per second after the first token, at roughly 1k, 8k and 14k tokens of context |
| Concurrency | Aggregate tokens per second with 1, 2 and 4 requests in flight |

It uses raw completions, so chat templates and thinking mode cannot skew the comparison.

### 3. The tool-calling check

Fourteen prompts against an agent-shaped set of eight tools, plus a follow-up where a tool result is fed back and the answer must use it. Cases cover choosing a tool, getting arguments right, an enum, two calls of the same tool, parallel calls to different tools, one long-context case, and three where the right behaviour is *restraint*: no tool needed, or a required argument missing so the model must ask.

### 4. The decision suite

This one measures the behaviour my agent depends on: given a request, choose **start a task, ask, schedule for later, answer, or do it yourself**. A wrong choice wastes a whole run.

| Suite | Cases | Samples | What changes |
|---|---|---|---|
| Triage | 32 | 96 | Short prompt only |
| Freeform | 32 | 96 | Same cases with the full tool catalog in context, about 10k tokens |
| Delegate | 18 | 54 | Act, delegate, ask, schedule or answer |

Triage and freeform each run in **fast** and **thinking** modes. Every case is run three times, because a single sample hides variance.

| Category | Cases | Expected decision |
|---|---|---|
| Start now | 8 | start a task with the right skill |
| Later | 4 | schedule it |
| Answer | 4 | answer directly |
| Capability questions | 4 | discover tools, never deny a capability |
| Live data | 5 | discover, call a tool, answer |
| Engine, no task | 3 | schedule, do not start a task |
| Wake | 2 | resume an existing task |
| Start or ask, do it yourself | 2 | ask or start; load a tool and act |

The full list of cases and accepted decisions is [published](https://github.com/kumarabd/portfolio/blob/main/bench/rtx3080/cases/decision-suite-cases.md). The prompts themselves are not, because they contain details from my own life.

## What keeps the numbers honest

| Rule | Why |
|---|---|
| Warm up, then measure | The first requests pay for loading and clock ramp-up |
| Time on the client, identically for every engine | Engine-reported numbers are not comparable |
| Random nonce at the front of cold prompts | Otherwise a prefix cache makes "cold" prompts warm |
| One configuration per run | One out-of-memory should not hide the others |
| Report the spread, and repeat | I ran the baseline twice, so I know a few samples is noise |
| Check the GPU is free first | A resident model on a shared card changes every number |

## What is not covered

- Speech, embeddings, rerankers and OCR were never benchmarked. They moved off the GPU on operational grounds.
- vLLM was never benchmarked head to head. It left the stack before this harness existed.
- Quality is one decision suite and one tool-calling check, written by me, for my agent.
- Only the NVIDIA driver version (580) is recorded. Versions of the engines are not, so an exact rerun needs fresh notes.

## Where it stands, and my verdict

Mapping the goal from post 1 onto the instruments:

| Criterion | Instrument | Covered |
|---|---|---|
| Fits, resident, shareable | VRAM and offload checks, the sweep | <span class="pill good">yes</span> |
| Fast enough | Sweep and engine bench | <span class="pill good">yes</span> |
| Decisions I would trust | Tool-calling check, decision suite | <span class="pill warn">one suite, written by me</span> |
| Easy to run | Notes only | <span class="pill warn">qualitative</span> |

**Verdict: enough to decide, not enough to generalise.** Speed and fit are measured in ways anyone can repeat. Quality rests on a single suite built for one agent, so I will treat quality results as evidence about my workload and nothing wider.

Next: the first engine, and why it did not stay.
