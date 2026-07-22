# plan — `fix` type

Use `fix` for wrong behavior, errors, and regressions. Its quality bar is an evidenced root cause plus a regression that distinguishes the broken behavior from the correction.

## Evidence to resolve

- Reproduce or otherwise establish expected versus actual behavior.
- Locate the causal condition in code, configuration, data, or protocol evidence.
- Scan the blast radius for the same failure class.
- Identify when the behavior changed when history is relevant.

Gather repository-answerable evidence directly. Ask the user only when a missing product decision changes what counts as correct behavior.

## Required plan sections

### `## Root cause`

State one sentence naming the causal location or condition, what it does incorrectly, when it triggers, and why it explains every observed symptom. Use `file:line` or the narrowest available function/configuration location when the repository provides it.

### `## Regression tests`

List the test file and test name, triggering input or condition, expected corrected behavior, and whether coverage is new or existing. The regression must fail against the broken behavior and pass after the fix. If the project has no test framework, give the minimal reproducible command or action sequence and observable result.

Include `## Spec delta` when the correction changes a recorded contract.

## Ready when

The root cause explains all reported symptoms, the pattern scan covers the plausible blast radius, and every corrected behavior has a regression path. A guard that only hides the symptom does not meet the bar.
