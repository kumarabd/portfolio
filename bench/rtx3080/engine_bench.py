"""Engine speed comparison over any OpenAI-compatible /v1/completions endpoint (Ollama, llama-server, TabbyAPI, vLLM).

    python engine_bench.py http://localhost:8080 --model qwen3-8b --label llamacpp --out llamacpp.json

Raw completions with a fixed prompt, so chat templates, thinking mode and tool formats can't skew the numbers; tool-call
quality goes through llm_bench.py. Everything is timed on the client with streaming, the same way for every engine:
  ttft_cold  time to first token on a prompt the server hasn't seen (a random nonce leads it, so prefix caches can't help)
  ttft_warm  the same prompt again (what an agent loop resending its system prompt gets)
  decode     tokens/s after the first token
  conc       aggregate tokens/s with 1, 2, 4 requests in flight at a 1k prompt
"""
import argparse
import json
import random
import statistics
import string
import sys
import threading
import time
import urllib.request

FILLER = ("The quarterly review covered budget lines, staffing, vendor contracts and the schedule for the migration. "
          "Each owner reported status, risks and the next step, and the notes below record what was decided. ")
TASK = "\n\nTask: count from 1 to 400 separated by commas.\nAnswer: 1, 2, 3,"
OUT_TOKENS = 256


def prompt(n_tokens, nonce=True):
    n = "".join(random.choices(string.ascii_lowercase, k=12)) if nonce else "fixed"
    body = (FILLER * (n_tokens * 4 // len(FILLER) + 1))[: n_tokens * 4]  # ~4 chars/token
    return f"[{n}] {body}{TASK}"


def stream_ollama(base, model, text):
    """Ollama's native API in raw mode (no chat template, so Qwen3 doesn't spend the budget thinking)."""
    body = {"model": model, "prompt": text, "raw": True, "stream": True, "options": {"num_predict": OUT_TOKENS, "temperature": 0}}
    req = urllib.request.Request(base + "/api/generate", json.dumps(body).encode(), {"content-type": "application/json"})
    t0, first, last, chunks, final = time.time(), None, None, 0, {}
    with urllib.request.urlopen(req, timeout=900) as r:
        for raw in r:
            d = json.loads(raw)
            if d.get("response"):
                now = time.time()
                first = first or now
                last, chunks = now, chunks + 1
            if d.get("done"):
                final = d
    if first is None:
        raise RuntimeError("no tokens streamed")
    n = final.get("eval_count") or chunks
    dec = (n - 1) / (last - first) if last > first and n > 1 else 0.0
    return first - t0, dec, n, final.get("prompt_eval_count", 0), time.time() - t0


API = "openai"


def stream(base, model, text, key=""):
    """Returns (ttft, decode_tok_s, completion_tokens, prompt_tokens, wall)."""
    if API == "ollama":
        return stream_ollama(base, model, text)
    chat = API == "chat"  # engines with no /v1/completions (Strata): chat endpoint, thinking off
    body = {"model": model, "max_tokens": OUT_TOKENS, "temperature": 0, "stream": True,
            "stream_options": {"include_usage": True}}
    if chat:
        body.update(messages=[{"role": "user", "content": text}], chat_template_kwargs={"enable_thinking": False})
    else:
        body["prompt"] = text
    req = urllib.request.Request(base + ("/v1/chat/completions" if chat else "/v1/completions"), json.dumps(body).encode(),
                                 {"content-type": "application/json", **({"Authorization": "Bearer " + key} if key else {})})
    t0, first, last, chunks, usage = time.time(), None, None, 0, {}
    with urllib.request.urlopen(req, timeout=900) as r:
        for raw in r:
            line = raw.decode().strip()
            if not line.startswith("data:") or line.endswith("[DONE]"):
                continue
            d = json.loads(line[5:])
            if d.get("usage"):
                usage = d["usage"]
            ch = d.get("choices") or []
            if ch and (ch[0].get("text") or (ch[0].get("delta") or {}).get("content")):
                now = time.time()
                first = first or now
                last, chunks = now, chunks + 1
    if first is None:
        raise RuntimeError("no tokens streamed")
    n = usage.get("completion_tokens") or chunks
    dec = (n - 1) / (last - first) if last > first and n > 1 else 0.0
    return first - t0, dec, n, usage.get("prompt_tokens", 0), time.time() - t0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("--model", required=True)
    ap.add_argument("--label", default="engine")
    ap.add_argument("--key", default="")
    ap.add_argument("--out", default="")
    ap.add_argument("--ctx", default="1024,8192,14000")
    ap.add_argument("--reps", type=int, default=3)
    ap.add_argument("--api", choices=["openai", "ollama", "chat"], default="openai")
    a = ap.parse_args()
    global API
    API = a.api
    res = {"label": a.label, "ctx": {}, "conc": {}}
    stream(a.base, a.model, prompt(256), a.key)  # warm-up: load weights / compile graphs, not timed
    for n in [int(x) for x in a.ctx.split(",")]:
        cold, warm, dec, ptok = [], [], [], 0
        for _ in range(a.reps):
            p = prompt(n)
            t, d, _, ptok, _ = stream(a.base, a.model, p, a.key)
            cold.append(t); dec.append(d)
            warm.append(stream(a.base, a.model, p, a.key)[0])
        res["ctx"][n] = {"prompt_tokens": ptok, "ttft_cold_s": statistics.median(cold), "ttft_warm_s": statistics.median(warm),
                         "decode_tok_s": statistics.median(dec)}
        c = res["ctx"][n]
        print(f"{a.label:10} ctx~{n:6} ({ptok:6} tok)  cold {c['ttft_cold_s']:6.2f}s  warm {c['ttft_warm_s']:6.2f}s  decode {c['decode_tok_s']:6.1f} tok/s", flush=True)
    for k in (1, 2, 4):
        out, t0 = [], time.time()
        def one():
            out.append(stream(a.base, a.model, prompt(1024), a.key)[2])
        ts = [threading.Thread(target=one) for _ in range(k)]
        [t.start() for t in ts]; [t.join() for t in ts]
        res["conc"][k] = sum(out) / (time.time() - t0)
        print(f"{a.label:10} {k} in flight: {res['conc'][k]:6.1f} tok/s aggregate", flush=True)
    if a.out:
        json.dump(res, open(a.out, "w"), indent=1)


if __name__ == "__main__":
    main()
