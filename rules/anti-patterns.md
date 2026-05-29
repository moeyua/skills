# Anti-Patterns

> Cross-skill behavior constraints that apply to all praxis work, whatever the agent is currently doing.
>
> Every anti-pattern should come from a real failure, **not an imagined one**. Start empty; append one each time the agent slips up.

| #   | Pattern                                     | Wrong                                                                                                         | Right                                                                                                                                              |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Answering about tools / APIs / syntax from memory | Answering "Claude Code skills have no explicit trigger syntax" or "library X has API Y" from a training-data impression — and inventing facts that don't exist | Fetch the docs / test it / read the reference implementation first. "I don't know, I need to check" beats a plausible-but-wrong answer. The cost of misleading far outweighs the cost of checking. |

## When to add one

- The agent actually made a mistake, and it **isn't confined to a single skill** — that's an anti-pattern candidate.
- If the mistake only happens in one skill, put it in that SKILL.md instead.

## When to remove one

- If an anti-pattern hasn't triggered in 6 months, re-evaluate whether it still matters.
- If a model upgrade makes one no longer a problem, remove it and note why.
