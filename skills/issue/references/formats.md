# Issue Formats

Read this file only after `issue` has selected one mode label. Render exactly one matching semantic schema; keep its section identity and order unchanged.

## Shared rules

- Render each semantic section as one natural visible `##` heading without exposing its internal key.
- Every section is required and non-empty. Do not output `TODO`, `TBD`, ellipses, generic placeholders, or invented facts.
- If an unknown observation is itself part of the work, state the investigation or measurement task explicitly as a complete fact.
- Keep detail inside the defined sections. Do not add, remove, merge, or reorder semantic sections.
- Write acceptance criteria as Markdown checkboxes whose completion can be observed or measured.

## Label metadata

Create only the selected missing label. Never rewrite an existing label.

| Label      | Description                    | Color    |
| ---------- | ------------------------------ | -------- |
| `fix`      | 修复错误、异常行为或回归       | `d73a4a` |
| `feat`     | 新增用户可观察的能力或行为     | `a2eeef` |
| `refactor` | 保持外部行为不变的内部结构调整 | `5319e7` |
| `perf`     | 具有可测量目标的性能改进       | `fbca04` |

## `fix`

| Section key    | Content requirement                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `background`   | The business or technical context in which the problem occurs and why it needs attention.          |
| `problem`      | The incorrect behavior, error, or regression without claiming an unverified root cause.            |
| `reproduction` | The confirmed minimal reproduction path, or an explicit task to establish reproducible conditions. |
| `expected`     | The behavior that should be observable when the system is correct.                                 |
| `actual`       | The behavior currently observed and its known impact.                                              |
| `scope`        | The covered area, constraints, and adjacent problems explicitly excluded from this Issue.          |
| `acceptance`   | Observable repair results written as Markdown checkboxes.                                          |

## `feat`

| Section key     | Content requirement                                                      |
| --------------- | ------------------------------------------------------------------------ |
| `background`    | The context for the proposed capability and the current gap.             |
| `goal`          | The new capability described as a user-observable result.                |
| `user_scenario` | Who uses it, in what situation, and what result they obtain.             |
| `scope`         | The first version's included behavior, inputs, outputs, and constraints. |
| `non_goals`     | Adjacent capabilities or extensions explicitly excluded from this Issue. |
| `acceptance`    | Verifiable feature results written as Markdown checkboxes.               |

## `refactor`

| Section key           | Content requirement                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `background`          | The current structural problem and motivation for restructuring.                                 |
| `refactor_goal`       | The intended internal structural improvement without mixing in a feature or bug fix.             |
| `behavior_invariants` | External behavior, side effects, and important performance characteristics that must not change. |
| `scope`               | The structural boundary allowed to change and behavior changes explicitly excluded.              |
| `acceptance`          | Verifiable structural results or regression safeguards written as Markdown checkboxes.           |

## `perf`

| Section key           | Content requirement                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `background`          | The scenario in which the performance problem appears and its impact.                               |
| `performance_problem` | The observable latency, throughput, resource, or responsiveness problem.                            |
| `metric`              | The metric used to judge improvement.                                                               |
| `baseline`            | The measured baseline, or an explicit task to establish a repeatable baseline.                      |
| `target`              | The measurable target, or the decision condition used to derive it after establishing the baseline. |
| `measurement`         | The reproduction environment, commands, tools, or sampling method.                                  |
| `scope`               | The optimization boundary, unacceptable costs, and behavior changes explicitly excluded.            |
| `acceptance`          | Repeatable, measurable performance results written as Markdown checkboxes.                          |
