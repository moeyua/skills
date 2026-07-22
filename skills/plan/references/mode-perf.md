# plan — `perf` type

Use `perf` for a measurable improvement in latency, throughput, memory, bundle size, startup, or another explicit metric. Its quality bar is measure → change → measure under comparable conditions.

## Evidence to resolve

- Select the user-relevant metric and measurement environment.
- Capture or schedule the baseline before optimization work.
- Set a numeric target and explain the requirement it serves.
- Locate the bottleneck with profiling evidence when the cause is not established.
- State acceptable trade-offs when consequential.

Repository and measurement facts come from tools. Ask the user when the target or acceptable trade-off is a genuine product decision.

## Required plan sections

### `## Baseline`

Record the command or tool, values with units and useful distribution, environment, and representative data/load. When no measurement exists yet, make baseline measurement the first implementation outcome.

### `## Target`

State a verifiable numeric target and its user, SLA, or operational rationale.

### `## Measurement`

Use the same method and conditions as the baseline, state the passing result, and add a durable regression guard when practical.

## Ready when

The metric, comparable measurement method, target, bottleneck evidence, and acceptable costs are explicit. Improvements to an unmeasured or non-bottleneck path do not meet the bar.
