import { createSupabaseClient } from '@/lib/supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const MAX_INPUT_LENGTH = 8000;

export interface ContentInput {
  text: string;
  insights?: Array<{ text: string }>;
}

export async function generateContentEmbedding(contentInput: ContentInput): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  let textToEmbed = contentInput.text || '';
  
  if (contentInput.insights && contentInput.insights.length > 0) {
    const insightTexts = contentInput.insights.map(i => i.text).join(' ');
    textToEmbed = `${textToEmbed} ${insightTexts}`;
  }

  if (textToEmbed.length > MAX_INPUT_LENGTH) {
    textToEmbed = textToEmbed.substring(0, MAX_INPUT_LENGTH);
  }

  if (!textToEmbed.trim()) {
    throw new Error('Content text is empty');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: textToEmbed,
        dimensions: 1536
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid embedding response from OpenAI');
    }

    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function storeContentEmbedding(
  contentId: string, 
  embedding: number[], 
  token?: string
): Promise<void> {
  const supabase = createSupabaseClient(token);
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('posts')
    .update({ embedding })
    .eq('id', contentId);

  if (error) {
    throw new Error(`Failed to store embedding: ${error.message}`);
  }
}

export async function generateAndStoreEmbedding(
  contentId: string,
  contentInput: ContentInput,
  token?: string
): Promise<void> {
  const embedding = await generateContentEmbedding(contentInput);
  await storeContentEmbedding(contentId, embedding, token);
}
