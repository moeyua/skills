---
name: implement
description: 'Implement an authorized change, verify it in proportion to risk, and keep directly affected durable truth accurate. Use when the user says "implement" / "build it" / "实现" / "落实", whether or not a plan exists. Not for shaping unresolved intent, publishing git history, releasing, or expanding the requested scope.'
---

# Implement

Implement owns the authorized outcome from edit through working behavior and proportionate evidence. A plan is optional context, not an entry gate; a clear request to make or fix something authorizes the work needed within that scope.

## Ground the change

Use the user's current request, settled decisions, and corrections to determine the outcome. Explicit user instructions take precedence over skill guidance, within applicable host constraints. An artifact carries the authority of its sources; it does not settle an undisclosed product choice. Read an associated plan in full, but do not let it override a later correction. When a premise is rejected, revisit only the work that depended on it; answer side questions without losing the active task.

Inspect project instructions, working tree, target code, and verification entry points. Obtain Explore context when missing project facts would make the change unreliable. Preserve separable user changes; stop only the edits that overlap work of ambiguous ownership. Never stash, discard, stage, or commit that work to proceed. Before editing on `main`, `master`, `develop`, the remote default branch, or detached HEAD, use a working branch; reuse an existing same-task branch and follow stricter repository isolation policy.

State the observable outcome and affected paths. Resolve repository-answerable facts and mechanical choices yourself. New product semantics, dependencies, external side effects, or scope expansion need authority. Fallbacks, compatibility layers, migrations, dual paths, and legacy paths are not mechanical safety; they require explicit user authority or authoritative project intent. An authorized replacement removes superseded code, configuration, tests, and directly affected durable truth.

When an associated plan needs lifecycle maintenance or the outcome requires formal acceptance, read `references/assurance.md` before the first relevant edit or claim. Ordinary work without a plan or formal acceptance needs no assurance artifact or complete-diff identity.

## Build and verify

Read `references/change-types.md` when it helps select proof. For a fix, establish expected versus actual behavior; for a feature, cover its observable interface; for a refactor, preserve behavior and side-effect invariants; for performance work, compare the same metric before and after.

Use TDD when a red-to-green test is cheap, stable, and distinguishes the correction. Otherwise use existing tests or the narrowest falsifiable observation. Avoid tests that merely restate implementation or require ceremonial infrastructure. Reshape the touched range coherently, follow local style, and leave unrelated improvements alone.

Run required checks and the smallest evidence that can disprove the change; broaden for actual interaction risk or the requested gate. Once those checks pass, broaden or repeat only for new edits, failures, or unresolved concerns. Never weaken tests, add skips or ignore directives, bypass hooks, force operations, or repeat a failure until it happens to pass. Keep credential values on the project's normal secret/configuration path, out of code, tests, logs, plans, docs, and reports.

## Continue through supporting work

Compose Check for relevant review, testing, or independent judgment, and Docs for an explicit document target, Spec delta, or directly affected false claim whose correction is already authorized. Their results return to the active implementation; they do not end it. Check stays read-only, while the still-authorized Implement may investigate and repair in-scope findings. Rerun only affected proof after repair or documentation changes. Formal acceptance additionally follows `references/assurance.md`; an ordinary Check pass is not an acceptance attestation.

When the host permits delegation, delegate a bounded, independent investigation or verification if it saves time or improves judgment. Give it the required raw context, expected deliverable, and edit ownership; continue independent work and inspect its result. Keep tightly dependent edits local. A full-history fork does not establish independent acceptance.

Retry a command once only when evidence suggests a transient failure. Repeated failure ends blind retries, not diagnosis: inspect new evidence, revise the hypothesis, and repair within scope. Ask only when the next action needs changed intent, scope, dependency or document authority, or cannot proceed with available access. Finish unaffected authorized work while that action waits. If a skill instruction causes a pause, link its source, quote the relevant instruction, and explain why it applies rather than inventing a new approval gate.

A failed, ambiguous, or missing required state remains its exact non-success result. Report what it limits; never mask it with an unrequested alternate path. A running job or intermediate check does not substitute for the user's observable outcome.

## Result

Lead with what works, then give relevant changed paths, actual verification and important limitations. Ordinary results need no producer/acceptance form. If a plan or formal acceptance is involved, preserve the required record and report its actual state through `references/assurance.md`; do not self-attest acceptance or imply that an unperformed Check or Docs occurred.

Implementation does not authorize commit, push, PR, release, deployment, or other delivery. Continue those outcomes only when separately authorized through their owning capability.
