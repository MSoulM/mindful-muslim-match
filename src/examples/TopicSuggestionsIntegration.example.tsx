/**
 * Topic Suggestions Integration Examples
 * Shows how to use the intelligent topic suggestion engine
 */

import { useState } from 'react';
import { TopicSuggestionsPanel, CompactTopicSuggestion } from '@/components/profile/TopicSuggestionsPanel';
import { 
  generateTopicSuggestions,
  getTopSuggestions,
  getSuggestionsForCategory,
  updateCompletionStreak,
  type UserContext,
  type TopicSuggestion
} from '@/utils/topicSuggestions';
import { toast } from '@/hooks/use-toast';

// ==================== EXAMPLE 1: FULL SUGGESTIONS PANEL ON PROFILE ====================

export const ProfileDashboardExample = () => {
  // Mock user context (in real app, get from profile completion data)
  const userContext: UserContext = {
    overallCompletion: 67,
    categoryCompletions: {
      values_beliefs: 74,
      interests_hobbies: 50,
      relationship_goals: 85,
      lifestyle_personality: 60,
      family_cultural: 40,
    },
    coveredTopics: [
      'vb_religious_practice',
      'vb_spiritual_values',
      'vb_community_involvement',
      'rg_marriage_timeline',
      'rg_children_family',
      'fc_family_involvement'
    ],
    missingTopics: [
      'vb_islamic_knowledge',
      'rg_lifestyle_vision',
      'fc_cultural_traditions'
    ],
    recentActivity: {
      lastPostDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      contentTypesUsed: ['text', 'photo'],
      mostActiveCategory: 'values_beliefs'
    }
  };

  const handleAddContent = (topicId: string, topicName: string, prompts: string[]) => {
    console.log('Opening content modal for:', topicName);
    console.log('Suggested prompts:', prompts);
    
    // Update streak when user starts adding content
    updateCompletionStreak();
    
    // Open content upload modal with category pre-selected
    // and topic hints displayed
    toast({
      title: "Add Content",
      description: `Opening content modal for: ${topicName}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile Dashboard</h1>
      
      {/* Full suggestions panel - shows top 3 prioritized suggestions */}
      <TopicSuggestionsPanel
        userContext={userContext}
        maxSuggestions={3}
        showOnlyHighPriority={false}
        onAddContent={handleAddContent}
        variant="full"
      />
    </div>
  );
};

// ==================== EXAMPLE 2: HIGH-PRIORITY ONLY (ABOVE CATEGORY CARDS) ====================

export const CompactSuggestionsExample = () => {
  const userContext: UserContext = {
    overallCompletion: 67,
    categoryCompletions: {
      values_beliefs: 74,
      relationship_goals: 85,
      family_cultural: 40,
    },
    coveredTopics: ['vb_religious_practice', 'vb_spiritual_values'],
    missingTopics: ['vb_islamic_knowledge', 'fc_cultural_traditions'],
    recentActivity: {
      lastPostDate: new Date(),
      contentTypesUsed: ['text'],
      mostActiveCategory: 'values_beliefs'
    }
  };

  // Get only high-priority suggestions
  const highPrioritySuggestions = getTopSuggestions(userContext, 2, true);

  return (
    <div className="space-y-3">
      {highPrioritySuggestions.map(suggestion => (
        <CompactTopicSuggestion
          key={suggestion.topicId}
          suggestion={suggestion}
          onAddContent={(topicId, topicName, prompts) => {
            console.log('Add content for:', topicName);
          }}
        />
      ))}
    </div>
  );
};

// ==================== EXAMPLE 3: CATEGORY-SPECIFIC SUGGESTIONS ====================

export const CategorySuggestionsExample = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('values_beliefs');

  const userContext: UserContext = {
    overallCompletion: 67,
    categoryCompletions: {
      values_beliefs: 74,
      relationship_goals: 85,
    },
    coveredTopics: ['vb_religious_practice', 'vb_spiritual_values', 'vb_community_involvement'],
    missingTopics: ['vb_islamic_knowledge'],
    recentActivity: {
      contentTypesUsed: ['text', 'photo'],
    }
  };

  // Get suggestions for specific category
  const categorySuggestions = expandedCategory
    ? getSuggestionsForCategory(userContext, expandedCategory as any, 2)
    : [];

  return (
    <div className="space-y-4">
      {/* Show suggestions in expanded category card */}
      {expandedCategory && categorySuggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">
            Suggested topics for this category:
          </h4>
          <div className="space-y-2">
            {categorySuggestions.map(suggestion => (
              <div
                key={suggestion.topicId}
                className="bg-white rounded-md p-3 border border-blue-200"
              >
                <p className="text-sm font-semibold text-foreground">{suggestion.topicName}</p>
                <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== EXAMPLE 4: POST-SUBMISSION SUGGESTION ====================

export const PostSuccessSuggestionExample = () => {
  const userContext: UserContext = {
    overallCompletion: 67,
    categoryCompletions: { values_beliefs: 74 },
    coveredTopics: ['vb_religious_practice'],
    missingTopics: ['vb_spiritual_values', 'vb_community_involvement'],
    recentActivity: {
      lastPostDate: new Date(),
      contentTypesUsed: ['text'],
    }
  };

  // Get next suggested topic
  const nextSuggestion = getTopSuggestions(userContext, 1, false)[0];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Success message */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-600 mb-2">Content Added! 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Your profile has been updated
        </p>
      </div>

      {/* Next suggestion */}
      {nextSuggestion && (
        <div className="border-t border-border pt-6">
          <h3 className="text-base font-bold text-foreground mb-3">
            What's Next?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            While you're here, how about covering another topic?
          </p>
          
          <CompactTopicSuggestion
            suggestion={nextSuggestion}
            onAddContent={(topicId, topicName) => {
              console.log('Add another topic:', topicName);
            }}
          />
        </div>
      )}
    </div>
  );
};

// ==================== EXAMPLE 5: PROGRAMMATIC USAGE ====================

export const ProgrammaticExample = () => {
  const userContext: UserContext = {
    overallCompletion: 67,
    categoryCompletions: {
      values_beliefs: 74,
      relationship_goals: 65,
    },
    coveredTopics: ['vb_religious_practice', 'rg_marriage_timeline'],
    missingTopics: ['vb_islamic_knowledge', 'rg_children_family', 'rg_lifestyle_vision'],
    recentActivity: {
      lastPostDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      contentTypesUsed: ['text'],
    }
  };

  // Generate all suggestions
  const allSuggestions = generateTopicSuggestions(userContext);
  
  console.log('Total suggestions:', allSuggestions.length);
  console.log('High priority:', allSuggestions.filter(s => s.priority === 'high').length);
  console.log('Top suggestion:', allSuggestions[0]);

  // Example: Send email with top 3 suggestions
  const emailSuggestions = getTopSuggestions(userContext, 3, false);
  
  // Example: Check if user should see urgent prompt
  const urgentSuggestion = allSuggestions.find(s => 
    s.priority === 'high' && s.reason.includes('ChaiChat')
  );

  if (urgentSuggestion) {
    console.log('Show urgent banner:', urgentSuggestion.reason);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Programmatic Examples</h2>
      <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
        {JSON.stringify({ allSuggestions, urgentSuggestion }, null, 2)}
      </pre>
    </div>
  );
};

// ==================== USAGE SUMMARY ====================

/**
 * INTEGRATION POINTS:
 * 
 * 1. Profile Dashboard (Top)
 *    - Use: <TopicSuggestionsPanel variant="full" maxSuggestions={3} />
 *    - Shows top 3 prioritized suggestions above category cards
 * 
 * 2. Category Expanded View
 *    - Use: getSuggestionsForCategory(userContext, category, 2)
 *    - Show 1-2 suggestions specific to expanded category
 *    - Display in Factor 3 section
 * 
 * 3. Post Success Modal
 *    - Use: getTopSuggestions(userContext, 1)
 *    - Show "What's next?" with 1 compact suggestion
 *    - Encourage momentum
 * 
 * 4. Weekly Email
 *    - Use: getTopSuggestions(userContext, 3, true)
 *    - Include top 3 high-priority suggestions
 *    - Deep links to content upload
 * 
 * 5. Urgent Banner (Close to 70%)
 *    - Check: userContext.overallCompletion >= 65 && < 70
 *    - Show: <CompactTopicSuggestion /> at top
 *    - Highlight path to ChaiChat unlock
 */
