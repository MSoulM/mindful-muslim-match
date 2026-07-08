# FIX-MSM-007 — Lockfile repair (SD-007)

Date: 2026-07-08. Branch: dev. Scope: root-cause fix, minimal diff.

## Root cause

`package-lock.json:289` pinned `@clerk/shared@3.35.2` to a nonexistent
registry tarball URL:

- Bad: `https://registry.npmjs.org/@clerk/_shared/-/shared-3.35.2.tgz` (E404)
- Correct: `https://registry.npmjs.org/@clerk/shared/-/shared-3.35.2.tgz`

Decisive evidence for the minimal fix: the `integrity` hash already stored in
the lockfile (`sha512-TXWHWWZYgIkuk6jGFMMHtnjxVw92JJY/krckQnzR8kXqSFbs4Pvrkf5
zm1HH+97v4nL0w2GC9XAdolQYOsTk0A==`) is byte-identical to the registry's
`dist.integrity` for `@clerk/shared@3.35.2` (verified via `npm view`). Only
the URL was corrupt; the pinned version and its hash were already correct, so
no regeneration and no other lockfile change was needed or performed.

**How it got there:** `git log -S '@clerk/_shared'` shows the bad URL entered
in commit `d36d4bf` (2026-01-16, "implemented mmagent chat feature"). npm
never emits URLs of that shape, and a correct integrity hash sitting next to
a wrong URL means the entry was mechanically rewritten rather than resolved —
consistent with a bad merge-conflict resolution or an editor search/replace
sweep over package-lock.json during that commit's large lockfile update.

## Change summary (exact diff)

1. `package-lock.json` — 1 line changed: `@clerk/_shared/-` → `@clerk/shared/-`
   in the `resolved` field of `node_modules/@clerk/shared`. Integrity hash
   untouched (already correct). Every pinned version preserved.
   `git diff --stat`: `package-lock.json | 2 +- (1 insertion, 1 deletion)`.
2. `bun.lockb` — deleted (stale Lovable artifact, last real update
   2025-11-11; bun not installed; npm is the package manager of record).
   Exactly one lockfile truth remains.
3. Ledgers migrated into the repo per operating rules: docs/SPRINT-DEBT-TRACKER.md
   and docs/TOBEPROMOTED.md are now authoritative on dev; CLAUDE.md rule
   amended accordingly.

## Verification (literal output tails)

Run in the repo on dev, from gutted node_modules (i.e. a true clean install):

```
33 vulnerabilities (10 moderate, 21 high, 2 critical)
To address issues that do not require attention, run:
  npm audit fix
...
CI EXIT: 0
=====BUILD=====
...
dist/assets/VoiceRegistration-BeC9D8GD.js                451.86 kB │ gzip:  94.23 kB
dist/assets/AdminAnalyticsScreen-BC8WmQx7.js             713.57 kB │ gzip: 233.45 kB
dist/assets/ProfileCompletionTest-7EqNGMPq.js            810.82 kB │ gzip: 152.33 kB
dist/assets/index-CLTtONuD.js                            829.85 kB │ gzip: 250.53 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking:
https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 1m 39s
BUILD EXIT: 0
```

- `npm ci` exit 0; `npm run build` exit 0 (1m 39s on the OneDrive-synced
  path; 39.75s on local temp in the INV diagnostic — same result).
- Chunk hashes are identical to the INV-MSM-000 diagnostic build
  (e.g. `index-CLTtONuD.js`, `ChatDetailScreen-BB8MKJ_B.js`), confirming the
  one-line repair reproduces the exact dependency tree — no drift.
- Warnings unchanged from INV-MSM-000 (pre-existing, out of scope here):
  33 audit vulnerabilities (SD-015), >500 kB chunks (SD-018/019 bundle notes).

## Sprint-debt effect

- SD-007 → RESOLVED (this fix). Repo installs reproducibly from lockfile;
  repo node_modules restored by the verification `npm ci`.
- SD-019 narrowed: bun.lockb line item resolved here; remaining hygiene items
  unchanged.
- Unblocked: SD-015 (`npm audit fix` now runnable against a working install).

## Proposed trap-rule

Lockfile E404 on a scoped package: before regenerating, diff the failing
`resolved` URL against `npm view <pkg>@<version> dist.tarball` — if the
integrity hash matches the registry, fix the URL in place and keep every pin.
