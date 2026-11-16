---
title: Machine learning is fitting a curve
summary: Instead of writing rules, you show a program examples and let it find the rules. Training, inference and overfitting in one small example.
date: 2026-11-16
---

Traditional programming goes: *rules + data → answers*. Machine learning flips it: *data + answers → rules*. You provide examples with the right answers attached, and a training procedure works out the rules.

## The smallest possible example

Suppose you want to predict a house's price from its size. You have a few past sales. The "rule" you are after is a line, `price = w × size + b`, and learning means finding good values for `w` and `b`.

```python
import numpy as np

size  = np.array([50, 70, 90, 110, 130]) / 100            # in units of 100 m²
price = np.array([160, 210, 270, 330, 380], dtype=float)  # in thousands

w, b = 0.0, 0.0
lr = 0.1                       # step size

for _ in range(2000):
    pred = w * size + b
    error = pred - price
    # nudge w and b in the direction that shrinks the error
    w -= lr * (error * size).mean()
    b -= lr * error.mean()

print(round(w), round(b))      # 280 18
print(w * 1.0 + b)             # prediction for a 100 m² house: about 298
```

(Sizes are scaled to a small range so the same step size works for both parameters. Scaling inputs is standard practice.)

That loop is the core of nearly all machine learning:

1. **Predict** with the current parameters.
2. Measure the **error**, which is also called the loss.
3. Work out which way to nudge each parameter to reduce it. This step is *gradient descent*.
4. Repeat.

A neural network does exactly this, with millions or billions of parameters instead of two.

## Training and inference

Two words you will keep hearing:

- **Training** is the expensive part: adjusting the parameters using lots of examples. It happens once, or occasionally.
- **Inference** is using the finished model to make predictions on new inputs. It happens constantly.

These have very different costs and hardware needs, which is why people talk about them separately.

## Overfitting, the classic failure

A model with enough parameters can memorise its training examples perfectly and still be useless on new ones, the way a student can memorise past exam answers without understanding the subject. This is **overfitting**.

The standard defence is simple: hold some data back, never train on it, and check the model on it afterwards. Performance on data the model has never seen is the only number that counts.

## What you should take away

Machine learning is statistics with a lot of compute attached. It finds patterns that were present in its training data. It is as good as those examples and as fair as they were, and it will confidently apply a pattern in places where the pattern does not hold. Keep that in mind and the rest of the series will make sense.
