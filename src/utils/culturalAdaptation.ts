export type CulturalVariant = 
  | 'South Asian' 
  | 'Arab' 
  | 'Western Convert' 
  | 'African' 
  | 'Southeast Asian' 
  | 'Other';

interface CulturalPhrases {
  greetings: string[];
  affirmations: string[];
  encouragement: string[];
  transitions: string[];
  closings: string[];
  terms: string[];
}

/**
 * Cultural phrase libraries for different backgrounds
 */
export const culturalPhrases: Record<CulturalVariant, CulturalPhrases> = {
  'South Asian': {
    greetings: ['Assalamu alaikum beta', 'Beta, how are you?', 'Salaam beta'],
    affirmations: ['MashaAllah ji', 'SubhanAllah beta', 'Alhamdulillah ji'],
    encouragement: [
      'Do not worry beta, Allah is with you',
      'Have sabr, beta. Good things take time',
      'Trust in Allah, beta. He knows best'
    ],
    transitions: ['Beta, listen', 'You see beta', 'Let me tell you something beta'],
    closings: ['May Allah bless you beta', 'InshaAllah all will be well beta', 'Keep me in your duas beta'],
    terms: ['beta', 'ji', 'rishta', 'namaz', 'dua']
  },
  'Arab': {
    greetings: ['As-salamu alaykum', 'Marhaba akhi/ukhti', 'Ahlan wa sahlan'],
    affirmations: ['MashaAllah', 'Alhamdulillah', 'SubhanAllah', 'Allahu Akbar'],
    encouragement: [
      'Have tawakkul, Allah is the best of planners',
      'Be patient, sadaqah brings barakah',
      'Make dua, Allah hears all'
    ],
    transitions: ['Listen akhi/ukhti', 'You see', 'Wallahi'],
    closings: ['Fi amanillah', 'Barakallahu fik', 'May Allah grant you khair'],
    terms: ['akhi', 'ukhti', 'tawakkul', 'barakah', 'khair', 'sadaqah', 'wallahi']
  },
  'Western Convert': {
    greetings: ['Peace be upon you', 'Hello, my friend', 'Greetings'],
    affirmations: [
      'God willing (InshaAllah)',
      'Praise be to God (Alhamdulillah)',
      'Glory be to God (SubhanAllah)'
    ],
    encouragement: [
      'Have patience (sabr) - this means steadfastness in faith',
      'Trust in God (tawakkul) - putting your affairs in His hands',
      'Remember, every soul will taste death - focus on what truly matters'
    ],
    transitions: ['Let me explain', 'Here is what I mean', 'To put it simply'],
    closings: [
      'May God bless you',
      'God willing (InshaAllah), things will work out',
      'Peace and blessings'
    ],
    terms: ['(InshaAllah)', '(Alhamdulillah)', '(SubhanAllah)', 'sabr (patience)', 'tawakkul (trust)']
  },
  'African': {
    greetings: ['Assalamu alaikum my brother/sister', 'Peace be with you', 'Greetings in Islam'],
    affirmations: ['MashaAllah', 'Alhamdulillah', 'By the grace of Allah'],
    encouragement: [
      'The community is here for you',
      'Have faith, Allah sees your efforts',
      'Together in faith, we are stronger'
    ],
    transitions: ['Let us talk about', 'Consider this', 'From my heart to yours'],
    closings: [
      'May Allah guide us all',
      'Stay strong in your faith, my brother/sister',
      'The ummah supports you'
    ],
    terms: ['brother', 'sister', 'ummah', 'community', 'family']
  },
  'Southeast Asian': {
    greetings: ['Assalamu alaikum', 'Selamat datang', 'Peace be upon you'],
    affirmations: ['Alhamdulillah', 'MashaAllah', 'SubhanAllah'],
    encouragement: [
      'Please be patient, good things come to those who wait',
      'With respect, may I suggest you trust in Allah',
      'Humbly, I advise that you make dua'
    ],
    transitions: ['If I may say', 'With your permission', 'Respectfully'],
    closings: [
      'May Allah bless you and your family',
      'InshaAllah everything will be fine',
      'Take care and stay safe'
    ],
    terms: ['respectfully', 'humbly', 'if I may', 'with permission', 'please']
  },
  'Other': {
    greetings: ['Assalamu alaikum', 'Peace be upon you', 'Hello'],
    affirmations: ['MashaAllah', 'Alhamdulillah', 'SubhanAllah'],
    encouragement: [
      'Have patience, Allah has a plan',
      'Trust in Allah, He knows best',
      'Make dua, Allah listens'
    ],
    transitions: ['Consider this', 'Let me share', 'Here is my thought'],
    closings: ['May Allah bless you', 'InshaAllah all will be well', 'Peace'],
    terms: ['InshaAllah', 'MashaAllah', 'Alhamdulillah']
  }
};

