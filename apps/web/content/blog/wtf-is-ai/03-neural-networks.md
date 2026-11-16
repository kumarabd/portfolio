---
title: Neural networks are lots of tiny dials
summary: A neuron is a weighted sum plus a bend. Stack millions of them and you have a network, and a reason GPUs matter.
verdict: A neural network is stacked weighted sums with a bend, trained by gradient descent. It is matrix multiplication, which is why GPUs matter.
date: 2026-11-16
---

The line from the last post has two parameters and can only ever be a straight line. Real problems are not straight lines. Neural networks are a way to get flexible, curvy functions out of the same fit-by-nudging recipe.

**At a glance**

| Piece | What it does |
|---|---|
| Neuron | A weighted sum of its inputs, then a bend (ReLU) |
| Layer | Many neurons reading the same inputs: one matrix multiplication |
| Network | Layers chained; "deep" means many |
| Training | Backpropagation tells every weight how to change |
| Hardware | All of it is matrix maths, which is what GPUs do best |

## One neuron

A neuron does two things:

1. Multiply each input by a weight and add them up (plus a bias).
2. Pass the sum through a simple non-linear function, such as "output zero if negative, otherwise leave it alone". This is called ReLU.

```python
def neuron(inputs, weights, bias):
    total = sum(x * w for x, w in zip(inputs, weights)) + bias
    return max(0.0, total)      # the bend
```

The weights are the dials. Training is the process of turning them.

## Why the bend matters

Without the non-linear step, stacking layers of weighted sums would collapse into one big weighted sum, which is still just a straight line in disguise. The bend is what lets each layer build something the previous one could not. With it, a network can approximate remarkably complicated functions.

## Layers

Neurons are arranged in layers, and each layer feeds the next. In an image model the early layers tend to respond to simple things like edges, later ones to shapes, and later still to whole objects. Nobody programs those roles in. They emerge because they help reduce the error during training.

The word **deep** in deep learning just means many layers.

## How the dials get set

Training is gradient descent from the previous post, at scale. Show the network an example, compare its output to the right answer, and use an algorithm called **backpropagation** to work out how much each of the millions of weights contributed to the error. Then nudge them all slightly. Repeat over billions of examples.

## Why this is a hardware story

Look at what a layer actually computes: many neurons, each a weighted sum of the same inputs. Written together, that is a **matrix multiplication**. A neural network is, computationally, a long chain of enormous matrix multiplications plus cheap bends in between.

Matrix multiplication happens to be exactly the job graphics processors are good at: the same simple operation applied to huge numbers of values in parallel. That match is why GPUs, built to render games, became the engine of modern AI. It is also why memory bandwidth and capacity decide so much about what a given GPU can run. The [Benchmarks with RTX 3080](/blog/benchmarks-rtx-3080) series measures that directly.

Next: what happens when you point this machinery at text.
