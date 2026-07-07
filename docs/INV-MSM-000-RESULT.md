# INV-MSM-000 — Codebase Ground-Truth Inventory

Date: 2026-07-07. Branch: dev (main frozen at ff88440, 2026-01-27).
Scope: read/verify/report only. No fixes, no dependency changes, no DB writes.
Method: direct introspection (git, npm, Supabase_DEV_MSM MCP) plus five parallel
read-only code-tracing agents. Every classification below is backed by files read
end-to-end, not grep hits.

---

## 1. Repo map

**One repo, Lovable-built Vite + React + Capacitor PWA.** Top level: `src/`
(392 .tsx + 172 .ts files), `supabase/` (48 edge functions + 70 migration
files), `docs/` (57 design/status docs), `public/` (manifest.json, favicon,
robots.txt — PWA basics only).

**Framework/language versions** (package.json): React 18.3.1, TypeScript 5.8.3,
Vite 5.4.19 (`@vitejs/plugin-react-swc`), Tailwind 3.4.17 + shadcn/Radix,
TanStack Query 5, Zustand 5, react-router-dom 6.30.2, Capacitor 7.4.4
(android + ios + push-notifications + share + network plugins),
@clerk/clerk-react 5.56.2, @supabase/supabase-js 2.81.1,
microsoft-cognitiveservices-speech-sdk 1.47.0, posthog-js 1.297.2.

**Package manager: npm.** `package-lock.json` (lockfileVersion 3) was actively
updated through 2026-01-16 by mojjammil; `bun.lockb` is a stale Lovable
artifact last touched 2025-11-11 by the Lovable bot. bun is not installed on
this machine. Verdict: npm is authoritative; `bun.lockb` should be deleted.

**Entry points:** `index.html` → `src/main.tsx` (wraps app in `ClerkProvider`,
throws if `VITE_CLERK_PUBLISHABLE_KEY` missing) → `src/App.tsx`.

**Routing:** react-router-dom v6, ~105 routes in `src/App.tsx`. All app routes
gated by Clerk `<SignedIn>/<SignedOut>` (`App.tsx:773-782`). Route groups:
onboarding (12), auth (3), dna (6), chaichat/messaging (6), admin (4),
settings (9), safety (3), analytics (4), and **~30 `/dev/*` and `*-demo`/
`*-test` routes** shipped in the production bundle.

**Build tooling:** Vite 5 + SWC; `lovable-tagger` componentTagger in dev mode
only (`vite.config.ts:12`). Scripts: dev / build / build:dev / lint / preview.
No test runner configured in package.json despite test files existing
(`src/services/*/tests`, `supabase/functions/tests/`).

**Capacitor:** `capacitor.config.ts` — appId `app.lovable.d234b80414ea42d3addefa33ff893b5e`,
webDir `dist`, and `server.url` still pointing at
`https://d234b804-...lovableproject.com?forceHideBadge=true` with
`cleartext: true` — i.e. a native shell would load the Lovable-hosted remote
app, not the bundled build. **No `android/` or `ios/` native projects are
committed.** Targets are declared via deps only.

**Deploy configuration: none in repo.** No CI/CD workflows, no
netlify/vercel/cloudflare/docker config. README confirms deployment is
Lovable's one-click Publish. `supabase/config.toml` (project
cuawtofgiviiwiyepyav) sets `verify_jwt = false` for 16 functions.
Hygiene notes: an accidental nested `supabase/supabase/` duplicate config,
and `supabase/.temp/` CLI cache files are tracked.

---

## 2. Feature reality

Classifications: IMPLEMENTED / PARTIAL / STUB / ABSENT, with evidence.

| # | Feature area | Verdict |
|---|---|---|
| 1 | Registration & onboarding | PARTIAL |
| 2 | Voice registration | STUB (demo) + disconnected real backend |
| 3 | Auth flow (Clerk) | IMPLEMENTED |
| 4 | Profile building & editing | IMPLEMENTED |
| 5 | Profile photos | IMPLEMENTED (upload) / blur-reveal STUB |
| 6 | MMAgent chat | IMPLEMENTED |
| 7 | MySoul DNA scoring | PARTIAL (three divergent implementations) |
| 8 | Matching / MMEngine | STUB (Math.random scores) |
| 9 | Weekly matches | PARTIAL (pipeline real, no UI, mock scores) |
| 10 | Human-to-human messaging | PARTIAL |
| 11 | Islamic compliance | ABSENT-to-STUB across all sub-areas |
| 12 | City clusters | IMPLEMENTED |
| 13 | Gamification & streaks | IMPLEMENTED |
| 14 | Admin / moderation | PARTIAL |
| 15 | Notifications | STUB/PARTIAL |

