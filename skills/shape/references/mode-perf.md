# shape — `perf` mode

Triggers: slow, laggy, performance, "optimize loading", "first paint takes too long", "uses too much memory", "the endpoint is too slow".

The core of `perf` is **measure before optimize**. No baseline, no start; no way to measure, no finish.

## Clarify focus (perf-specific)

- Performance metric: what are we optimizing? (latency / throughput / memory / bundle size / startup time / something else)
- Baseline: what's the current number? how was it measured?
- Target: what number do we need? why that number (user experience / SLA / business need)?
- Bottleneck: do you know where it's stuck? or do you need to profile first?
- Acceptable cost: worse readability / added complexity / more memory to trade for CPU — which are acceptable?

## Required plan fields (beyond the common skeleton)

### `## Baseline`

A measurement actually taken, including:

- **Measurement command / tool**: `hyperfine ./run.sh` / Chrome DevTools Performance / `pprof -http` / etc.
- **Numbers**: with units (e.g. `first paint 2.3s` / `memory 1.2GB` / `bundle 8.4MB`), ideally a distribution (p50 / p95 / p99), not just the mean.
- **Environment**: hardware / network / dataset size.

If you haven't measured yet → the plan's first step must be "measure first", otherwise there's no baseline to commit the plan against.

### `## Target`

A specific target number + why it's that number:

- `first paint < 1s` (perceptual threshold)
- `p99 latency < 200ms` (SLA requirement)
- `bundle < 5MB` (acceptable on mobile networks)

Avoid "just make it faster" / "optimize as much as possible" — it must be verifiable.

### `## Measurement`

What command / number proves the target was met after the build:

- the same tool / command as the baseline, run under the same load
- expected number: `the new baseline should meet <target>`
- regression guard: add the measurement to CI / a benchmark suite to prevent future regressions.

## Anti-patterns

- Optimizing without a baseline — "gut feel" optimizations are often negative optimizations.
- Readability dropped but no provable performance gain to show for it — revert.
- Guessing "it should be faster" without measuring — you must measure.
- Optimizing a non-bottleneck — don't touch what the profile didn't point to.
- Substituting a synthetic micro-benchmark number for a real-scenario measurement.
- Optimizing N points at once with no way to tell which one worked — one change at a time, re-measure each time.
- Target written as "a bit faster / smoother" — not verifiable.
- The optimization introduces a new feature — that's feat, not perf.
- The performance work also changes external behavior — that's perf + refactor mixed; split them.
