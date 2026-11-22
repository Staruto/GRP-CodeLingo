---
title: Last Item in an Array
difficulty: Easy
type: Find the Error
tags: [Arrays, Indexing]
options:
  - key: a
    label: count + 1
  - key: b
    label: count - 1
  - key: c
    label: count
  - key: d
    label: "0"
---
This C program should print the last item in `colors`, but its index points past the end of the array. Reading outside the array causes undefined behavior.

Choose the expression that should replace `count` in the assignment to `lastIndex`. The fix should also work if more colors are added.
