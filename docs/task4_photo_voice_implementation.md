# Task 4: Photo & Voice Upload System - Implementation Guide

**Date**: 2026-01-17  
**Status**: IMPLEMENTED ✅

## Architecture Overview

This system implements photo and voice upload capabilities with:
- ✅ AI-powered content moderation
- ✅ Mandatory voice intro gating for messaging
- ✅ Azure Speech transcription & personality analysis
- ✅ Supabase Storage with RLS policies
- ✅ Clerk authentication integration

---

## 1. STORAGE ARCHITECTURE

### Photo Storage (Denormalized)

**Design Decision**: Photos are stored as JSONB arrays in `profiles.photos`, not as a separate normalized table.

**Location**: `profiles` table
- Field: `photos` JSONB (array of photo objects)
- Field: `primary_photo_url` TEXT (cached for quick access)

**Storage Bucket**: `profile-photos`
- Public: YES
- Size Limit: 5MB per file
- Allowed Types: image/jpeg, image/png, image/webp
- Path Pattern: `{clerk_user_id}/{uuid}.{ext}`

**Photo Object Schema**:
```typescript
{
  id: string;                    // UUID
  url: string;                   // Public URL
  storagePath: string;           // Storage path
  isPrimary: boolean;            // Only one true per user
  approved: boolean;             // Quick check
  moderationStatus: string;      // 'pending' | 'approved' | 'rejected' | 'manual_review'
  rejectionReason?: string;      // If rejected
  moderationConfidence?: number; // 0.0-1.0
  moderationFlags?: string[];    // Array of detected issues
  moderatedAt?: string;          // ISO timestamp
  mimeType?: string;             // MIME type
  fileSizeBytes?: number;        // Size in bytes
  uploadedAt: string;            // ISO timestamp
}
```

**Why Denormalized?**
- ✅ Atomic updates (entire photo array updated together)
- ✅ No joins needed for profile queries
- ✅ Simpler for small arrays (max 6 photos)
- ✅ Works well with existing profiles structure
- ⚠️ Harder for cross-user photo queries

---

### Voice Storage (Normalized)

**Design Decision**: Voice intros use a normalized table for better querying and processing state management.

**Table**: `voice_introductions`

**Schema**:
```sql
CREATE TABLE voice_introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,                    -- Clerk user ID
  url TEXT NOT NULL,                        -- Signed URL
  storage_path TEXT NOT NULL,               -- Storage path
  duration_seconds INTEGER NOT NULL,        -- 5-30 seconds
  file_type TEXT NOT NULL,                  -- audio/* MIME type
  transcription TEXT,                       -- Azure Speech result
  transcription_confidence NUMERIC(5,4),    -- 0.0-1.0
  personality_markers JSONB,                -- Extracted traits
  processing_status TEXT NOT NULL,          -- 'pending' | 'processing' | 'completed' | 'failed'
  language TEXT DEFAULT 'en-US',            -- Language code
  is_active BOOLEAN DEFAULT TRUE,           -- Only one active per user
  processed_at TIMESTAMPTZ,                 -- When completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: only one active voice per user
CREATE UNIQUE INDEX idx_voice_introductions_one_active_per_user
  ON voice_introductions(user_id)
  WHERE (is_active = true);
```

**Storage Bucket**: `voice-intros`
- Public: NO (private, signed URLs)
- Size Limit: 10MB per file
- Allowed Types: audio/webm, audio/mp3, audio/mpeg, audio/wav
- Path Pattern: `{clerk_user_id}/{uuid}.{ext}`

**Personality Markers Schema**:
```typescript
{
  pace: 'slow' | 'moderate' | 'fast',
  tone: 'warm' | 'neutral' | 'formal',
  energy: 'calm' | 'moderate' | 'energetic',
  confidence: 'low' | 'moderate' | 'high',
  wordCount: number,
  sentenceCount: number,
  fillerWordCount: number
}
```

---

## 2. STORAGE RLS POLICIES

### Profile Photos Bucket

```sql
-- Anyone can view (public bucket)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Users can only upload to their own folder
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Users can only delete from their own folder
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub'
);
```

### Voice Intros Bucket

```sql
-- Users can only view their own voice intros (private bucket)
CREATE POLICY "Users can view their own voice intros"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'voice-intros' 
  AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Users can only upload to their own folder
CREATE POLICY "Users can upload their own voice intros"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'voice-intros' 
  AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub'
);
```

