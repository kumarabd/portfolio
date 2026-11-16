---
title: Fitting a real model in 10 GB
summary: September to October. A 14B, a 9B and an 8B on the same card, and the arithmetic that predicts which fits before you download anything.
date: 2026-09-26
until: 2026-10-27
---

With Ollama as the only GPU tenant, one question remained: which model do I leave resident? The card gave very different answers for three candidates.

<div class="stats">
<div><b>12.3 <small>tok/s</small></b><span>a 14B model with 21% pushed onto the CPU</span></div>
<div><b>~100 <small>tok/s</small></b><span>a 9B model, fully on the GPU</span></div>
<div><b>~90 <small>tok/s</small></b><span>Qwen3 8B at 40k context, fully on the GPU</span></div>
<div><b>5.6 <small>GiB</small></b><span>what an fp16 KV cache at 40k would have cost</span></div>
</div>

## The three candidates

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

The 14B fell off the cliff from post 1: roughly 9 GB of weights before any KV cache, so a fifth of it ran on the CPU and generation crawled. The 9B was faster and lighter but picked the wrong tool half the time. Qwen3 8B gave up some speed and all vision for the best tool accuracy, and an agent needs tool accuracy more than anything.

## The physics: predicting fit

Memory is arithmetic. Weights are parameters × bytes each:

| Precision | Bytes per parameter | 7B | 13B |
|---|---|---|---|
| FP16 | 2 | 14 GB | 26 GB |
| INT8 | 1 | 7 GB | 13 GB |
| 4-bit | about 0.5 | about 3.5 GB | about 6.5 GB |

The KV cache grows per token:

```text
bytes per token = 2 × layers × kv_heads × head_dim × bytes_per_value
```

```python
def fits(params_b, bits, layers, kv_heads, head_dim, ctx, vram_gb=10, overhead_gb=1.0, kv_bytes=2):
    weights = params_b * 1e9 * bits / 8
    kv = 2 * layers * kv_heads * head_dim * kv_bytes * ctx
    total = (weights + kv) / 2**30 + overhead_gb
    return round(total, 1), total <= vram_gb
```

Qwen3 8B has 36 layers, 8 key/value heads and a head dimension of 128 (from its published config). The table is where a setting decides whether it runs at all:

| KV cache type | Per token | At 32k | At 40k | Weights + KV at 40k |
|---|---|---|---|---|
| fp16 | 147,456 B | 4.50 GiB | 5.62 GiB | <span class="pill bad">10.3 GiB, does not fit</span> |
| q8_0 | 78,336 B | 2.39 GiB | 2.99 GiB | <span class="pill good">7.7 GiB, fits</span> |

Weights are 4.68 GiB, so the q8_0 cache gives 7.07 GiB at 32k and 7.67 GiB at 40k. I measured 7.6 and 8.3, an implied overhead of 0.5 to 0.6 GiB. **The q8_0 cache is what makes 40k context possible at all.** The server settings that came out of it:

```text
OLLAMA_CONTEXT_LENGTH=40960
OLLAMA_NUM_PARALLEL=1
OLLAMA_FLASH_ATTENTION=1
OLLAMA_KV_CACHE_TYPE=q8_0
OLLAMA_KEEP_ALIVE=10m
```

## What I produced

- A LiteLLM front door where `local-llm` and `local-llm-think` are the same Qwen3 8B weights, differing only in a per-request thinking flag, so switching never reloads the model.
- Embeddings and both rerankers moved to the CPU, so they stop competing with the language model.
- A calculator for fit, above, that I now run before downloading any model.

## Where it stands, and my verdict

How the datasheet's predictions from post 1 held up so far:

| Question from post 1 | Paper said | Measured | |
|---|---|---|---|
| Does a 7 to 8B model fit? | Yes, with room | Qwen3 8B at 40k uses 8.3 GB, fully on GPU | <span class="pill good">held</span> |
| Is 10 GB a cliff? | Yes | The 14B offloaded 21% and ran at 12.3 tok/s | <span class="pill good">held</span> |
| Weights + KV + overhead | 7.7 GiB + 0.5 to 1.0 | 8.3 GB at 40k | <span class="pill good">held</span> |
| Can several jobs share the card? | Only if memory sums to under 10 GB | Embedder and STT moved off the GPU (post 3) | <span class="pill good">held</span> |

**Verdict: Qwen3 8B at 40k context, q8_0 KV cache.** It is the only candidate that is both fully resident and good at choosing tools. It leaves about 1.4 GiB free, which is thin, so the embedder had to leave the GPU. Next: how fast it really is against the ceilings the datasheet drew.
