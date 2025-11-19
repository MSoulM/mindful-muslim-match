import React from 'react';
import { Check } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: string;
}

export const DepthAchievements: React.FC = () => {
  const achievements: Achievement[] = [
    {
      id: 'first_emotional',
      title: 'Heart Opener',
      description: 'Shared your first emotional story',
      icon: '💜',
      unlocked: true
    },
    {
      id: 'five_transformational',
      title: 'Growth Guide',
      description: 'Shared 5 transformational stories',
      icon: '✨',
      unlocked: false,
      progress: '3/5'
    },
    {
      id: 'depth_master',
      title: 'Depth Master',
      description: 'Average depth level above 3.0',
      icon: '🌊',
      unlocked: false
    },
    {
      id: 'consistent_sharer',
      title: 'Consistent Voice',
      description: 'Shared meaningfully for 7 days in a row',
      icon: '🔥',
      unlocked: true
    },
    {
      id: 'context_king',
      title: 'Context Champion',
      description: 'Added context to 20 different shares',
      icon: '🎯',
      unlocked: false,
      progress: '14/20'
    },
    {
      id: 'authentic_storyteller',
      title: 'Authentic Storyteller',
      description: 'All shares above surface level',
      icon: '📖',
      unlocked: false
    }
  ];
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Depth Achievements</h3>
        <p className="text-sm text-muted-foreground">
          Unlock badges by sharing authentically and meaningfully
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all duration-500 ${
              achievement.unlocked 
                ? 'border-primary bg-primary/10 scale-100' 
                : 'border-border bg-card opacity-60 hover:opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{achievement.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{achievement.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {achievement.description}
                </div>
                {achievement.progress && !achievement.unlocked && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-muted-foreground">
                        Progress: {achievement.progress}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ 
                          width: `${(parseInt(achievement.progress.split('/')[0]) / parseInt(achievement.progress.split('/')[1])) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {achievement.unlocked && (
                <div className="text-primary animate-in zoom-in-50 duration-600">
                  <div className="rounded-full bg-primary p-1">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
