# Issue Formats

Read this file only when the selected target is ready to create one or more GitHub Issues. For each create candidate, render exactly one schema matching its own change type. Preserve the relative order of the included sections. The `both` target is the one-candidate case.

## Problem-record boundary

Each Issue records what is wrong or missing, why it matters, and the observable resolved state when known; it never prescribes how to implement the change.

- Render each included semantic section as one natural visible `##` heading without exposing its internal key.
- The type-specific problem section is required. Include any other section only when supported by the user or inspected evidence; every included section must be non-empty, factual, and free of placeholders.
- Unknown solutions remain unknown; they are not converted into investigation, implementation, or measurement tasks merely to fill a section. If missing evidence is itself material, state its absence as a fact.
- Do not prescribe a technical approach, target architecture, path or symbol to change, dependency choice, migration design, implementation order, or test implementation plan.
- A title names the problem or missing observable outcome, not an implementation method.
- Acceptance criteria are optional. Include them only when already established by the user, an existing contract, or inspected evidence, and write them as observable Markdown checkboxes.
- Do not output `TODO`, `TBD`, ellipses, generic placeholders, or invented facts.

## Label metadata

Create all missing change-type labels required by the current batch, each at most once. Never rewrite an existing label.

| Label      | Description                    | Color    |
| ---------- | ------------------------------ | -------- |
| `fix`      | 修复错误、异常行为或回归       | `d73a4a` |
| `feat`     | 新增用户可观察的能力或行为     | `a2eeef` |
| `refactor` | 保持外部行为不变的内部结构调整 | `5319e7` |
| `perf`     | 具有可测量目标的性能改进       | `fbca04` |

## `fix`

| Section key    | Presence    | Content requirement                                                                                             |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| `background`   | Conditional | The business or technical context in which the problem occurs and why it needs attention.                       |
| `problem`      | Required    | The incorrect behavior, error, or regression without claiming an unverified root cause or prescribing a fix.    |
| `reproduction` | Conditional | Confirmed reproduction evidence, or the factual absence of a stable reproduction when that absence matters.     |
| `expected`     | Conditional | The behavior that should be observable when the system is correct, when already established.                    |
| `actual`       | Conditional | The behavior currently observed when it adds detail beyond the problem statement.                               |
| `impact`       | Conditional | Known effects on users, callers, operations, or reliability.                                                    |
| `constraints`  | Conditional | External constraints and adjacent problems explicitly outside the Issue, without naming implementation targets. |
| `acceptance`   | Conditional | Already-established observable repair results written as Markdown checkboxes.                                   |

## `feat`

| Section key       | Presence    | Content requirement                                                                                    |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `background`      | Conditional | The context in which the unmet need or current limitation appears.                                     |
| `gap`             | Required    | The missing user- or caller-observable capability, stated without selecting an interface or mechanism. |
| `user_scenario`   | Conditional | Who encounters the gap, in what situation, and its effect.                                             |
| `desired_outcome` | Conditional | The user-observable result already established by the request or an existing contract.                 |
| `impact`          | Conditional | Known cost or limitation created by the missing capability.                                            |
| `constraints`     | Conditional | External behavior, input, output, policy, or compatibility constraints already established.            |
| `non_goals`       | Conditional | Adjacent outcomes explicitly excluded from this Issue.                                                 |
| `acceptance`      | Conditional | Already-established observable feature results written as Markdown checkboxes.                         |

## `refactor`

| Section key           | Presence    | Content requirement                                                                                   |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `background`          | Conditional | The context in which the internal structural problem matters.                                         |
| `structural_problem`  | Required    | The coupling, duplication, fragility, or maintenance problem, without prescribing a target structure. |
| `evidence`            | Conditional | Concrete facts demonstrating the structural problem without proposing its replacement.                |
| `impact`              | Conditional | Known effects on change safety, comprehension, maintenance cost, or reliability.                      |
| `behavior_invariants` | Conditional | External behavior, side effects, or performance characteristics already known to remain stable.       |
| `constraints`         | Conditional | Established external constraints and behavior changes outside the Issue.                              |
| `acceptance`          | Conditional | Already-established observable resolution or regression safeguards written as Markdown checkboxes.    |

## `perf`

| Section key           | Presence    | Content requirement                                                                                        |
| --------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `background`          | Conditional | The scenario in which the performance problem appears.                                                     |
| `performance_problem` | Required    | The observable latency, throughput, resource, size, or responsiveness problem.                             |
| `metric`              | Conditional | A user-relevant metric already named by the request or existing evidence; do not select one speculatively. |
| `baseline`            | Conditional | An existing measured baseline, or the factual absence of a reliable baseline when material.                |
| `impact`              | Conditional | Known effects on users, callers, cost, capacity, or operations.                                            |
| `desired_outcome`     | Conditional | A measurable or observable result already established by the request or an existing contract.              |
| `constraints`         | Conditional | Established unacceptable costs, behavior changes, or environmental constraints.                            |
| `acceptance`          | Conditional | Already-established repeatable performance results written as Markdown checkboxes.                         |
