import type { UserPersonalityType, AssessmentQuestion, CulturalOption, PersonalityRevealConfig } from '@/types/onboarding';
import { Heart, Sparkles, BookOpen, Globe } from 'lucide-react';

// Step constants
export const ONBOARDING_STEPS = {
  BASIC_INFO: 1,
  RELIGIOUS_PREFERENCES: 2,
  PROFILE_PHOTO: 3,
  INTERESTS: 4,
  LIFESTYLE: 5,
  PERSONALITY: 6,
  REVIEW: 7,
  TOTAL: 7
} as const;

// Sect options
export const SECT_OPTIONS = [
  { value: 'sunni', label: 'Sunni' },
  { value: 'shia', label: 'Shia' },
  { value: 'ahmadiyya', label: 'Ahmadiyya' },
  { value: 'other', label: 'Other' }
] as const;

// Madhab options
export const MADHAB_OPTIONS = [
  { value: 'hanafi', label: 'Hanafi', description: 'Most common in South Asia' },
  { value: 'shafi', label: "Shafi'i", description: 'Common in Southeast Asia' },
  { value: 'maliki', label: 'Maliki', description: 'Common in North Africa' },
  { value: 'hanbali', label: 'Hanbali', description: 'Common in Saudi Arabia' }
] as const;

// Prayer frequency options
export const PRAYER_OPTIONS = [
  { value: 'five_daily', label: '5 Daily' },
  { value: 'most', label: 'Most' },
  { value: 'some', label: 'Some' },
  { value: 'jummah', label: 'Jummah' },
  { value: 'learning', label: 'Learning' }
] as const;

// Muslim since options
export const MUSLIM_SINCE_OPTIONS = [
  { value: 'birth', label: 'Born Muslim' },
  { value: 'revert', label: 'Revert/Convert' }
] as const;

// Text constants - Religious Preferences Screen
export const RELIGIOUS_PREFERENCES_TEXT = {
  title: 'Religious Background',
  subtitle: 'This helps us find compatible matches',
  muslimSince: 'Muslim Since',
  bornMuslim: 'Born Muslim',
  revertConvert: 'Revert/Convert',
  revertYear: 'Year of Reversion',
  selectYear: 'Select year',
  sect: 'Sect',
  selectSect: 'Select sect',
  madhab: 'Madhab (School of Thought)',
  selectMadhab: 'Select madhab',
  madhabInfo: 'A madhab is a school of Islamic jurisprudence. Each follows the Quran and Sunnah but may differ in interpretation of certain practices.',
  prayerFrequency: 'Prayer Frequency',
  everyoneJourney: "Everyone's journey is unique",
  privacyNote: 'Your religious information is private and only used for matching',
  stepCounter: (current: number, total: number) => `Step ${current} of ${total}`
} as const;

// Text constants - Basic Info Screen
export const BASIC_INFO_TEXT = {
  title: 'Basic Information',
  subtitle: 'Help us know you better',
  firstName: 'First Name',
  lastName: 'Last Name',
  gender: 'Gender',
  birthdate: 'Date of Birth',
  location: 'Location',
  bio: 'About You',
  bioPlaceholder: 'Tell us about yourself...',
  selectGender: 'Select gender',
  stepCounter: (current: number, total: number) => `Step ${current} of ${total}`
} as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
] as const;

// Routes
export const ONBOARDING_ROUTES = {
  BASIC_INFO: '/onboarding/basic-info',
  RELIGIOUS_PREFERENCES: '/onboarding/religious-preferences',
  PROFILE_PHOTO: '/onboarding/profile-photo',
  INTERESTS: '/onboarding/interests',
  LIFESTYLE: '/onboarding/lifestyle',
  PERSONALITY: '/onboarding/personality',
  REVIEW: '/onboarding/review',
  HOME: '/'
} as const;

// Validation constants
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  LOCATION_MAX_LENGTH: 100,
  MIN_AGE: 18,
  MAX_AGE: 120
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 20,
  MAX_SIZE_BYTES: 20 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
} as const;

// Image compression constants
export const IMAGE_COMPRESSION = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
  MAX_SIZE_MB: 2
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Please select an image file',
  FILE_TOO_LARGE: 'Image must be smaller than 20MB',
  INVALID_NAME: 'Name must be between 2 and 50 characters',
  INVALID_EMAIL: 'Please enter a valid email address',
  REQUIRED_FIELD: 'This field is required',
  INVALID_BIRTHDATE: 'Please enter a valid date of birth',
  SAVE_FAILED: 'Failed to save. Please try again.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_SAVED: 'Profile updated successfully!',
  PHOTO_UPLOADED: 'Photo uploaded successfully!',
  PREFERENCES_SAVED: 'Preferences saved successfully!'
} as const;

