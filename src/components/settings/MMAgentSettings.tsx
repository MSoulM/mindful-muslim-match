import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X, Heart, BookOpen, Sparkles, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';

interface MMAgentSettingsProps {
  personalityType: UserPersonalityType;
  daysAgo?: number;
}

const personalityConfig = {
  wise_aunty: {
    icon: Heart,
    name: "The Wise Aunty",
    color: "hsl(var(--primary))",
  },
  modern_scholar: {
    icon: BookOpen,
    name: "The Modern Scholar",
    color: "hsl(var(--accent))",
  },
  spiritual_guide: {
    icon: Sparkles,
    name: "The Spiritual Guide",
    color: "hsl(var(--chart-3))",
  },
  cultural_bridge: {
    icon: Globe,
    name: "The Cultural Bridge",
    color: "hsl(var(--chart-4))",
  }
};

const getPlaceholderByPersonality = (personalityType: UserPersonalityType) => {
  switch(personalityType) {
    case 'wise_aunty': 
      return 'e.g., Auntie Sarah, Khalto Maryam';
    case 'modern_scholar': 
      return 'e.g., Dr. Hassan, Professor Amina';
    case 'spiritual_guide': 
      return 'e.g., Sister Fatima, Brother Omar';
    case 'cultural_bridge': 
      return 'e.g., Mentor Zara, Guide Rashid';
    default: 
      return 'Enter a name';
  }
};

export function MMAgentSettings({ personalityType, daysAgo = 0 }: MMAgentSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [tempName, setTempName] = useState('');
  
  const config = personalityConfig[personalityType];
  const IconComponent = config.icon;

  // Load agent name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('mmAgentCustomName');
    if (savedName) {
      setAgentName(savedName);
      setTempName(savedName);
    }
  }, []);

  const handleSave = () => {
    const trimmedName = tempName.trim();
    setAgentName(trimmedName);
    localStorage.setItem('mmAgentCustomName', trimmedName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(agentName);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempName(agentName);
    setIsEditing(true);
  };

  return (
    <Card className="p-6 border-2" style={{ borderColor: config.color }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Your {config.name}</h3>
        {daysAgo > 0 && (
          <span className="text-sm text-muted-foreground">
            Assigned {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
          </span>
        )}
      </div>
      
      {/* Avatar and Name Section */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
        >
          <IconComponent className="w-8 h-8" style={{ color: config.color }} />
        </motion.div>
        
        {/* Name Display/Edit */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="display"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg font-medium text-foreground truncate">
                  {agentName || `Your ${config.name}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  className="flex-shrink-0 h-8 w-8"
                  aria-label="Edit agent name"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2"
              >
                <Input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={getPlaceholderByPersonality(personalityType)}
                  maxLength={30}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                  className="flex-1"
                />
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleSave}
                  className="flex-shrink-0 h-10 w-10"
                  aria-label="Save name"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCancel}
                  className="flex-shrink-0 h-10 w-10"
                  aria-label="Cancel editing"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Tip Banner */}
      {!agentName && !isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-accent/10 rounded-lg border border-accent/20"
        >
          <p className="text-sm text-foreground">
            💡 <strong>Tip:</strong> Adding a name makes your experience more personal
          </p>
        </motion.div>
      )}
    </Card>
  );
}
