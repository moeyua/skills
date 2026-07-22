---
name: shape
description: 'Shape an uncertain idea into a grounded, bounded direction through conversation. Use when the user says "think it through" / "how should we do this" / "想想" / "出方案", or when material product or design choices remain unresolved. Not for writing a plan or Issue (use plan), implementing the change, or deciding whether the work is worth doing.'
when_to_use: "think, shape, design, brainstorm, approach, 想想, 出方案, 设计, 怎么做, 头脑风暴"
dispatch_intent: "Ground the idea, resolve material decisions, and leave a clear conversational direction"
---

# Shape

Shape turns uncertainty into a grounded direction. It is conversational: use judgment in proportion to ambiguity and risk, then stop when the user can see what should be built and why.

<HARD-GATE>
Shape writes no files and performs no implementation or external mutation. It never creates a plan or Issue and never invokes plan or implement automatically. It may use explore for read-only project context when facts are missing.
</HARD-GATE>

Two cross-skill rules apply to all work in this skill suite — `references/anti-patterns.md` and `references/durable-context.md`. If they are not already in context this session, read them once. Read `references/change-types.md` when classifying a concrete change would focus the design.

## Outcome Contract

- Outcome: a grounded direction with its important boundaries and decisions visible in the conversation
- Done when: repository facts are reliable enough, material decisions are settled or explicitly left with the user, and the recommended direction is internally consistent
- Evidence: the user's stated intent and prior decisions, relevant repository facts, and authoritative external sources when needed
- Output: a concise conversational synthesis of the direction, constraints, recommendation, and any genuinely unresolved decision

## Adaptive shaping

Use this as a decision policy, not a sequence of mandatory phases. Skip work whose condition is absent.

### Ground facts

Judge whether current project facts are reliable enough for the requested decision. When they are missing, stale, or too shallow, use explore in context mode with depth proportional to risk and emit no separate Explore Report. Read code, docs, tests, history, and authoritative sources instead of asking the user for discoverable facts.

Follow existing project patterns unless they are the cause of the change. Keep unrelated improvements outside the direction.

### Assess convergence

- **Converged** — the user and evidence already determine the direction: synthesize it without manufacturing questions.
- **Material frontier** — unresolved decisions could change scope, observable behavior or interface, hard-to-reverse architecture, risk, or acceptance: resolve them.
- **Evidence gap** — a decision depends on a discoverable fact: investigate it first.
- **Explicit grill** — the user asks to be challenged or stress-tested: traverse the material decision tree thoroughly.

### Resolve only the material frontier

Ask independent material questions together when useful. Give the recommended answer and its reason. Keep dependent decisions until their prerequisites resolve.

An unstated preference is not delegated judgment. When reasonable choices produce meaningfully different observable semantics, surface the choice even if one default feels conventional. When the user delegates a choice, state the consequential assumption and proceed.

Treat prior statements and agreements as settled inputs. Reopen one only when new evidence invalidates it. Do not ask for confirmation of a conclusion the user has already accepted.

### Recommend proportionally

Give one recommended direction when evidence favors it. Compare alternatives only when viable paths create a consequential trade-off. A summary is communication, not a new approval gate.

For a concrete change, the shared type can focus the discussion:

- `fix`: establish correct behavior and causal evidence;
- `feat`: bound the observable interface and acceptance;
- `refactor`: protect behavior invariants;
- `perf`: define a measurable baseline and target.

Do not force classification while the user is still exploring the problem or direction.

## Finish

Conclude in the conversation with the recommended direction, what it includes and excludes, the decisions that matter, and any remaining material uncertainty. If the direction is ready to persist, mention `/plan` as an available next action; do not invoke it or write its output.

Shape designs how work should be approached. If the user instead asks whether work is worth doing, state that product-value boundary and offer only the directly relevant trade-off observation.
