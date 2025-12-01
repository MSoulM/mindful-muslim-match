create table if not exists public.dna_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.dna_questionnaires(id) on delete cascade,
  clerk_user_id text not null, -- Clerk user ID
  answer jsonb not null, -- Stores: string, number, or array depending on question type
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Add unique constraint to prevent duplicate answers for same question per user
  unique(question_id, clerk_user_id)
);

-- Create indexes for better query performance
create index idx_dna_answers_question_id on public.dna_answers(question_id);
create index idx_dna_answers_clerk_user_id on public.dna_answers(clerk_user_id);
create index idx_dna_answers_created_at on public.dna_answers(created_at);
create index idx_dna_answers_unique_question_user on public.dna_answers(question_id, clerk_user_id);