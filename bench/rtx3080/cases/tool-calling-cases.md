# Tool-calling cases (llm_bench.py)

Fourteen prompts against an eight-tool, agent-shaped tool set, plus one follow-up where a tool result is fed back and the answer must use it. A case passes only if the model's calls satisfy the check in `llm_bench.py`.

| # | Prompt | What it tests |
|---|---|---|
| 1 | How much did I spend on groceries in October? | tool choice, argument accuracy |
| 2 | Who should I captain in gameweek 12? | tool choice, integer argument |
| 3 | Remind me to call mom tomorrow at 5pm | tool choice, free-text argument |
| 4 | Find my notes about the Kubernetes migration | tool choice |
| 5 | What's the weather in Seattle right now? | tool choice |
| 6 | What is 17 times 23? | restraint: no tool needed |
| 7 | Compare my spending on dining vs groceries last month. | two calls of the same tool |
| 8 | Show my last 5 transactions at Costco | optional argument and limit |
| 9 | Turn the heat on to 70 | enum argument |
| 10 | Send an email to Sam. | restraint: required arguments missing, so ask |
| 11 | Email me my October grocery total at me@example.com | dependency: look the number up before acting |
| 12 | Set the thermostat to cool at 68 and remind me at 9pm to take out the trash. | parallel calls to different tools |
| 13 | What's the weather in Lisbon? I'm deciding whether to pack an umbrella. | tool choice with extra chatter |
| 14 | Given all that, who should I captain in gameweek 14?  (preceded by about 8k tokens of notes) | long context (about 8k tokens) before the question |
| 15 | follow-up: tool result fed back | answer must use the returned total |
