/**
 * Intelligent Topic Suggestion Engine
 * Provides smart, contextual suggestions for missing topics
 */

import {
  TOPIC_REQUIREMENTS,
  type TopicRequirement,
  type CategoryType
} from '@/config/topicRequirements';

// ==================== INTERFACES ====================

export interface TopicSuggestion {
  topicId: string;
  topicName: string;
  category: CategoryType;
  categoryName: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  prompts: string[];
  estimatedTime: number; // minutes
  impactOnCompletion: number; // percentage points
}

export interface UserContext {
  overallCompletion: number;
  categoryCompletions: Record<string, number>;
  coveredTopics: string[];
  missingTopics: string[];
  recentActivity: {
    lastPostDate?: Date;
    contentTypesUsed: string[];
    mostActiveCategory?: string;
  };
  userGoals?: {
    targetCompletion: number;
    targetDate?: Date;
  };
}

export interface TopicReminder {
  topicId: string;
  reminderDate: Date;
  frequency: 'once' | 'daily' | 'weekly';
  dismissed: boolean;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get category weight for overall completion calculation
 */
function getCategoryWeight(category: CategoryType): number {
  const weights: Record<CategoryType, number> = {
    values_beliefs: 0.25,
    relationship_goals: 0.25,
    lifestyle_personality: 0.20,
    interests_hobbies: 0.15,
    family_cultural: 0.15
  };
  return weights[category] || 0.20;
}

/**
 * Get all topic requirements across all categories
 */
function getAllTopicRequirements(): TopicRequirement[] {
  return TOPIC_REQUIREMENTS.flatMap(config => config.topics);
}

/**
 * Get category name from category type
 */
function getCategoryName(category: CategoryType): string {
  const config = TOPIC_REQUIREMENTS.find(c => c.category === category);
  return config?.categoryName || category;
}

// ==================== PRIORITY CALCULATION ====================

/**
 * Calculate suggestion priority based on user context
 * HIGH: Close to 70% threshold, last topic in category, category < 70%
 * MEDIUM: Category 70-85%, user recently active
 * LOW: All other cases
 */
export function calculateSuggestionPriority(
  topic: TopicRequirement,
  userContext: UserContext
): 'high' | 'medium' | 'low' {
  const categoryCompletion = userContext.categoryCompletions[topic.category] || 0;
  
  // Count missing topics in this category
  const missingInCategory = userContext.missingTopics.filter(
    t => t.startsWith(topic.category.substring(0, 2)) // Match by prefix (vb_, rg_, fc_)
  ).length;

  // HIGH PRIORITY: Last topic to reach 70% in category
  if (categoryCompletion < 70 && missingInCategory === 1) {
    return 'high';
  }

  // HIGH PRIORITY: User is close to 70% overall (ChaiChat threshold)
  if (userContext.overallCompletion >= 65 && userContext.overallCompletion < 70) {
    return 'high';
  }

  // HIGH PRIORITY: Category significantly below target
  if (categoryCompletion < 60) {
    return 'high';
  }

  // MEDIUM PRIORITY: Category between 70-85%
  if (categoryCompletion >= 70 && categoryCompletion < 85) {
    return 'medium';
  }

  // MEDIUM PRIORITY: User posted recently (active)
  if (userContext.recentActivity.lastPostDate) {
    const daysSinceLastPost = Math.floor(
      (Date.now() - userContext.recentActivity.lastPostDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastPost < 3) {
      return 'medium';
    }
  }

  // LOW PRIORITY: Everything else
  return 'low';
}

// ==================== REASON GENERATION ====================

/**
 * Generate contextual, personalized reason for suggesting a topic
 */
export function generateSuggestionReason(
  topic: TopicRequirement,
  userContext: UserContext,
  priority: 'high' | 'medium' | 'low'
): string {
  const categoryName = getCategoryName(topic.category);
  const categoryCompletion = userContext.categoryCompletions[topic.category] || 0;

  // High priority reasons (urgent, actionable)
  if (priority === 'high') {
    // Close to ChaiChat threshold
    if (userContext.overallCompletion >= 65 && userContext.overallCompletion < 70) {
      const gap = 70 - userContext.overallCompletion;
      return `You're just ${gap.toFixed(1)}% away from unlocking ChaiChat! Covering this topic will help you reach 70%.`;
    }

    // Last missing topic in category
    const missingCount = userContext.missingTopics.filter(
      t => t.startsWith(topic.category.substring(0, 2))
    ).length;
    
    if (missingCount === 1) {
      return `This is the last missing topic in ${categoryName}. Complete it to fully cover this category!`;
    }

    // Category below 70%
    if (categoryCompletion < 70) {
      return `${categoryName} is at ${categoryCompletion}%. Covering this topic will boost it significantly.`;
    }

    // Category significantly behind
    return `${categoryName} needs attention. Completing this topic will strengthen your profile.`;
  }

  // Medium priority reasons (encouraging, beneficial)
  if (priority === 'medium') {
    return `Adding content about ${topic.name} will strengthen your ${categoryName} profile and improve match quality.`;
  }

  // Low priority reasons (gentle, optional)
  return `When you're ready, share about ${topic.name} to build a more complete profile.`;
}

// ==================== IMPACT CALCULATION ====================

/**
 * Calculate impact on overall completion percentage
 * Considers topic weight within category, factor weight, and category weight
 */
export function calculateImpactOnCompletion(
  topic: TopicRequirement,
  userContext: UserContext
): number {
  const categoryConfig = TOPIC_REQUIREMENTS.find(
    c => c.category === topic.category
  );

  if (!categoryConfig || categoryConfig.topics.length === 0) return 0;

  // Calculate weights
  const topicWeight = 1 / categoryConfig.topics.length; // e.g., 1/4 = 0.25 (25%)
  const categoryWeight = getCategoryWeight(topic.category); // e.g., 0.25 (25%)
  const factor3Weight = 0.30; // Factor 3 (Topic Coverage) is 30% of category score

  // Impact = topic weight × factor weight × category weight × 100
  const impact = topicWeight * factor3Weight * categoryWeight * 100;

  // Round to 1 decimal place
  return Math.round(impact * 10) / 10;
}

// ==================== TIME ESTIMATION ====================

/**
 * Estimate time to complete a topic (in minutes)
 * Based on topic complexity and typical response length
 */
export function estimateTimeToComplete(topic: TopicRequirement): number {
  // Predefined estimates based on topic complexity
  const timeEstimates: Record<string, number> = {
    // Values & Beliefs (5-15 min)
    vb_religious_practice: 7,
    vb_spiritual_values: 12,
    vb_community_involvement: 8,
    vb_islamic_knowledge: 12,
    
    // Relationship Goals (5-10 min)
    rg_marriage_timeline: 5,
    rg_children_family: 8,
    rg_lifestyle_vision: 10,
    
    // Family & Cultural (8-10 min)
    fc_family_involvement: 8,
    fc_cultural_traditions: 10,
  };

  return timeEstimates[topic.id] || 10; // Default: 10 minutes
}

// ==================== PROMPT SELECTION ====================

/**
 * Select best prompts for a topic based on user context
 * More active users get more detailed prompts
 */
export function selectBestPrompts(
  topic: TopicRequirement,
  userContext: UserContext,
  count: number = 3
): string[] {
  let prompts = [...topic.prompts];

  // If user is very active, suggest more specific/detailed prompts
  if (userContext.recentActivity.lastPostDate) {
    const daysSinceLastPost = Math.floor(
      (Date.now() - userContext.recentActivity.lastPostDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPost < 3) {
      // Active user: prioritize longer, more detailed prompts
      prompts = prompts.sort((a, b) => b.length - a.length);
    } else {
      // Less active: prioritize shorter, easier prompts
      prompts = prompts.sort((a, b) => a.length - b.length);
    }
  }

  // Return top N prompts
  return prompts.slice(0, count);
}

// ==================== MAIN SUGGESTION GENERATOR ====================

/**
 * Generate prioritized topic suggestions for user
 * Returns sorted array of suggestions (high priority first)
 */
export function generateTopicSuggestions(
  userContext: UserContext
): TopicSuggestion[] {
  const suggestions: TopicSuggestion[] = [];

  // Get all topic requirements
  const allTopics = getAllTopicRequirements();

  // Generate suggestion for each missing topic
  allTopics.forEach(topic => {
    // Skip if already covered
    if (userContext.coveredTopics.includes(topic.id)) {
      return;
    }

    const priority = calculateSuggestionPriority(topic, userContext);
    const reason = generateSuggestionReason(topic, userContext, priority);
    const prompts = selectBestPrompts(topic, userContext);
    const estimatedTime = estimateTimeToComplete(topic);
    const impact = calculateImpactOnCompletion(topic, userContext);

    suggestions.push({
      topicId: topic.id,
      topicName: topic.name,
      category: topic.category,
      categoryName: getCategoryName(topic.category),
      priority,
      reason,
      prompts,
      estimatedTime,
      impactOnCompletion: impact
    });
  });

  // Sort by priority (high > medium > low) then by impact
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

    if (priorityDiff !== 0) return priorityDiff;

    // Same priority: sort by impact
    return b.impactOnCompletion - a.impactOnCompletion;
  });
}

/**
 * Get top N suggestions for display
 */
export function getTopSuggestions(
  userContext: UserContext,
  count: number = 3,
  onlyHighPriority: boolean = false
): TopicSuggestion[] {
  const allSuggestions = generateTopicSuggestions(userContext);
  
  const filtered = onlyHighPriority
    ? allSuggestions.filter(s => s.priority === 'high')
    : allSuggestions;

  return filtered.slice(0, count);
}

/**
 * Get suggestions for specific category
 */
export function getSuggestionsForCategory(
  userContext: UserContext,
  category: CategoryType,
  count: number = 3
): TopicSuggestion[] {
  const allSuggestions = generateTopicSuggestions(userContext);
  
  return allSuggestions
    .filter(s => s.category === category)
    .slice(0, count);
}

// ==================== REMINDER SYSTEM ====================

const REMINDER_STORAGE_KEY = 'topic_reminders';

/**
 * Schedule a reminder for a topic
 */
export function scheduleTopicReminder(
  topicId: string,
  frequency: 'once' | 'daily' | 'weekly' = 'once'
): void {
  const reminders = getReminders();
  
  const newReminder: TopicReminder = {
    topicId,
    reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    frequency,
    dismissed: false
  };

  reminders.push(newReminder);
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
}

/**
 * Get all reminders from localStorage
 */
export function getReminders(): TopicReminder[] {
  const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
  if (!stored) return [];

  try {
    const reminders = JSON.parse(stored);
    // Convert date strings back to Date objects
    return reminders.map((r: any) => ({
      ...r,
      reminderDate: new Date(r.reminderDate)
    }));
  } catch {
    return [];
  }
}

/**
 * Check if reminder should be shown
 */
export function shouldShowReminder(reminder: TopicReminder): boolean {
  if (reminder.dismissed) return false;
  if (new Date() < reminder.reminderDate) return false;
  return true;
}

/**
 * Dismiss a reminder
 */
export function dismissReminder(topicId: string): void {
  const reminders = getReminders();
  const updated = reminders.map(r => 
    r.topicId === topicId ? { ...r, dismissed: true } : r
  );
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Get active reminders (not dismissed, past reminder date)
 */
export function getActiveReminders(): TopicReminder[] {
  return getReminders().filter(shouldShowReminder);
}

// ==================== GAMIFICATION ====================

const STREAK_STORAGE_KEY = 'topic_completion_streak';

export interface CompletionStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: Date;
  topicsCompletedThisWeek: number;
}

/**
 * Get current streak data
 */
export function getCompletionStreak(): CompletionStreak {
  const stored = localStorage.getItem(STREAK_STORAGE_KEY);
  if (!stored) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: new Date(),
      topicsCompletedThisWeek: 0
    };
  }

  try {
    const streak = JSON.parse(stored);
    return {
      ...streak,
      lastCompletionDate: new Date(streak.lastCompletionDate)
    };
  } catch {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: new Date(),
      topicsCompletedThisWeek: 0
    };
  }
}

