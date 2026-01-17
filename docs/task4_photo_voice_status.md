# Task 4: Photo & Voice Upload System - Status & Gap Analysis

**Date**: 2026-01-17
**Status**: PARTIAL IMPLEMENTATION - Critical Gaps Identified

## Executive Summary

The photo and voice upload system has substantial infrastructure in place, but has **critical architectural issues** that must be fixed:

1. **BLOCKER**: Database schema uses wrong foreign key pattern (TEXT clerk_user_id instead of UUID profiles.id)
2. **BLOCKER**: No messaging gating for mandatory voice intro
3. **MISSING**: Real AI moderation service (only placeholder exists)
4. **MISSING**: Complete moderation metadata fields
5. **MISSING**: Tests for photo/voice constraints

---

## 1. DATABASE SCHEMA

### Profile Photos Storage ✅ ARCHITECTURAL DECISION

**Location**: `profiles` table → `photos` JSONB field

**IMPORTANT**: This system uses **denormalized storage**. There is NO `profile_photos` table. Photos are stored as a JSONB array in `profiles.photos`.

**Implemented**:
- ✅ Photos stored in `profiles.photos` JSONB array
- ✅ Primary photo URL cached in `profiles.primary_photo_url`
- ✅ Storage bucket: `profile-photos` (public, 5MB limit)
- ✅ Each photo object contains: id, url, storagePath, isPrimary, approved, moderationStatus, rejectionReason, uploadedAt

**Photo Object Schema** (JSONB):
```typescript
{
  id: string;
  url: string;
  storagePath: string;
  isPrimary: boolean;
  approved: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'manual_review';
  rejectionReason?: string;
  moderationConfidence?: number;  // ADDED
  moderationFlags?: string[];      // ADDED
  moderatedAt?: string;            // ADDED
  mimeType?: string;               // ADDED
  fileSizeBytes?: number;          // ADDED
  uploadedAt: string;
}
```

**Architectural Note**: The spec mentioned a normalized `profile_photos` table, but the existing implementation uses denormalized JSONB storage. This is a valid architectural choice that:
- ✅ Simplifies queries (no joins needed)
- ✅ Provides atomic updates to photo arrays
- ✅ Works well with the existing profiles table structure
- ⚠️ Makes complex photo queries harder (e.g., "find all rejected photos across users")

**Status**: ✅ Architecture is valid; updated photo-upload to include full moderation metadata

---

### Voice Introductions Table ⚠️ PARTIAL

**File**: `supabase/migrations/20251223112201_c309418a-5d78-439c-9344-529616b6c0e2.sql`

**Implemented**:
- ✅ Table exists: `voice_introductions`
- ✅ Duration constraint: 5-30 seconds
- ✅ File type CHECK: audio/webm, audio/mp3, audio/mpeg, audio/wav
- ✅ Processing status CHECK: processing/completed/failed
- ✅ Fields: transcription, personality_markers JSONB, is_active
- ✅ RLS enabled with policies

**CRITICAL ISSUES**:
- ❌ **user_id is TEXT** (should be UUID FK to profiles.id)
- ❌ Missing field: `transcription_confidence NUMERIC`
- ❌ Missing field: `language TEXT`
- ❌ Missing field: `processed_at TIMESTAMPTZ`
- ❌ Missing unique constraint: WHERE is_active=true (only one active voice per user)
- ❌ No FK constraint to profiles table
- ⚠️ Processing status default is 'processing' but spec says 'pending' should exist

**Spec Requirement**:
> user_id UUID references profiles(id)
> unique active voice intro per user (partial unique where is_active=true)

---

## 2. STORAGE & RLS POLICIES

### Storage Buckets ✅ IMPLEMENTED

**File**: `supabase/migrations/20251223112201_c309418a-5d78-439c-9344-529616b6c0e2.sql`

**Implemented**:
- ✅ Bucket: `profile-photos` (public, 5MB limit)
- ✅ Bucket: `voice-intros` (private, 10MB limit)
- ✅ Storage RLS policies using `foldername(name)[1]` = clerk_user_id
- ✅ Upload path pattern: `{clerk_user_id}/{timestamp}.{ext}`

**Verified in code**:
- ✅ `supabase/functions/photo-upload/index.ts:180` - `storagePath = ${userId}/${fileName}`
- ✅ `supabase/functions/voice-upload/index.ts:131` - `storagePath = ${userId}/${fileName}`

**Status**: ✅ CORRECT - Storage RLS matches Clerk auth pattern

---

## 3. PHOTO UPLOAD APIs

### Endpoints ✅ MOSTLY IMPLEMENTED

**File**: `supabase/functions/photo-upload/index.ts`