// Photo guidelines
export const PHOTO_GUIDELINES = [
  { text: 'Clear face visible (no sunglasses)', valid: true },
  { text: 'Modest clothing', valid: true },
  { text: 'Recent photos (within 2 years)', valid: true },
  { text: 'Smile! Show your personality', valid: true },
  { text: 'No group photos as main', valid: false },
  { text: 'No filters or heavy editing', valid: false }
] as const;

// Photo upload constants
export const PHOTO_UPLOAD = {
  MAX_PHOTOS: 6,
  MIN_PHOTOS: 1,
  STEP: 3
} as const;

// DNA Questionnaire Constants
export const DNA_QUESTIONNAIRE = {
  STEP: 4,
  TOTAL_QUESTIONS: 25,
  QUESTIONS_PER_CATEGORY: 5,
  MAX_SKIPS_PER_CATEGORY: 3,
  TOTAL_CATEGORIES: 5
} as const;

export const DNA_CATEGORY_LABELS = {
  values: 'Values & Beliefs',
  personality: 'Personality Traits',
  interests: 'Interests & Hobbies',
  lifestyle: 'Lifestyle & Habits',
  goals: 'Life Goals'
} as const;

export const DNA_CATEGORY_COLORS = {
  values: 'bg-[#0D7377] text-white',
  personality: 'bg-[#8B7AB8] text-white',
  interests: 'bg-[#FF6B6B] text-white',
  lifestyle: 'bg-[#0066CC] text-white',
  goals: 'bg-[#FDB813] text-white'
} as const;

// Match Preferences Screen Constants
export const PREFERENCES_SCREEN = {
  STEP: 5,
  TOTAL_STEPS: 7
} as const;

export const EDUCATION_OPTIONS = [
  'High School',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate/PhD',
  'Trade/Vocational',
  'Other'
] as const;

export const MARITAL_STATUS_OPTIONS = [
  'Never Married',
  'Divorced',
  'Widowed'
] as const;

export const RELIGIOSITY_OPTIONS = [
  'Very Practicing',
  'Practicing',
  'Moderate',
  'Cultural',
  'Flexible'
] as const;

export const PREFERENCES_TEXT = {
  title: 'Match Preferences',
  subtitle: 'Who are you looking to meet?',
  ageRange: 'Age Range',
  yearsOld: (min: number, max: number) => `${min} - ${max} years old`,
  maxDistance: 'Maximum Distance',
  within: (distance: number) => `Within ${distance} km`,
  anywhere: 'Anywhere',
  education: 'Education Level',
  maritalStatus: 'Marital Status',
  hasChildren: 'Open to partners with children?',
  yes: 'Yes',
  no: 'No',
  noPreference: 'No Preference',
  religiousLevel: 'Religious Practice Level',
  similarToMine: 'Similar to mine',
  flexibility: 'Flexibility Tip',
  flexibilityMessage: 'Being flexible with your preferences increases your potential matches. You can always adjust these later in settings.',
  stepCounter: (current: number, total: number) => `Step ${current} of ${total}`
} as const;

// Profile Complete Screen Constants
export const PROFILE_COMPLETE_SCREEN = {
  title: 'Welcome to MuslimSoulmate.ai!',
  subtitle: 'Your profile is ready to shine ✨',
  dnaProfileLabel: 'DNA Profile',
  completeLabel: '% Complete',
  dnaMessage: 'Great start! Keep building your DNA for better matches',
  achievementsTitle: 'Achievements Unlocked',
  journeyTitle: 'Your Journey Begins!',
  agentTitle: 'Your MMAgent',
  agentMessage: "Assalamu Alaikum! I'm your personal AI matchmaker. I'll be working behind the scenes to find your most compatible matches. Your first batch arrives this Sunday!",
  startExploring: 'Start Exploring',
  viewProfile: 'View My Profile'
} as const;

export const ACHIEVEMENTS = [
  { icon: 'Sparkles', title: 'Profile Created', points: '+100', color: 'text-primary' },
  { icon: 'Camera', title: 'Photos Added', points: '+50', color: 'text-blue-500' },
  { icon: 'Dna', title: 'DNA Initialized', points: '+75', color: 'text-purple-500' },
  { icon: 'TrendingUp', title: 'Notifications On', points: '+25', color: 'text-green-500' }
] as const;

