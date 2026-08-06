# Pull Request

Resolve the repository default base and inspect the whole branch:

    git log <base>..HEAD --oneline
    git diff <base>...HEAD

Reuse an open PR for the current head branch; push new commits but do not overwrite authored title/body unless the user asks. An ambiguous create result may be queried once by exact head branch before deciding its state.

For a new PR, derive the title and body from every branch commit and the merge-base diff. Include:

```markdown
## Summary

- <whole-branch outcomes>

## Test plan

- [ ] <reviewer-verifiable checks and actual evidence>
```

Do not claim tests or Check ran without evidence. Use the repository's normal PR state and do not change draft/readiness unless the user explicitly asks.

When a canonical same-repository Issue association is explicit or recorded in the plan, add `Closes #N`. No Issue association is a normal state: omit closing syntax and never search by title.

Use a safe temporary body file for the create call. Remove the temporary body file after the attempt on success, failure, or an ambiguous result. For a non-GitHub remote, complete the safe push and return a manual PR/MR title and body instead of pretending a PR exists.