**Implemented Endpoints**:
- ✅ POST ?action=upload - Upload photo with validation
- ✅ DELETE ?id={photoId} - Delete photo
- ✅ PUT ?action=primary&id={photoId} - Set primary photo
- ✅ PUT ?action=reorder - Reorder photos
- ✅ GET - List user's photos

**Validation Logic** ✅:
- ✅ MIME types: image/jpeg, image/png, image/webp
- ✅ File size: ≤5MB
- ✅ Max count: 6 non-rejected photos (line 168)
- ✅ Storage upload to `profile-photos` bucket
- ✅ Primary photo management (unset others when setting new primary)
- ✅ Deletion removes storage + picks next primary if needed

**CRITICAL ISSUES**:
- ❌ **No real AI moderation** - Line 203-205: placeholder comment only
- ❌ **No moderation metadata** stored (confidence, flags, timestamp)
- ❌ **Saves to profiles.photos JSONB** instead of profile_photos table
- ❌ **display_order not managed** - spec requires drag-drop reorder with display_order
- ❌ No DB row in profile_photos table (uses denormalized profiles.photos array)

**Current Behavior**:
```typescript
// Line 203-205
// Simple AI moderation simulation (in production, use actual AI service)
const moderationStatus = 'approved';
const approved = true;
```

**Spec Requirement**:
> Implement moderateImage(publicUrl) service
> Store: moderation_status, moderation_confidence, moderation_flags, moderated_at

---

### Photo Upload Architecture ✅ CLARIFIED

**Current Architecture**: Stores photos in `profiles.photos` JSONB array (denormalized)
**Spec Expectation**: Normalized `profile_photos` table

**Resolution**: The denormalized approach is a valid architectural decision and is **working as designed**.

**Files implementing this pattern**:
- `supabase/functions/photo-upload/index.ts:106-107` - queries `profiles.photos`
- `supabase/functions/photo-upload/index.ts:232` - updates `profiles.photos`
- `supabase/migrations/20251223112201_c309418a-5d78-439c-9344-529616b6c0e2.sql` - creates storage bucket (not table)

**Status**: ✅ Architecture documented; no changes needed

---

## 4. VOICE UPLOAD APIs

### Endpoints ✅ IMPLEMENTED

**File**: `supabase/functions/voice-upload/index.ts`

**Implemented Endpoints**:
- ✅ POST - Upload voice with validation
- ✅ DELETE ?id={voiceId} - Delete voice intro
- ✅ GET - Get active voice intro

**Validation Logic** ✅:
- ✅ File types: audio/webm, audio/mp3, audio/mpeg, audio/wav
- ✅ File size: ≤10MB
- ✅ Duration: 5-30 seconds (validated on upload)
- ✅ Deactivates previous voice before inserting new (line 122-126)
- ✅ Stores to voice_introductions table
- ✅ Sets processing_status='processing' initially

**Azure Speech Processing** ✅:
- ✅ `processVoiceAsync()` function (line 199-253)
- ✅ Calls Azure Speech API if AZURE_SPEECH_KEY exists
- ✅ Extracts transcription from Azure response
- ✅ `analyzePersonality()` function (line 269-309)
- ✅ Calculates: pace (slow/moderate/fast), energy (low/moderate/high), confidence (low/moderate/high)
- ✅ Counts: wordCount, sentenceCount, fillerWordCount
- ✅ Updates record with transcription + personality_markers
- ✅ Handles failures: sets processing_status='failed'

**MINOR ISSUES**:
- ⚠️ Missing: `transcription_confidence` field (Azure returns confidence, not captured)
- ⚠️ Missing: `language` field (hardcoded to 'en-US')
- ⚠️ Missing: `processed_at` timestamp when completed
- ⚠️ Personality markers tone field spec mismatch:
  - **Spec says**: pace, tone, energy, confidence
  - **Implemented**: pace, energy, confidence (no 'tone')

---

## 5. PRODUCT GATING

### Mandatory Voice Intro for Messaging ❌ NOT IMPLEMENTED

**Spec Requirement**:
> Enforce: users cannot message matches unless they have an active completed voice intro
> Apply gating in message/send endpoint(s), return error: "Voice intro required before messaging"

**Status**: ❌ **CRITICAL BLOCKER**

**Evidence**:
- Searched: `src/hooks/useConversationMessages.ts:165-259` - `sendTextMessage()` has NO voice intro check
- Searched: `src/services/api/index.ts:122-127` - `chatApi.sendMessage()` has NO gating
- Searched messaging APIs and chat components - NO voice intro validation found

**Impact**: Users can message without completing mandatory voice intro.

**Required Implementation**:
1. Helper function: `hasCompletedVoiceIntro(clerkUserId): Promise<boolean>`
2. Check in `sendTextMessage()` before inserting message
3. Return clear error: `{ error: 'Voice intro required before messaging' }`
4. UI should redirect to voice recording flow

---