### 2.1 Registration and onboarding — PARTIAL
Linear chain welcome → basic-info → religious-preferences → photo-upload →
dna-questionnaire → preferences → complete is real and persists each step
(`src/pages/onboarding/BasicInfoScreen.tsx:120-179` → `profiles`;
`ReligiousPreferencesScreen.tsx:93` → `islamic_preferences`;
`PhotoUploadScreen.tsx:84-119` → Storage bucket `users` + profile update;
`DNAQuestionnaireScreen.tsx` → `dna_questionnaires`/`dna_answers`;
`PreferencesScreen.tsx:44` → `match_preferences`). Gaps: `onboarding_completed`
is **never set true** anywhere in the frontend (only read, `useProfile.ts:210,275`);
`/onboarding/notifications` and `/onboarding/communication-prefs` are routed but
unreachable from the chain; photo upload is paywalled behind Gold with no real
payment system (see 2.11/§8). ProfileCompleteScreen achievements/points are
hardcoded (`onboardingConstants.ts:252-278`).

### 2.2 Voice registration — STUB demo + disconnected real backend
Path A (`/onboarding/voice-demo` → `VoiceRegistration` → `useSpeechToText.ts`)
does real Azure Speech SDK browser transcription (`VITE_AZURE_SPEECH_KEY/REGION`)
but persists **nothing** — transcript held in local state then navigate away
(`VoiceOnboardingDemo.tsx:42-61`). Path B is a complete real backend
(`useVoiceIntro.ts` → `voice-upload` edge fn → bucket `voice-intros` +
`voice_introductions` + server-side Azure STT + heuristic personality analysis)
that **no live screen calls** — its only consumer is commented out in
`EditProfileScreen.tsx:101-103`. Bonus defect in the dead path: the fn INSERTs
`user_id` but GET/DELETE query `clerk_user_id` which doesn't exist
(`voice-upload/index.ts:160` vs `:331,371`).

### 2.3 Auth flow — IMPLEMENTED (Clerk)
Clerk is the live auth end-to-end: `main.tsx:15` ClerkProvider; hosted
`<SignIn>/<SignUp>` at `/auth/sign-in`, `/auth/sign-up`; route protection via
`<SignedIn>/<RedirectToSignIn>` (`App.tsx:773-782`); profile provisioning by
`clerk-webhook` edge fn on user.created (svix-verified,
`clerk-webhook/index.ts:170-214`). Supabase is data-layer only — the real
client is `src/lib/supabase.ts` (`createSupabaseClient(clerkToken)` injecting
the Clerk JWT as Bearer); the auto-generated
`src/integrations/supabase/client.ts` auth config is vestigial. Dead mock auth
code: `OTPScreen.tsx` (hardcoded `123456`, unrouted) and
`ResetPasswordScreen.tsx` (setTimeout mocks, routed but orphaned — real reset
happens inside the Clerk widget).

### 2.4 Profile building and editing — IMPLEMENTED
`useProfile.ts` real CRUD on `profiles` keyed by `clerk_user_id` (fetch :34-38,
update :85-93, create :130-137). Completion % computed client-side with
weighted dimensions (`profileCompletion.ts:117-191`) and written to
`profiles.profile_completion_percent`; caveat: voice/text/video/photo count
inputs default to 0 with no live writer, so those sub-scores stay 0.
EditProfileScreen save is real. Satellite hooks all real:
`useIslamicPreferences`, `useMatchPreferences`, `useDNAAnswers`,
`useCulturalProfile`, `usePersonalityAssessment`.

### 2.5 Profile photos — upload IMPLEMENTED; crop dead; blur/reveal STUB
Upload path is real: `PhotoGallery` → `useProfilePhotos.ts:79` →
`photo-upload` edge fn → Storage bucket `profile-photos` (**public**) with
metadata denormalized into `profiles.photos` JSONB (`photo-upload/index.ts:110-139,189-207`).
Azure Content Safety image moderation wired with graceful fallback
(`_shared/moderation-service.ts:11-47`). `react-easy-crop`'s `CropModal.tsx` is
complete but imported nowhere (dead). **Modesty blur/progressive-reveal does
not exist**: the only artifact is a `blurUntilMatched` toggle stored in
localStorage (`usePrivacy.ts:46-51`) that nothing reads; `PhotoGallery.tsx:112`
and Discover render plain `<img>`; originals sit in a public bucket with
public-read policy ("Anyone can view profile photos",
migration 20251223112201:88-102). The `profile_photos` table exists with full
RLS but is **orphaned** — nothing reads or writes it.

### 2.6 MMAgent chat — IMPLEMENTED
Live path: `AgentChatScreen.tsx` → `src/services/api/mmagent.ts` → edge fns
`mmagent-sessions` / `mmagent-messages` / `mmagent-tokens` / `mmagent-memory`,
core pipeline in `_shared/mmagent-handler.ts:63-201` (topic validation → abuse
checks → persist user msg → model routing → token deduct → memories → AI call
→ persist reply). Providers: Anthropic `claude-3-5-sonnet-20241022` primary,
OpenAI `gpt-4o-mini` fallback/cheap tier, `text-embedding-ada-002` for memory
(pgvector `match_memories` RPC against `mmagent_conversation_memory`).
Personalities/prompts DB-driven from `mmagent_prompts` + `cultural_variants` +
city overlays with 5-min cache (`mmagent-prompt-service.ts:138-296`). Token
usage real (`mmagent_token_usage`, gold 10k / gold_plus 25k daily,
`token-governance-service.ts`). Gaps: **no streaming** (plain fetch/JSON, zero
SSE hits in functions); memory only written when zero memories were retrieved
(`mmagent-handler.ts:187` — stops accumulating after first recall); SupportMode
distress UI exists only on a test route, absent from real chat; `agent-chat`
edge fn + `useTextChat.ts` is a dead parallel path (model `claude-sonnet-4-5`);
several mobile gesture handlers are toast placeholders.

