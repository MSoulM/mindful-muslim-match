# FIX-MSM-008 — Remove committed secrets from the repo (SD-001, SD-008)

Date: 2026-07-08. Branch: dev. Precondition: operator rotated all keys before
this fix — every historical value is dead. No secret value appears in this
file or anywhere in the fix.

## Actions

1. **`.gitignore`** — added an environment block at the top: `.env`, `.env.*`,
   `!env.example` (so the placeholder template stays trackable).
2. **Untracked `.env`** — `git rm --cached .env`: the deletion is staged in
   the index only; the file remains on disk for local dev.
3. **`env.example` rewritten** — now lists the 7 client-safe variable names
   with placeholder values: VITE_SUPABASE_URL, VITE_SUPABASE_PROJECT_ID,
   VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_PUBLISHABLE_KEY,
   VITE_CLERK_PUBLISHABLE_KEY, VITE_AZURE_SPEECH_KEY,
   VITE_AZURE_SPEECH_REGION. **VITE_SUPABASE_SERVICE_ROLE_KEY dropped
   entirely**, with the required comment: the service-role key lives only in
   Supabase edge function secrets, never in this repo, and never in a
   VITE_-prefixed variable (VITE_ vars bake into the public client bundle).
   This also fixes the stale `PUBLIC_CLERK_PUBLISHABLE_KEY` name that
   env.example previously carried.

## Evidence

Untracking verified (literal):

```
rm '.env'
=== status ===
D  .env
 M .gitignore
 M env.example
=== .env still tracked? ===
(empty = untracked)
=== .env on disk? ===
True
=== check-ignore ===
.gitignore:2:.env	.env
```

**Repo-wide scan for VITE_SUPABASE_SERVICE_ROLE_KEY:** the only matches are
`.env` itself (local, now untracked), the old `env.example` placeholder
(removed by this fix), and historical mentions in docs
(INV-MSM-000-RESULT.md, the tracker). **Zero source files import or read the
variable** — no call sites exist, so no refactor ruling was needed.
Recommended operator follow-up: delete the line from the local `.env` too;
nothing reads it.

Build verification (env on disk unchanged):

```
dist/assets/ProfileCompletionTest-7EqNGMPq.js            810.82 kB │ gzip: 152.33 kB
dist/assets/index-CLTtONuD.js                            829.85 kB │ gzip: 250.53 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking:
https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 49.22s
BUILD EXIT: 0
```

Exit 0; chunk hashes identical to FIX-MSM-007's verified build (no code or
dependency change in this fix, as expected). The >500 kB chunk warning is
pre-existing (SD-018/019).

## Residual risk (recorded, not attempted)

The pre-fix `.env` blobs remain reachable in git history (every commit from
the initial Lovable import through FIX-MSM-007 on both main and dev). Purging
them requires a history rewrite (filter-repo/BFG) plus force-pushes, which
the main-branch ruleset now blocks. Because the operator has rotated every
key — the historical values are dead credentials — this is accepted as
residual risk rather than bypassing branch protection. Revisit only if the
repository is ever made public or transferred (rewrite history first in that
event).

## Sprint-debt effect

- SD-001 → RESOLVED (residual: dead secrets in history, note above).
- SD-008 → RESOLVED (variable dropped from client env surface; no code
  references; the inert browser VITE_OPENAI_API_KEY pattern in
  src/services/originality/embeddings.ts stays tracked under SD-018).
- No new items: step-3 scan found zero call sites.

## Proposed trap-rule

Secrets never go in VITE_-prefixed vars — Vite bakes them into the public
bundle; server keys live only in Supabase edge function secrets, and .env
stays gitignored (verify: `git ls-files .env` empty + `git check-ignore .env`
matches). (Added to CLAUDE.md standing trap-rules in this commit, together
with the FIX-MSM-007 lockfile-E404 rule.)
