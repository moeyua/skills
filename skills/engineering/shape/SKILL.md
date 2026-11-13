---
name: shape
description: "Interview the user in rounds until a plan, design, or idea is clear, each question with a recommended answer. Use when the user is unsure what they want, wants to stress-test a design, or says 想想 / 我也不知道 / 怎么设计 / grill me."
metadata:
  credits: "Adapted from https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling (MIT)"
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Word each question so "yes" accepts your recommended answer.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Read `GLOSSARY.md` (if it exists) before the first round, and when a term gets settled, update it in the format the `docs` skill gives. Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent with a fresh context window to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding. Then offer the `plan` skill to write it down.

When a decision is hard to reverse, would surprise someone without the context, and came from a real trade-off between alternatives, ask the user whether to record it as an ADR. Write it only if they agree, in the format the `docs` skill gives.