export const NEXT_STEPS = [
  {
    icon: 'Calendar',
    title: 'Weekly Matches',
    description: 'Every Sunday, 3 curated matches',
    color: 'bg-primary/10 text-primary'
  },
  {
    icon: 'Coffee',
    title: 'ChaiChat',
    description: 'AI explores compatibility for you',
    color: 'bg-orange-500/10 text-orange-500'
  },
  {
    icon: 'Dna',
    title: 'Build DNA',
    description: 'Share posts to improve matching',
    color: 'bg-purple-500/10 text-purple-500'
  }
] as const;

// Notifications Screen Constants
export const NOTIFICATIONS_SCREEN = {
  STEP: 6,
  TOTAL_STEPS: 7,
  title: 'Stay Connected',
  subtitle: 'Never miss a meaningful connection',
  enableButton: 'Enable Notifications',
  enablingButton: 'Enabling...',
  skipButton: 'Maybe Later',
  privacyNote: "We'll never spam. You control what you receive."
} as const;

export const NOTIFICATION_BENEFITS = [
  {
    icon: '💕',
    title: 'New Matches',
    description: 'Know when someone special appears'
  },
  {
    icon: '💬',
    title: 'Messages',
    description: 'Stay engaged in conversations'
  },
  {
    icon: '🤖',
    title: 'AI Insights',
    description: 'Get personalized compatibility updates'
  },
  {
    icon: '📅',
    title: 'Weekly Updates',
    description: 'New ChaiChat conversations every Sunday'
  }
] as const;

// Communication Preferences Screen Constants
export const COMMUNICATION_PREFS_SCREEN = {
  STEP: 7,
  TOTAL_STEPS: 7,
  title: 'Customize Notifications',
  subtitle: 'Choose what you\'d like to know about',
  finalStepLabel: 'Final Step!',
  completeButton: 'Complete Setup',
  emailUpdatesTitle: 'Email Updates',
  quietHoursTitle: 'Quiet Hours',
  enableQuietHoursLabel: 'Enable Quiet Hours',
  quietHoursDescription: 'No notifications during sleep time',
  quietHoursFromLabel: 'From',
  quietHoursToLabel: 'To',
  respectPrayerTimesLabel: 'Respect Prayer Times',
  respectPrayerTimesDescription: 'No notifications during Salah'
} as const;

export const NOTIFICATION_TYPES = [
  {
    id: 'newMatches',
    icon: 'Heart',
    title: 'New Matches',
    description: 'Get notified when you have a new match',
    defaultOn: true
  },
  {
    id: 'messages',
    icon: 'MessageCircle',
    title: 'Messages',
    description: 'New messages from your matches',
    defaultOn: true
  },
  {
    id: 'chaiChatUpdates',
    icon: 'Coffee',
    title: 'ChaiChat Updates',
    description: 'AI conversation analysis complete',
    defaultOn: true
  },
  {
    id: 'weeklyInsights',
    icon: 'TrendingUp',
    title: 'Weekly Insights',
    description: 'Your compatibility stats and tips',
    defaultOn: false
  },
  {
    id: 'promotions',
    icon: 'Gift',
    title: 'Promotions & Tips',
    description: 'Special offers and app updates',
    defaultOn: false
  }
] as const;

export const EMAIL_DIGEST_OPTIONS = [
  { value: 'daily' as const, label: 'Daily Digest', description: 'Get updates every day' },
  { value: 'weekly' as const, label: 'Weekly Summary', description: 'Recommended - once a week' },
  { value: 'never' as const, label: 'No Emails', description: 'App notifications only' }
] as const;

// Voice Onboarding Demo Questions
export const VOICE_ONBOARDING_QUESTIONS = [
  {
    prompt: 'Tell us about yourself',
    subtitle: 'Share what makes you unique',
    minWords: 10
  },
  {
    prompt: 'What are your values and beliefs?',
    subtitle: 'What matters most to you in life?',
    minWords: 15
  },
  {
    prompt: 'Describe your ideal relationship',
    subtitle: 'What does your perfect partnership look like?',
    minWords: 20
  }
] as const;

