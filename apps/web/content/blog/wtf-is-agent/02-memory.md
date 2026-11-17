---
title: Memory: remember, cite, forget
summary: Three layers, one provenance trail, and a forget that follows it. What I built, rebuilt and surveyed for an agent's long-term memory.
verdict: Store the raw text, keep facts small, derive everything else, and make every belief point back to its source so it can be traced and forgotten. The design is built; its evaluation is not.
date: 2026-06-03
---

An agent that forgets is a chatbot, so memory was the first thing I built. It was also the thing I rebuilt most. Where I ended up is one rule: **every belief the agent holds must point back to the words it came from.**

<div class="stats">
<div><b>3</b><span>layers: raw text, facts, conclusions</span></div>
<div><b>1</b><span>provenance table joining every kind of record</span></div>
<div><b>3</b><span>clocks per fact: happened, told, stored</span></div>
<div><b>0</b><span>evaluation results so far, which is the honest gap</span></div>
</div>

## The design

<div class="diagram">
<div class="cap">Three layers, one trail <small>Every record points to what it was formed from. Forgetting a payload walks that trail upward.</small></div>
<svg viewBox="0 0 760 330" role="img" aria-label="Three layers: raw payloads at the bottom, facts in the middle, observations and profiles on top, joined by provenance edges. Forgetting one payload removes the facts only it supported and the observation formed from them.">
<g class="dl" style="--d:.1s"><rect class="box" style="--k:#4338ca" x="20" y="28" width="540" height="76" rx="14"/><text class="tag" style="--k:#4338ca" x="32" y="44">Derived: what the system concluded</text></g>
<g class="dl" style="--d:.2s"><rect class="box" style="--k:#0f766e" x="20" y="128" width="540" height="76" rx="14"/><text class="tag" style="--k:#0f766e" x="32" y="144">Base: what it was told, as small facts</text></g>
<g class="dl" style="--d:.3s"><rect class="box" style="--k:#6b6677" x="20" y="228" width="540" height="76" rx="14"/><text class="tag" style="--k:#6b6677" x="32" y="244">Raw: the text exactly as sent</text></g>
<g style="--k:#0f766e">
<path class="de" pathLength="1" style="--d:.9s" d="M295 84 C295 118 325 118 325 156"/>
<path class="de" pathLength="1" style="--d:1s" d="M465 84 C465 118 325 118 325 156"/>
<path class="de" pathLength="1" style="--d:1.1s" d="M325 190 V256"/>
<g class="fg"><path class="de" pathLength="1" style="--d:.9s" d="M125 84 C125 118 105 118 105 156"/><path class="de" pathLength="1" style="--d:.95s" d="M125 84 C125 118 195 118 195 156"/><path class="de" pathLength="1" style="--d:1.1s" d="M105 190 C105 220 140 224 155 256"/><path class="de" pathLength="1" style="--d:1.15s" d="M195 190 C195 220 170 224 155 256"/></g>
</g>
<g class="fg"><g class="dn tint" style="--d:.5s;--k:#4338ca"><rect x="70" y="50" width="110" height="34" rx="9"/><text x="125" y="72" text-anchor="middle" style="font-size:12.5px">Observation</text></g></g>
<g class="dn tint" style="--d:.55s;--k:#4338ca"><rect x="240" y="50" width="110" height="34" rx="9"/><text x="295" y="72" text-anchor="middle" style="font-size:12.5px">Observation</text></g>
<g class="dn tint" style="--d:.6s;--k:#4338ca"><rect x="410" y="50" width="110" height="34" rx="9"/><text x="465" y="72" text-anchor="middle" style="font-size:12.5px">Entity profile</text></g>
<g class="fg"><g class="dn tint" style="--d:.7s;--k:#0f766e"><rect x="70" y="156" width="70" height="34" rx="9"/><text x="105" y="178" text-anchor="middle" style="font-size:12.5px">fact</text></g><g class="dn tint" style="--d:.75s;--k:#0f766e"><rect x="160" y="156" width="70" height="34" rx="9"/><text x="195" y="178" text-anchor="middle" style="font-size:12.5px">fact</text></g></g>
<g class="dn tint" style="--d:.8s;--k:#0f766e"><rect x="290" y="156" width="70" height="34" rx="9"/><text x="325" y="178" text-anchor="middle" style="font-size:12.5px">fact</text></g>
<g class="fg"><g class="dn" style="--d:.9s;--k:#6b6677"><rect x="95" y="256" width="120" height="34" rx="9"/><text x="155" y="278" text-anchor="middle" style="font-size:12.5px">payload A</text></g></g>
<g class="dn" style="--d:1s;--k:#6b6677"><rect x="265" y="256" width="120" height="34" rx="9"/><text x="325" y="278" text-anchor="middle" style="font-size:12.5px">payload B</text></g>
<g class="dl" style="--d:1.4s"><text class="big" x="590" y="60">forget(payload A)</text><text class="sub" x="590" y="82">removes the payload,</text><text class="sub" x="590" y="98">the facts only it supported,</text><text class="sub" x="590" y="114">and every conclusion</text><text class="sub" x="590" y="130">formed from them.</text><text class="big" x="590" y="190">why do you believe this?</text><text class="sub" x="590" y="212">walk the edges down to</text><text class="sub" x="590" y="228">the words you said.</text></g>
</svg>
</div>

