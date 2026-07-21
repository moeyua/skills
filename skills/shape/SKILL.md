---
name: shape
description: 'Shape a fuzzy idea into a grounded design and executable plan. Modes: brainstorm / fix / feat / refactor / perf; brainstorm stays conversational, named modes write to plans/. Use when the user says "think it through" / "how should we do this" / "出方案" / "想想", or anything that needs design before coding. Not for executing an approved plan (use implement), deciding whether something is worth doing, or plain API-usage questions.'
when_to_use: "think, shape, plan, design, brainstorm, approach, 想想, 出方案, 设计, 怎么做, 头脑风暴"
dispatch_intent: "Ground the intent, resolve material decisions, and produce an executable plan when authorized"
---

# Shape

Shape turns an uncertain change into a grounded direction or an executable plan. Apply judgment in proportion to ambiguity and risk: a settled request needs synthesis, while a consequential unresolved choice needs discussion.

<HARD-GATE>
Shape produces conversation or a named-mode file under `plans/`. It never writes implementation, scaffolding, specs, or other project files, and never invokes implementation work. `brainstorm` writes no files.
</HARD-GATE>

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: a grounded brainstorm conclusion, or a named-mode plan ready for implement
- Done when: brainstorm → the direction, constraints, and unresolved material decisions are clear; named mode → every intent decision needed by implement is settled and the plan is written to `plans/`
- Evidence: repository and authoritative-source facts, the user's stated intent and prior decisions, and mode-specific evidence
- Output: brainstorm → conversational synthesis; named mode → plan path + concise summary + implementation handoff

## Adaptive shaping

Use the following as a decision policy, not mandatory phases. Skip any action whose condition is absent.

### Ground facts

Judge whether current project facts are reliable enough for the requested decision. When they are missing, stale, or too shallow, use `explore` in context mode with depth proportional to risk and emit no Explore Report. Read code, docs, tests, history, and authoritative external sources instead of asking the user for facts those sources can answer.

Follow existing project patterns unless they are the cause of the change. Keep unrelated improvements outside the plan.

### Assess convergence

Classify the current state:

- **Converged** — the user and evidence already determine the direction: synthesize it.
- **Material frontier** — unresolved decisions could change scope, observable behavior or interface, hard-to-reverse architecture, risk, or acceptance: resolve them.
- **Evidence gap** — a decision depends on a fact that can be discovered: investigate it first.
- **Explicit grill** — the user asks to be challenged or stress-tested: traverse the material decision tree thoroughly.

Mode identification alone is not a reason to ask questions. A detailed request can enter a named mode already converged.

### Resolve the material frontier

The frontier is every material decision whose prerequisites are already settled. Ask the independent frontier in one comprehensible round, number items when useful, and provide the recommended answer and reason for each. Keep dependent decisions for a later round after their prerequisites resolve.

An unstated preference is not delegated judgment. When two reasonable answers produce different observable semantics—such as ordering, search/filter behavior, persistence, or destructive behavior—the choice remains on the frontier even if one default feels conventional. A recommendation lowers the user's decision cost; it does not silently authorize the choice.

Treat the user's prior statements and agreements as settled inputs. When the user delegates a choice, make the recommendation, state any consequential assumption, and proceed. Reopen a settled decision only when new evidence invalidates it.

### Recommend proportionally

Give one recommended direction when evidence strongly favors it. Compare alternatives only when multiple viable paths create a consequential trade-off; explain the difference and take a position rather than turning the comparison into a vote.

Summarize when it helps the user see the whole design, especially after a long or branching discussion. A summary is communication, not a separate approval gate.

### Synthesize the outcome

Before concluding, check that the result is grounded, internally consistent, bounded to one coherent change, and free of unresolved intent decisions.

User authorization accumulates through the conversation. A request for a plan, an explicit named-mode request, agreement with the direction, or “continue” authorizes a named-mode plan once it is ready. Do not require a fixed heading, phrase, or duplicate confirmation.

## Mode Picker

| user's intent                                             | mode         | output       |
| --------------------------------------------------------- | ------------ | ------------ |
| exploratory or still choosing the problem/direction       | `brainstorm` | conversation |
| wrong behavior, error, or regression                      | `fix`        | plan         |
| new externally observable capability                      | `feat`       | plan         |
| internal restructuring with behavior preserved            | `refactor`   | plan         |
| measurable speed, throughput, memory, or size improvement | `perf`       | plan         |

When the category would change the required evidence, resolve that ambiguity from the request or material frontier. An intentional behavior change is `fix` or `feat`, not `refactor`.

## Brainstorm

Keep exploration conversational and write no plan, design, or spec file. End with the current direction, constraints, recommendation, and any unresolved material decisions.

When brainstorm converges, recommend the matching named mode. Ask whether to continue only when the user has not already requested a plan or authorized that transition.

Shape designs how to do work; it does not decide whether the work is worth doing. For a value judgment, state that boundary and offer at most one relevant trade-off observation.

## Named modes

Load [references/plan-template.md](references/plan-template.md) plus only the matching reference:

- [references/mode-fix.md](references/mode-fix.md) — root cause + regression tests
- [references/mode-feat.md](references/mode-feat.md) — interface boundary + acceptance scenarios
- [references/mode-refactor.md](references/mode-refactor.md) — behavior invariants + regression coverage
- [references/mode-perf.md](references/mode-perf.md) — baseline + target + measurement

Write `plans/YYYY-MM-DD-<slug>.md` when the common readiness checks and matching mode bar pass. The plan settles intent: outcome, boundaries, consequential decisions, acceptance, risks that actually exist, and verification. Exact line locating, final wording, and micro-edit order belong to implement.

After writing the plan, output:

```text
Plan written to plans/YYYY-MM-DD-<slug>.md

[2-3 line summary]

To implement it: say "implement this plan".
```

## Stop conditions

Stop and surface the specific gap when reliable facts cannot be obtained, a material intent decision remains unresolved, the result spans independent changes that need separate plans, or the plan would contain an intent-level placeholder. Verify dependency, API, library, and CLI facts from code or authoritative documentation before they enter the design.
