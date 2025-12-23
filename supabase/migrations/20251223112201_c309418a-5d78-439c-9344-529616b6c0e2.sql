-- Create profile_photos table for storing photo metadata
CREATE TABLE public.profile_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  approved BOOLEAN DEFAULT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'manual_review')),
  rejection_reason TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_introductions table
CREATE TABLE public.voice_introductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 5 AND duration_seconds <= 30),
  file_type TEXT NOT NULL CHECK (file_type IN ('audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav')),
  transcription TEXT,
  personality_markers JSONB,
  processing_status TEXT NOT NULL DEFAULT 'processing' CHECK (processing_status IN ('processing', 'completed', 'failed')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_introductions ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile_photos
CREATE POLICY "Users can view their own photos"
ON public.profile_photos FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own photos"
ON public.profile_photos FOR INSERT
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own photos"
ON public.profile_photos FOR UPDATE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own photos"
ON public.profile_photos FOR DELETE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS policies for voice_introductions
CREATE POLICY "Users can view their own voice intros"
ON public.voice_introductions FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own voice intros"
ON public.voice_introductions FOR INSERT
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own voice intros"
ON public.voice_introductions FOR UPDATE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own voice intros"
ON public.voice_introductions FOR DELETE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create triggers for updated_at
CREATE TRIGGER update_profile_photos_updated_at
BEFORE UPDATE ON public.profile_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_updated_at();

CREATE TRIGGER update_voice_introductions_updated_at
BEFORE UPDATE ON public.voice_introductions
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_updated_at();

-- Create storage buckets for photos and voice
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880),
  ('voice-intros', 'voice-intros', false, 10485760);

-- Storage policies for profile-photos bucket
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub');

-- Storage policies for voice-intros bucket
CREATE POLICY "Users can view their own voice intros"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-intros' AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can upload their own voice intros"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-intros' AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own voice intros"
ON storage.objects FOR UPDATE
USING (bucket_id = 'voice-intros' AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own voice intros"
ON storage.objects FOR DELETE
USING (bucket_id = 'voice-intros' AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'sub');