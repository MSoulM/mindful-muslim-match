# SPRINT-DEBT-TRACKER.md — MSM (muslimsoulmate.ai)
Living tracker. CC updates this file as the final step of every INV/FIX prompt.
Authoritative copy: this file (docs/ on dev). A copy is uploaded to the
msmadmin Drive folder on every change; Drive files cannot be edited in place,
so the Drive copy with the latest modifiedTime is current.
Format: ID | Date raised | Severity | Item | Source | Status

## OPEN

SD-001 | 2026-07-07 | CRITICAL | .env file (1,079 bytes) committed and tracked in git — appeared in fresh clone of MSoulM/mindful-muslim-match. All contained credentials must be treated as compromised: inventory (names only), rotate all keys, remove from git tracking, purge from git history, add to .gitignore. INV-MSM-000 addendum: 8 vars inventoried (see INV-MSM-000-RESULT.md §6); .gitignore confirmed missing .env entry. | B0.3 verification | OPEN

SD-002 | 2026-07-07 | CRITICAL | 22 of 46 public tables have RLS disabled, incl. messages, conversations, profile_photos, mmagent_messages, mysoul_dna_scores, mysoul_score_history, behavioral_tracking, voice_introductions, posts, dna_questionnaires, dna_answers, typing_indicators, personality_assessments, notification_settings, message_reactions, message_attachments, cultural_backgrounds, cultural_profiles, trait_distribution_stats, user_profile_fields, behavioral_events, profile_views. 4 of these have policies defined but RLS off. Needs deliberate policy-design pass (default-deny), not blind enable. | Supabase Advisor + B0.3 verification | OPEN

SD-003 | 2026-07-07 | HIGH | No backups, no migrations in Supabase project cuawtofgiviiwiyepyav (free tier). Live DB is the only copy of the 46-table schema. INV-MSM-000 corroborated: list_migrations returns [] while repo holds ~70 migration files (~24 duplicated T-variants) — ledger empty, schema applied ad hoc. Take full schema dump via CC and commit to repo before any schema-touching work. | B0.2 health check | OPEN

SD-004 | 2026-07-07 | MEDIUM | Advisor reports 29 total issues (4 critical RLS covered in SD-002; remaining 25 unreviewed). Enumerate all in INV-MSM-001 and triage. | B0.2 health check | OPEN

SD-008 | 2026-07-07 | CRITICAL | Service-role key stored as VITE_SUPABASE_SERVICE_ROLE_KEY in the tracked .env — client env namespace AND git. Also src/services/originality/embeddings.ts is designed to use VITE_OPENAI_API_KEY in the browser (currently unset/inert). Rotate service-role key; remove from client env; never VITE_-prefix secrets. | INV-MSM-000 §6 | OPEN

SD-009 | 2026-07-07 | CRITICAL | Edge-function auth gaps: JWT payload decoded WITHOUT signature verification across photo-upload/mmagent-* fns (photo-upload uses service-role client + unverified sub → any-user impersonation for photo ops); 16 deployed fns have verify_jwt=false (incl. send-message, voice-upload, weekly-batch); admin-governance-cost has NO admin check (service-role, open). | INV-MSM-000 §2.5/2.6/2.14, config.toml | OPEN

SD-010 | 2026-07-07 | CRITICAL | All 4 storage buckets are PUBLIC (media, profile-photos, users, voice-intros) — every profile photo and voice note world-readable by URL. voice-intros was declared private in migration 20251223112201 but the live bucket is public. No photo-visibility/modesty enforcement exists anywhere. Islamic-compliance critical. | INV-MSM-000 §3 | OPEN

SD-011 | 2026-07-07 | HIGH | Matching engine is fake: weekly-batch compatibility scores are Math.random() (batch-service.ts:855-857); Discover screen renders hardcoded sample profiles; no client code reads weekly_matches; ChaiChat previews hardcoded. The core matchmaking product does not exist yet. | INV-MSM-000 §2.8/2.9 | OPEN

SD-012 | 2026-07-07 | HIGH | Islamic compliance layer absent: no gender-interaction rules anywhere in code; Wali = single preference column with no guardian mechanism; no Hijri/Salah/Ramadan features (respect_prayer_times stored, consumed by nothing); photo modesty blur is a localStorage toggle with zero render effect. Compliance check: flagged as the product's defining gap. | INV-MSM-000 §2.11 | OPEN

SD-013 | 2026-07-07 | HIGH | Messaging defects: undeclared `supabase` identifier in MessagesScreen.tsx + ChatDetailScreen.tsx → ReferenceError, partner names/avatars never load; send-message edge fn (voice-gating enforcement) never called by client AND references nonexistent columns → gating bypassed by direct inserts; messaging tables not in supabase_realtime publication; attachments/reactions/typing are TODO stubs. | INV-MSM-000 §2.10 | OPEN

