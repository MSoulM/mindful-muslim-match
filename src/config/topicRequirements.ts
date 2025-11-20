/**
 * Topic Requirements Configuration
 * Defines required topics for profile completion categories
 */

export interface TopicRequirement {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  required: boolean;
  keywords: string[]; // For AI detection
  prompts: string[]; // User-facing prompts to generate content
  examples: string[]; // Example content snippets
}

export type CategoryType = 
  | 'values_beliefs'
  | 'interests_hobbies'
  | 'relationship_goals'
  | 'lifestyle_personality'
  | 'family_cultural';

export interface CategoryTopicConfig {
  category: CategoryType;
  categoryName: string;
  hasRequiredTopics: boolean;
  topics: TopicRequirement[];
  minTopicsCovered: number; // For completion calculation
}

// VALUES & BELIEFS TOPICS (4 Required)
const valuesBeliefTopics: TopicRequirement[] = [
  {
    id: 'vb_religious_practice',
    name: 'Religious Practice',
    description: 'Daily Islamic practices like prayer, fasting, and worship',
    category: 'values_beliefs',
    required: true,
    keywords: [
      'prayer', 'salah', 'pray', 'namaz', 'fajr', 'maghrib',
      'fasting', 'ramadan', 'sawm', 'mosque', 'masjid',
      'quran', 'quranic', 'worship', 'ibadah', 'dua'
    ],
    prompts: [
      'What role does prayer play in your daily life?',
      'Tell us about your Ramadan routine',
      'How do you maintain your connection with worship?',
      'What Islamic practices are most important to you?'
    ],
    examples: [
      'I try to pray all five daily prayers. Prayer keeps me grounded spiritually.',
      'Ramadan is a special time for me. I focus on spiritual growth and community.',
      'I read Quran every morning after Fajr prayer.'
    ]
  },
  {
    id: 'vb_spiritual_values',
    name: 'Spiritual Values',
    description: 'Core Islamic values like taqwa, ihsan, and good character',
    category: 'values_beliefs',
    required: true,
    keywords: [
      'taqwa', 'ihsan', 'akhlaq', 'character', 'integrity',
      'honesty', 'kindness', 'compassion', 'patience', 'sabr',
      'gratitude', 'shukr', 'humility', 'spiritual', 'faith', 'iman'
    ],
    prompts: [
      'What spiritual values guide your daily decisions?',
      'How do you practice ihsan (excellence) in your life?',
      'What does good character mean to you?',
      'How do you cultivate taqwa (God-consciousness)?'
    ],
    examples: [
      'I strive to maintain good character in all interactions. Honesty and kindness are non-negotiable for me.',
      'Ihsan means doing my best in everything, even when no one is watching.',
      'Patience and gratitude have transformed how I handle challenges.'
    ]
  },
  {
    id: 'vb_community_involvement',
    name: 'Community Involvement',
    description: 'Charity work, volunteering, and community service',
    category: 'values_beliefs',
    required: true,
    keywords: [
      'charity', 'sadaqah', 'zakat', 'volunteer', 'volunteering',
      'community', 'service', 'helping', 'giving', 'donate',
      'food bank', 'homeless', 'orphan', 'masjid', 'community center'
    ],
    prompts: [
      'How do you give back to your community?',
      'Tell us about your volunteer or charity work',
      'What causes are important to you?',
      'How do you practice sadaqah in your life?'
    ],
    examples: [
      'I volunteer at the local food bank every weekend. Helping others brings me joy.',
      'I organize charity drives at my masjid during Ramadan.',
      'Giving back to the community is a core part of my faith.'
    ]
  },
  {
    id: 'vb_islamic_knowledge',
    name: 'Islamic Knowledge & Education',
    description: 'Quranic study, Islamic courses, seeking knowledge',
    category: 'values_beliefs',
    required: true,
    keywords: [
      'quran', 'study', 'learn', 'learning', 'knowledge', 'ilm',
      'course', 'class', 'sheikh', 'scholar', 'lecture', 'halaqah',
      'tafsir', 'hadith', 'fiqh', 'memorize', 'hifz'
    ],
    prompts: [
      'How do you continue learning about your faith?',
      'What Islamic books or scholars have influenced you?',
      'Do you attend any Islamic courses or study circles?',
      'Tell us about your Quranic study routine'
    ],
    examples: [
      'I attend a weekly tafsir class at my local masjid.',
      'I\'ve been slowly memorizing Juz Amma over the past year.',
      'Reading books by contemporary Islamic scholars helps me grow spiritually.'
    ]
  }
];

