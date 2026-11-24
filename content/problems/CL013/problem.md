---
title: Counting Halvings
difficulty: Easy
type: Complexity Analysis
tags: [Loops, Time Complexity]
options:
  - key: a
    label: O(1)
  - key: b
    label: O(log n)
  - key: c
    label: O(n)
  - key: d
    label: O(n²)
---
The function takes a positive integer `n`. For example, when `n` is 10, the loop
changes it to 5, then 2, then 1.

As the initial value of `n` grows, what is the **tightest time bound** among
the choices? Count each comparison, integer division and increment as one
constant-time operation.
