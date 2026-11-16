---
title: Tokens per second is a bandwidth problem
summary: Generating text one token at a time reads the whole model from memory for every token. That gives a ceiling you can compute before running anything.
date: 2026-11-16
---

The last two posts gave us capacity and bandwidth. Together they predict how fast a model can generate text.

## Decoding reads everything, every time

To produce one token, the model has to pass it through every layer, which means reading every weight from memory. For a single stream of text the math per byte read is tiny, so the card sits well below its compute peak and waits on memory.

That gives a hard ceiling:

```text
tokens per second  ≤  memory bandwidth / bytes of weights
```

For a 7B model in 4-bit, about 3.5 GB of weights on a card with 760 GB/s:

```text
760 / 3.5 ≈ 217 tokens per second
```

Real quantized formats are somewhat bigger than the nominal 3.5 GB, and the KV cache and other overheads also need reading, so a realistic ceiling is lower. The number is not a prediction. It is a line your measurement must stay under. If you measure more than the ceiling, something is wrong with the measurement.

The same arithmetic explains why quantization speeds generation up. Halving the bytes per weight roughly doubles the ceiling, not because the math is faster but because there is less to read.

## Prompt processing is the other regime

Processing the prompt is different. All the prompt tokens can be pushed through together, so each weight loaded gets reused across many tokens. That makes it **compute-bound**. A decoder-only model needs about 2 operations per parameter per token, so a 7B model costs roughly 14 GFLOP per token. At a sustained 60 TFLOPS that is a ceiling of about 4,300 tokens per second.

| Phase | Limited by | Rough ceiling for a 7B 4-bit model |
|---|---|---|
| Prompt processing | Compute | about 4,300 tokens/s |
| Token generation | Memory bandwidth | about 217 tokens/s, less in practice |

> **Correction, Nov 16.** The prompt-processing ceiling above is too low for 4-bit models. Measured on a real RTX 3080, an 8B Q4_K_M model processed prompts at about 4,580 tokens/s, which is roughly 75 TFLOPS of useful work, above the 60 TFLOPS FP16 figure used here. Quantized kernels appear to use the tensor cores' integer path, which has a higher peak. The generation ceiling is unaffected. See [A harness, then the sweep](/blog/benchmarks-rtx-3080/harness-and-sweep).

Those two phases behave so differently that any honest benchmark reports them separately.

## Measuring it

`llama-bench`, which ships with llama.cpp, reports both phases:

```bash
llama-bench -m model-q4.gguf -p 512 -n 128
```

`-p` is the prompt length for the prompt-processing test and `-n` the number of tokens to generate. Run it long enough to reach steady-state clocks, and note the model file, quantization and software version next to the result.

## The number to report

Do not just report tokens per second. Report it next to the ceiling:

> 7B, 4-bit: measured X tok/s against a bandwidth ceiling of about 217, so Y% of the way there.

That single percentage tells a reader how well the software stack uses the hardware, which is the thing they can compare across cards and runtimes. Raw speed alone cannot do that.
