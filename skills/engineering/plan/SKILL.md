---
name: plan
description: "Turn the current conversation into a one-screen plan the user can read and veto: their goal, decisions split into settled and awaiting confirmation, and tracer-bullet slices. Use when the user asks for a plan, wants to write down what was agreed before building, or wants the work filed as GitHub issues."
---

# Plan

A plan exists so the user can check, in one read, that you understood them and that nothing got decided behind their back. If they don't want to read it, it failed.

Work from what is already in the conversation. Don't interview. If you can't state the user's goal in one sentence they'd agree with, run the `shape` skill first. Open choices with a sensible default (a limit, a name, a tool) don't need shaping: make the call and put it under "awaiting confirmation".

## 1. Look before you write

Read the code the change touches, enough to name the real modules and spot the obvious seam. Read `GLOSSARY.md` if it exists and use its terms. Facts you can look up are your job, never the user's.

## 2. Sort the decisions

List every decision the plan depends on, in two groups:

- **Settled**: the user said it or agreed to it. Give the source: a close paraphrase of what they said.
- **Awaiting confirmation**: you chose it. Give your reason. A plausible default is still your choice, not theirs.

Include where the tests go, named concretely: the function, command, endpoint, or page each test drives, and what stays untested from outside ("tests call `createOrder()`, not its internal helpers"). `implement` writes tests only where this says. Say it in those plain terms; don't make the user learn the word "seam".

Leave out what nobody needs to decide: local naming, file layout inside a module, the order of mechanical edits.

## 3. Slice it

Break the work into **tracer bullets**: each slice cuts a narrow but complete path through every layer it touches and is demoable on its own. Give each slice one line on **how you'll see it work**: a command, a screen, a request, a test name. If you can't say how you'd see it, the slice is wrong.

Most changes are one to three slices. One is fine.

## 4. Write it

Check the `## Skills` section of `CLAUDE.md` or `AGENTS.md` for where plans go. Without one, write a local file. Local plans go to `plans/<YYYY-MM-DD>-<slug>.md`.

Write in the user's language. The plan must fit on one screen: about 40 lines. Cut until it does. Cut exposition first, never the decisions. Use these headings, translated into the user's language:

```markdown
# <title>

**Goal.** <one or two sentences: what the user wants and why>

## Settled

- <decision>. Source: <what the user said>

## Awaiting confirmation

- <decision>. Reason: <one line>

## Slices

1. <what works after this slice>. See it: <command / screen / test>
2. ...

## Not doing

- <adjacent thing you deliberately left out>
```

In decisions, no file paths or code unless a snippet states a decision more exactly than prose (a type shape, a state machine). The "See it" lines may name any command, test, or path. No background section, no risk matrix, no restating the conversation.

## 5. Hand it over

Paste the whole plan into your message, give the file path, and stop. Write each item awaiting confirmation as a statement of your choice, so "yes" accepts it and anything else changes it. When the user answers, move each item to "Settled" with their answer as its source, or rewrite it, and update the plan. Building starts only when they say so.

## GitHub issues

When plans go to GitHub issues, or the user asks for issues, file one issue per slice with `gh issue create`, blockers first so later issues can reference earlier ones. Each body: the goal, what works after this slice, how to see it, the settled decisions it depends on, and `Blocked by: #N` or `None`. File only after every item awaiting confirmation has been answered. With "both", also keep the local file and add the issue links to it.