// Personality Assessment Constants
export const USER_PERSONALITIES = {
  wise_aunty: {
    name: 'Traditional Wisdom Seeker',
    tagline: 'Values family guidance and heritage',
    emoji: '👵🏽',
    description: 'You value traditional wisdom, family guidance, and cultural heritage in decision-making',
    traits: ['Family-oriented', 'Traditional', 'Community-focused', 'Heritage-conscious']
  },
  modern_scholar: {
    name: 'Analytical Thinker',
    tagline: 'Research-driven and data-focused',
    emoji: '📚',
    description: 'You approach decisions through research, analysis, and evidence-based reasoning',
    traits: ['Analytical', 'Research-driven', 'Independent', 'Progressive']
  },
  spiritual_guide: {
    name: 'Faith-Centered Believer',
    tagline: 'Guided by prayer and spirituality',
    emoji: '🤲🏽',
    description: 'You seek spiritual guidance through prayer, reflection, and Islamic principles',
    traits: ['Spiritual', 'Faith-driven', 'Reflective', 'Prayerful']
  },
  cultural_bridge: {
    name: 'Balanced Integrator',
    tagline: 'Bridges multiple perspectives',
    emoji: '🌉',
    description: 'You balance multiple cultural perspectives, integrating tradition with modern values',
    traits: ['Adaptable', 'Open-minded', 'Multicultural', 'Balanced']
  }
} as const;

