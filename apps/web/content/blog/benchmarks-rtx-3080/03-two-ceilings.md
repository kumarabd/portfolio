---
title: Two ceilings, measured
summary: A copy kernel finds the memory bandwidth ceiling and a big matrix multiply finds the compute ceiling. Compare both to the datasheet.
date: 2026-11-16
---

Post one derived two ceilings on paper: 760 GB/s of memory bandwidth and about 29.8 TFLOPS of FP32 compute. Now measure how close real code gets. Both snippets assume the `bench` helper from the previous post.

## Memory bandwidth

The simplest bandwidth test is a big copy. It does no arithmetic, so memory is the only limit.

```python
import torch

n = 512 * 1024 * 1024 // 4            # 512 MB of float32
x = torch.empty(n, device="cuda")
y = torch.empty_like(x)

ms, lo, hi = bench(lambda: y.copy_(x))
bytes_moved = 2 * x.numel() * 4       # one read plus one write
print(f"{bytes_moved / (ms / 1e3) / 1e9:.0f} GB/s  (peak 760)")
```

A copy both reads and writes, which is why the byte count is doubled. Expect a healthy card to land somewhere close to its peak but not on it, commonly in the high 80s to low 90s as a percentage. If you see far less, look for another process on the GPU, a thermally limited card, or a transfer that is secretly crossing PCIe.

## Compute

Matrix multiplication is the workload GPUs are built for. Multiplying two N×N matrices takes 2·N³ operations.

```python
import torch

N = 8192
flops = 2 * N**3

for dtype in (torch.float32, torch.float16):
    a = torch.randn(N, N, device="cuda", dtype=dtype)
    b = torch.randn(N, N, device="cuda", dtype=dtype)
    ms, lo, hi = bench(lambda: a @ b)
    print(f"{dtype}: {flops / (ms / 1e3) / 1e12:.1f} TFLOPS")
```

What to compare against:

| dtype | Datasheet ceiling | Runs on |
|---|---|---|
| float32 | about 29.8 TFLOPS | CUDA cores |
| float16 | about 60 TFLOPS dense | Tensor cores |

Two details change the answer, so write them down with the result:

- **TF32.** PyTorch's default for float32 matmul on Ampere does not use the tensor cores. Setting `torch.backends.cuda.matmul.allow_tf32 = True` does, trading some mantissa precision for speed. Report which mode you measured.
- **Sustained versus burst.** Run the matmul loop long enough to reach steady-state clocks, as discussed in the previous post, then compare.

## Reading the pair together

Two ratios, measured over theoretical, tell you a lot: bandwidth efficiency and compute efficiency. If both are healthy, the card and your environment are fine, and any later slowness belongs to the workload. If only one is low, you have already narrowed down where to look.
