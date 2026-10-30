# Test Method

Detect the project's real test command from its manifest, task runner, or instructions. For feature verification, use tests to support actual use and cover relevant risks; passing internal tests does not complete the feature claim. When the user explicitly asks only to run tests, limit the result to those tests. Start with the narrowest command that covers the required checks; broaden when interaction risk or the user's requested gate requires it.

Report the exact command, result, and pass/fail/skipped counts when available. Group failures by likely shared cause and distinguish failures related to the change from clearly unrelated ones without hiding either.

Retry once only when failure evidence is plausibly timing- or resource-sensitive. A second failure remains a failure; investigate other relevant evidence without disguising that result. Once required checks pass, repeat or broaden only for new changes, failures, or unresolved concerns. Never skip/delete tests, weaken assertions, add ignore directives, or bypass hooks to manufacture green.

If the project lacks a test framework, use an existing deterministic check or report that automated coverage is unavailable; do not create infrastructure from a read-only capability.
