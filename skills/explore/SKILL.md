---
name: explore
description: 'Build fact-level understanding of a project or unfamiliar module for an explicit report or reliable downstream context. Use when entering a repo, facing an unfamiliar module, or the user says "look at this project" / "先看看" / "整体了解一下". Not for debugging or design decisions (use shape), writing an implementation plan (use plan), or checking docs against code (use doctor).'
---

# Explore

Explore builds a trustworthy map of a project before answering a broad understanding question or grounding another capability. It has two outputs: a user-facing report when exploration is the request, and silent context when another capability needs facts.

## Start with the fixed Overview

Complete this skeleton before a scoped deep-dive:

1. Confirm the project root and identity.
2. Read the root README, the ecosystem manifest, and every applicable project instruction file.
3. Scan the documentation inventory, then read in full and in sequence the architecture and other global documents needed to understand the system. When the project uses the Skills memory catalog, read `references/memory-catalog.md` before interpreting its artifacts.
4. Map top-level responsibilities, key entry points, and the commands for running and verifying the project.

The Overview is fixed; its depth is not. “Necessary global documents” means documents whose claims affect the project skeleton or the current scope, not every Markdown file by default. Attribute documentation claims (`per README`, `per ARCHITECTURE`) so they remain distinguishable from observed code and live configuration.

## Deepen progressively

After the Overview, follow the user's scope and the risk of the invoking task. Locate evidence with file listings and search before opening files, avoid rereading unchanged material, and stop when more reading is unlikely to change the answer.

Read `references/deep-dive.md` when a module, behavior, or high-risk cross-cutting area needs detailed mapping. Read `references/report.md` only when exploration itself is the deliverable.

Use the code, tests, configuration, history, and authoritative external sources that can answer the actual question. If evidence is absent, say so. If docs and code conflict, report both sources without deciding which product truth should win.

## Boundaries

Explore is strictly read-only. It does not diagnose a bug, audit documentation drift, make a product or architecture decision, edit files, or launch mutation. Those boundaries keep its facts reusable by shape, implement, check, docs, and doctor.

In report mode, return the structured understanding and stop. In context mode, carry only the relevant facts and source paths into the invoking capability; do not emit a second report.
