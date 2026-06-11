---
name: handoff
description: "Generate a self-contained handoff summary so work can continue in a fresh session or with another agent. Use when the current session is ending, context is getting long, or the user asks to preserve what matters for continuation. Not for project documentation (use docs), whole-project exploration (use explore), or automatically creating new sessions."
when_to_use: "handoff, hand over, continue later, new session, context summary, session summary, transfer context, 交接, 交班, 交给下个会话, 新会话继续, 上下文总结"
dispatch_intent: "Generate a host-neutral, read-only handoff summary for continuing work in a fresh session"
---

# Handoff

Handoff packages what matters from the current session into a self-contained summary that a fresh session — or another agent — can pick up and continue from. It is an orthogonal tool, like doctor: it serves the continuity of the loop, not any single change inside it, so it sits outside the core loop and the delivery stages. Every rule here exists to keep the summary **honest and portable**: built only from what this session can actually see, readable by any host, and never a write into the project.

Two cross-skill rules apply to all squire work — `references/anti-patterns.md` and `references/durable-context.md`. If they aren't already in your context this session, read them once before proceeding; don't re-read if you already have.

## Outcome Contract

- Outcome: a self-contained handoff summary in the conversation, ready to paste into a new session
- Done when: every HANDOFF CONTEXT field is filled — with an explicit `Not available` / `None` where the data doesn't exist — and a host-neutral continuation note follows it; or the session has nothing to hand off and that verdict is stated plainly
- Evidence: the visible conversation + `git status --short` output + the plans / diffs / files actually read
- Output: a plain-text HANDOFF CONTEXT block in the conversation — never a file

## Read-only, output stays in the conversation

Handoff modifies nothing: no file writes, no commits, no pushes, no new sessions, no calling other skills. The summary's one use is being pasted into the next session — it is transient by nature. Writing it to a file would mint a durable artifact that someone then has to track and clean up, and would blur the line with project documentation, which `/docs` owns. The user decides what to do with the output; handoff just hands it over.

## Validate: is there anything to hand off?

Check first that the session actually carries substantive work — a task in progress, decisions made, files touched, a plan advanced. A fresh or idle session has nothing to transfer; say so plainly and stop. Fabricating a summary from nothing defeats the only purpose the summary has: being trusted by the next session.

## Gather

Collect read-only facts, starting with `git status --short` — always. When the work involves code or a plan, extend to: the relevant plan file, recent diff / stat, the key files in play, and whatever task list state is available.

Use only what this session can see: the visible conversation, project files, git state, and available task state. Don't reach for raw transcripts or machine-specific long-term memory paths. Data the host doesn't expose — hidden earlier turns, todo state, anything you can't actually read — gets marked `Not available`, never reconstructed from memory or guessed. A gap labeled honestly is useful; a gap papered over poisons the next session's trust in the whole summary.

## Extract and output

The selection bar for every line: does the next session need this to continue? Keep the user's words, the goal, decisions, constraints, files, and remaining tasks. Implementation detail survives only when it changes the next step.

Output this plain-text template — no markdown `#` headings and no code fences, neither inside the block nor wrapped around it, so it pastes cleanly into any host:

```
HANDOFF CONTEXT

USER REQUESTS (AS-IS)
<the user's original requests, verbatim as far as possible>

GOAL
<what the work is driving at, one or two lines>

WORK COMPLETED
<what has been done and verified>

CURRENT STATE
<where things stand now: branch, working tree, test status>

PENDING TASKS
<what remains, in order if order matters>

KEY FILES
<up to 10 workspace-relative paths, one line each on its role>

IMPORTANT DECISIONS
<decisions made and why, briefly>

EXPLICIT CONSTRAINTS
<the user's stated constraints, verbatim as far as possible>

CONTEXT FOR CONTINUATION
<anything else the next session needs to not start cold>
```

Field rules:

- **USER REQUESTS (AS-IS)** and **EXPLICIT CONSTRAINTS** preserve the user's wording verbatim as far as possible — paraphrase loses exactly the nuance a handoff exists to carry.
- **KEY FILES** lists at most 10, as workspace-relative paths. More than 10 means the summary is becoming a project index — that's `/explore` output, not a handoff.
- Missing or unobtainable information: `Not available`. Genuinely empty: `None`. Never invent.

## Secrets never travel

If the conversation, a diff, or a file surfaces an API key, token, credential, or private config value, the summary omits the value and says so ("omitted: credential value"). Keep the non-sensitive context around it when that's what the next session needs. A handoff summary is made to be pasted around — it is exactly the wrong place for a secret.

## Host-neutral continuation

End with one short instruction the user can act on anywhere: paste the HANDOFF CONTEXT block into a new session and continue from PENDING TASKS. Don't require any host-specific capability — no session APIs, no TUI keystrokes, nothing squire doesn't own. The summary must work whether the next session is Claude Code, another agent, or a plain chat window.

## When to stop

Handoff's failure mode is overreaching — doing more than reading and summarizing. Stop in these cases:

- **No substantive work in the session** — say there's nothing to hand off; don't fabricate a summary.
- **The urge to write the summary to a file** — output lives in the conversation; files are `/docs`' territory.
- **Host data you can't see** — mark it `Not available`; don't reconstruct it from memory or guess.
- **The summary ballooning into project documentation** — durable project truth goes to `/docs`, project understanding to `/explore`; handoff carries only what continuation needs.
