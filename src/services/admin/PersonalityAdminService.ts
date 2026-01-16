export type PersonalityKey = 'wise_aunty' | 'modern_scholar' | 'spiritual_guide' | 'cultural_bridge';
export type CulturalRegion = 'south_asian' | 'middle_eastern' | 'southeast_asian' | 'western_convert' | 'african';

export interface ToneParameters {
  warmth: number;
  formality: number;
  energy: number;
  empathy: number;
  religiosity: number;
}

export interface PromptRecord {
  id: string;
  personality_key: PersonalityKey;
  system_prompt: string;
  tone_parameters: ToneParameters;
  version: number;
  is_active: boolean;
  is_draft: boolean;
  token_count: number | null;
  created_by: string | null;
  change_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CulturalVariantRecord {
  id: string;
  personality_key: PersonalityKey;
  cultural_region: CulturalRegion;
  prompt_overlay: string;
  expression_library: Record<string, any>;
  local_references: Record<string, any>;
  ab_test_variant: 'A' | 'B' | null;
  ab_test_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestHistoryRecord {
  id: string;
  prompt_id: string;
  test_input: string;
  test_output: string | null;
  admin_rating: number | null;
  admin_notes: string | null;
  response_time_ms: number | null;
  token_usage: number | null;
  tested_by: string | null;
  tested_at: string;
}

function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Clerk) {
      (window as any).Clerk.session?.getToken().then((token: string) => resolve(token)).catch(() => resolve(null));
    } else {
      resolve(null);
    }
  });
}

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getAuthToken();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export class PersonalityAdminService {
  static async getActivePrompt(personalityKey: PersonalityKey): Promise<PromptRecord | null> {
    const result = await apiCall(`admin-mmagent-prompts?personality_key=${personalityKey}`);
    return result.prompt || null;
  }

  static async getAllPrompts(personalityKey?: PersonalityKey): Promise<PromptRecord[]> {
    const url = personalityKey 
      ? `admin-mmagent-prompts?personality_key=${personalityKey}`
      : 'admin-mmagent-prompts';
    const result = await apiCall(url);
    return result.prompts || [];
  }

  static async getVersions(personalityKey: PersonalityKey): Promise<PromptRecord[]> {
    const result = await apiCall(`admin-mmagent-prompts?action=versions&personality_key=${personalityKey}`);
    return result.versions || [];
  }

  static async saveDraft(
    personalityKey: PersonalityKey,
    systemPrompt: string,
    toneParameters: ToneParameters,
    changeNotes: string,
    adminId: string
  ): Promise<PromptRecord> {
    const tokenCount = Math.ceil(systemPrompt.length / 4);
    if (tokenCount > 2000) {
      throw new Error(`Prompt exceeds 2000 token limit (estimated: ${tokenCount} tokens)`);
    }
    
    const result = await apiCall('admin-mmagent-prompts?action=draft', {
      method: 'POST',
      body: JSON.stringify({
        personality_key: personalityKey,
        system_prompt: systemPrompt,
        tone_parameters: toneParameters,
        change_notes: changeNotes,
        admin_id: adminId
      })
    });
    
    return result.prompt;
  }

  static async activatePrompt(promptId: string, adminId: string): Promise<void> {
    await apiCall(`admin-mmagent-prompts?action=activate&prompt_id=${promptId}`, {
      method: 'POST',
      body: JSON.stringify({ admin_id: adminId })
    });
  }

  static async rollback(personalityKey: PersonalityKey, targetVersion: number, adminId: string): Promise<void> {
    await apiCall(`admin-mmagent-prompts?action=rollback&personality_key=${personalityKey}`, {
      method: 'POST',
      body: JSON.stringify({ target_version: targetVersion, admin_id: adminId })
    });
  }

  static async testPrompt(
    promptId: string,
    testInput: string,
    adminId: string
  ): Promise<TestHistoryRecord> {
    const result = await apiCall(`admin-mmagent-prompts?action=test&prompt_id=${promptId}`, {
      method: 'POST',
      body: JSON.stringify({ test_input: testInput, admin_id: adminId })
    });
    
    return result.test;
  }

  static async updateTestRating(
    testId: string,
    rating: number,
    notes: string
  ): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const token = await getAuthToken();
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { error } = await supabase
      .from('prompt_test_history')
      .update({
        admin_rating: rating,
        admin_notes: notes
      })
      .eq('id', testId);
    
    if (error) throw error;
  }

  static async getTestHistory(promptId: string): Promise<TestHistoryRecord[]> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const token = await getAuthToken();
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data, error } = await supabase
      .from('prompt_test_history')
      .select('*')
      .eq('prompt_id', promptId)
      .order('tested_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getCulturalVariants(personalityKey?: PersonalityKey): Promise<CulturalVariantRecord[]> {
    const url = personalityKey
      ? `admin-mmagent-cultural-variants?personality_key=${personalityKey}`
      : 'admin-mmagent-cultural-variants';
    const result = await apiCall(url);
    return result.variants || [];
  }

  static async createCulturalVariant(variant: Omit<CulturalVariantRecord, 'id' | 'created_at' | 'updated_at'>): Promise<CulturalVariantRecord> {
    const result = await apiCall('admin-mmagent-cultural-variants', {
      method: 'POST',
      body: JSON.stringify(variant)
    });
    return result.variant;
  }

  static async updateCulturalVariant(id: string, updates: Partial<CulturalVariantRecord>): Promise<CulturalVariantRecord> {
    const result = await apiCall(`admin-mmagent-cultural-variants?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return result.variant;
  }

  static async deleteCulturalVariant(id: string): Promise<void> {
    await apiCall(`admin-mmagent-cultural-variants?id=${id}`, {
      method: 'DELETE'
    });
  }
}