### 2.7 MySoul DNA scoring — PARTIAL, three divergent implementations
(a) **Displayed path** = client heuristic `useDNAScore.ts:203-388`: real reads
of `profiles`/`posts` but uses post-count as a proxy for approved insights
(admitted in comment :256-258), no IDF/behavioral inputs, writes legacy columns
(`trait_uniqueness_score` etc.). (b) **Batch path** = real spec implementation
(`_shared/dna-calculator.ts`, `batch-service.ts:281-468`): frequency-band trait
rarity from `trait_distribution_stats` (true `idf_score` computed in SQL but
explicitly unused — `dna-calculator.ts:171`), profile depth from
`user_profile_fields`, behavioral z-scores from `behavioral_tracking`, content
originality via embeddings — but runs only via weekly cron or Gold+ queue, and
writes **new** columns (`trait_rarity_raw_score` etc.) that the UI doesn't
render. (c) `src/services/dna/MySoulDNACalculator.ts` + `BehavioralAnalyzer.ts`
= complete third implementation imported by nothing (dead).
`dna_answers` and `personality_assessments` are stored but feed **no** scoring
path. Trait auto-registration triggers on `profiles` are real
(migration 20260118000002).

### 2.8 Matching / MMEngine — STUB
No real matching exists. Discover renders hardcoded `sampleMatches`
(`DiscoverScreen.tsx:46-92`); `MatchesContext.tsx:34-86` generates mocks into
localStorage; `searchStore.ts` has no fetch. The only server-side scoring
invents results: `batch-service.ts:855-857` —
`vectorSimilarity = 0.8 + Math.random()*0.2`,
`preferencesMatch = 0.7 + Math.random()*0.3`. A real `cosineSimilarity`
exists (`:598-620`) but is used only for content originality, never matching.

### 2.9 Weekly matches — PARTIAL
Generation pipeline is real and scheduled: pg_cron job Sunday 02:00 UTC →
`weekly-batch` edge fn → 5 phases → writes `weekly_matches` top-5 per user +
`batch_run_history`/`batch_processing_queue` lifecycle with retry
(migration 20260116000005; `weekly-batch/index.ts:41-218`). But compatibility
scores are the Math.random() above, ChaiChat previews are hardcoded strings
(`batch-service.ts:909-913`), and **no client code reads `weekly_matches`** —
"New matches arrive every Sunday" in Discover is cosmetic copy. Admin batch
fns (`batch-trigger`/`-status`/`-history`/`-queue`/`-retry`) are never invoked
from src/.

### 2.10 Human-to-human messaging — PARTIAL
Core text flow real end-to-end: `useConversations.ts:49-55` (list),
`useConversationMessages.ts` (RPC `get_or_create_conversation` :73-76, load
:111-117, optimistic insert :210-224, mark-read :269-274), DB trigger
denormalizes last-message onto `conversations`. Defects: **both messaging
screens reference an undeclared `supabase` identifier**
(`MessagesScreen.tsx:32,35`; `ChatDetailScreen.tsx:69,73,220,255` import only
`createSupabaseClient`) → ReferenceError → partner names/avatars never load;
attachments/reactions/typing are TODO stubs (toasts, local state;
`message_reactions` and `typing_indicators` tables untouched by any code);
realtime `postgres_changes` subscriptions exist but no migration adds the
tables to the `supabase_realtime` publication; the `send-message` edge fn
(which enforces voice-gating) is never called by the client **and** targets
columns that don't exist (`participant1_clerk_id`, `last_message_at`) — so
voice-gating is bypassed by the direct-insert path. `realtime-chat` edge fn
(OpenAI `gpt-4o-realtime-preview-2024-10-01` + `whisper-1`) also unreferenced.

### 2.11 Islamic compliance — the product's differentiator is ABSENT
- **Gender interaction rules: ABSENT.** Gender is stored/display data only;
  no code path restricts messaging or visibility by gender
  (`get_or_create_conversation` accepts any two ids, no checks anywhere).
- **Wali system: STUB.** One preference column (`islamic_preferences.wali_involvement`)
  plus static education text (`topicRequirements.ts:204-222`). No guardian
  accounts, no conversation supervision, no enforcement.
- **Hijri/Salah/Ramadan: ABSENT.** All hits are static strings (keyword lists,
  a `respect_prayer_times` boolean on `notification_settings` that nothing
  consumes, a prayer-frequency dropdown). No prayer-time computation or API,
  no Hijri calendar, no Qibla/Adhan code.
- **Photo modesty blur: STUB** (see 2.5). Halal-interaction posture overall:
  not implemented.

