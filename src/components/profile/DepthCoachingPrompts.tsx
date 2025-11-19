import React from 'react';
import { Sparkles } from 'lucide-react';

interface DepthCoachingPromptsProps {
  currentDepth: number;
  topic: string;
}

export const DepthCoachingPrompts: React.FC<DepthCoachingPromptsProps> = ({ 
  currentDepth, 
  topic 
}) => {
  
  const getCoachingPrompt = () => {
    switch(currentDepth) {
      case 1:
        return {
          title: "Go a bit deeper? 💭",
          suggestions: [
            `Why is ${topic} important to you?`,
            `What does ${topic} mean in your life?`,
            `How did you discover your interest in ${topic}?`
          ],
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-300 dark:border-blue-800'
        };
      case 2:
        return {
          title: "Share the feeling 💜",
          suggestions: [
            `How does ${topic} make you feel?`,
            `What emotions do you associate with ${topic}?`,
            `Share a memory connected to ${topic}`
          ],
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          borderColor: 'border-purple-300 dark:border-purple-800'
        };
      case 3:
        return {
          title: "Beautiful! Share the transformation? ✨",
          suggestions: [
            `How has ${topic} changed you?`,
            `What have you learned from ${topic}?`,
            `How were you different before ${topic}?`
          ],
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          borderColor: 'border-amber-300 dark:border-amber-800'
        };
      case 4:
        return null;
    }
  };
  
  const prompt = getCoachingPrompt();
  
  if (!prompt) {
    return (
      <div className="p-4 rounded-lg border-2 border-primary bg-primary/10 animate-in fade-in-50 duration-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <div className="font-semibold text-foreground">
              Beautifully shared!
            </div>
            <div className="text-sm text-muted-foreground">
              Your authentic story will resonate deeply with matches
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 rounded-lg border-2 ${prompt.borderColor} ${prompt.bgColor} transition-all animate-in fade-in-50 duration-500`}>
      <div className="font-semibold text-foreground mb-2">{prompt.title}</div>
      <div className="text-sm text-muted-foreground mb-3">
        Optional: These prompts can help you share more meaningfully:
      </div>
      <div className="space-y-2">
        {prompt.suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => {
              navigator.clipboard.writeText(suggestion);
            }}
            className="block w-full text-left px-3 py-2 rounded bg-background hover:bg-accent text-sm text-foreground transition-colors"
          >
            💡 {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
