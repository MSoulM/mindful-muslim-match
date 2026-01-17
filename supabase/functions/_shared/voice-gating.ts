import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface VoiceGatingResult {
  allowed: boolean;
  reason?: string;
  hasVoiceIntro: boolean;
  processingStatus?: string;
}

export async function hasCompletedVoiceIntro(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('voice_introductions')
      .select('processing_status, is_active')
      .eq('user_id', clerkUserId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking voice intro:', error);
      return false;
    }

    if (!data) {
      return false;
    }

    return data.processing_status === 'completed';
  } catch (error) {
    console.error('Voice intro check failed:', error);
    return false;
  }
}

export async function checkVoiceGating(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<VoiceGatingResult> {
  try {
    const { data, error } = await supabase
      .from('voice_introductions')
      .select('processing_status, is_active')
      .eq('user_id', clerkUserId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking voice intro:', error);
      return {
        allowed: false,
        reason: 'Unable to verify voice intro status',
        hasVoiceIntro: false
      };
    }

    if (!data) {
      return {
        allowed: false,
        reason: 'Voice intro required before messaging',
        hasVoiceIntro: false
      };
    }

    if (data.processing_status === 'processing' || data.processing_status === 'pending') {
      return {
        allowed: false,
        reason: 'Voice intro is still processing. Please wait a moment and try again.',
        hasVoiceIntro: true,
        processingStatus: data.processing_status
      };
    }

    if (data.processing_status === 'failed') {
      return {
        allowed: false,
        reason: 'Voice intro processing failed. Please record a new voice intro.',
        hasVoiceIntro: true,
        processingStatus: data.processing_status
      };
    }

    if (data.processing_status === 'completed') {
      return {
        allowed: true,
        hasVoiceIntro: true,
        processingStatus: data.processing_status
      };
    }

    return {
      allowed: false,
      reason: 'Voice intro required before messaging',
      hasVoiceIntro: false
    };
  } catch (error) {
    console.error('Voice gating check failed:', error);
    return {
      allowed: false,
      reason: 'Unable to verify voice intro status',
      hasVoiceIntro: false
    };
  }
}

export async function getProfileCompletionStatus(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<{
  hasApprovedPhoto: boolean;
  hasCompletedVoice: boolean;
  canMessage: boolean;
  canBeDiscovered: boolean;
}> {
  const [photoResult, voiceResult] = await Promise.all([
    supabase
      .from('profile_photos')
      .select('id')
      .eq('user_id', clerkUserId)
      .eq('moderation_status', 'approved')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('voice_introductions')
      .select('processing_status')
      .eq('user_id', clerkUserId)
      .eq('is_active', true)
      .eq('processing_status', 'completed')
      .maybeSingle()
  ]);

  const hasApprovedPhoto = !!photoResult.data;
  const hasCompletedVoice = !!voiceResult.data;

  return {
    hasApprovedPhoto,
    hasCompletedVoice,
    canMessage: hasCompletedVoice,
    canBeDiscovered: hasApprovedPhoto
  };
}
