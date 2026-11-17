---
title: Language models are autocomplete at scale
summary: Predict the next token, over and over. How that one trick produces fluent text, why it also produces confident nonsense, and what the knobs do.
verdict: A language model predicts the next token. Its output is fluent and plausible but unverified, so give it sources and check what matters.
date: 2026-11-16
---

A large language model is trained on one task: given some text, predict what comes next. Everything else it appears to do emerges from doing that extremely well, on an enormous amount of text.

**At a glance**

| Term | Plain meaning |
|---|---|
| Token | A chunk of text, often a word or part of one |
| Next-token prediction | The only thing it is trained to do |
| Attention | How it links words that are far apart |
| Context window | How many tokens it can see at once |
| Temperature | How adventurous the choice of next token is |
| Hallucination | A fluent answer that is not true |

## Tokens

Models do not read letters or whole words. Text is split into **tokens**, chunks that are often a word or a piece of one. "Unbelievable" might be two or three tokens; a common short word is usually one. The model's whole world is a sequence of token numbers.

## Predicting the next one

Given the tokens so far, the model outputs a probability for every possible next token. "The capital of France is" puts most of the probability on " Paris". To write a reply, the system picks a token, appends it to the text, and asks again. It repeats that loop until the response is finished.

That is the entire generation process: one token at a time, each chosen using everything before it.

## Attention

To predict well, the model must connect words that are far apart, such as a pronoun and the noun it refers to. The mechanism that does this is called **attention**: for each position, the model learns which earlier tokens to look at and how much weight to give them. Almost every modern language model is built around it, in an architecture called the transformer.

## From autocomplete to assistant

A model trained only to continue text will happily continue a question with more questions. Turning it into an assistant takes extra training: examples of good instructions and answers, and feedback from people on which responses are better. That is what makes it answer instead of ramble.

## The knobs you will see

- **Context window.** The maximum number of tokens the model can consider at once, prompt and reply together. Anything outside it is simply not seen.
- **Temperature.** How adventurous the token choice is. Low means the most likely token almost every time; high means more variety, and more risk.

## Why it makes things up

The model is trained to produce text that is *plausible*, not text that is *verified*. When it does not know something, the most plausible continuation is still a fluent, confident answer. These are often called hallucinations. They are not a bug that will be patched out so much as a direct consequence of how the system works, so the practical rules are:

- Treat output as a draft from a fast, well-read colleague who sometimes bluffs.
- Give it the source material to work from instead of relying on its memory.
- Check anything that matters, especially names, numbers and citations.

Letting a model do things, not just say things, is what the rest of this series is about. [Start with the anatomy of an agent](/blog/wtf-is-agent/anatomy-of-an-agent).