/**
 * Update streak when user completes a topic
 */
export function updateCompletionStreak(): void {
  const streak = getCompletionStreak();
  const today = new Date();
  const lastCompletion = streak.lastCompletionDate;
  
  // Calculate days since last completion
  const daysSince = Math.floor(
    (today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = streak.currentStreak;
  
  if (daysSince === 0) {
    // Same day - don't increment streak, but count topics
    newStreak = streak.currentStreak;
  } else if (daysSince === 1) {
    // Next day - increment streak
    newStreak = streak.currentStreak + 1;
  } else {
    // Streak broken - reset to 1
    newStreak = 1;
  }

  // Update longest streak
  const longestStreak = Math.max(newStreak, streak.longestStreak);

  // Count topics this week
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const topicsThisWeek = lastCompletion >= weekStart 
    ? streak.topicsCompletedThisWeek + 1 
    : 1;

  const updated: CompletionStreak = {
    currentStreak: newStreak,
    longestStreak,
    lastCompletionDate: today,
    topicsCompletedThisWeek: topicsThisWeek
  };

  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Get streak message for motivation
 */
export function getStreakMessage(): string | null {
  const streak = getCompletionStreak();
  
  if (streak.currentStreak >= 3) {
    return `${streak.currentStreak} days in a row covering topics! 🔥`;
  }
  
  if (streak.topicsCompletedThisWeek >= 3) {
    return `You've covered ${streak.topicsCompletedThisWeek} topics this week! 🎯`;
  }
  
  return null;
}
