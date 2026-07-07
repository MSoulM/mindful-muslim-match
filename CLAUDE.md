# CLAUDE.md — mindful-muslim-match

Project: MSM (muslimsoulmate.ai) — AI-powered Islamic matrimonial platform.
Operating manual: MSMDevMode.md. Follow it.

Estate facts:
- This is the ONLY repo. Stack: Vite + React + Capacitor (Lovable-built).
- Supabase project cuawtofgiviiwiyepyav is MSM-DEV. There is NO Live
  Supabase project yet; MSM-Live will be created at first promotion.
- MCP names: Supabase_DEV_MSM = Dev. Supabase_LIVE_MSM is reserved for
  the future Live project. Never point SQL at any other Supabase MCP
  that may be visible in this session (e.g. an AGXL connection) — those
  belong to a different estate.

Hard rules:
- Dev-first: work on the dev branch against Supabase_DEV_MSM unless the
  prompt explicitly says otherwise. Never merge to main; main is PR-only.
- Introspect the Dev DB before writing any SQL that assumes schema.
- Verification steps paste LITERAL output. Unpasted claims are unverified.
- Every INV/FIX result .md is committed to the msmadmin Google Drive
  output folder (search for the folder at runtime, never hardcode its id;
  retry with title-contains on Drive sync lag). The final step of every
  prompt updates SPRINT-DEBT-TRACKER.md and, for FIX prompts,
  TOBEPROMOTED.md, both in that folder.
- Islamic-compliance-touching changes (gender interaction, photo
  visibility/blur, Wali permissions, moderation, Islamic terminology)
  require an explicit compliance check line in the work and in tests.
- No secrets in files, results, or chat. Reference secrets by name only.
  The tracked .env in this repo is a known breach (SD-001): treat all
  its values as compromised; never copy them anywhere.
- Use Fable 5 High reasoning.
- Never hand the operator curl/shell commands to run manually; execute
  via MCP tools and paste output.
- Root-cause only; no hacks. A forced quick fix is flagged temporary and
  logged as sprint-debt with the proper fix proposed alongside.
- Every root-caused bug ends with a proposed one-line trap-rule.

Standing trap-rules: PG CREATE OR REPLACE with changed signature creates
an overload — pair with DROP FUNCTION IF EXISTS old signature. RLS block
= HTTP 200 empty array; 400 = bad column. Mutual-recursive RLS = break
with SECURITY DEFINER. Trim char columns before comparing. HNSW over
IVFFlat under 1000 rows. React Query same-key consumers must share data
shape. Link helpers: no "?" in path; query string starts with "?". Vite
env vars bake at BUILD time — fresh build (empty commit) after any env
change. Assume Lovable-era hardcoded Supabase creds — env-first. Schema
mirrors include policies on ALL schemas incl. storage. Free-tier
Supabase pauses on inactivity.
