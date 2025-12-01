import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { CommunicationPrefs } from '@/types/onboarding';
import { toast } from 'sonner';

export interface NotificationSettings extends CommunicationPrefs {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  newMatches: true,
  messages: true,
  chaiChatUpdates: true,
  weeklyInsights: false,
  promotions: false,
  emailDigest: 'weekly',
  quietHours: false,
  quietHoursFrom: '22:00',
  quietHoursTo: '07:00',
  noPrayerTimes: false
};

const stripSeconds = (value?: string | null) => {
  if (!value) return undefined;
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const buildDbPayload = (userId: string, settings: NotificationSettings) => ({
  clerk_user_id: userId,
  push_enabled: settings.pushEnabled,
  email_enabled: settings.emailEnabled,
  sms_enabled: settings.smsEnabled,
  new_matches: settings.newMatches,
  messages: settings.messages,
  chai_chat_updates: settings.chaiChatUpdates,
  weekly_insights: settings.weeklyInsights,
  promotions: settings.promotions,
  email_digest: settings.emailDigest,
  quiet_hours_enabled: settings.quietHours,
  quiet_hours_start: settings.quietHours ? settings.quietHoursFrom ?? '22:00' : null,
  quiet_hours_end: settings.quietHours ? settings.quietHoursTo ?? '07:00' : null,
  respect_prayer_times: settings.noPrayerTimes
});

const mapRowToSettings = (row: any): NotificationSettings => ({
  pushEnabled: row?.push_enabled ?? DEFAULT_SETTINGS.pushEnabled,
  emailEnabled: row?.email_enabled ?? DEFAULT_SETTINGS.emailEnabled,
  smsEnabled: row?.sms_enabled ?? DEFAULT_SETTINGS.smsEnabled,
  newMatches: row?.new_matches ?? DEFAULT_SETTINGS.newMatches,
  messages: row?.messages ?? DEFAULT_SETTINGS.messages,
  chaiChatUpdates: row?.chai_chat_updates ?? DEFAULT_SETTINGS.chaiChatUpdates,
  weeklyInsights: row?.weekly_insights ?? DEFAULT_SETTINGS.weeklyInsights,
  promotions: row?.promotions ?? DEFAULT_SETTINGS.promotions,
  emailDigest: row?.email_digest ?? DEFAULT_SETTINGS.emailDigest,
  quietHours: row?.quiet_hours_enabled ?? DEFAULT_SETTINGS.quietHours,
  quietHoursFrom: stripSeconds(row?.quiet_hours_start) ?? DEFAULT_SETTINGS.quietHoursFrom,
  quietHoursTo: stripSeconds(row?.quiet_hours_end) ?? DEFAULT_SETTINGS.quietHoursTo,
  noPrayerTimes: row?.respect_prayer_times ?? DEFAULT_SETTINGS.noPrayerTimes
});

interface UseNotificationSettingsReturn {
  settings: NotificationSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveCommunicationPrefs: (prefs: CommunicationPrefs) => Promise<void>;
  updateChannelFlags: (updates: Partial<Pick<NotificationSettings, 'pushEnabled' | 'emailEnabled' | 'smsEnabled'>>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const useNotificationSettings = (): UseNotificationSettingsReturn => {
  const { userId } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseSupabase = useMemo(() => Boolean(supabase), []);

  const refreshSettings = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    if (!canUseSupabase) {
      setError('Supabase client not configured');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase!
        .from('notification_settings')
        .select('*')
        .eq('clerk_user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setSettings(mapRowToSettings(data));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notification settings';
      setError(message);
      console.error('Error loading notification settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, canUseSupabase]);

  const persistSettings = useCallback(
    async (nextSettings: NotificationSettings) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }
      if (!canUseSupabase) {
        setError('Supabase client not configured');
        return;
      }

      try {
        setIsSaving(true);
        setError(null);

        const payload = buildDbPayload(userId, nextSettings);
        const { error: upsertError } = await supabase!
          .from('notification_settings')
          .upsert(payload, {
            onConflict: 'clerk_user_id'
          });

        if (upsertError) {
          throw upsertError;
        }

        setSettings(nextSettings);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save notification settings';
        setError(message);
        console.error('Error saving notification settings:', err);
        toast.error('Could not save notification settings');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, canUseSupabase]
  );

  const saveCommunicationPrefs = useCallback(
    async (prefs: CommunicationPrefs) => {
      const nextSettings: NotificationSettings = {
        ...settings,
        ...prefs
      };

      await persistSettings(nextSettings);
      toast.success('Communication preferences saved');
    },
    [persistSettings, settings]
  );

  const updateChannelFlags = useCallback(
    async (
      updates: Partial<Pick<NotificationSettings, 'pushEnabled' | 'emailEnabled' | 'smsEnabled'>>
    ) => {
      const nextSettings: NotificationSettings = {
        ...settings,
        ...updates
      };

      await persistSettings(nextSettings);
    },
    [persistSettings, settings]
  );

  useEffect(() => {
    if (userId) {
      refreshSettings();
    }
  }, [userId, refreshSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    saveCommunicationPrefs,
    updateChannelFlags,
    refreshSettings
  };
};

