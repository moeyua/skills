# Test Method

Detect the project's real test command from its manifest, task runner, or instructions. Start with the narrowest command that covers the claim; broaden when interaction risk or the user's requested gate requires it.

Report the exact command, result, and pass/fail/skipped counts when available. Group failures by likely shared cause and distinguish failures related to the change from clearly unrelated ones without hiding either.

Retry once only when failure evidence is plausibly timing- or resource-sensitive. A second failure is a failure. Never skip/delete tests, weaken assertions, add ignore directives, or bypass hooks to manufacture green.

If the project lacks a test framework, use an existing deterministic check or report that automated coverage is unavailable; do not create infrastructure from a read-only capability.
