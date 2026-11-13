---
name: verify
description: "Prove a change works by using it for real and comparing what happens with what the user asked for. Use when the user says verify / check it works / 验证 / run the tests, or before calling work done."
---

# Verify

Check the real thing. "It compiles", "the tests pass", and an agent's own summary are proxies. The proof is the feature doing what the user asked, observed directly.

## 1. Write down what should happen

Before running anything, list what the user should see if this works, from their side: "`pnpm build` exits 0 and `dist/` has `index.html`", "clicking Save shows the toast and the row persists after reload". Take it from the request or the plan, not from the code you wrote.

## 2. Use it through the front door

Drive the change the way its user would:

- **CLI**: run the command with real input and read the output.
- **Web UI**: open it in a browser, click through the flow, screenshot it.
- **API**: send the request with `curl` and read the response.
- **Library**: write a throwaway script that imports it the way a caller would.

Then run the project's checks (types, lint, tests). They support the proof; they don't replace it.

If the user only asked to run the tests, run the tests and stop there.

Prefer a check you can rerun over one you eyeballed: a script, a test, a saved command. When a check fails, suspect your observation method before the system.

## 3. Compare and report

For each expected result from step 1, give one line:

- ✅ matched. Show the command and the relevant output, or the screenshot.
- ❌ didn't match. Show what you expected and what you saw.
- ⚠️ couldn't check. Say why and what it would take.

Label every claim: **measured** (you ran it and saw it), **inferred** (you reasoned from code), or **guess**. Never hand the user a check you could have run yourself.

Verify reports. It doesn't fix. If something failed, say so and let the caller decide.

## Independent verification

When the user asks for an independent check, spawn a subagent with a fresh context. Give it the user's request and the expected results, not your implementation notes, so it can't inherit your assumptions.