Four operations sit on top of that: **retain** (store a payload, extract facts), **recall** (find what is relevant), **reflect** (answer a question over what is stored) and **mental models** (a written answer about the user that is refreshed and cites its sources).

## The journey

<ol class="timeline">
<li><time>Jun 3</time><b>A mining pipeline.</b> Extract entities and rules from conversations, cluster them into a knowledge graph, consolidate in the background.</li>
<li><time>Aug 17</time><b>Rebuilt on a published design.</b> Retain, recall, reflect and mental models, following the Hindsight paper, running as durable workflows.</li>
<li><time>Sep 13</time><b>The first pipeline is removed.</b> Mining, clustering and consolidation were taken out in full once the rebuild replaced them.</li>
<li><time>Oct 22</time><b>Raw text first.</b> Store every payload as sent, give each fact a source, add a separate layer for conclusions.</li>
<li><time>Oct 25–26</time><b>One provenance trail.</b> Profiles, relations and observations all cite their sources in one table, and forget walks it.</li>
<li class="end"><time>Nov 8</time><b>Realigned with the paper.</b> Observations are recomputed per entity from all of its facts.</li>
</ol>

## Decisions that held

| Decision | Why | The lesson behind it |
|---|---|---|
| Store the raw text as sent | Without it a belief cannot be traced to anything | Facts stored before this have no source, and there is no backfill because the text was discarded |
| Keep the base small, derive the rest | A summary is a conclusion, not a fact | A one-way rule: derived reads base, never the reverse, enforced by a test |
| One provenance table for every kind of record | Profiles, relations and observations all need the same trail | Two evidence tables turned out to be the same relation |
| The model proposes citations, code checks them | A model can cite a fact it never saw | Code accepts only ids that appeared in the evidence it was given |
| Three clocks: happened, told, stored | A fact told about 2019 and stored today is new to the system | I used the told time as a "new" marker in four places, so a fact told about 2019 would never have counted as new |

## What already exists

I read the main systems before rebuilding. What each keeps of where a memory came from:

| System | What it stores | Source of a memory | History when it changes | Deletion |
|---|---|---|---|---|
| [MemGPT / Letta](https://arxiv.org/abs/2310.08560) | Evicted messages, a rolling summary, archival store | Only that messages are still stored | Summary overwritten | Not described |
| [Mem0](https://arxiv.org/abs/2504.19413) | Facts the model adds, updates or deletes | No raw-text provenance described | Graph variant marks relations invalid | Model chooses DELETE |
| [A-MEM](https://arxiv.org/abs/2502.12110) | Linked notes that evolve | The original content stays on the note | Evolved note replaces the original | Not described |
| [Zep](https://arxiv.org/abs/2501.13956) | A temporal knowledge graph over raw episodes | Edges trace back to episodes | Edges are invalidated with timestamps | Not described |
| [Hindsight](https://arxiv.org/abs/2512.12818) | Four networks of facts and observations | Observations list their source fact ids (in the released code) | Facts can be invalidated | Deleting a document removes the observations built from it (in the released code) |
| Mine | Raw text, base facts, a derived layer | One table, for six kinds of record | Each conclusion supersedes with history | One operation walks the trail |

This is from my reading notes of the papers and, for Hindsight, its released code. I first claimed in my own draft that nobody had lineage or deletion. That was **wrong**: Hindsight's code has both for observations. What remains different is breadth, one trail covering profiles, relations and written answers, and history for conclusions.

## Where it stands, and my verdict

| Question | Answer | |
|---|---|---|
| Does it remember across sessions? | Retain, recall, reflect and mental models run | <span class="pill good">yes</span> |
| Can a belief be traced to its words? | Yes, for everything formed after the raw layer | <span class="pill good">yes</span> |
| Can I forget something and what came from it? | One operation does it | <span class="pill good">yes</span> |
| Does it help the agent decide better? | Not measured | <span class="pill bad">unproven</span> |
| Do conclusions earn their cost? | No with/without comparison yet | <span class="pill bad">unproven</span> |

**Verdict: the design is sound and untested.** The traceability and forgetting work as designed. I have no measurement that the layers improve what the agent does, which is the next thing I owe this component. Next: the toolbox, which is how that agent reaches anything outside itself.