**Key Pattern**: The `foldername(name)[1]` extracts the first folder segment (clerk_user_id) from the storage path, ensuring users can only access their own files.

---

## 3. API ENDPOINTS

### Photo Upload API

**Function**: `supabase/functions/photo-upload/index.ts`

**Endpoints**:

1. **POST ?action=upload**
   - Upload new photo with AI moderation
   - Validates: MIME type, file size, max count (6 non-rejected)
   - Returns: Photo object with moderation results

2. **GET**
   - List user's photos
   - Returns: Array of photo objects with display order

3. **DELETE ?id={photoId}**
   - Delete photo from storage + profiles.photos array
   - If primary deleted, auto-promotes next approved photo

4. **PUT ?action=primary&id={photoId}**
   - Set photo as primary
   - Unsets other primary photos atomically
   - Updates `profiles.primary_photo_url`

5. **PUT ?action=reorder**
   - Reorder photos by providing ordered array of IDs
   - Updates `profiles.photos` array order

**Flow**:
```
1. Client uploads file → photo-upload edge function
2. Validate MIME, size, count
3. Upload to storage bucket: {clerk_user_id}/{uuid}.{ext}
4. Get public URL
5. Call moderateImage(publicUrl) → Azure Content Safety
6. Create photo object with moderation results
7. Update profiles.photos JSONB array
8. Update profiles.primary_photo_url if needed
9. Return photo object to client
```

---

### Voice Upload API

**Function**: `supabase/functions/voice-upload/index.ts`

**Endpoints**:

1. **POST**
   - Upload voice intro with duration
   - Validates: MIME type, file size, duration (5-30s)
   - Deactivates previous voice intro
   - Returns: Voice object with processing_status='processing'

2. **GET**
   - Get active voice intro
   - Returns: Voice object with signed URL (refreshed)

3. **DELETE ?id={voiceId}**
   - Delete voice intro from storage + DB
   - User must re-record to message

**Flow**:
```
1. Client uploads audio → voice-upload edge function
2. Validate MIME, size, duration
3. Deactivate previous is_active=true voice intros
4. Upload to storage bucket: {clerk_user_id}/{uuid}.{ext}
5. Get signed URL (private bucket, 1 year expiry)
6. Insert voice_introductions row with processing_status='processing'
7. Return voice object to client
8. Async: processVoiceAsync() → Azure Speech API
   - Transcribe audio
   - Extract personality markers
   - Update record with results, processing_status='completed'
```

---

## 4. AI MODERATION SERVICE

**File**: `supabase/functions/_shared/moderation-service.ts`

### moderateImage(imageUrl)

**Service**: Azure Content Safety API

**Request**:
```typescript
POST {AZURE_CONTENT_SAFETY_ENDPOINT}/contentsafety/image:analyze
Headers:
  Ocp-Apim-Subscription-Key: {KEY}
Body:
  {
    image: { url: imageUrl },
    categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
    outputType: 'FourSeverityLevels'
  }
```

**Response Processing**:
```typescript
interface ModerationResult {
  status: 'pending' | 'approved' | 'rejected' | 'manual_review';
  confidence: number;  // 0.0-1.0
  flags: string[];     // e.g., ['high_sexual', 'medium_violence']
  reason?: string;     // Human-readable explanation
}
```

**Logic**:
- Severity 4+ → `rejected`
- Severity 2-3 → `manual_review`
- Severity 0-1 → `approved`

**Fallback**: If Azure not configured, uses basic validation (file extension check, auto-approve with confidence=0.5).

---

## 5. AZURE SPEECH PROCESSING

**File**: `supabase/functions/voice-upload/index.ts` → `processVoiceAsync()`

### Transcription

**Service**: Azure Speech-to-Text API

**Request**:
```typescript
POST https://{REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US
Headers:
  Ocp-Apim-Subscription-Key: {KEY}
  Content-Type: audio/webm | audio/wav | audio/mpeg
Body: <audio binary>
```

**Response**:
```json
{
  "RecognitionStatus": "Success",
  "DisplayText": "Hello, I'm looking for a match...",
  "NBest": [
    { "Confidence": 0.95 }
  ]
}
```

