---
title: Waking, asking, stopping
summary: How an agent starts without being asked, pauses to ask a person, and stops before it does damage. Three designs for waking, one primitive for asking.
verdict: An agent only needs a wake when its own reasoning is needed later; everything else is a notification. Asking is a durable pause, approvals are the same pause, and stopping is a clean result, not a crash.
date: 2026-08-07
---

An autonomous agent has to do three things a chatbot never does. **Start on its own**, because nobody typed anything. **Ask**, because some actions need a person. **Stop**, because it must not run forever or spend without limit. I redesigned the first one three times and the other two once each.

<div class="stats">
<div><b>3</b><span>designs for waking before one small one stuck</span></div>
<div><b>1</b><span>pause primitive for questions, choices and approvals</span></div>
<div><b>1 <small>h</small></b><span>how long a question waits before it is cancelled</span></div>
<div><b>Clean</b><span>every stop ends with a partial result, not a crash</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">Three ways in, three guards <small>A person, a clock or a change can start a turn. The turn can pause to ask, is bounded by a budget, and always stops cleanly.</small></div>
<svg viewBox="0 0 760 330" role="img" aria-label="A person's message, a wake at a set time, and a watch on a change all start the agent's turn. Three guards sit under it: ask, budget and clean stop. The turn acts through tools or tells the person.">
<path class="de" pathLength="1" style="--d:.7s;--k:#6b6677" d="M180 62 C250 62 250 150 310 150"/>
<path class="de" pathLength="1" style="--d:.8s;--k:#a16207" d="M180 150 H310"/>
<path class="de" pathLength="1" style="--d:.9s;--k:#a16207" d="M180 238 C250 238 250 150 310 150"/>
<path class="de" pathLength="1" style="--d:1.1s;--k:#4338ca" d="M480 150 H590"/>
<path class="de" pathLength="1" style="--d:1.3s;--k:#a16207" d="M345 190 V258"/>
<path class="de" pathLength="1" style="--d:1.4s;--k:#a16207" d="M447 190 V258"/>
<path class="de" pathLength="1" style="--d:1.5s;--k:#a16207" d="M470 190 C470 224 549 224 549 258"/>
<g class="dn" style="--d:.1s"><rect x="30" y="36" width="150" height="52" rx="12"/><text x="105" y="60" text-anchor="middle">A person writes</text><text class="sub" x="105" y="77" text-anchor="middle">any channel</text></g>
<g class="dn tint" style="--d:.2s;--k:#a16207"><rect x="30" y="124" width="150" height="52" rx="12"/><text x="105" y="148" text-anchor="middle">A wake</text><text class="sub" x="105" y="165" text-anchor="middle">the agent's own message</text></g>
<g class="dn tint" style="--d:.3s;--k:#a16207"><rect x="30" y="212" width="150" height="52" rx="12"/><text x="105" y="236" text-anchor="middle">A watch</text><text class="sub" x="105" y="253" text-anchor="middle">something changed</text></g>
<g class="dn solid" style="--d:.5s"><rect x="310" y="110" width="170" height="80" rx="14"/><text x="395" y="146" text-anchor="middle" style="font-size:16px">Agent turn</text><text class="sub" x="395" y="166" text-anchor="middle" style="fill:#d8d4e4">one door for all input</text></g>
<g class="dn tint" style="--d:1s;--k:#4338ca"><rect x="590" y="124" width="140" height="52" rx="12"/><text x="660" y="148" text-anchor="middle">Act</text><text class="sub" x="660" y="165" text-anchor="middle">tools · tell the person</text></g>
<g class="dn tint" style="--d:1.3s;--k:#a16207"><rect x="299" y="258" width="92" height="52" rx="12"/><text x="345" y="282" text-anchor="middle" style="font-size:13px">Ask</text><text class="sub" x="345" y="299" text-anchor="middle">pause, durably</text></g>
<g class="dn tint" style="--d:1.4s;--k:#a16207"><rect x="401" y="258" width="92" height="52" rx="12"/><text x="447" y="282" text-anchor="middle" style="font-size:13px">Budget</text><text class="sub" x="447" y="299" text-anchor="middle">steps · cost</text></g>
<g class="dn tint" style="--d:1.5s;--k:#a16207"><rect x="503" y="258" width="92" height="52" rx="12"/><text x="549" y="282" text-anchor="middle" style="font-size:13px">Stop</text><text class="sub" x="549" y="299" text-anchor="middle">clean result</text></g>
<circle class="ring" cx="345" cy="284" r="30" style="--k:#a16207;--d:1.8s"/>
<circle class="pk" r="5" style="--k:#a16207"><animateMotion dur="4.4s" begin="0s" repeatCount="indefinite" path="M180 150 H310 L395 150 L480 150 H590"/></circle>
<circle class="pk" r="5" style="--k:#a16207"><animateMotion dur="4.4s" begin="-2.2s" repeatCount="indefinite" path="M180 238 C250 238 250 150 310 150 L395 150 L480 150 H590"/></circle>
</svg>
</div>

## Waking: the same idea, three times

