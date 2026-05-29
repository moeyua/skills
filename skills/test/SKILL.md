---
name: test
description: 'Run, add, or debug tests — the single entry point for test work. Use when the user says "run the tests" / "add tests" / "add a regression for X" / "this test is failing, help me look" / "跑测试" / "补测试". Not for the minimal test set a plan requires (write that via TDD inside implement), non-test code changes (use implement), or pure review without writing tests (use review).'
when_to_use: "test, run tests, add tests, regression, coverage, flaky, failing test, 跑测试, 补测试, 回归, 覆盖率, 测试挂了"
dispatch_intent: "One entry point to run / add / debug tests"
---

# Test

Test is the single entry point for test work — run tests, add coverage, debug failures. Every rule here exists so that **tests guard the truth**: a failing test is a signal, not a nuisance, and bypassing it throws the signal away; test code must be grounded in real code behavior, and a "looks plausible" test written from intuition is noise.

Unfamiliar project? Run `/explore` first — starting without knowing the project's test framework and commands invites inventing infrastructure that isn't needed.

Test follows the project: test framework, commands, directory structure, naming, assertion style, mock conventions — all taken from what the project already uses, inventing no new conventions. If the project has no framework installed, report the state and let the user decide whether to introduce one; **never run a silent `pnpm add`**.

## Outcome Contract

- Outcome: the test suite runs / coverage is filled as requested / a failure diagnosis is clear
- Done when: run tests → pass/fail fully reported; add tests → new tests green + coverage intent clear; debug → root cause identified
- Evidence: the actual output of the test command / the code under test that was Read / the full failure message
- Output: see the template at the end of each scenario

## Three work scenarios (routed by the message)

| cue in the user's message                              | work    |
| ------------------------------------------------------ | ------- |
| `/test` / "run the tests" / "do the tests pass"        | run     |
| "add tests" / "add a regression for X" / "cover module Y" | coverage |
| "this is failing, help me look" / "flaky?" / "why is this test breaking" | debug   |

No mode system needed — the message content routes naturally.

## Run tests

Detect the framework + command (`package.json` scripts / `Cargo.toml` / `pyproject.toml` / `go.mod` etc.), run the matching test command, report in this format:

```
Test run: <command>
Total: N | Pass: N | Fail: N | Skipped: N

Failures:
- <file>::<test-name>
  → <assertion or error first line>

Next: debug one failure with /test <file::name> / fix the code via /think fix
```

With multiple failures, group them by "looks related / looks independent" — failures with a shared root cause are far faster handled together than one by one.

**Flaky suspicion**: when a test looks timing- or resource-sensitive, **retry once only**; still failing means it's not flaky, it's failing. Passing after many retries and calling it green is the opposite of guarding the truth — you're just waiting for luck.

## Add coverage

1. **Clarify what to cover** — the scope from the user's message, or ask "which class of scenarios for X: happy / error / edge / integration?"
2. **Read the code under test** to see the **real behavior**, not guess what it should be. Tests written from intuition often "test a spec that doesn't exist".
3. **Grep existing tests** — don't rewrite a case that's already covered; N similar tests covering one case is noise.
4. **List a coverage plan**: which scenarios to test, one line each.
5. **Write in the project's test style**: directory structure / naming / assertion API / mock usage follow what's there; invent no new conventions.
6. **Run the new tests → they must be green**:
   - red from the start but not a pre-existing bug → the test itself is wrong
   - green from the start → the test doesn't really cover it (stop and fix the test, don't "tweak" the code to fit)
7. **Mock sparingly** — mock only the necessary external boundaries (network / filesystem / time); mocking until the test no longer verifies real behavior is self-deception.

```
Coverage added: <area>

New tests:
- <test-file>: <case 1>
- <test-file>: <case 2>

Verify: <command> → pass (N new green)

Next: run the full /test for regressions / run commit to land it
```

**Cover only the agreed scope** — write any refactor opportunity you spot into the report and route it back to `/think refactor`; don't touch it on the side.

## Debug

1. **Read three things**: the failing test code + the full error message + the code under test. All three — missing any one risks a misdiagnosis.
2. **Decide among three possibilities**:
   - **the test is wrong** (bad assertion / wrong mock / expectation out of sync with the implementation) → fix the test
   - **the code is wrong** (real bug) → don't fix it here; route back to `/think fix`
   - **flaky** (timing / resource / global state / random seed) → report the root cause; for a race condition, mark a TODO and let the user decide
3. **Don't "patch" a test into passing** — tell clearly which class of problem it is and handle it on the matching path. Editing a test's assertion to make it pass erases the signal source.

```
Failure: <file>::<test-name>

Root cause: <one paragraph>

Category: test-bug / code-bug / flaky

Fix direction:
- <action>

Next: <the specific next skill / action>
```

## When to stop

Test's most common failure is "bypassing the signal to make a test pass". Stop and report in these cases:

- **You want to `.skip` / delete a test / add `--no-verify` to make it pass** — never bypass; a failure is the signal.
- **A test still fails after 1 retry** — no more retries, treat it as a failure; passing after many retries and calling it good is self-deception.
- **The user asks to "make test X pass" but X reflects a real bug** — refuse; route back to `/think fix` so the bug takes the proper fix path.
- **No test framework / command found** (and it's not an empty project) — report, let the user name the command or install a framework first.
- **The project has no framework but the user wants to "run the tests"** — report the state, ask whether to introduce testing via `/think feat`.
- **You want to write a test asserting a feature not yet implemented** — the code under test must already exist, otherwise it's TDD overreach (TDD is implement's job, not test's).
- **You want to refactor the code under test on the side** — scope creep; write the refactor opportunity into the report but don't touch it, route it back to `/think refactor`.