**Captured**:
- `transcription`: DisplayText
- `transcription_confidence`: NBest[0].Confidence
- `language`: Language code used

---

### Personality Analysis

**Function**: `analyzePersonality(transcription, azureResult)`

**Extracted Markers**:

1. **Pace**: Based on words per sentence
   - <10 words → `slow`
   - 10-20 words → `moderate`
   - >20 words → `fast`

2. **Tone**: Based on word choice
   - Positive/casual words → `warm`
   - Formal words → `formal`
   - Default → `neutral`

3. **Energy**: Based on punctuation
   - >2 exclamations or positive words → `energetic`
   - 0 exclamations/questions → `calm`
   - Default → `moderate`

4. **Confidence**: Based on filler words
   - >5 fillers (um, uh, like) → `low`
   - 3-5 fillers → `moderate`
   - <3 fillers → `high`

**Additional Metrics**:
- `wordCount`: Total words
- `sentenceCount`: Total sentences
- `fillerWordCount`: Count of filler words

---

## 6. MESSAGING GATING

**Requirement**: Users MUST have a completed voice intro before messaging matches.

### Implementation

**File**: `supabase/functions/_shared/voice-gating.ts`

**Helper Function**:
```typescript
export async function checkVoiceGating(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<VoiceGatingResult> {
  // Query voice_introductions for active voice with status='completed'
  // Return: { allowed, reason, hasVoiceIntro, processingStatus }
}
```

**Gating Logic**:
- No voice intro → `{ allowed: false, reason: 'Voice intro required before messaging' }`
- Voice processing → `{ allowed: false, reason: 'Voice intro is still processing...' }`
- Voice failed → `{ allowed: false, reason: 'Voice intro processing failed...' }`
- Voice completed → `{ allowed: true }`

**Enforcement Points**:

1. **Server-side** (NEW): `supabase/functions/send-message/index.ts`
   ```typescript
   const voiceGating = await checkVoiceGating(supabase, senderClerkId);
   if (!voiceGating.allowed) {
     return 403 Forbidden with reason
   }
   ```

2. **Client-side**: `src/hooks/useConversationMessages.ts`
   - Should check voice status before sending
   - Show UI prompt to record voice if missing

**Database Helper**:
```sql
CREATE FUNCTION has_completed_voice_intro(user_clerk_id TEXT)
RETURNS BOOLEAN
AS $$
  SELECT EXISTS(
    SELECT 1 FROM voice_introductions
    WHERE user_id = user_clerk_id
      AND is_active = true
      AND processing_status = 'completed'
  );
$$;
```

---

## 7. PROFILE VISIBILITY GATING

**Requirement**: Profiles visible to matches only after at least 1 approved photo.

### Implementation

**Database Helper**:
```sql
CREATE FUNCTION get_profile_completion_status(user_clerk_id TEXT)
RETURNS TABLE(
  has_approved_photo BOOLEAN,
  has_completed_voice BOOLEAN,
  can_message BOOLEAN,
  can_be_discovered BOOLEAN
)
AS $$
  -- Check profiles.photos JSONB for approved photo
  -- Check voice_introductions for completed voice
  -- Return gating statuses
$$;
```

**Usage**:
- Match discovery queries filter by `has_approved_photo = true`
- Messaging checks `can_message = true` (requires voice)
- Profile cards show completion status

---

## 8. ASYNC PROCESSING

### Voice Processing Pattern

**Flow**:
1. Upload returns immediately with `processing_status='processing'`
2. Client polls or subscribes to voice_introductions table for status updates
3. Server processes asynchronously:
   ```typescript
   processVoiceAsync(voiceId, storagePath, audioData, fileType).catch(console.error);
   ```
4. Updates record with transcription, markers, `processing_status='completed'`, `processed_at`

**Performance Target**: <5 seconds (best-effort)

**Error Handling**:
- Network failures → retry (not implemented, sets to 'failed')
- Azure API errors → log, set `processing_status='failed'`
- User can delete and re-record if failed

---

## 9. TESTING

**File**: `supabase/functions/tests/photo-voice-gating.test.ts`

**Test Coverage**:
1. ✅ Voice gating: no voice → blocked
2. ✅ Voice gating: processing voice → blocked
3. ✅ Voice gating: completed voice → allowed
4. ✅ Unique constraint: only one active voice per user
5. ✅ Unique constraint: only one primary photo per user (enforced in app logic)
6. ✅ Duration constraints: 5-30 seconds enforced in DB
7. ✅ MIME type constraints: only allowed types
8. ✅ File size constraints: 5MB photos, 10MB voice