// RELATIONSHIP GOALS TOPICS (3 Required)
const relationshipGoalsTopics: TopicRequirement[] = [
  {
    id: 'rg_marriage_timeline',
    name: 'Marriage Timeline Expectations',
    description: 'When you want to get married and your readiness',
    category: 'relationship_goals',
    required: true,
    keywords: [
      'marry', 'marriage', 'wedding', 'ready', 'timeline',
      'soon', 'year', 'months', 'nikah', 'engaged', 'engagement'
    ],
    prompts: [
      'What\'s your ideal timeline for getting married?',
      'Are you ready for marriage now or still preparing?',
      'What does marriage readiness mean to you?',
      'When do you hope to have your nikah?'
    ],
    examples: [
      'I\'m ready for marriage within the next 6-12 months.',
      'I want to get married soon, but I\'m waiting for the right person.',
      'I hope to be married within the next year or two.'
    ]
  },
  {
    id: 'rg_children_family',
    name: 'Children & Family Planning',
    description: 'Preferences about having children and family size',
    category: 'relationship_goals',
    required: true,
    keywords: [
      'children', 'kids', 'family', 'parenting', 'parent',
      'child', 'son', 'daughter', 'baby', 'babies',
      'planning', 'family size', 'want kids'
    ],
    prompts: [
      'How do you envision your future family?',
      'What are your thoughts on having children?',
      'What kind of parent do you hope to be?',
      'How many children would you like, if any?'
    ],
    examples: [
      'I definitely want children, ideally 2-3. Family is very important to me.',
      'I hope to start a family soon after marriage and raise kind, faithful children.',
      'Children are a blessing I look forward to, when the time is right.'
    ]
  },
  {
    id: 'rg_lifestyle_vision',
    name: 'Lifestyle & Living Arrangements',
    description: 'Career-family balance, where to live, lifestyle preferences',
    category: 'relationship_goals',
    required: true,
    keywords: [
      'live', 'living', 'home', 'house', 'city', 'country',
      'career', 'work', 'job', 'balance', 'lifestyle',
      'settle', 'relocate', 'move', 'stay', 'apartment'
    ],
    prompts: [
      'Where do you see yourself living after marriage?',
      'How do you balance career and family life?',
      'What does your ideal lifestyle look like?',
      'Are you open to relocating for marriage?'
    ],
    examples: [
      'I hope to live in a family-friendly suburb, near good schools.',
      'Career is important, but family comes first. I want balance.',
      'I\'m open to living anywhere as long as we\'re building together.'
    ]
  }
];

// FAMILY & CULTURAL TOPICS (2 Required)
const familyCulturalTopics: TopicRequirement[] = [
  {
    id: 'fc_family_involvement',
    name: 'Family Involvement & Wali Role',
    description: 'Family role in marriage, wali requirements, family dynamics',
    category: 'family_cultural',
    required: true,
    keywords: [
      'family', 'parents', 'wali', 'guardian', 'father',
      'mother', 'siblings', 'involved', 'involvement',
      'approval', 'blessing', 'permission', 'close'
    ],
    prompts: [
      'What role does your family play in your marriage decision?',
      'How involved is your wali in the process?',
      'Tell us about your relationship with your family',
      'How important is family approval to you?'
    ],
    examples: [
      'My family is very important to me. I need their blessing and approval.',
      'I\'m close with my parents and want them involved in meeting potential matches.',
      'My wali will be actively involved in getting to know my future spouse.'
    ]
  },
  {
    id: 'fc_cultural_traditions',
    name: 'Cultural Heritage & Traditions',
    description: 'Cultural background, traditions, celebrations, food, language',
    category: 'family_cultural',
    required: true,
    keywords: [
      'culture', 'cultural', 'heritage', 'tradition', 'traditional',
      'language', 'speak', 'food', 'cuisine', 'cooking',
      'celebrate', 'celebration', 'eid', 'festival', 'customs'
    ],
    prompts: [
      'What cultural traditions are important to you?',
      'How do you celebrate cultural holidays and Eid?',
      'What role does your heritage play in your daily life?',
      'Tell us about your cultural background'
    ],
    examples: [
      'I love cooking traditional Pakistani dishes and sharing them with family.',
      'My cultural heritage is important, but I\'m open to learning about other cultures too.',
      'We celebrate both Eid and cultural festivals as a family.'
    ]
  }
];

