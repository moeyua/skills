# Change Types

`fix`, `feat`, `refactor`, and `perf` are the shared vocabulary for a change. They are not workflow stages and do not imply that any other skill has already run.

| type       | use when                                                                                    | evidence emphasis                                     |
| ---------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `fix`      | observed behavior is incorrect, broken, or regressed                                        | expected vs actual, root cause, regression protection |
| `feat`     | users or callers gain a new observable capability or behavior                               | interface boundary, acceptance scenarios              |
| `refactor` | internal structure changes while observable behavior and important side effects stay stable | invariants, characterization or regression coverage   |
| `perf`     | latency, throughput, memory, size, or another explicit metric should improve                | baseline, numeric target, comparable measurement      |

An intentional observable behavior change is `fix` or `feat`, not `refactor`. An unmeasured improvement is not yet `perf`.

Use the vocabulary proportionally:

- shape uses it only when classifying a concrete change helps focus the discussion;
- plan selects exactly one type for plan structure and the optional GitHub Issue label;
- implement uses the known or inferred type to choose TDD, invariant protection, or measurement.

`brainstorm` describes a conversational use of shape. It is not a change type, plan mode, label, or persistent status.
