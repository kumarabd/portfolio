---
title: The card on paper
summary: Every spec on the RTX 3080 box reduces to two numbers that decide most ML workloads.
date: 2026-11-16
---

Before running anything, read the datasheet. A benchmark result only means something next to the number it is trying to approach.

## The spec sheet

| | RTX 3080 (10 GB) |
|---|---|
| Chip | GA102, Ampere architecture |
| Streaming multiprocessors | 68 |
| CUDA cores | 8,704 |
| Tensor cores | 272 (3rd generation) |
| Boost clock | about 1.71 GHz |
| Memory | 10 GB GDDR6X, 320-bit bus, 19 Gbps |
| Board power | 320 W |

Most of that collapses into two figures.

**Compute.** Each CUDA core can do one fused multiply-add per clock, which counts as two floating point operations. So the FP32 peak is 8,704 × 2 × 1.71 GHz, about **29.8 TFLOPS**. The tensor cores run matrix math in lower precision much faster: roughly 60 TFLOPS dense for FP16 with FP32 accumulation, the mode deep learning frameworks use by default.

**Memory bandwidth.** A 320-bit bus is 40 bytes wide. At 19 Gbps per pin that is 40 × 19 = **760 GB/s**.

## Why the ratio matters

Divide the first by the second: 29.8 trillion operations per second against 760 billion bytes per second is about 39 operations per byte, or roughly 157 operations for every 4-byte float loaded from memory.

That is the card's *balance*. A workload that does fewer than that many operations on each value it loads cannot keep the cores busy: it waits on memory. It is **bandwidth-bound**. A workload that does more is **compute-bound**.

- Adding two big vectors does one operation per two loaded values. Bandwidth-bound by a mile.
- Multiplying two large matrices reuses each value many times. Compute-bound.
- Generating text with a language model one token at a time reads every weight once per token and does very little with it. Bandwidth-bound. We come back to this in the last post of the series.

## The third number: 10 GB

Capacity is a cliff, not a slope. Speed degrades gradually as you push a workload; a model that needs 10.5 GB of memory simply does not run. The fourth post is about checking that before you start.

## What the rest of the series does

The next posts measure each of these ceilings on real hardware and compare the result to the paper number above. The point is the ratio between measured and theoretical, since that ratio is what tells you whether your setup is healthy.