### 2.12 City clusters — IMPLEMENTED
End-to-end real: `CityClusterSelector.tsx` (in Settings) → `city-list` /
`city-current` / `city-select` / `city-auto-detect` edge fns; geolocation
bounding-box auto-detect for 5 clusters writing `user_city_assignments`
(`city-auto-detect/index.ts:19-139`); city prompt overlays genuinely injected
into live MMAgent system prompts (`mmagent-prompt-service.ts:242-263` →
`city_prompts`); admin CRUD screens wired to `admin-cities` / `admin-city-prompts`
/ `admin-local-references` / `admin-city-analytics`. Dead: frontend duplicate
`src/services/city/CityClusterService.ts` (used only by its own test).

### 2.13 Gamification and streaks — IMPLEMENTED
Streaks: `StreakManager` mounted globally (`App.tsx:802`) → `streaks-activity`
/ `streaks-status` edge fns writing `streak_rewards` + `streak_history` with
consecutive-day increment, one-time 72h grace, ≥4-day reset, milestones
7/14/30/60 (badges, tier-aware bonus credits, 10%/20% discounts)
(`streaks-activity/index.ts:136-233`). Insights: `insights-pending/approve/
reject/approved` real against `user_insights`; points/badges awarded by DB
trigger `update_gamification_on_review` (migration 20251225000003) writing
`gamification_progress` and `mysoul_dna_scores.approved_insights_count` —
the "+10 points" toast is backed by reality.

### 2.14 Admin / moderation — PARTIAL
Real: governance dashboard (`AdminGovernanceScreen.tsx` → `admin-governance-rules`
/ `-alerts` / `-cost`, aggregating `mmagent_token_usage`), prompt management
(`AdminPersonalityScreen.tsx` → `admin-mmagent-prompts` CRUD/versions/test
against `mmagent_prompts` + `prompt_test_history`), city admin (2.12).
Backend admin auth real via `ADMIN_USER_IDS` env (`_shared/admin-auth.ts:25-44`)
— **except `admin-governance-cost` which has no admin check at all**
(`index.ts:14-17`, service-role). Frontend admin gating is a demo stub:
`useAdminCheck.ts:50-74` trusts `sessionStorage['demo_admin_mode']`.
`AdminAnalyticsScreen.tsx:28` renders hardcoded `mockPlatformMetrics`.
**No moderation queue exists**: `abuse_flags` is written by the backend but no
surface reads it; user reports (`ReportUserScreen`) go nowhere reviewable.
Governance `governance_rules`/`cost_alerts` are admin-editable but **not
consulted at runtime** by `checkAndDeductTokens` (grep: 0 hits).

### 2.15 Notifications — STUB/PARTIAL
Push: `usePushNotifications.ts` genuinely registers via Capacitor and captures
the FCM/APNs token — then writes it **only to localStorage** (:42); no
`push_tokens` table, no sender backend, so server push is impossible.
In-app: `useNotifications.ts:20-90` is a hardcoded mock array in localStorage;
`NotificationService.ts` is local Web-Notification demo code. Settings:
IMPLEMENTED — `useNotificationSettings.ts` real upsert to
`notification_settings` (channels/categories/quiet hours/respect_prayer_times),
but nothing consumes those preferences because nothing sends notifications.

---

## 3. Supabase surface (Supabase_DEV_MSM, project cuawtofgiviiwiyepyav)

**Edge functions: 48 deployed, all ACTIVE.** Literal slugs (version,
verify_jwt): clerk-webhook (v23, false), photo-upload (v12, false),
voice-upload (v15, false), gamification-badges (v11, true),
gamification-progress (v11, false), insights-approve (v14, true),
insights-approved (v11, false), insights-pending (v11, false),
insights-reject (v11, true), streaks-activity (v13, false),
streaks-status (v13, false), mmagent-memory (v11, false),
mmagent-messages (v23, false), mmagent-sessions (v10, false),
mmagent-tokens (v10, false), agent-chat (v10, false),
admin-governance-alerts (v11, true), admin-governance-cost (v10, true),
admin-governance-rules (v10, true), governance-cost (v10, true),
governance-tokens (v10, true), admin-mmagent-cache-invalidate (v10, true),
admin-mmagent-cultural-variants (v10, true), admin-mmagent-prompts (v10, true),
weekly-batch (v11, false), batch-history (v10, true), batch-queue (v10, true),
batch-retry (v10, true), batch-status (v10, true), batch-trigger (v10, true),
admin-cities (v11, true), admin-city-analytics (v10, true),
admin-city-prompts (v10, true), admin-local-references (v10, true),
city-auto-detect (v10, true), city-current (v10, true), city-list (v10, true),
city-select (v10, true), dna-originality (v9, true), realtime-chat (v9, false),
dna-achievements (v9, true), dna-breakdown (v9, true), dna-calculate (v11, true),
dna-history (v9, true), dna-leaderboard (v9, true), dna-rare-traits (v9, true),
dna-score (v9, true), send-message (v10, false).
**16 functions run with verify_jwt=false**, including send-message,
photo-upload, voice-upload, weekly-batch and the whole mmagent set.

**Storage buckets** (literal): media (public, 2025-12-10),
profile-photos (public, 2025-12-24), users (public, 2025-11-26),
voice-intros (public, 2025-12-24). Note: the migration intended voice-intros
to be private; **live bucket is public**. All four buckets public = every
uploaded photo and voice note is world-readable by URL.

