create table if not exists public.dna_questionnaires (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  type text not null check (type in ('multiChoice', 'scale', 'multiSelect', 'text')),
  options jsonb not null, -- Stores array of options/strings
  max_selections int, -- For multiSelect questions
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index idx_dna_questionnaires_category on public.dna_questionnaires(category);
create index idx_dna_questionnaires_type on public.dna_questionnaires(type);
