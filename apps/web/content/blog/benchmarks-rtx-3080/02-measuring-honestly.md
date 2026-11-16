---
title: Measuring honestly
summary: GPU work is asynchronous, clocks move, and cards throttle. A small timing harness and a short checklist keep the numbers trustworthy.
date: 2026-11-16
---

The most common GPU benchmark bug is timing the wrong thing. When you call a CUDA operation from Python, the call returns as soon as the work is *queued*, not when it is *done*. Wrap it in `time.time()` and you have measured how fast Python can enqueue.

## A harness that does it properly

```python
import statistics
import torch

def bench(fn, warmup=10, iters=50):
    """Median, min and max milliseconds per call, measured on the GPU."""
    for _ in range(warmup):
        fn()
    torch.cuda.synchronize()

    times = []
    for _ in range(iters):
        start = torch.cuda.Event(enable_timing=True)
        end = torch.cuda.Event(enable_timing=True)
        start.record()
        fn()
        end.record()
        end.synchronize()
        times.append(start.elapsed_time(end))
    return statistics.median(times), min(times), max(times)
```

Three decisions in there are the whole game:

1. **Warm up.** The first calls pay for kernel selection, memory allocation and clock ramp-up. Throw them away.
2. **Time on the GPU.** CUDA events are timestamps recorded in the GPU's own queue, so they measure execution, not enqueueing.
3. **Report the median, and the spread.** One slow iteration from a background process should not move your headline number. If min and max are far apart, the machine is noisy and you should find out why.

## Things that quietly change the answer

- **Clocks.** The card boosts opportunistically. Watch it while the test runs: `nvidia-smi --query-gpu=clocks.sm,temperature.gpu,power.draw --format=csv -l 1`.
- **Thermals and power.** A 320 W card in a warm case will start shedding clock speed after a minute of sustained load. A benchmark that runs for two seconds and one that runs for two minutes can disagree by a lot. Measure both, and say which one you are reporting.
- **Size.** Tiny operations are dominated by kernel launch overhead, not by the hardware. Use sizes large enough that the kernel runs for at least a millisecond or so.
- **Other work on the GPU.** A desktop session, a browser with hardware acceleration and a stray notebook kernel all share the card and its memory.
- **Software versions.** Record driver, CUDA, cuDNN and PyTorch versions. A result without them cannot be reproduced or compared.

## What a result should look like

A number alone is not a result. A useful line says what was run, on what, and how much it varied:

> fp16 matmul, 8192×8192, median of 50 after 10 warmup iterations, PyTorch version and driver version noted, GPU at steady-state clocks.

Every post that follows uses this harness.
