# TOBEPROMOTED.md — MSM promotion ledger
Every FIX prompt's final step adds a line: Repo | One-line change description | Result file | Dev-tested (Y/N)
"promoteALL" verifies this ledger against actual main...dev diffs (git is the authoritative payload), promotes per-repo all-or-nothing, verifies production, then archives this file to PROMOTED-{date}.md and starts a fresh empty one.

## STAGED FOR PROMOTION
mindful-muslim-match | FIX-MSM-007 lockfile repair + bun.lockb removal | docs/FIX-MSM-007-RESULT.md | Dev-tested Y
