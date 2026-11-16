# Decision suite cases

The suite lives in my agent harness; this is the list of cases and the decision each is expected to produce. Every case is run 3 times per configuration. Prompts are omitted because they contain personal details; the case names and expected decisions are what the results refer to.

## Triage (32 cases)

One decision from a short prompt. Note: the *capability* and *live* categories expect decisions that triage mode cannot produce, so they score 0 for every model.

| Category | Case | Accepted decisions |
|---|---|---|
| start now | fpl plan | start |
| start now | fpl plan, worded loosely | start |
| start now | fpl history | start |
| start now | fpl league compare | start |
| start now | goal: 10K | start |
| start now | goal: language | start |
| start now | goal: trip | start |
| start or ask | fpl plan, no team id | ask, start |
| wake | wake: fpl plan | start |
| wake | wake: fpl history | start |
| start now | duplicate while one runs | start |
| later | fpl in 2 min | schedule |
| later | fpl every Tuesday | schedule |
| later | fpl next Friday | schedule |
| later | weekly recommendations | schedule, start |
| engine, no task | person's own reminder | schedule |
| engine, no task | arm a watch | schedule |
| engine, no task | a single task | schedule |
| do it yourself | change a goal | load, schedule |
| answer | fpl question | answer |
| answer | what can you do | answer |
| answer | thanks | answer |
| answer | chat | answer |
| capability | can you search the web | discover, no-denial |
| capability | reddit | discover, no-denial |
| capability | what tools | discover, no-denial |
| capability | instagram | discover, no-denial |
| live | weather | discover+invoke+answer, hub-no-tool |
| live | arsenal news | discover+invoke+answer, hub-no-tool |
| live | search the web | discover+invoke+answer, hub-no-tool |
| live | score | discover+invoke+answer, hub-no-tool |
| live | bitcoin | discover+invoke+answer, hub-no-tool |

## Freeform (32 cases)

The same 32 cases with the full tool catalog in context (about 10k tokens).

| Category | Case | Accepted decisions |
|---|---|---|
| start now | fpl plan | start |
| start now | fpl plan, worded loosely | start |
| start now | fpl history | start |
| start now | fpl league compare | start |
| start now | goal: 10K | start |
| start now | goal: language | start |
| start now | goal: trip | start |
| start or ask | fpl plan, no team id | ask, start |
| wake | wake: fpl plan | start |
| wake | wake: fpl history | start |
| start now | duplicate while one runs | start |
| later | fpl in 2 min | schedule |
| later | fpl every Tuesday | schedule |
| later | fpl next Friday | schedule |
| later | weekly recommendations | schedule, start |
| engine, no task | person's own reminder | schedule |
| engine, no task | arm a watch | schedule |
| engine, no task | a single task | schedule |
| do it yourself | change a goal | load, schedule |
| answer | fpl question | answer |
| answer | what can you do | answer |
| answer | thanks | answer |
| answer | chat | answer |
| capability | can you search the web | discover, no-denial |
| capability | reddit | discover, no-denial |
| capability | what tools | discover, no-denial |
| capability | instagram | discover, no-denial |
| live | weather | discover+invoke+answer, hub-no-tool |
| live | arsenal news | discover+invoke+answer, hub-no-tool |
| live | search the web | discover+invoke+answer, hub-no-tool |
| live | score | discover+invoke+answer, hub-no-tool |
| live | bitcoin | discover+invoke+answer, hub-no-tool |

## Delegate (18 cases)

Act, delegate, ask, schedule or answer.

| Category | Case | Accepted decisions |
|---|---|---|
| act | email one line | load |
| act | email draft | load |
| act | mark done | load |
| act | look up | answer, load |
| delegate | email and chase | delegate, schedule |
| delegate | research comparison | delegate |
| delegate | fix the build | delegate |
| delegate | trip booking | delegate |
| delegate | spend review | delegate |
| delegate | fpl plan | delegate |
| delegate | duplicate while one runs | answer, ask, delegate |
| ask | email, no recipient | ask |
| ask | book, no date | ask |
| schedule | reminder | schedule |
| schedule | weekly job | schedule |
| schedule | fpl later | schedule |
| answer | what is wildcard | answer |
| answer | thanks | answer |