// FREE-FORM CATEGORIES (No Required Topics)
const interestsHobbiesTopics: TopicRequirement[] = [
  // No required topics - completely free-form
  // Users can share anything about their interests
];

const lifestylePersonalityTopics: TopicRequirement[] = [
  // No required topics - completely free-form
  // Users can share anything about their lifestyle
];

// EXPORT CONFIGURATION
export const TOPIC_REQUIREMENTS: CategoryTopicConfig[] = [
  {
    category: 'values_beliefs',
    categoryName: 'Values & Beliefs',
    hasRequiredTopics: true,
    topics: valuesBeliefTopics,
    minTopicsCovered: 4 // All 4 required for 100% topic coverage
  },
  {
    category: 'relationship_goals',
    categoryName: 'Relationship Goals',
    hasRequiredTopics: true,
    topics: relationshipGoalsTopics,
    minTopicsCovered: 3 // All 3 required
  },
  {
    category: 'family_cultural',
    categoryName: 'Family & Cultural',
    hasRequiredTopics: true,
    topics: familyCulturalTopics,
    minTopicsCovered: 2 // Both required
  },
  {
    category: 'interests_hobbies',
    categoryName: 'Interests & Hobbies',
    hasRequiredTopics: false,
    topics: interestsHobbiesTopics,
    minTopicsCovered: 0 // Free-form, no specific topics
  },
  {
    category: 'lifestyle_personality',
    categoryName: 'Lifestyle & Personality',
    hasRequiredTopics: false,
    topics: lifestylePersonalityTopics,
    minTopicsCovered: 0 // Free-form, no specific topics
  }
];

// Helper function to get topics for a category
export function getTopicsForCategory(category: CategoryType): TopicRequirement[] {
  const config = TOPIC_REQUIREMENTS.find(c => c.category === category);
  return config?.topics || [];
}

// Helper function to check if category has required topics
export function categoryHasRequiredTopics(category: CategoryType): boolean {
  const config = TOPIC_REQUIREMENTS.find(c => c.category === category);
  return config?.hasRequiredTopics || false;
}

// Helper function to get category configuration
export function getCategoryConfig(category: CategoryType): CategoryTopicConfig | undefined {
  return TOPIC_REQUIREMENTS.find(c => c.category === category);
}

// Utility function for AI/keyword-based topic detection
export function detectTopicsInContent(
  content: string,
  category: CategoryType
): string[] {
  const topics = getTopicsForCategory(category);
  const detectedTopics: string[] = [];
  const contentLower = content.toLowerCase();
  
  topics.forEach(topic => {
    const keywordMatches = topic.keywords.filter(keyword =>
      contentLower.includes(keyword.toLowerCase())
    );
    
    // If 2+ keywords match, consider topic covered
    if (keywordMatches.length >= 2) {
      detectedTopics.push(topic.id);
    }
  });
  
  return detectedTopics;
}

// Calculate topic coverage percentage for a category
export function calculateTopicCoverage(
  coveredTopicIds: string[],
  category: CategoryType
): number {
  const config = getCategoryConfig(category);
  if (!config || !config.hasRequiredTopics || config.minTopicsCovered === 0) {
    return 100; // Free-form categories are always 100%
  }
  
  const requiredTopics = config.topics.filter(t => t.required);
  const coveredRequired = requiredTopics.filter(t => coveredTopicIds.includes(t.id));
  
  return Math.round((coveredRequired.length / requiredTopics.length) * 100);
}

// Get a specific topic by ID and category
export function getTopicById(category: CategoryType, topicId: string): TopicRequirement | undefined {
  const config = getCategoryConfig(category);
  return config?.topics.find(t => t.id === topicId);
}
