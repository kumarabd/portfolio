"""Image-in latency over /v1/chat/completions: python vision_bench.py http://localhost:8080 MODEL image.png [--reps 3]
Prints time to first token (image encode + prompt read) and decode tok/s per rep, and the answer so you can eyeball it."""
import base64, json, sys, time, urllib.request

base, model, img = sys.argv[1:4]
reps = int(sys.argv[5]) if len(sys.argv) > 5 else 3
url = "data:image/png;base64," + base64.b64encode(open(img, "rb").read()).decode()
for i in range(reps):
    body = {"model": model, "max_tokens": 128, "temperature": 0, "stream": True, "chat_template_kwargs": {"enable_thinking": False},
            "stream_options": {"include_usage": True},
            "messages": [{"role": "user", "content": [{"type": "image_url", "image_url": {"url": url}},
                                                      {"type": "text", "text": "List the shapes, their colors, and any text in this image."}]}]}
    req = urllib.request.Request(base + "/v1/chat/completions", json.dumps(body).encode(), {"content-type": "application/json"})
    t0, first, last, out, n = time.time(), None, None, "", 0
    with urllib.request.urlopen(req, timeout=600) as r:
        for raw in r:
            l = raw.decode().strip()
            if not l.startswith("data:") or l.endswith("[DONE]"):
                continue
            d = json.loads(l[5:])
            n = (d.get("usage") or {}).get("completion_tokens", n)
            ch = d.get("choices") or []
            c = ch and (ch[0].get("delta") or {}).get("content")
            if c:
                last = time.time(); first = first or last; out += c
    print(f"rep {i}: ttft {first - t0:.2f}s  decode {(n - 1) / (last - first):.1f} tok/s  ({n} tok)")
print(out)
