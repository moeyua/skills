# Catalog Convergence States

Judge mechanical signals first: catalog applicability, file existence, checker findings, and headings from the selected format. Use model judgment only for claim drift.

| state           | meaning                                               | action                                               |
| --------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| not applicable  | the catalog's `When needed` excludes the artifact     | skip and report why                                  |
| missing         | applicable artifact is absent                         | create only from its authoritative source            |
| format mismatch | content exists in an older or hand-written shell      | re-shell autonomously when all content is preserved  |
| half-done       | conforming shell contains empty/placeholder sections  | fill gaps autonomously from an explicit valid source |
| content drift   | a current claim conflicts with verified project state | stop for the authority that can resolve the conflict |
| conformant      | format and current claims hold                        | skip                                                 |

For PRODUCT or Specs created from nothing, maintainer interview answers are authority. An unanswered section may remain visibly source-missing; never infer intended behavior or product direction from code. Also stop before an edit that could lose authored content or create new product intent.

After writing, rerun the same classification and compare working-tree state. Acceptance requires every artifact to be conformant or not applicable and an immediate second run to make no change.