**Database functions (public schema, excluding pgvector's C functions):**
aggregate_behavioral_tracking, auto_record_score_history,
calculate_behavioral_z_scores, calculate_dna_percentile_rank,
calculate_profile_depth_score, capture_match_event, capture_message_event,
capture_profile_view_event, capture_swipe_event, cleanup_score_history,
compute_profile_dimension_completion, extract_and_register_traits,
get_or_create_conversation, get_or_create_token_record (SECURITY DEFINER),
get_profile_completion_status (SECURITY DEFINER), handle_new_user (SECURITY
DEFINER), has_completed_voice_intro (SECURITY DEFINER), match_memories,
posts_search_vector_trigger, process_weekly_behavioral_aggregation,
profiles_search_vector_trigger, record_score_history,
refresh_trait_distribution_stats, trg_profiles_update_user_profile_fields,
trigger_register_profile_traits, trigger_set_subscriptions_timestamp,
trigger_set_timestamp, trigger_set_updated_at,
update_conversation_last_message, update_dna_percentile_rank,
update_gamification_on_review, update_match_preferences_updated_at,
update_notification_settings_updated_at, update_posts_updated_at,
upsert_user_profile_field. (Full literal output retained in session log.)

**Triggers (public schema, literal):** 32 triggers — set_timestamp/updated_at
housekeeping on 18 tables plus functional ones: messages
(trg_capture_message_event AFTER INSERT, trg_update_conversation_last_message
AFTER INSERT), profile_views (trg_capture_profile_view AFTER INSERT), profiles
(search-vector, profile-depth-dimensions, trait registration ×2),
mysoul_dna_scores (auto_record_score_history, update_dna_percentile_rank),
posts (search vector), user_insights (gamification trigger).

**pgvector: ENABLED**, version 0.8.0 in schema public. Vector columns
(literal): `public.mmagent_conversation_memory.embedding`,
`public.posts.embedding`. Also installed: pg_cron 1.6.4 (weekly batch),
pg_net 0.19.5, pgcrypto, uuid-ossp, pg_stat_statements, supabase_vault.

**Migration ledger: EMPTY** (`list_migrations` → `[]`) despite ~70 migration
files in `supabase/migrations/` — schema was applied ad hoc, never through the
CLI ledger; ~24 migrations exist in duplicate (plain and `T`-timestamp
variants of the same file). The live DB is the only source of truth for
schema (consistent with SD-003).

---

## 4. Build health

**Clean install: FAILS. The frozen repo is not reproducible from its
lockfile.** `npm ci` (npm 11.8.0, Node v25.5.0) aborts:

```
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/@clerk/_shared/-/shared-3.35.2.tgz
npm error 404 The requested resource '@clerk/shared@https://registry.npmjs.org/@clerk/_shared/-/shared-3.35.2.tgz'
could not be found or you do not have permission to access it.
```

Root cause verified: `package-lock.json:289` contains a corrupted `resolved`
URL — `@clerk/_shared` instead of `@clerk/shared`. The correct tarball exists
(`npm view @clerk/shared@3.35.2 dist.tarball` →
`https://registry.npmjs.org/@clerk/shared/-/shared-3.35.2.tgz`). One-line
lockfile defect; not fixed per INV rules.

Because `npm ci` deletes `node_modules` before failing, **the repo's
node_modules is now gutted** (EPERM warnings from OneDrive file locks during
removal also appeared). A FIX prompt must repair the lockfile line and
reinstall.

**Production build (diagnostic):** to obtain a build verdict without touching
the repo, the tree was copied to a temp dir, the single lockfile URL patched
in the copy only, and `npm ci` + `npm run build` run there. (First attempt in
the session scratchpad failed for an unrelated environment reason: the
scratchpad prefix pushes `node_modules\lovable-tagger\node_modules\@esbuild\
win32-x64\esbuild.exe` past the Windows 260-char MAX_PATH → spawn ENOENT. The
repo's own path is ~94 chars and unaffected. Machine note: Norton AV injects
`NODE_EXTRA_CA_CERTS`.) Result from the short-path diagnostic build:

**With the one-line lockfile patch, clean install and production build both
SUCCEED** (literal tail):

```
CI EXIT: 0
=====BUILD=====
> vite_react_shadcn_ts@0.0.0 build
> vite build
vite v5.4.19 building for production...
Browserslist: browsers data (caniuse-lite) is 13 months old. Please run:
  npx update-browserslist-db@latest
✓ 5320 modules transformed.
...
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
✓ built in 39.75s
BUILD EXIT: 0
```

**Build warnings of note:** browserslist data 13 months old; three chunks
exceed 500 kB minified — `index-CLTtONuD.js` 829.85 kB (gzip 250.53 kB),
`ProfileCompletionTest-*.js` 810.82 kB (a /dev test screen shipping a huge
chunk to prod), `AdminAnalyticsScreen-*.js` 713.57 kB (gzip 233 kB — xlsx +
chart libs), plus `VoiceRegistration-*.js` 451.86 kB (Azure Speech SDK) and
`html2canvas` 201 kB. The README's "<500KB gzipped" target is missed by the
main chunk alone. TypeScript/Vite emitted no type or compile errors.

**Verdict: the code itself builds cleanly; the only blocker is the corrupted
lockfile entry (SD-007).**

**npm warnings during install (literal, recurring):** `npm warn cleanup Failed
to remove some directories ... EPERM: operation not permitted, rmdir ...
node_modules\posthog-js / @capacitor\push-notifications` (OneDrive locks).

---

## 5. Dependency audit (npm audit, literal summary)

`npm audit` against the frozen lockfile: **33 vulnerabilities
(10 moderate, 21 high, 2 critical).**

**Critical:**
- `@clerk/shared` 0.18.0–3.47.5 — "Middleware-based route protection bypass"
  (GHSA-vqx2-fgx2-5wq9) + authorization bypass (GHSA-w24r-5266-9c3c); depends
  on vulnerable js-cookie. Fix available via `npm audit fix`.
- `jspdf` ≤4.2.0 — Local File Inclusion/Path Traversal (GHSA-f8cm-6447-x5h2)
  plus 9 further advisories incl. arbitrary JS execution via AcroForm. Fix is
  a breaking upgrade (`npm audit fix --force` → jspdf@4.2.1).

**High (21):** @clerk/clerk-react (authorization bypass GHSA-w24r-5266-9c3c),
axios 1.13.2 (24 advisories: SSRF, prototype-pollution credential theft, MITM
via config.proxy, ReDoS...), @remix-run/router → react-router / react-router-dom
(XSS via open redirects GHSA-2w69-qvjg-hvjx), @xmldom/xmldom (XML injection
×5), flatted, form-data (CRLF injection), glob CLI (command injection),
js-cookie (prototype hijack), lodash (code injection via _.template),
minimatch (ReDoS ×3 paths), picomatch, preact (VNode injection), rollup
(arbitrary file write via path traversal), tar (7 advisories) → @capacitor/cli
depends on it, ws (memory disclosure/DoS), **xlsx — "No fix available"**
(prototype pollution GHSA-4r6h-8v6p-xvw6 + ReDoS GHSA-5pgg-2g8v-p4x9),
@isaacs/brace-expansion.

**Moderate (10):** ajv, brace-expansion, dompurify (16 advisories),
esbuild ≤0.24.2 (dev-server request exposure) → vite ≤6.4.2 depends on it,
follow-redirects, js-yaml, postcss, uuid (via
microsoft-cognitiveservices-speech-sdk, fix is breaking), yaml.

Full literal output preserved in the session log; rerun `npm audit` after any
lockfile repair to confirm the same counts.

---

## 6. Credential scan (names/locations only — values withheld)

**Tracked `.env` at repo root (SD-001 confirmed; 8 variables):**
`VITE_AZURE_SPEECH_KEY`, `VITE_AZURE_SPEECH_REGION`,
`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`,
`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`.
- **`VITE_SUPABASE_SERVICE_ROLE_KEY` is a service-role secret in a `VITE_`-
  prefixed variable** — it is both committed to git AND would be baked into
  any client bundle that references it. This escalates SD-001.
- `.gitignore` does not exclude `.env` (only `*.local`).
- The `.env` Supabase values point at **cuawtofgiviiwiyepyav = Supabase_DEV_MSM
  (match confirmed** via `get_project_url` and a ref-pattern scan: the only
  project ref appearing anywhere in the repo is cuawtofgiviiwiyepyav, in `.env`
  line 8). JWT-shaped strings (`eyJ...`) exist **only** in `.env` — none
  hardcoded in src/ or supabase/functions/.
- No `pk_live_`/`sk_live_`/`sk-ant`/`AIza`-style keys anywhere outside `.env`.

**Hardcoded URLs (non-secret, for the record):**
`src/services/ApiClient.ts:8` → `https://api.muslimsoulmateai.com/v1`
(aspirational REST backend, dead scaffolding);
`capacitor.config.ts:8` → Lovable preview URL (with `cleartext: true`);
`src/services/originality/embeddings.ts:32` → `https://api.openai.com`
(**uses `VITE_OPENAI_API_KEY` in the browser** — any key set there ships to
clients; currently absent from .env so the code path is inert);
`supabase/config.toml:1` → project_id; docs/settings screens reference
posthog.com, muslimsoulmateai.com, unsplash.com (images).

**Server-side secret names referenced in edge functions (env-based, correct
pattern, values in Supabase secrets, not repo):** `ANTHROPIC_API_KEY`,
`OPENAI_API_KEY`, `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION`,
`AZURE_CONTENT_SAFETY_ENDPOINT`/`KEY`, `CLERK_WEBHOOK_SECRET`,
`ADMIN_USER_IDS`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## 7. Git archaeology

**Last 30 commits on main (literal):**
```
ff88440 2026-01-27 mojjammil fixed basic info completion bar
2054ad8 2026-01-26 mojjammil fixed duplicated line issue
149523c 2026-01-26 mojjammil fixed issues on mmagent-chat
71b64b3 2026-01-26 mojjammil implemented agent chat
db626f0 2026-01-21 mojjammil Merge branch 'main' of github.com:MSoulM/mindful-muslim-match
4090873 2026-01-20 mojjammil fixed profile completion issue
8846aba 2026-01-17 mojjammil fixed issues in asset uploading feature
d370a3a 2026-01-17 mojjammil fixed issues in mysoul dna system
50c1ce3 2026-01-17 mojjammil implemented jwt token based supabase client on edge functions
c4c6fe6 2026-01-16 mojjammil implemented city cluster management
016fff5 2026-01-16 mojjammil implemented dna batch system
602dd0a 2026-01-16 mojjammil implemented mmagent personality admin
8958d69 2026-01-16 mojjammil implemented chat token governance
d36d4bf 2026-01-16 mojjammil implemented mmagent chat feature
9530476 2026-01-14 mojjammil updated to use real data in myagent page for insight
8075416 2026-01-14 mojjammil implemented dna insights with gamification progress
c5effee 2025-12-25 mojjammil updated sould dna score logic
bde7a23 2025-12-23 gpt-engineer-app[bot] Fix photo upload picker bug
1e6cac1 2025-12-23 gpt-engineer-app[bot] Changes
a75ad0f 2025-12-23 gpt-engineer-app[bot] Fix supabase clients
c505c4f 2025-12-23 gpt-engineer-app[bot] Changes
b981f74 2025-12-23 gpt-engineer-app[bot] Use Mysoul DNA table
bd59acd 2025-12-23 gpt-engineer-app[bot] Changes
f8ac373 2025-12-23 gpt-engineer-app[bot] Use photos field for photos
deee7cf 2025-12-23 gpt-engineer-app[bot] Changes
5b12a72 2025-12-23 gpt-engineer-app[bot] Connect PhotoGallery to profile page
cf02d81 2025-12-23 gpt-engineer-app[bot] Changes
db7ec90 2025-12-23 gpt-engineer-app[bot] Implement DNA score flow fixes
7c51483 2025-12-23 gpt-engineer-app[bot] Changes
aa1578a 2025-12-23 gpt-engineer-app[bot] Implement MySoul DNA score flow
```

**Branch status: all 8 pre-existing non-main branches are FULLY MERGED into
main** (literal: `git branch -r --merged origin/main` lists every branch;
`git rev-list --count origin/main..origin/<branch>` = 0 for all 8):
mojjammil/auth (head 2025-11-24), mojjammil/message (2025-12-04),
mojjammil/onboarding-process (2025-12-08), mojjammil/profile-edit (2025-11-26),
and the four Lovable `edit/edt-*` branches (2025-11-13 to 2025-11-20).
**No work exists only on a branch.** All 8 are safe to prune (updates SD-005).
The only branch ahead of main is `dev` (CLAUDE.md + this report), by design.

---

## 8. External services

| Service | Purpose | Evidence | Status |
|---|---|---|---|
| Anthropic Claude | MMAgent chat primary (`claude-3-5-sonnet-20241022`) | `_shared/mmagent-handler.ts:259-286` | Wired |
| Anthropic Claude | Dead `agent-chat` fn (`claude-sonnet-4-5`) | `agent-chat/index.ts:28-36` | Dead code |
| OpenAI | `gpt-4o-mini` chat fallback + weekly insight generation + prompt testing | `mmagent-handler.ts:310-317`, `batch-service.ts:169-176`, `admin-mmagent-prompts/index.ts:212-229` | Wired |
| OpenAI | Embeddings: `text-embedding-ada-002` (memory), `text-embedding-3-small` (originality/posts) | `mmagent-service.ts:268,321`, `batch-service.ts:577-584` | Wired |
| OpenAI Realtime | `gpt-4o-realtime-preview-2024-10-01` + `whisper-1` voice chat | `realtime-chat/index.ts:39,75`, `useRealtimeChat.ts` | Deployed, unreferenced by UI |
| OpenAI (browser) | Client-side embeddings using `VITE_OPENAI_API_KEY` | `src/services/originality/embeddings.ts:3,32` | Inert (key unset) but dangerous pattern |
| Azure Speech (STT) | Voice transcription, client SDK + server REST | `useSpeechToText.ts:2-28`, `voice-upload/index.ts:14-15,208-218` | Wired (client demo path; server path dead) |
| Azure Content Safety | Photo moderation | `_shared/moderation-service.ts:8-46` | Wired w/ fallback |
| Clerk | Auth, sessions, webhooks (svix) | `main.tsx:15`, `App.tsx:773-782`, `clerk-webhook/index.ts` | Wired (core) |
| Supabase | DB / edge functions / storage / realtime | throughout | Wired (the backend) |
| PostHog | Behavioral analytics | `behavioralTracking.ts:1,83,88` — capture() called but **no posthog.init() anywhere** | Dead (events go nowhere) |
| Capacitor Push (FCM/APNs) | Native push registration | `usePushNotifications.ts:30-67` | Partial — token never leaves localStorage |
| Capacitor Share / Network | Native share sheet, connectivity | ShareReceiverScreen, useNetworkStatus | Wired |
| Payments (any) | Subscriptions/premium | `PremiumScreen.tsx:90-111` — setTimeout-simulated purchase | **ABSENT** — all Gold/Gold+ gating rests on a fake paywall |
| Prayer-time / Hijri API | — | none | ABSENT |
| Lovable | Build origin, `lovable-tagger`, preview URL in capacitor config | `vite.config.ts:12`, `capacitor.config.ts:8` | Build-time |
| api.muslimsoulmateai.com | Aspirational REST layer (`ApiClient.ts` + 6 api modules) | `src/services/ApiClient.ts:8` | Dead scaffolding |

`index.html` contains no third-party script tags.

---

## 9. New sprint-debt items raised by INV-MSM-000

- **SD-007 | CRITICAL | Lockfile corruption blocks all clean installs** —
  `package-lock.json:289` resolves @clerk/shared to nonexistent
  `@clerk/_shared` URL; `npm ci` fails; repo node_modules currently gutted by
  the failed install. Fix: correct the URL (or regenerate lockfile), reinstall,
  verify build.
- **SD-008 | CRITICAL | Service-role key in client env namespace** —
  `VITE_SUPABASE_SERVICE_ROLE_KEY` in tracked .env; plus
  `src/services/originality/embeddings.ts` designed to use
  `VITE_OPENAI_API_KEY` in the browser. Rotate, remove, never expose via VITE_.
- **SD-009 | CRITICAL | Edge-function auth is decorative in places** — JWT
  payloads decoded without signature verification across photo-upload/mmagent
  fns (photo-upload uses service-role + unverified `sub` → user impersonation);
  16 deployed functions with verify_jwt=false; `admin-governance-cost` has no
  admin check at all.
- **SD-010 | CRITICAL | All four storage buckets are public** (media,
  profile-photos, users, voice-intros) — photos and voice notes world-readable;
  contradicts the migration that declared voice-intros private; no modesty/
  photo-visibility enforcement exists (Islamic-compliance relevant).
- **SD-011 | HIGH | Matching engine is fake** — Math.random() compatibility
  scores in weekly batch; Discover renders hardcoded profiles; no UI reads
  weekly_matches; ChaiChat previews hardcoded.
- **SD-012 | HIGH | Islamic compliance layer absent** — no gender-interaction
  rules, Wali is a stored preference with no mechanism, no prayer-time/Hijri
  features, photo blur toggle is a localStorage no-op. Core product promise
  unimplemented (compliance check: this item exists precisely to flag it).
- **SD-013 | HIGH | Messaging defects** — undeclared `supabase` ReferenceError
  breaks partner names/avatars in MessagesScreen + ChatDetailScreen; voice-
  gating edge fn unused and schema-mismatched; realtime publication not
  configured; attachments/reactions/typing are stubs.
- **SD-014 | HIGH | Monetization is simulated** — no payment provider; Gold/
  Gold+ tiers gate photos/chat/DNA on a setTimeout fake purchase.
- **SD-015 | HIGH | Dependency vulnerabilities** — 33 total: 2 critical
  (@clerk/shared route-protection bypass — the live auth SDK; jspdf), 21 high
  (axios ×24 advisories, xlsx has NO fix — consider removal), fix mostly via
  `npm audit fix` after SD-007.
- **SD-016 | MEDIUM | DNA scoring triple-implementation divergence** — client
  heuristic (displayed) vs batch engine (unused columns) vs dead
  MySoulDNACalculator; dna_answers/personality_assessments feed nothing;
  legacy-vs-new column schism bridged by || fallbacks.
- **SD-017 | MEDIUM | Notifications non-functional** — push token never
  persisted; no sending backend; in-app notifications are mocks; stored
  preferences (incl. respect_prayer_times) consumed by nothing.
- **SD-018 | MEDIUM | Dead/mock surfaces shipped** — ~30 /dev+demo routes in
  prod bundle; AdminAnalytics mock; sessionStorage admin mode; PostHog capture
  without init; ApiClient scaffolding to nonexistent api.muslimsoulmateai.com;
  agent-chat + realtime-chat + send-message fns deployed but unreachable;
  OTP/ResetPassword mock screens; CropModal, profile_photos table,
  city/dna service duplicates orphaned.
- **SD-019 | MEDIUM | Migration/repo hygiene** — supabase migration ledger
  empty while repo holds ~70 files with ~24 duplicated T-variants; nested
  supabase/supabase/ duplicate config; supabase/.temp tracked; stale bun.lockb;
  capacitor server.url points at Lovable preview with cleartext:true;
  onboarding_completed never set true.

Tracker updates applied: SD-005 → all 8 branches confirmed merged (prune
safely); SD-006 → RESOLVED (AGXL MCPs confirmed visible; CLAUDE.md prohibition
line committed b545dc6). SD-003 corroborated (empty migration ledger).

---

## Bottom line

The repo is a Lovable-origin prototype with three genuinely solid subsystems
(Clerk auth, MMAgent chat with governance, gamification/streaks + city
clusters) sitting on top of a hollow core: **no real matching, no Islamic
compliance layer, no payments, no notifications delivery, and a security
posture (public buckets, unverified JWTs, RLS off on 22 tables, committed
service-role key) that must be rebuilt before any real user touches it.**
The build is currently not reproducible from the lockfile (SD-007), and main's
last state (2026-01-27) is fully captured — no work is stranded on branches.
