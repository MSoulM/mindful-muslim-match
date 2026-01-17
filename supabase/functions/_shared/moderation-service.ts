export interface ModerationResult {
  status: 'pending' | 'approved' | 'rejected' | 'manual_review';
  confidence: number;
  flags: string[];
  reason?: string;
}

const AZURE_CONTENT_SAFETY_ENDPOINT = Deno.env.get("AZURE_CONTENT_SAFETY_ENDPOINT");
const AZURE_CONTENT_SAFETY_KEY = Deno.env.get("AZURE_CONTENT_SAFETY_KEY");

export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  if (!AZURE_CONTENT_SAFETY_ENDPOINT || !AZURE_CONTENT_SAFETY_KEY) {
    console.warn('Azure Content Safety not configured, using basic moderation');
    return basicImageModeration(imageUrl);
  }

  try {
    const response = await fetch(
      `${AZURE_CONTENT_SAFETY_ENDPOINT}/contentsafety/image:analyze?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_CONTENT_SAFETY_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: {
            url: imageUrl
          },
          categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
          outputType: 'FourSeverityLevels'
        }),
      }
    );

    if (!response.ok) {
      console.error('Azure Content Safety error:', response.status);
      return basicImageModeration(imageUrl);
    }

    const result = await response.json();
    return parseAzureModerationResult(result);
  } catch (error) {
    console.error('Image moderation error:', error);
    return basicImageModeration(imageUrl);
  }
}

function parseAzureModerationResult(azureResult: any): ModerationResult {
  const flags: string[] = [];
  let maxSeverity = 0;
  let totalConfidence = 0;
  let categoryCount = 0;

  const categories = ['hateResult', 'selfHarmResult', 'sexualResult', 'violenceResult'];
  
  for (const category of categories) {
    if (azureResult[category]) {
      const severity = azureResult[category].severity || 0;
      maxSeverity = Math.max(maxSeverity, severity);
      totalConfidence += 1.0;
      categoryCount++;

      if (severity >= 4) {
        flags.push(`high_${category.replace('Result', '')}`);
      } else if (severity >= 2) {
        flags.push(`medium_${category.replace('Result', '')}`);
      }
    }
  }

  const avgConfidence = categoryCount > 0 ? totalConfidence / categoryCount : 0.9;

  if (maxSeverity >= 4) {
    return {
      status: 'rejected',
      confidence: avgConfidence,
      flags,
      reason: 'Content violates community guidelines'
    };
  } else if (maxSeverity >= 2 || flags.length > 0) {
    return {
      status: 'manual_review',
      confidence: avgConfidence,
      flags,
      reason: 'Requires manual review'
    };
  } else {
    return {
      status: 'approved',
      confidence: avgConfidence,
      flags: []
    };
  }
}

function basicImageModeration(imageUrl: string): ModerationResult {
  const fileExt = imageUrl.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  
  if (!allowedExtensions.includes(fileExt)) {
    return {
      status: 'rejected',
      confidence: 1.0,
      flags: ['invalid_format'],
      reason: 'Invalid image format'
    };
  }

  return {
    status: 'approved',
    confidence: 0.5,
    flags: [],
    reason: 'Basic validation passed (Azure Content Safety not configured)'
  };
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (!AZURE_CONTENT_SAFETY_ENDPOINT || !AZURE_CONTENT_SAFETY_KEY) {
    console.warn('Azure Content Safety not configured, using basic moderation');
    return basicTextModeration(text);
  }

  try {
    const response = await fetch(
      `${AZURE_CONTENT_SAFETY_ENDPOINT}/contentsafety/text:analyze?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_CONTENT_SAFETY_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
          outputType: 'FourSeverityLevels'
        }),
      }
    );

    if (!response.ok) {
      console.error('Azure Content Safety error:', response.status);
      return basicTextModeration(text);
    }

    const result = await response.json();
    return parseAzureModerationResult(result);
  } catch (error) {
    console.error('Text moderation error:', error);
    return basicTextModeration(text);
  }
}

function basicTextModeration(text: string): ModerationResult {
  const bannedWords = ['spam', 'scam', 'porn', 'xxx'];
  const lowerText = text.toLowerCase();
  
  const foundBannedWords = bannedWords.filter(word => lowerText.includes(word));
  
  if (foundBannedWords.length > 0) {
    return {
      status: 'manual_review',
      confidence: 0.7,
      flags: foundBannedWords,
      reason: 'Contains potentially inappropriate content'
    };
  }

  return {
    status: 'approved',
    confidence: 0.5,
    flags: []
  };
}