The question that cleared it up was **who acts at the future moment**.

| The person asked for | Who runs at that time | So I use |
|---|---|---|
| "Remind me to pay bills on the 1st" | An external system | That system's own tool |
| "Tell me when my weight drops below 70 kg" | An external system watching its own data | The same |
| "Every Sunday, review my week and tell me what to change" | **The agent's own reasoning** | A wake |
| "Check on this in three days and decide if it still matters" | **The agent's own reasoning** | A wake |

No outside system can wake *your* agent. That is the whole gap. The rule I wrote into the prompt:

> If an external system should act at T, use that system's tool. If the agent should think at T, arm a wake. If the agent should think when something changes, arm a watch.

<ol class="timeline">
<li><b>Intentions.</b> Every request was a workflow, and the workflow's own state was the record. It failed four ways: recurring ones were schedules, not workflows, so every operation had two code paths; conditions were expensive and a stub that never fired; identity was a guess from free text; and most of it duplicated tools the agent already had.</li>
<li><b>Wake tools.</b> Delete everything except the wake. A reminder is a schedule that signals the agent.</li>
<li><b>Reminders move out.</b> The agent's own reminders and watches became items in a separate planning service. The harness lost its watch tools.</li>
<li class="end"><b>A wake is a message to yourself.</b> It arrives as the agent's own message, "This is your own task, set to come due now", not as a tool call.</li>
</ol>

## Asking: one pause for everything

A question, a choice and an approval are the same thing: the turn stops and waits for a person for as long as it takes, then continues exactly where it was. So they are one primitive.

| Design choice | Why |
|---|---|
| A wait ends three ways: an answer, a one-hour timeout, or a cancel | Every wait is closed out the same way, so nothing is left pending |
| A new unrelated message cancels a pending question | The person moved on |
| An approval is a question, not a second mechanism | I had built them separately and merged them |
| The approval list is separate from tool definitions | A tool's definition is intrinsic. Whether to ask is a tenant's policy |
| The same rule applies inside a program | A script that needs an approved tool is refused and told to call it directly, so it cannot lift an approval |
| Reads run unasked, writes ask | Listing pods runs freely. Restarting one asks |

## Stopping

A turn is bounded by a step limit, a retry limit and a spend budget. The rule I kept: **a stop is a result, not a failure**. The turn ends with whatever it has, and a person can see why. Today I export usage as metrics (tokens, calls, latency, steps) so a dashboard can show it. Rules that force a stop from those numbers are designed and deferred.

## What already exists

| Need | What exists | Where mine differs |
|---|---|---|
| Pause for a person | [LangGraph](https://docs.langchain.com/oss/python/langchain/human-in-the-loop) `interrupt()` with a checkpointer. [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/guides/human-in-the-loop) `needs_approval`, resuming from saved run state | Mine is a durable workflow wait, so it survives restarts and can last hours |
| Long waits and timers | [Temporal](https://temporal.io) signals and timers, [Restate](https://restate.dev) | I use one for the loop already |
| A reminder or recurring job | Cron in the chat gateway, as in the agent I started from | A wake is a message from the agent to itself |
| Policy, not just a pause | A [caution](https://arcjet.com/learn/needsapproval-and-interrupt-are-not-a-policy): a human click is a hold, not an allow or deny, and enforcement belongs at the tool | The approval list is enforced at the call, including inside programs |

## Where it stands, and my verdict

| Component | Status | |
|---|---|---|
| Memory, tools, harness, context (posts [2](/blog/wtf-is-agent/memory) to [5](/blog/wtf-is-agent/context-and-skills)) | Built; see earlier posts | <span class="pill good">stable</span> |
| Runtime and sandbox ([post 6](/blog/wtf-is-agent/runtime-and-sandbox)) | New, unevaluated | <span class="pill warn">new</span> |
| Waking | One small design after two removed | <span class="pill good">stable</span> |
| Asking and approvals | Live-verified for approve, deny, timeout and interrupt | <span class="pill good">stable</span> |
| Asking before acting | Journeys: the 35B fast asks on an ambiguous booking; Gyro-S and the thinking 35B book it; the 8B sends an email without the address | <span class="pill warn">mixed</span> |
| Instruction from a page | The 35B in thinking mode called `trip_book` on six of six samples after a fake page told it to; fast mode, the 8B and Gyro-S refused | <span class="pill warn">caught</span> |
| Stopping on rules | Visibility only. Rule-driven stop is deferred | <span class="pill bad">gap</span> |

**Verdict: I deleted my way to a small design.** Waking shrank from a whole subsystem to one idea, "the agent's own reasoning at a future time". Asking is solid as a mechanism. The model's side of it is not settled: the journey suite shows the 35B fast asking before an ambiguous booking, Gyro-S and the thinking 35B booking it, and the 8B sending an email without looking up the address. The thinking 35B also called `trip_book` on all six samples after a fake page told it to; fast mode and the other models refused. The approval rule is the backstop, and the suite is how I know it is needed. The gap is stopping: I can see spend but I cannot yet make a rule stop a run. Next: how I know any of this makes the agent decide correctly.
