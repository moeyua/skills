---
name: implement
description: "Build an agreed change test-first, slice by slice, committing each slice, and finish by showing the user it works. Use when the user says implement / build it / 实现 / 落实, or approves a plan."
metadata:
  credits: "The test-first section is adapted from https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd (MIT)"
---

# Implement

## Start

Open with one or two sentences: the user's goal in your own words, and the smallest change you expect to meet it. Don't wait for confirmation. If what you find in the code rules out the change they asked for, show the evidence and stop.

If a plan exists, read it and work its slices in order. Anything still "awaiting confirmation" is open: ask about it before building on it. Read `GLOSSARY.md` if it exists, and name things in its terms.

Work on a branch, never on the default branch.

## Build each slice test-first

A slice ends in something you can run, not in "the code is written". For a bug, use the `debug` skill until you have a loop that goes red on it.

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals. Test only at seams the user agreed to, usually in the plan. If none were agreed, propose them before writing tests, in plain terms: the function, command, endpoint, or page each test drives, and one line on what it catches and what it misses. Prefer the highest seam that still gives a tight signal.

The loop, per slice:

1. **Red.** Write one test at the seam for the behavior this slice adds. Run it and watch it fail for the right reason.
2. **Green.** Write only enough code to pass it. Don't anticipate later tests or add speculative features.
3. Repeat for the next behavior in the slice. One test, one minimal implementation at a time.

A good test reads like a specification ("user can check out with a valid cart") and survives a refactor because it only touches the public interface. Watch for:

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or checks through a side channel (querying the database instead of using the interface). The tell: it breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does, so it can never disagree with it. Expected values come from an independent source: a known-good literal, a worked example, the spec.
- **Horizontal slicing**: writing all tests first, then all code. Those tests check imagined behavior. Go one test at a time instead.

See [references/tests.md](references/tests.md) for examples and [references/mocking.md](references/mocking.md) for when to mock. When a test at a real seam would be expensive or flaky, say so and check the slice another way (a script, a request, a screenshot).

Run the typechecker and the single test file often. Run the full suite once at the end.

## Keep the change small and clean

- Make the smallest change that solves the problem. Leave code you aren't changing alone.
- When you replace something, delete what it replaced: old code, old tests, old docs. No fallback or compatibility path unless the user asked for one.
- If the change makes one of the project's long-lived docs wrong (README, ARCHITECTURE, specs, GLOSSARY, ...), fix it in the same slice, in the format the `docs` skill gives.
- When a decision is hard to reverse, would surprise someone without the context, and came from a real trade-off between alternatives, ask the user whether to record it as an ADR. Write it only if they agree, in the format the `docs` skill gives.

## Commit each slice

When a slice's tests pass, commit it on the work branch. Stage explicit paths, never `git add -A`; never stage secrets or stray generated files. Match the message style in `git log`, or use a conventional commit. Don't push, amend, or skip hooks.

## Decide or ask

Decide reversible implementation details yourself and keep going. Write each one down as you go.

Stop and ask only for a choice that changes what the user will see, adds a dependency, or is hard to undo. Finish the work that doesn't depend on the answer first.

## Finish

Run the `verify` skill on the result. Then reply, in the user's language, with:

1. **See it yourself.** The one command, URL, or step that shows the change working, and what you saw when you ran it.
2. **Decisions I made.** Every choice the user didn't make, one line each, so they can veto any of them.
3. **Not done or not checked.** Plainly. "Not tested on Windows" beats silence.

Update the plan: mark finished slices and add any decisions you made under "awaiting confirmation".
