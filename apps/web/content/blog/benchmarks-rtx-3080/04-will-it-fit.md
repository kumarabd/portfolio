---
title: Will it fit in 10 GB?
summary: Model memory is arithmetic. Weights, KV cache and training state, worked out in bytes before you download anything.
date: 2026-11-16
---

Capacity is the hard limit on a 10 GB card, and it is predictable. You can do the sums on paper.

## Weights

Memory for weights is parameters times bytes per parameter.

| Precision | Bytes per parameter | 7B model | 13B model |
|---|---|---|---|
| FP16 / BF16 | 2 | 14 GB | 26 GB |
| INT8 | 1 | 7 GB | 13 GB |
| 4-bit | about 0.5 | about 3.5 GB | about 6.5 GB |

A 7B model in FP16 does not fit. The same model in 4-bit leaves most of the card free. A 13B model in 4-bit fits, but with less room around it. Real 4-bit formats store per-block scales, so budget a little over the nominal figure.

## The KV cache

During generation, the model keeps the attention keys and values of every previous token so it does not recompute them. That cache grows with context length:

```text
bytes per token = 2 × layers × kv_heads × head_dim × bytes_per_value
```

The 2 is for keys and values. Two examples, both at FP16:

- **Llama 2 7B** has 32 layers, 32 key/value heads and a head dimension of 128. That is 2 × 32 × 32 × 128 × 2 = 524,288 bytes, or 0.5 MiB per token. A 4,096-token context costs **2 GiB**.
- **Llama 3 8B** has 32 layers but only 8 key/value heads (grouped-query attention). That is 128 KiB per token, so an 8,192-token context costs **1 GiB**.

Architecture choices like grouped-query attention exist largely to shrink this number. When you pick a model for a small card, its KV cost per token matters as much as its parameter count.

## Everything else

Add a margin for the CUDA context, framework buffers and activations, commonly several hundred megabytes up to a gigabyte. And if the same GPU drives your display, the desktop takes a slice too.

## A calculator

```python
def fits(params_b, bits, layers, kv_heads, head_dim, ctx, vram_gb=10, overhead_gb=1.0):
    weights = params_b * 1e9 * bits / 8
    kv = 2 * layers * kv_heads * head_dim * 2 * ctx   # FP16 cache
    total_gb = (weights + kv) / 2**30 + overhead_gb
    return total_gb, total_gb <= vram_gb

print(fits(8, 4, layers=32, kv_heads=8, head_dim=128, ctx=8192))
```

## Training is a different budget

Training holds far more than weights. With the Adam optimizer in plain FP32, each parameter needs 4 bytes for the weight, 4 for its gradient and 8 for the optimizer's two moments: **16 bytes per parameter**, before activations. A 10 GB card therefore tops out under one billion parameters for full training. That is why parameter-efficient methods such as LoRA, which train a small set of added weights on top of a frozen, quantized base model, are the practical route on this class of hardware.
