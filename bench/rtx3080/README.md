# RTX 3080 benchmarks: tests and results

The test code, cases and summary results behind the blog series
[Benchmarks with RTX 3080](https://abishekkumar.me/blog/benchmarks-rtx-3080).
Everything was run on one RTX 3080 (10 GB) shared with other services.

## Files

| File | What it does |
|---|---|
| `sweep.sh` | Raw speed with `llama-bench`: prompt processing at 512 and 4,096 tokens, generation of 128. One run per configuration so an out-of-memory does not abort the rest. Run inside a llama.cpp CUDA pod with the GPU free |
| `engine_bench.py` | Engine comparison over any OpenAI-compatible endpoint (Ollama, llama-server, Strata, vLLM): time to first token cold and warm, decode speed, aggregate speed with 1, 2 and 4 requests in flight |
| `llm_bench.py` | Tool-calling quality and latency: 14 cases plus a follow-up, against an eight-tool set |
| `strata-bench.yaml` | Kubernetes manifest used to run the Strata engine for the speed run (node name removed, key replaced) |
| `cases/tool-calling-cases.md` | The 15 prompts in `llm_bench.py` and what each tests |
| `cases/decision-suite-cases.md` | The agent decision suite: 32 cases (run in triage and freeform modes) plus 18 delegate cases, with the decision each should produce |
| `results/` | `sweep-results.txt`, the four `engine-*.json` files, and per-suite totals for the decision suite |

## Running

```bash
python engine_bench.py http://localhost:8080 --model <name> --label mine --out mine.json
python llm_bench.py http://localhost:8080 --think off
```

`sweep.sh` expects the model files under `/models` and skips any that are missing.

## What is not here

- **Raw per-sample outputs** of the decision suite. They contain details from my own agent runs, so only the per-suite totals and per-category counts are published.
- **The decision suite's prompts and the harness that runs it.** The cases and expected decisions are listed; the prompts are personal.

## Known limits

- Only the driver version (580) is recorded in these files. CUDA, llama.cpp, Ollama and Strata versions were not captured, so exact reproduction needs a rerun with versions noted.
- `sweep.sh` uses 2 repetitions; the decision suite uses 3 samples per case. Differences under 3 samples on a suite are noise (see the series).
- Two of the four model families in the sweep were not on disk when it ran and were skipped (the result file says which).
