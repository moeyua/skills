# Skills

> Focused, lightweight capabilities for software development and durable project memory.

Skills assumes modern agents already possess strong general reasoning. Its value is not to prescribe every step; it supplies clear capability interfaces, project-specific judgment, trustworthy sources, and boundaries around consequential side effects.

The context architecture draws on Anthropic's [The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models): prefer judgment over exhaustive rules, interfaces over examples, progressive disclosure over upfront context, concise descriptions over repetition, and rich references over overloaded prompts. One common skill set serves Codex and Claude Code; GPT-6 Astra is the primary model for current behavior calibration, informed by [OpenAI's model guidance](https://developers.openai.com/api/docs/guides/latest-model). The relevant outcomes are autonomous follow-through within authorization, proportional verification, useful delegation, and concise evidence-backed communication.

## Design philosophy

### 1. Lightweight guides, not workflow programs

A main `SKILL.md` contains only what is broadly useful when entering that capability:

- its purpose and result;
- product- or domain-specific judgment;
- the few boundaries that protect intent, data, credibility, or difficult-to-reverse state;
- routing to deeper references when their trigger appears.

Rules that restate general competence, enumerate every possible mistake, repeat another source, or force the same prose template across all capabilities do not belong in the main context.

### 2. Outcome authorization with agent-owned composition

The user expresses the outcome and its authorization boundary. The agent owns the micro-orchestration needed to finish it: gathering facts, using TDD when useful, selecting verification depth, obtaining independent judgment, and synchronizing directly affected durable truth.

Supporting capabilities return to the active owner, which continues already-authorized work. A blocked dependent action does not stop unrelated authorized work, and repeated command failure calls for diagnosis rather than blind retry. Required checks end once sufficient evidence is established unless new changes, failures, or unresolved concerns warrant more. Independent work may be delegated when the host permits it and the benefit exceeds coordination cost.

This composition is adaptive rather than a hidden fixed pipeline. An explicit Skill invocation remains a useful way to narrow or control the public outcome, but the user should not have to manually invoke every supporting capability. Shape uses Explore context for the current target project before forming a project-related direction, even when the project is familiar, the request is simple, or the direction is settled. This required support call returns to Shape without a separate report or review round; it does not make Explore or Shape an upstream requirement for other outcomes. Already-settled decisions remain inputs unless new evidence invalidates them.

Plan owns one required quality check after generating the selected artifacts: an independent Review audits the actual planning outputs, then Plan corrects evidenced problems within its existing authorization and verifies the affected findings. This applies to all three targets without a separate user invocation or approval for clear corrections. New requirements and material tradeoffs remain the user's decisions. One audit and its targeted follow-up do not become an open-ended review loop; generation, audit verdict, and revision evidence remain separate, and planning review never grants implementation approval or acceptance.

Shape helps users form judgments about intent and consequential design. It asks independent, currently answerable questions together, grounds choices in concrete situations, and uses uncertain answers to refine the discussion. A proposed mechanism is evidence of an idea, not a settled goal; an already-clear request does not require an interview ritual.

Debug is a reusable diagnostic capability: it establishes expected versus actual behavior, investigates falsifiable causes, and makes evidence and unknowns visible. Implement owns completing an authorized repair, including changes, regression proof, and directly affected truth. Diagnosis does not grant new mutation authority or end a still-authorized repair.

Review and Verify serve independently useful questions. Review identifies what needs correction and why; Verify judges whether the original claimed result has sufficient evidence. Code inspection, tests, and real user paths may support either outcome. Their results stay scoped and read-only; only formal independent Verify establishes acceptance, and later conflicting review evidence prevents an unqualified current acceptance claim.

External mutations remain bounded by their owning outcome. Implementation does not silently become publish or release; an Issue target, commit/push/PR, and release transaction each require the corresponding user authorization.

### 3. Intent fidelity across outcomes

Adaptive composition does not let the agent silently reframe the work. Four distinctions preserve the user's meaning as context and artifacts accumulate:

- **Intent** — the active outcome and horizon come from the user's statements, accepted decisions, and authoritative project intent. A mechanism, local task, artifact, or intermediate state does not replace that outcome.
- **Authority** — a consequential commitment is settled only by a user decision or authoritative project intent. Agent inference, recommendation, silence, or the existence of a summary, plan, code change, or merged artifact does not create that authority.
- **Evidence** — a completion claim cannot exceed the evidence actually established for the observable outcome. Static checks and intermediate success remain useful without becoming end-to-end proof.
- **Invalidation** — when the user rejects a premise, conclusions that actually depended on it reopen; unrelated settled decisions remain stable.

Two operating consequences apply throughout project development:

- **Fail-close** — A failed, ambiguous, or missing required state remains exactly that. It may yield an honest partial or lower-assurance result, but it is never success and never authorizes an unrequested alternate path.
- **Clean-break** — When the authorized outcome replaces or removes a design, the superseded path is removed. A fallback, compatibility layer, migration, dual path, or legacy path is additional scope and requires an explicit user decision or authoritative project intent; perceived safety does not create authority.

These are semantic distinctions, not a universal form, ledger, or confirmation workflow. Each capability applies only the part needed for its own outcome.

**Attestation** constrains who may produce a consequential claim and which stable basis it covers across those four distinctions; it is not a fifth state. A capability may establish its own outcome and report the evidence it actually produced, but it cannot manufacture missing upstream authority or grant itself a downstream independent verdict. Ordinary implementation and scoped checks report the outcome, actual evidence, and material limitations without a mandatory assurance form. Formal acceptance and associated plan records load the detailed protocol only when needed: implementation produces an identifiable candidate and local evidence, while only independent Verify can attest acceptance for that exact basis. A recorded attestation is a time-scoped snapshot, not proof that no later contradictory result exists; a current acceptance claim must establish that the basis still matches and that the referenced result is the latest applicable evidence available in the current context. A legacy `done` artifact without a complete basis-scoped attestation remains historical completion only—missing provenance is not inferred or backfilled. Lower-assurance outcomes remain valid results when reported honestly.

### 4. Clear interfaces and progressive disclosure

Frontmatter descriptions are the runtime routing interface. The main body explains judgment and routes to conditional references. Target schemas, recovery state machines, complex provider behavior, document formats, and other deep knowledge load only when the task triggers them.

Explore deliberately keeps a fixed Overview before scoped depth. Necessary project identity, instructions, architecture, and global documents are still read in full and in sequence; progressive disclosure applies after that skeleton and to domain-specific depth. Explore owns this method wherever its context is used, including Shape: current facts may be reused and gaps filled, but familiarity does not waive the required exploration. Missing Explore or an inaccessible or unidentified target project remains an explicit evidence gap rather than an invented completion or substitute method.

### 5. Durable truth is a first-class capability

The default catalog contains exactly six memories: domain Specs, PRODUCT, ARCHITECTURE, DESIGN, ROADMAP, and README. Docs records only truth with an authoritative source; code can establish mechanics but cannot invent product intent.

Specs, tests, code, formats, mockups, and rubrics are valuable high-fidelity references. They may be detailed because they are loaded for a relevant question, not injected into every capability call.

### 6. Tools protect mechanical invariants

Deterministic checks own what code can know: frontmatter shape, public inventory, reference resolution, Skill↔Spec pairing, memory-format indexing, Markdown links, and checker facts. Tests should protect interfaces and product invariants rather than exact prompt wording or one mandatory body template.

## Boundaries

### Product value decisions

Skills helps clarify and execute work after someone decides to pursue it. It does not decide whether an idea is worth doing, or make Kill/Keep/Pivot judgments for the product owner.

### Authorization does not silently expand

Supporting capabilities may be composed inside an authorized outcome, but one outcome never grants a different consequential transaction. Planning artifacts, project edits, commit/push/PR, and release state retain distinct authorization boundaries.

### Unrequested project documents

The six catalog memories are the default durable surface. A user may explicitly name another project document, but the agent does not invent a seventh catalog category, sibling guide, changelog, or release-notes file.

This boundary does not exclude version-bound repository release metadata that authoritative project facts already make part of a release. Release may update that existing surface with the target version; it still does not invent a new documentation system.

### Release-adjacent operations

Release is intentionally narrower than deployment or distribution. It does not absorb rollback, registry publishing, artifact upload, arbitrary changelog creation, automatic PRs, or release-train management.

As decided on 2026-08-11, Release owns an existing version-bound repository release metadata surface together with version and dependency metadata when repository authority makes them one release invariant. Its shape and mechanics remain repository-defined and Agent-resolved; repositories without that invariant gain no new file, schema, or confirmation ritual.

### Agent-host administration

Doctor audits the project, not the agent host's plugins, hooks, MCP configuration, or local machine policy. Host administration is outside this product.

### General project management and content ingestion

Issues created by Plan are bounded problem records: they preserve what is wrong or missing, why it matters, and an observable resolved state when known, while local plans own the implementation approach. Canonical identity stays stable, but `both` may synchronize the Plan-managed problem record for that same bounded problem; implementation-only revisions remain no-ops, and missing ownership, protected external edits, or identity changes fail closed instead of being overwritten. `local` has zero GitHub mutation. Pure `issue` keeps pre-existing reused Issues read-only; after a successful creation batch, it may make one audit correction to each Issue definitively created by that invocation only while its write baseline still matches. Audit findings do not establish permanent ownership or revive a stopped remote transaction. Plan is not a Projects/status/milestone/assignee system. URL/PDF ingestion and open-ended research remain general input capabilities rather than new Skills in this suite.

## Using this document

When a capability changes, ask whether the main context stays lightweight, the interface remains clear, deeper knowledge loads conditionally, agent composition stays inside authorization, and high-consequence boundaries remain explicit. PRODUCT records those stable decisions; implementation history belongs in git and change plans.
