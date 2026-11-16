---
title: Agents are language models with hands
summary: Give a model tools and a loop and it can act. How agents work, what MCP standardizes, and why access control suddenly matters.
date: 2026-11-16
---

A language model on its own only produces text. An **agent** is a language model placed in a loop where it can also *do* things, by calling tools.

## The loop

```python
messages = [{"role": "user", "content": task}]

while True:
    reply = model(messages, tools=TOOLS)
    messages.append(reply)

    if not reply.tool_calls:          # the model decided it is done
        return reply.text

    for call in reply.tool_calls:
        result = run_tool(call.name, call.arguments)
        messages.append({"role": "tool", "content": result})
```

The model reads the task, decides it needs something such as a search, a file read or an API call, and emits a structured request for that tool. Ordinary code runs it and feeds the result back. The model looks at the result and decides what to do next. Everything an agent does is that cycle repeated.

A **tool** is just a function with a name, a description and a typed set of arguments. The description is how the model knows when to use it.

## Why a standard helps

Every tool used to be wired into every application by hand. The **Model Context Protocol (MCP)** is an open standard for that connection: a tool provider runs an MCP server that describes what it can do, and any compatible application can discover and call those tools. Write the integration once, use it from many places.

## Why this raises the stakes

Text generation is low risk: the worst case is a wrong paragraph. An agent with tools can send email, change files or call production systems. The questions that matter change:

- **Who is the agent acting as?** Its permissions should be those of a specific user or service, with the least privilege that gets the job done.
- **What is it allowed to call?** Policy should be explicit and checked outside the model, since the model's own judgement is not a security boundary.
- **What did it do?** Every call needs an audit trail.
- **Can untrusted text steer it?** Content the agent reads, such as a web page or an email, can contain instructions aimed at the model. This is called **prompt injection**, and it means tool output should be treated as untrusted input, never as commands.

None of these is exotic. They are the access-control, policy and observability problems the industry has already solved for human users and services, now applied to a new kind of caller.

## Where to go from here

You now have the whole stack: AI as the umbrella, machine learning as fitting from examples, neural networks as stacked dials, language models as next-token prediction, and agents as models in a loop with tools. Most arguments about "what AI can do" get easier once you know which layer is being discussed.