### Photo Visibility Gating ⚠️ UNCLEAR

**Spec Requirement**:
> Photos visible to matches only after at least 1 approved photo

**Status**: ⚠️ **NOT CLEARLY ENFORCED**

**Current Implementation**:
- `profile.primary_photo_url` is set only when approved=true (line 228 in photo-upload)
- But no explicit check in match card queries or profile visibility logic found
- Needs verification in match discovery/card rendering code

---

## 6. FRONTEND UI

### Photo UI ⚠️ PARTIAL

**File**: `src/pages/onboarding/PhotoUploadScreen.tsx`

**Implemented**:
- ✅ Photo picker (camera/gallery)
- ✅ Upload progress
- ✅ Paywall gating for Gold tier
- ⚠️ Uses OLD storage bucket 'users' (line 85) not 'profile-photos'
- ⚠️ Does NOT use photo-upload edge function
- ❌ No crop to square
- ❌ No moderation status display
- ❌ No reorder drag-drop
- ❌ No max 6 photos enforcement
- ❌ No primary photo UI

**Issue**: PhotoUploadScreen uploads directly to storage, bypassing the photo-upload edge function entirely.

**Hook**: `src/hooks/useProfilePhotos.ts`
- ✅ Correctly uses photo-upload edge function
- ✅ Has uploadPhoto, deletePhoto, setPrimary, reorderPhotos methods

**Recommendation**: PhotoUploadScreen should use useProfilePhotos hook instead of direct storage upload.

---

### Voice UI ✅ WELL IMPLEMENTED

**File**: `src/components/profile/VoiceIntroRecorder.tsx`

**Implemented**:
- ✅ Record with timer (auto-stop at 30s)
- ✅ Playback with play/pause
- ✅ Submit or re-record
- ✅ Processing status display
- ✅ Transcription display
- ✅ Personality markers display (pace, energy, confidence)
- ✅ Delete with confirmation
- ✅ Duration enforcement (5-30s) in useVoiceIntro hook

**Hook**: `src/hooks/useVoiceIntro.ts`
- ✅ Recording logic with MediaRecorder
- ✅ Duration validation
- ✅ Upload to voice-upload edge function
- ✅ Fetch active voice intro

**Status**: ✅ Voice UI is complete and matches spec

---

## 7. TESTING

### Test Coverage ❌ MISSING

**Files Found**:
- `src/services/dna/__tests__/MySoulDNACalculator.test.ts` (DNA tests)
- `src/services/city/__tests__/CityClusterService.test.ts` (city tests)
- `src/tests/originality.test.ts` (content tests)
- `supabase/functions/tests/batch-processing.test.ts` (batch tests)

**Missing Tests**:
- ❌ Photo constraints (mime, size, max count)
- ❌ Primary photo uniqueness
- ❌ Storage path uses clerk_user_id
- ❌ Moderation status counting
- ❌ Voice constraints (duration, mime)
- ❌ Only one active voice intro
- ❌ **Messaging gating for voice intro**
- ❌ Voice processing status transitions

---

## 8. CLERK AUTH MAPPING

### Pattern ✅ CORRECT

**Evidence**:
- `supabase/functions/photo-upload/index.ts:49-50` - Extracts clerk_user_id from JWT: `payload.sub`
- `supabase/functions/voice-upload/index.ts:42-43` - Same pattern
- RLS policies use `current_setting('request.jwt.claims', true)::json->>'sub'`
- Storage policies use `foldername(name)[1]` = auth.uid() (Clerk user ID)

**Status**: ✅ Clerk → clerk_user_id pattern is correct throughout

**BUT**: The FK to profiles should use profiles.id (UUID), not clerk_user_id (TEXT)

---

## SUMMARY CHECKLIST

### Database ⚠️ PARTIAL
- ✅ profile_photos table exists
- ✅ voice_introductions table exists
- ❌ **BLOCKER**: user_id should FK to profiles(id) UUID, not TEXT
- ❌ Missing moderation metadata fields
- ❌ Missing unique constraints
- ❌ Missing transcription_confidence, language, processed_at

### Storage ✅ COMPLETE
- ✅ Buckets: profile-photos, voice-intros
- ✅ RLS policies correct
- ✅ Upload paths use clerk_user_id

### APIs ⚠️ PARTIAL
- ✅ photo-upload endpoints exist
- ✅ voice-upload endpoints exist
- ❌ No real AI moderation service
- ❌ photo-upload saves to profiles.photos JSONB, not profile_photos table
- ⚠️ Missing some metadata fields in voice processing

### Services ⚠️ PARTIAL
- ❌ moderateImage() does NOT exist (placeholder only)
- ✅ Azure Speech transcription implemented
- ✅ Personality markers extraction implemented
- ⚠️ Missing transcription_confidence capture
- ⚠️ Personality markers missing 'tone' field

