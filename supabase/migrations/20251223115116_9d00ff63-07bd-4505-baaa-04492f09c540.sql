-- Rename user_dna_scores table to mysoul_dna_scores
ALTER TABLE public.user_dna_scores RENAME TO mysoul_dna_scores;

-- Update RLS policies to reference the new table name
-- First drop existing policies
DROP POLICY IF EXISTS "Users can insert their own DNA score" ON public.mysoul_dna_scores;
DROP POLICY IF EXISTS "Users can update their own DNA score" ON public.mysoul_dna_scores;
DROP POLICY IF EXISTS "Users can view their own DNA score" ON public.mysoul_dna_scores;

-- Recreate policies with the same logic
CREATE POLICY "Users can insert their own DNA score" 
ON public.mysoul_dna_scores 
FOR INSERT 
WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own DNA score" 
ON public.mysoul_dna_scores 
FOR UPDATE 
USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can view their own DNA score" 
ON public.mysoul_dna_scores 
FOR SELECT 
USING ((auth.uid())::text = user_id);