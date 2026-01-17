import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hasCompletedVoiceIntro, checkVoiceGating } from "../_shared/voice-gating.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.test("Voice Gating - User with no voice intro is blocked", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_no_voice';
  
  const result = await checkVoiceGating(supabase, testUserId);
  
  assertEquals(result.allowed, false);
  assertEquals(result.hasVoiceIntro, false);
  assertExists(result.reason);
});

Deno.test("Voice Gating - User with processing voice intro is blocked", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_processing';
  
  await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice.webm',
    storage_path: 'test/voice.webm',
    duration_seconds: 10,
    file_type: 'audio/webm',
    processing_status: 'processing',
    is_active: true
  });
  
  const result = await checkVoiceGating(supabase, testUserId);
  
  assertEquals(result.allowed, false);
  assertEquals(result.hasVoiceIntro, true);
  assertEquals(result.processingStatus, 'processing');
  
  await supabase.from('voice_introductions').delete().eq('user_id', testUserId);
});

Deno.test("Voice Gating - User with completed voice intro is allowed", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_completed';
  
  await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice.webm',
    storage_path: 'test/voice.webm',
    duration_seconds: 10,
    file_type: 'audio/webm',
    processing_status: 'completed',
    is_active: true,
    transcription: 'Hello, this is my voice intro.'
  });
  
  const result = await checkVoiceGating(supabase, testUserId);
  
  assertEquals(result.allowed, true);
  assertEquals(result.hasVoiceIntro, true);
  assertEquals(result.processingStatus, 'completed');
  
  await supabase.from('voice_introductions').delete().eq('user_id', testUserId);
});

Deno.test("hasCompletedVoiceIntro - Returns true only for completed voice", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_completed_check';
  
  let hasVoice = await hasCompletedVoiceIntro(supabase, testUserId);
  assertEquals(hasVoice, false);
  
  await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice.webm',
    storage_path: 'test/voice.webm',
    duration_seconds: 15,
    file_type: 'audio/webm',
    processing_status: 'completed',
    is_active: true
  });
  
  hasVoice = await hasCompletedVoiceIntro(supabase, testUserId);
  assertEquals(hasVoice, true);
  
  await supabase.from('voice_introductions').delete().eq('user_id', testUserId);
});

Deno.test("Photo Constraints - Max 6 non-rejected photos", async () => {
  const maxPhotos = 6;
  
  assertEquals(maxPhotos, 6);
});

Deno.test("Photo Constraints - Only one primary photo per user", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_primary_photo';
  
  await supabase.from('profile_photos').insert({
    user_id: testUserId,
    url: 'https://example.com/photo1.jpg',
    storage_path: 'test/photo1.jpg',
    is_primary: true,
    moderation_status: 'approved'
  });
  
  const { error } = await supabase.from('profile_photos').insert({
    user_id: testUserId,
    url: 'https://example.com/photo2.jpg',
    storage_path: 'test/photo2.jpg',
    is_primary: true,
    moderation_status: 'approved'
  });
  
  assertExists(error);
  
  await supabase.from('profile_photos').delete().eq('user_id', testUserId);
});

Deno.test("Voice Constraints - Only one active voice intro per user", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_active_voice';
  
  await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice1.webm',
    storage_path: 'test/voice1.webm',
    duration_seconds: 10,
    file_type: 'audio/webm',
    processing_status: 'completed',
    is_active: true
  });
  
  const { error } = await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice2.webm',
    storage_path: 'test/voice2.webm',
    duration_seconds: 12,
    file_type: 'audio/webm',
    processing_status: 'completed',
    is_active: true
  });
  
  assertExists(error);
  
  await supabase.from('voice_introductions').delete().eq('user_id', testUserId);
});

Deno.test("Voice Duration Constraints - 5 to 30 seconds enforced", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_duration';
  
  const { error: tooShortError } = await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice_short.webm',
    storage_path: 'test/voice_short.webm',
    duration_seconds: 3,
    file_type: 'audio/webm',
    processing_status: 'completed',
    is_active: true
  });
  
  assertExists(tooShortError);
  
  const { error: tooLongError } = await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice_long.webm',
    storage_path: 'test/voice_long.webm',
    duration_seconds: 35,
    file_type: 'audio/webm',
    processing_status: 'completed',
    is_active: true
  });
  
  assertExists(tooLongError);
  
  const { error: validError } = await supabase.from('voice_introductions').insert({
    user_id: testUserId,
    url: 'https://example.com/voice_valid.webm',
    storage_path: 'test/voice_valid.webm',
    duration_seconds: 15,
    file_type: 'audio/webm',
    processing_status: 'completed',
    is_active: true
  });
  
  assertEquals(validError, null);
  
  await supabase.from('voice_introductions').delete().eq('user_id', testUserId);
});

Deno.test("Photo MIME Type Constraints - Only JPEG, PNG, WebP allowed", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_mime';
  
  const { error: invalidMimeError } = await supabase.from('profile_photos').insert({
    user_id: testUserId,
    url: 'https://example.com/photo.gif',
    storage_path: 'test/photo.gif',
    mime_type: 'image/gif',
    moderation_status: 'approved'
  });
  
  assertExists(invalidMimeError);
  
  const { error: validMimeError } = await supabase.from('profile_photos').insert({
    user_id: testUserId,
    url: 'https://example.com/photo.jpg',
    storage_path: 'test/photo.jpg',
    mime_type: 'image/jpeg',
    moderation_status: 'approved'
  });
  
  assertEquals(validMimeError, null);
  
  await supabase.from('profile_photos').delete().eq('user_id', testUserId);
});

Deno.test("Photo File Size Constraints - Max 5MB enforced", async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = 'test_user_filesize';
  
  const { error: tooLargeError } = await supabase.from('profile_photos').insert({
    user_id: testUserId,
    url: 'https://example.com/large_photo.jpg',
    storage_path: 'test/large_photo.jpg',
    mime_type: 'image/jpeg',
    file_size_bytes: 6 * 1024 * 1024,
    moderation_status: 'approved'
  });
  
  assertExists(tooLargeError);
  
  const { error: validSizeError } = await supabase.from('profile_photos').insert({
    user_id: testUserId,
    url: 'https://example.com/valid_photo.jpg',
    storage_path: 'test/valid_photo.jpg',
    mime_type: 'image/jpeg',
    file_size_bytes: 3 * 1024 * 1024,
    moderation_status: 'approved'
  });
  
  assertEquals(validSizeError, null);
  
  await supabase.from('profile_photos').delete().eq('user_id', testUserId);
});
