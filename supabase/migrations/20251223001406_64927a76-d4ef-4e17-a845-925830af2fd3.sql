-- Create table for storing MySoul DNA scores per user
CREATE TABLE public.user_dna_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  rarity_tier TEXT NOT NULL DEFAULT 'Common',
  trait_uniqueness_score INTEGER NOT NULL DEFAULT 0,
  profile_completeness_score INTEGER NOT NULL DEFAULT 0,
  behavior_score INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_dna_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own DNA score" 
ON public.user_dna_scores 
FOR SELECT 
USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own DNA score" 
ON public.user_dna_scores 
FOR INSERT 
WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own DNA score" 
ON public.user_dna_scores 
FOR UPDATE 
USING ((auth.uid())::text = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_dna_scores_updated_at
BEFORE UPDATE ON public.user_dna_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_updated_at();