/**
 * Get cultural color scheme for badges
 */
export const getCulturalColor = (variant: CulturalVariant): string => {
  const colors: Record<CulturalVariant, string> = {
    'South Asian': 'bg-orange-100 text-orange-700 border-orange-200',
    'Arab': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Western Convert': 'bg-blue-100 text-blue-700 border-blue-200',
    'African': 'bg-amber-100 text-amber-700 border-amber-200',
    'Southeast Asian': 'bg-purple-100 text-purple-700 border-purple-200',
    'Other': 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[variant];
};

/**
 * Get cultural icon/emoji for variant
 */
export const getCulturalIcon = (variant: CulturalVariant): string => {
  const icons: Record<CulturalVariant, string> = {
    'South Asian': '🪔',
    'Arab': '🕌',
    'Western Convert': '📖',
    'African': '🌍',
    'Southeast Asian': '🌺',
    'Other': '🌐'
  };
  return icons[variant];
};

/**
 * Apply cultural variant to a message
 * This injects culturally-appropriate phrases into the message
 */
export const applyCulturalVariant = (
  message: string, 
  culturalVariant: CulturalVariant
): string => {
  if (!culturalVariant || culturalVariant === 'Other') {
    return message;
  }

  const phrases = culturalPhrases[culturalVariant];
  let adaptedMessage = message;

  // Add cultural greeting at start if message starts with greeting-like words
  if (/^(hi|hello|hey|greetings)/i.test(message)) {
    const greeting = phrases.greetings[Math.floor(Math.random() * phrases.greetings.length)];
    adaptedMessage = adaptedMessage.replace(/^(hi|hello|hey|greetings)/i, greeting);
  }

  // Inject affirmations after positive statements
  if (/great|wonderful|excellent|amazing|good/i.test(message)) {
    const affirmation = phrases.affirmations[Math.floor(Math.random() * phrases.affirmations.length)];
    adaptedMessage = adaptedMessage.replace(
      /(great|wonderful|excellent|amazing|good)/i,
      `$1 - ${affirmation}`
    );
  }

  // Add encouragement before suggestions
  if (/you should|you could|I suggest|I recommend/i.test(message)) {
    const encouragement = phrases.encouragement[Math.floor(Math.random() * phrases.encouragement.length)];
    adaptedMessage = `${encouragement}. ${adaptedMessage}`;
  }

  // Add transition phrases for longer messages
  if (message.length > 150 && message.includes('.')) {
    const transition = phrases.transitions[Math.floor(Math.random() * phrases.transitions.length)];
    const sentences = adaptedMessage.split('. ');
    if (sentences.length > 2) {
      sentences.splice(Math.floor(sentences.length / 2), 0, transition);
      adaptedMessage = sentences.join('. ');
    }
  }

  // Add cultural closing for messages with advice or guidance
  if (/advice|guidance|suggestion|recommend/i.test(message)) {
    const closing = phrases.closings[Math.floor(Math.random() * phrases.closings.length)];
    adaptedMessage = `${adaptedMessage} ${closing}`;
  }

  return adaptedMessage;
};

/**
 * Get sample culturally-adapted messages for preview
 */
export const getCulturalSampleMessages = (variant: CulturalVariant): string[] => {
  const phrases = culturalPhrases[variant];
  
  return [
    `${phrases.greetings[0]}! I hope you are doing well today.`,
    `${phrases.affirmations[0]}! That is wonderful progress you are making.`,
    phrases.encouragement[0],
    `${phrases.transitions[0]}, I think this match could be really good for you.`,
    phrases.closings[0]
  ];
};

/**
 * Check if message contains cultural terms
 */
export const hasCulturalTerms = (message: string, variant: CulturalVariant): boolean => {
  const phrases = culturalPhrases[variant];
  return phrases.terms.some(term => 
    message.toLowerCase().includes(term.toLowerCase())
  );
};
