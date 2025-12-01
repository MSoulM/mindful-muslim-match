create table if not exists public.match_preferences (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique, -- Clerk user ID - one preferences per user
  
  -- Age range preferences
  age_range_min integer not null default 25 check (age_range_min >= 18),
  age_range_max integer not null default 35 check (age_range_max >= 18 and age_range_max >= age_range_min),
  
  -- Distance preference (in kilometers)
  max_distance integer not null default 25 check (max_distance >= 5),
  
  -- Education preferences (stored as JSONB array of strings)
  education_preferences jsonb not null default '[]'::jsonb,
  
  -- Marital status preferences (stored as JSONB array of strings)
  marital_status_preferences jsonb not null default '[]'::jsonb,
  
  -- Children preference (yes, no, doesntMatter)
  has_children_preference text not null default 'doesntMatter' 
    check (has_children_preference in ('yes', 'no', 'doesntMatter')),
  
  -- Religiosity level preferences (stored as JSONB array of strings)
  religiosity_preferences jsonb not null default '[]'::jsonb,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index idx_match_preferences_clerk_user_id on public.match_preferences(clerk_user_id);
create index idx_match_preferences_age_range on public.match_preferences(age_range_min, age_range_max);
create index idx_match_preferences_max_distance on public.match_preferences(max_distance);
create index idx_match_preferences_created_at on public.match_preferences(created_at);

-- Create a trigger to automatically update updated_at timestamp
create or replace function public.update_match_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger match_preferences_updated_at_trigger
before update on public.match_preferences
for each row
execute function public.update_match_preferences_updated_at();
