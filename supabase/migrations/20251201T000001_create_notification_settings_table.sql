create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,

  -- Delivery channel toggles
  push_enabled boolean not null default true,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,

  -- In-app categories
  new_matches boolean not null default true,
  messages boolean not null default true,
  chai_chat_updates boolean not null default true,
  weekly_insights boolean not null default false,
  promotions boolean not null default false,

  -- Email digest cadence
  email_digest text not null default 'weekly'
    check (email_digest in ('daily', 'weekly', 'never')),

  -- Quiet hours + cultural context
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start time,
  quiet_hours_end time,
  respect_prayer_times boolean not null default false,

  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  constraint chk_notification_settings_quiet_hours
    check (
      (quiet_hours_enabled = false and quiet_hours_start is null and quiet_hours_end is null)
      or (quiet_hours_enabled = true and quiet_hours_start is not null and quiet_hours_end is not null)
    )
);

create index idx_notification_settings_clerk_user_id
  on public.notification_settings (clerk_user_id);

create index idx_notification_settings_email_digest
  on public.notification_settings (email_digest);

create or replace function public.update_notification_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notification_settings_updated_at_trigger
before update on public.notification_settings
for each row execute function public.update_notification_settings_updated_at();