SD-014 | 2026-07-07 | HIGH | Monetization simulated: no payment provider integration; PremiumScreen fakes purchase with setTimeout; all Gold/Gold+ gating (photos, MMAgent, DNA recalc, memory) rests on the fake tier. | INV-MSM-000 §8 | OPEN

SD-015 | 2026-07-07 | HIGH | npm audit: 33 vulnerabilities (2 critical, 21 high, 10 moderate). Critical: @clerk/shared route-protection bypass (live auth SDK) + jspdf LFI/JS-execution (breaking fix). xlsx has NO fix — consider removal. Most fixable via npm audit fix now that SD-007 is resolved. | INV-MSM-000 §5 | OPEN

SD-016 | 2026-07-07 | MEDIUM | MySoul DNA triple-implementation divergence: displayed client heuristic (legacy columns, post-count proxy) vs real batch engine (new columns, never rendered) vs dead src/services/dna/MySoulDNACalculator.ts; dna_answers + personality_assessments feed no scoring path; idf_score computed in SQL but unused. Needs single-engine consolidation. | INV-MSM-000 §2.7 | OPEN

SD-017 | 2026-07-07 | MEDIUM | Notifications non-functional: FCM/APNs token captured then stored only in localStorage (no table, no backend sender); in-app notifications are a hardcoded mock array; notification_settings persisted but consumed by nothing. | INV-MSM-000 §2.15 | OPEN

SD-018 | 2026-07-07 | MEDIUM | Dead/mock surfaces shipped to prod: ~30 /dev + demo/test routes (one is an 810 kB chunk); AdminAnalytics hardcoded mocks; admin gating via sessionStorage['demo_admin_mode']; PostHog capture() without init(); ApiClient scaffolding to nonexistent api.muslimsoulmateai.com; deployed-but-unreachable edge fns (agent-chat, realtime-chat, send-message); orphaned profile_photos table, CropModal, OTP/ResetPassword mock screens, duplicate city/dna services; no abuse_flags review surface. | INV-MSM-000 §2/§8 | OPEN

SD-019 | 2026-07-07 | MEDIUM | Migration/repo hygiene: empty supabase migration ledger vs ~70 files with ~24 T-variant duplicates; nested supabase/supabase/ duplicate config; supabase/.temp CLI cache tracked; capacitor server.url points at Lovable preview with cleartext:true (native shell would load remote app); onboarding_completed never set true; browserslist data 13 months old; main bundle 829 kB (README target <500 kB gzip missed). (bun.lockb item resolved via FIX-MSM-007.) | INV-MSM-000 §1/§4 | OPEN

## BASELINE CORRECTIONS (facts superseding MSMDevMode.md v1.0 assumptions)
- True freeze date: main last commit 2026-01-27 (not Nov 2025). Active dev Nov 2025 - Jan 2026 by mojjammil (auth, messaging, profile-edit, onboarding).
- Actual stack: single Lovable-built Vite + React + Capacitor repo. npm is the package manager of record (per INV-MSM-000); stale bun.lockb deleted in FIX-MSM-007. NOT React Native multi-repo.
- Supabase project cuawtofgiviiwiyepyav designated MSM-DEV (Adeel ruling 2026-07-07). MSM-Live to be created clean at first promotion; mirror direction Dev->Live.
- DB empty: all 46 tables at 0 rows. No real-user-data ruling needed.
- INV-MSM-000 additions: auth is Clerk (not Supabase Auth); .env confirmed pointing at MSM-DEV only; all 8 legacy branches merged; pgvector live (2 vector columns); pg_cron weekly batch scheduled Sundays 02:00 UTC.

## RESOLVED

SD-005 | 2026-07-07 | MEDIUM | Stale branches: INV-MSM-000 determined ALL 8 non-main branches (4 Lovable edit/edt-*, 4 mojjammil/*) are fully merged into main (rev-list count 0 each). No stranded work. Remote pruning of the 8 branches still pending as a housekeeping action. | B0.3 → INV-MSM-000 §7 | RESOLVED 2026-07-07 (pruning pending)

SD-006 | 2026-07-07 | LOW | AGXL Supabase MCPs confirmed visible in MSM sessions (supabase, supabase-a-dev connections). Prohibition line present in repo CLAUDE.md (commit b545dc6): never point SQL at non-MSM Supabase MCPs. | B0.3 → INV-MSM-000 | RESOLVED 2026-07-07

SD-007 | 2026-07-07 | CRITICAL | package-lock.json:289 resolved @clerk/shared to nonexistent @clerk/_shared registry URL → npm ci E404, repo not reproducible; node_modules gutted by failed install. FIXED by FIX-MSM-007: single resolved-URL correction (integrity hash already matched the registry, no other change), bun.lockb deleted, npm ci + vite build verified green on dev. Introduced by commit d36d4bf (2026-01-16). | INV-MSM-000 §4 → FIX-MSM-007 | RESOLVED 2026-07-08