export const PERSONALITY_REVEAL_CONFIG: PersonalityRevealConfig = {
  wise_aunty: {
    icon: Heart,
    name: "The Wise Aunty",
    tagline: "Traditional warmth meets modern wisdom",
    color: "hsl(var(--primary))",
    expectations: [
      "Warm, motherly guidance with Islamic values",
      "Practical advice rooted in family wisdom",
      "Gentle nudges toward halal connections"
    ],
    sampleGreeting: "Assalamu alaikum beta! I'm so happy to guide you on this blessed journey. Let's find someone who will cherish you the way you deserve, insha'Allah. 💚"
  },
  modern_scholar: {
    icon: BookOpen,
    name: "The Modern Scholar",
    tagline: "Data-driven insights with spiritual depth",
    color: "hsl(var(--accent))",
    expectations: [
      "Evidence-based compatibility analysis",
      "Balanced modern and traditional perspectives",
      "Clear, structured guidance"
    ],
    sampleGreeting: "As-salamu alaykum! I'm here to help you make informed decisions about your future. Let's analyze compatibility factors while keeping your values at the center."
  },
  spiritual_guide: {
    icon: Sparkles,
    name: "The Spiritual Guide",
    tagline: "Faith-centered matchmaking wisdom",
    color: "hsl(var(--chart-3))",
    expectations: [
      "Dua-inspired guidance and spiritual support",
      "Emphasis on taqwa and character",
      "Reminders of Allah's plan for you"
    ],
    sampleGreeting: "Peace be upon you, dear soul. Remember, Allah has written your rizq, including your spouse. Let's journey together with trust in His perfect timing. ✨"
  },
  cultural_bridge: {
    icon: Globe,
    name: "The Cultural Bridge",
    tagline: "Navigating traditions with modern grace",
    color: "hsl(var(--chart-4))",
    expectations: [
      "Understanding of multicultural dynamics",
      "Help balancing heritage and modernity",
      "Respectful navigation of family expectations"
    ],
    sampleGreeting: "Hello! I understand the beautiful complexity of straddling cultures. Let's find someone who appreciates all the facets that make you, you. 🌍"
  }
};

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'decision_making',
    question: 'When making important life decisions, what matters most to you?',
    subtitle: 'Think about major choices like career, marriage, or life direction',
    voicePrompt: 'Tell me about what matters most when you make important life decisions',
    options: [
      { 
        text: 'Family guidance and traditional wisdom', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 1 } 
      },
      { 
        text: 'Research, data, and personal analysis', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Prayer, istikhara, and spiritual guidance', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Balancing multiple perspectives and cultures', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'relationship_values',
    question: 'What do you value most in a life partner?',
    subtitle: 'Consider the qualities that are non-negotiable for you',
    voicePrompt: 'Describe what qualities you value most in a life partner',
    options: [
      { 
        text: 'Strong family connections and traditional values', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 2 } 
      },
      { 
        text: 'Intellectual compatibility and shared ambitions', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Deep faith and spiritual alignment', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Open-mindedness and cultural adaptability', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'conflict_resolution',
    question: 'How do you prefer to resolve conflicts in relationships?',
    subtitle: 'Your natural approach to disagreements',
    voicePrompt: 'Share how you typically handle conflicts or disagreements',
    options: [
      { 
        text: 'Seek advice from family elders or community', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 1 } 
      },
      { 
        text: 'Analyze objectively and find logical solutions', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Turn to prayer and seek divine guidance', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Consider all viewpoints and find middle ground', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'lifestyle_approach',
    question: 'Which lifestyle approach resonates most with you?',
    subtitle: 'How you envision your daily life and routines',
    voicePrompt: 'Describe the lifestyle that feels most authentic to you',
    options: [
      { 
        text: 'Close-knit community with regular family gatherings', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 2 } 
      },
      { 
        text: 'Independent pursuits with focus on personal growth', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Centered around worship, dhikr, and Islamic learning', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Blend of traditional values with modern flexibility', 
        scores: { wise_aunty: 2, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  },
  {
    id: 'future_planning',
    question: 'How do you approach planning your future?',
    subtitle: 'Your mindset about long-term goals and aspirations',
    voicePrompt: 'Tell me about how you think about and plan for your future',
    options: [
      { 
        text: 'Follow the path my family and culture have laid out', 
        scores: { wise_aunty: 3, modern_scholar: 1, spiritual_guide: 2, cultural_bridge: 1 } 
      },
      { 
        text: 'Set ambitious goals with detailed action plans', 
        scores: { wise_aunty: 1, modern_scholar: 3, spiritual_guide: 1, cultural_bridge: 2 } 
      },
      { 
        text: 'Trust in Allah\'s plan and stay spiritually prepared', 
        scores: { wise_aunty: 2, modern_scholar: 1, spiritual_guide: 3, cultural_bridge: 1 } 
      },
      { 
        text: 'Create flexible plans that honor both tradition and innovation', 
        scores: { wise_aunty: 1, modern_scholar: 2, spiritual_guide: 1, cultural_bridge: 3 } 
      }
    ]
  }
];

// Cultural Profile Constants
export const CULTURAL_OPTIONS: CulturalOption[] = [
  {
    id: 'south_asian',
    label: 'South Asian',
    emoji: '🇮🇳',
    gradient: 'from-orange-500 to-green-600',
    description: 'Heritage from India, Pakistan, Bangladesh, Sri Lanka',
    commonRegions: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal'],
    commonLanguages: ['Urdu', 'Hindi', 'Bengali', 'Punjabi', 'Tamil', 'Gujarati']
  },
  {
    id: 'arab',
    label: 'Arab',
    emoji: '🇸🇦',
    gradient: 'from-emerald-600 to-teal-500',
    description: 'Heritage from Middle East and North Africa',
    commonRegions: ['Saudi Arabia', 'UAE', 'Egypt', 'Jordan', 'Lebanon', 'Morocco'],
    commonLanguages: ['Arabic', 'French', 'Berber']
  },
  {
    id: 'western_convert',
    label: 'Western Convert',
    emoji: '🌍',
    gradient: 'from-blue-500 to-purple-600',
    description: 'Reverted to Islam from Western background',
    commonRegions: ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'],
    commonLanguages: ['English', 'French', 'German', 'Spanish']
  },
  {
    id: 'african',
    label: 'African',
    emoji: '🇳🇬',
    gradient: 'from-yellow-500 to-red-600',
    description: 'Heritage from Sub-Saharan Africa',
    commonRegions: ['Nigeria', 'Somalia', 'Senegal', 'Kenya', 'Mali', 'Ethiopia'],
    commonLanguages: ['Swahili', 'Somali', 'Hausa', 'Wolof', 'Amharic']
  },
  {
    id: 'southeast_asian',
    label: 'Southeast Asian',
    emoji: '🇲🇾',
    gradient: 'from-red-500 to-yellow-500',
    description: 'Heritage from Malaysia, Indonesia, Brunei, Philippines',
    commonRegions: ['Malaysia', 'Indonesia', 'Brunei', 'Singapore', 'Thailand'],
    commonLanguages: ['Malay', 'Indonesian', 'Tagalog', 'Thai']
  },
  {
    id: 'other',
    label: 'Other/Mixed',
    emoji: '🌏',
    gradient: 'from-pink-500 to-indigo-600',
    description: 'Multiple heritages or other cultural background',
    commonRegions: [],
    commonLanguages: []
  }
];

export const COMMON_LANGUAGES = [
  'Arabic', 'Urdu', 'English', 'Hindi', 'Bengali', 'Punjabi',
  'Malay', 'Indonesian', 'Turkish', 'Persian', 'French',
  'Swahili', 'Somali', 'Tamil', 'Gujarati', 'Spanish'
] as const;