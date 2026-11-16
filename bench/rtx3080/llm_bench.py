"""Quality + latency check for a llama-server (OpenAI-compatible) endpoint.

    python llm_bench.py http://localhost:8080 --think off|on

Ten cases against an agent-shaped tool set: tool choice, argument accuracy, correct restraint (no tool when none is
needed), a parallel call, an enum argument and a tool-result follow-up. Prints pass/fail per case plus decode and
prompt-processing speed (from llama-server's own `timings`) and wall time.
"""
import argparse
import json
import sys
import time
import urllib.request


def fn(name, desc, props, required):
    return {"type": "function", "function": {"name": name, "description": desc,
            "parameters": {"type": "object", "properties": props, "required": required}}}


S, N, I = {"type": "string"}, {"type": "number"}, {"type": "integer"}
TOOLS = [
    fn("get_spending", "Total spending for a category in a month.", {"category": S, "month": {"type": "string", "description": "YYYY-MM"}}, ["category", "month"]),
    fn("list_transactions", "List recent transactions, optionally for one merchant.", {"merchant": S, "limit": I}, ["limit"]),
    fn("captain_pick", "Recommend a Fantasy Premier League captain for a gameweek.", {"gameweek": I}, ["gameweek"]),
    fn("search_notes", "Full-text search over the user's notes.", {"query": S}, ["query"]),
    fn("get_weather", "Current weather for a city.", {"city": S}, ["city"]),
    fn("create_reminder", "Create a reminder.", {"text": S, "when": {"type": "string", "description": "ISO 8601 or natural language"}}, ["text", "when"]),
    fn("set_thermostat", "Set the thermostat.", {"mode": {"type": "string", "enum": ["heat", "cool", "off"]}, "temp_f": N}, ["mode"]),
    fn("send_email", "Send an email.", {"to": S, "subject": S, "body": S}, ["to", "subject", "body"]),
]
SYSTEM = "You are a personal assistant. Today is 2026-11-09. Use tools when they help; answer directly otherwise."


def has(call, name, **kw):
    a = call["args"]
    return call["name"] == name and all(str(v).lower() in str(a.get(k, "")).lower() for k, v in kw.items())


LONG = "\n".join(f"Note {i}: met with the team about item {i}; budget {i * 37 % 900} dollars, owner person{i % 17}, follow up in week {i % 9}." for i in range(380))  # ~8k tokens

CASES = [  # (prompt, check(calls, text))
    ("How much did I spend on groceries in October?", lambda c, t: any(has(x, "get_spending", category="grocer", month="2026-10") for x in c)),
    ("Who should I captain in gameweek 12?", lambda c, t: any(has(x, "captain_pick", gameweek=12) for x in c)),
    ("Remind me to call mom tomorrow at 5pm", lambda c, t: any(has(x, "create_reminder", text="mom") for x in c)),
    ("Find my notes about the Kubernetes migration", lambda c, t: any(has(x, "search_notes", query="kubernetes") for x in c)),
    ("What's the weather in Seattle right now?", lambda c, t: any(has(x, "get_weather", city="seattle") for x in c)),
    ("What is 17 times 23?", lambda c, t: not c and "391" in t),
    ("Compare my spending on dining vs groceries last month.", lambda c, t: sum(has(x, "get_spending", month="2026-10") for x in c) >= 2),
    ("Show my last 5 transactions at Costco", lambda c, t: any(has(x, "list_transactions", merchant="costco", limit=5) for x in c)),
    ("Turn the heat on to 70", lambda c, t: any(has(x, "set_thermostat", mode="heat", temp_f=70) for x in c)),
    # harder: restraint, dependency, parallelism across different tools, long context
    ("Send an email to Sam.", lambda c, t: not c),  # subject and body are missing: ask, don't invent
    ("Email me my October grocery total at me@example.com", lambda c, t: bool(c) and c[0]["name"] == "get_spending" and not any(x["name"] == "send_email" for x in c)),  # must look the number up first
    ("Set the thermostat to cool at 68 and remind me at 9pm to take out the trash.", lambda c, t: any(has(x, "set_thermostat", mode="cool", temp_f=68) for x in c) and any(has(x, "create_reminder", text="trash") for x in c)),
    ("What's the weather in Lisbon? I'm deciding whether to pack an umbrella.", lambda c, t: any(has(x, "get_weather", city="lisbon") for x in c)),
    (LONG + "\n\nGiven all that, who should I captain in gameweek 14?", lambda c, t: any(has(x, "captain_pick", gameweek=14) for x in c)),
]


def chat(base, messages, think, model="", key=""):
    body = {"model": model, "messages": messages, "tools": TOOLS, "temperature": 0.2, "max_tokens": 2048,
            "chat_template_kwargs": {"enable_thinking": think}}
    req = urllib.request.Request(base + "/v1/chat/completions", json.dumps(body).encode(), {"content-type": "application/json", **({"Authorization": "Bearer " + key} if key else {})})
    t0 = time.time()
    r = json.load(urllib.request.urlopen(req, timeout=600))
    return r, time.time() - t0


def parse(msg):
    calls = []
    for tc in msg.get("tool_calls") or []:
        a = tc["function"]["arguments"]
        calls.append({"name": tc["function"]["name"], "args": json.loads(a) if isinstance(a, str) and a else (a or {}), "id": tc.get("id", "x")})
    return calls, msg.get("content") or ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("--think", choices=["on", "off"], default="off")
    ap.add_argument("--model", default="")
    ap.add_argument("--key", default="")
    a = ap.parse_args()
    think, passed, dec, pp, wall = a.think == "on", 0, [], [], []
    for prompt, check in CASES:
        r, dt = chat(a.base, [{"role": "system", "content": SYSTEM}, {"role": "user", "content": prompt}], think, a.model, a.key)
        calls, text = parse(r["choices"][0]["message"])
        ok = bool(check(calls, text))
        passed += ok
        tm = r.get("timings", {})
        dec.append(tm.get("predicted_per_second", 0)); pp.append(tm.get("prompt_per_second", 0)); wall.append(dt)
        print(f"{'PASS' if ok else 'FAIL'}  {dt:5.1f}s  {prompt[:50]!r:54} -> {[(c['name'], c['args']) for c in calls] or text[:40]!r}")
    # follow-up: feed a tool result back, the answer must use it
    msgs = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": "How much did I spend on groceries in October?"},
            {"role": "assistant", "content": None, "tool_calls": [{"id": "c1", "type": "function", "function": {"name": "get_spending", "arguments": json.dumps({"category": "groceries", "month": "2026-10"})}}]},
            {"role": "tool", "tool_call_id": "c1", "content": json.dumps({"total": 612.37, "currency": "USD"})}]
    r, dt = chat(a.base, msgs, think, a.model, a.key)
    calls, text = parse(r["choices"][0]["message"])
    ok = not calls and "612" in text
    passed += ok
    print(f"{'PASS' if ok else 'FAIL'}  {dt:5.1f}s  tool-result follow-up -> {text[:60]!r}")
    n = len(CASES) + 1
    avg = lambda xs: sum(xs) / max(len(xs), 1)
    print(f"\nSCORE {passed}/{n}  think={a.think}  decode {avg(dec):.1f} tok/s  prompt {avg(pp):.0f} tok/s  mean {avg(wall):.1f}s/case")
    sys.exit(0)


if __name__ == "__main__":
    main()