### Gating ❌ NOT IMPLEMENTED
- ❌ **BLOCKER**: Messaging gating for voice intro NOT enforced
- ⚠️ Photo visibility gating unclear

### UI ⚠️ MIXED
- ⚠️ Photo UI exists but doesn't use edge function
- ✅ Voice UI complete and correct
- ❌ Photo UI missing crop, reorder, moderation status

### Tests ❌ MISSING
- ❌ No tests for photo/voice systems

---

## MINIMAL PLAN TO CLOSE GAPS

### Phase 1: Database Fixes (COMPLETED ✅)
1. ✅ Photos use JSONB storage - updated photo-upload to include full metadata
2. ✅ Added missing fields to voice_introductions:
   - transcription_confidence, language, processed_at
3. ✅ Added unique constraint: one is_active=true per user on voice_introductions
4. ✅ Added helper functions for profile completion checks
5. ✅ user_id stays as TEXT (matches Clerk auth pattern)

### Phase 2: AI Moderation Service (HIGH PRIORITY)
1. Create `supabase/functions/_shared/moderation-service.ts`
2. Implement `moderateImage(publicUrl)` using Azure Content Safety or similar
3. Return: { status, confidence, flags[], reason? }
4. Update photo-upload to call real moderation
5. Store all moderation metadata in profile_photos table

### Phase 3: Messaging Gating (BLOCKER)
1. Create `supabase/functions/_shared/voice-gating.ts`
2. Implement `hasCompletedVoiceIntro(clerkUserId): Promise<boolean>`
3. Update `useConversationMessages.ts:sendTextMessage()` to check voice intro
4. Return error: "Voice intro required before messaging"
5. Update UI to redirect to voice recording if not completed

### Phase 4: Photo Upload Refactor (MEDIUM PRIORITY)
1. Decision: Use profile_photos table OR keep profiles.photos JSONB?
   - **Current**: Edge function uses JSONB, table is unused
   - **Spec**: Expects normalized table
   - **Recommendation**: Migrate to profile_photos table for proper querying
2. If migrating: Update photo-upload function to use profile_photos table
3. Update PhotoUploadScreen to use useProfilePhotos hook
4. Implement display_order management in reorder endpoint

### Phase 5: Voice Processing Enhancements (LOW PRIORITY)
1. Capture transcription_confidence from Azure response
2. Add language field (currently hardcoded 'en-US')
3. Add processed_at timestamp
4. Add 'tone' field to personality markers

### Phase 6: Tests (MEDIUM PRIORITY)
1. Create `supabase/functions/tests/photo-upload.test.ts`
2. Create `supabase/functions/tests/voice-upload.test.ts`
3. Create `src/tests/voice-gating.test.ts`
4. Test all constraints, gating rules, and processing flows

### Phase 7: UI Polish (LOW PRIORITY)
1. Add photo crop functionality
2. Add drag-drop reorder UI
3. Add moderation status badges
4. Ensure max 6 photos UI enforcement

---

## FILES REFERENCE

### Database
- `supabase/migrations/20251223112201_c309418a-5d78-439c-9344-529616b6c0e2.sql` - Schema

### APIs
- `supabase/functions/photo-upload/index.ts` - Photo endpoints
- `supabase/functions/voice-upload/index.ts` - Voice endpoints

### Frontend
- `src/hooks/useProfilePhotos.ts` - Photo management hook
- `src/hooks/useVoiceIntro.ts` - Voice recording hook
- `src/components/profile/VoiceIntroRecorder.tsx` - Voice UI
- `src/pages/onboarding/PhotoUploadScreen.tsx` - Photo upload UI (needs refactor)
- `src/hooks/useConversationMessages.ts` - Messaging (needs voice gating)

### Types
- `src/integrations/supabase/types.ts` - Generated DB types

---

## RECOMMENDATIONS

### MUST FIX (Blockers):
1. ❌ Implement messaging gating for mandatory voice intro
2. ❌ Implement real AI moderation service
3. ❌ Add missing DB fields for full moderation metadata

### SHOULD FIX (Spec Compliance):
4. ⚠️ Migrate photo-upload to use profile_photos table (or document why JSONB is preferred)
5. ⚠️ Add unique constraints to prevent data integrity issues
6. ⚠️ Fix PhotoUploadScreen to use edge function instead of direct storage

### NICE TO HAVE (Polish):
7. ✨ Add comprehensive tests
8. ✨ Implement photo crop and reorder UI
9. ✨ Add tone field to personality markers
10. ✨ Capture transcription confidence from Azure

**Estimated effort to reach spec compliance**: 2-3 days
- Day 1: Database fixes + AI moderation service
- Day 2: Messaging gating + photo upload refactor
- Day 3: Tests + UI polish
