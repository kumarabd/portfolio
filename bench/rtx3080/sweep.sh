#!/bin/sh
# Raw speed sweep, run INSIDE the llama.cpp full-cuda pod with the GPU free and /models mounted.
# Each config is its own llama-bench run so one OOM doesn't abort the rest.
# Matches Ollama's runtime settings: flash attention on, q8_0 KV cache.
B="/app/llama-bench -fa 1 -ctk q8_0 -ctv q8_0 -p 512,4096 -n 128 -r 2"
M=/models
mkdir -p $M/results
run() { # label, args...  (skips configs whose model file isn't on the volume)
  l=$1; shift
  for a in "$@"; do case "$a" in *.gguf) [ -f "$a" ] || { echo "skip $l (missing $a)" | tee -a $M/results/sweep.txt; return; };; esac; done
  echo "### $l" | tee -a $M/results/sweep.txt
  $B "$@" 2>&1 | grep -E "^\|" | tee -a $M/results/sweep.txt || echo "FAILED (likely OOM)" | tee -a $M/results/sweep.txt
}

run "qwen3-8b all-GPU t8"          -m $M/Qwen3-8B-Q4_K_M.gguf -ngl 99 -t 8

# layers per model: 30B-A3B = 48, 35B-A3B ~ 40, gpt-oss-20b = 24; -ncmoe N keeps the experts of the first N layers on CPU
for n in 26 30 34 48; do run "qwen3-30b-a3b ncmoe=$n t8" -m $M/Qwen3-30B-A3B-Instruct-2507-Q4_K_M.gguf -ngl 99 -ncmoe $n -t 8; done
for n in 24 28 32 40; do run "qwen3.6-35b-a3b ncmoe=$n t8" -m $M/Qwen3.6-35B-A3B-UD-Q4_K_M.gguf -ngl 99 -ncmoe $n -t 8; done
for n in 0 8 12 16;   do run "gpt-oss-20b ncmoe=$n t8"  -m $M/gpt-oss-20b-F16.gguf -ngl 99 -ncmoe $n -t 8; done

# thread count matters when experts run on CPU: 8 physical cores vs 16 threads, on the best-looking MoE config
run "qwen3.6-35b-a3b ncmoe=28 t16" -m $M/Qwen3.6-35B-A3B-UD-Q4_K_M.gguf -ngl 99 -ncmoe 28 -t 16
run "qwen3.6-35b-a3b ncmoe=28 t6"  -m $M/Qwen3.6-35B-A3B-UD-Q4_K_M.gguf -ngl 99 -ncmoe 28 -t 6
echo DONE | tee -a $M/results/sweep.txt