**Run Tests**:
```bash
cd supabase/functions
deno test tests/photo-voice-gating.test.ts
```

---

## 10. DEPLOYMENT CHECKLIST

### Environment Variables

**Required for Azure Content Safety (Photo Moderation)**:
```bash
AZURE_CONTENT_SAFETY_ENDPOINT=https://{resource}.cognitiveservices.azure.com
AZURE_CONTENT_SAFETY_KEY={key}
```

**Required for Azure Speech (Voice Transcription)**:
```bash
VITE_AZURE_SPEECH_KEY={key}
VITE_AZURE_SPEECH_REGION=eastus
```

### Database Migration

```bash
# Run migration to add voice_introductions fields
supabase migration up
```

### Edge Functions

```bash
# Deploy edge functions
supabase functions deploy photo-upload
supabase functions deploy voice-upload
supabase functions deploy send-message
```

### Storage Buckets

Verify buckets exist with correct policies:
```bash
supabase storage list
# Should show: profile-photos (public), voice-intros (private)
```

### Clerk Auth

Ensure JWT claims include `sub` (clerk_user_id) for RLS policies.

---

## 11. MONITORING & MAINTENANCE

### Key Metrics

1. **Photo Moderation**:
   - Approval rate (should be >90%)
   - Rejection rate by category
   - Manual review queue size

2. **Voice Processing**:
   - Success rate (should be >95%)
   - Average processing time
   - Transcription confidence scores

3. **Gating Effectiveness**:
   - % users with completed voice intro
   - % users with approved photo
   - Message send failures due to gating

### Common Issues

1. **Photo rejected incorrectly**:
   - Check moderation_flags in photo object
   - Review Azure Content Safety thresholds
   - Provide manual override in admin panel

2. **Voice processing stuck**:
   - Check Azure Speech API logs
   - Verify audio format compatibility
   - Allow user to delete and re-record

3. **Storage RLS denies upload**:
   - Verify clerk_user_id in JWT claims
   - Check upload path format: `{clerk_user_id}/{file}`
   - Ensure storage policies reference correct claim

---

## 12. FUTURE ENHANCEMENTS

1. **Retry Logic**: Auto-retry failed voice processing
2. **Batch Moderation**: Moderate multiple photos in parallel
3. **Advanced Personality**: Use OpenAI for deeper analysis
4. **Photo Editing**: In-app crop/rotate before upload
5. **Voice Preview**: Allow listening before finalizing upload
6. **Admin Dashboard**: Review flagged content, override moderation
7. **Analytics**: Track upload success rates, processing times
8. **Multi-language**: Support Arabic, Urdu, French for voice transcription

---

## FILES REFERENCE

### Database
- `supabase/migrations/20260117T000004_fix_photo_voice_schema.sql` - Voice schema fixes

### Edge Functions
- `supabase/functions/photo-upload/index.ts` - Photo API
- `supabase/functions/voice-upload/index.ts` - Voice API
- `supabase/functions/send-message/index.ts` - Messaging with voice gating
- `supabase/functions/_shared/moderation-service.ts` - AI moderation
- `supabase/functions/_shared/voice-gating.ts` - Voice intro gating logic

### Tests
- `supabase/functions/tests/photo-voice-gating.test.ts` - Constraint tests

### Frontend (Reference)
- `src/hooks/useProfilePhotos.ts` - Photo management
- `src/hooks/useVoiceIntro.ts` - Voice recording
- `src/components/profile/VoiceIntroRecorder.tsx` - Voice UI
- `src/hooks/useConversationMessages.ts` - Messaging (needs voice check)

### Documentation
- `docs/task4_photo_voice_status.md` - Audit & gap analysis
- `docs/task4_photo_voice_implementation.md` - This document

---

**Implementation Status**: ✅ COMPLETE

All core requirements implemented:
- ✅ Photo upload with AI moderation
- ✅ Voice upload with Azure Speech processing
- ✅ Mandatory voice intro gating for messaging
- ✅ Storage RLS policies
- ✅ Async processing
- ✅ Tests
- ✅ Documentation
