import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { PremiumCard } from '@/components/ui/animated/PremiumCard';
import { SuccessCelebration } from '@/components/ui/animated/SuccessCelebration';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Bug, Lightbulb, Star, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeedbackCategory = 'general' | 'bug' | 'feature' | 'improvement';

export default function FeedbackScreen() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { id: 'general' as FeedbackCategory, label: 'General Feedback', icon: MessageSquare },
    { id: 'bug' as FeedbackCategory, label: 'Report Bug', icon: Bug },
    { id: 'feature' as FeedbackCategory, label: 'Feature Request', icon: Lightbulb },
    { id: 'improvement' as FeedbackCategory, label: 'Improvement', icon: Star },
  ];

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    navigate(-1);
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Send Feedback"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Introduction */}
        <div className="px-5 pt-6 pb-6">
          <PremiumCard variant="gradient" className="p-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-2">We Value Your Feedback</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your input helps us improve Muslim Soulmate AI for everyone. Share your thoughts, 
                report issues, or suggest new features.
              </p>
            </div>
          </PremiumCard>
        </div>

        {/* Category Selection */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Feedback Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    "flex flex-col items-center gap-2 text-center",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                  <span 
                    className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Input */}
        <div className="px-5 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Your Message</h3>
          <PremiumCard variant="glass" className="p-1">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                category === 'bug'
                  ? "Please describe the bug you encountered, including steps to reproduce it..."
                  : category === 'feature'
                  ? "Tell us about the feature you'd like to see..."
                  : category === 'improvement'
                  ? "How can we make this better?..."
                  : "Share your thoughts with us..."
              }
              className="min-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none"
            />
          </PremiumCard>
          <p className="text-xs text-muted-foreground mt-2">
            {feedback.length} / 1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="px-5 pb-8">
          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Feedback
              </>
            )}
          </Button>
        </div>

        {/* Tips */}
        <div className="px-5 pb-8">
          <PremiumCard variant="glass" className="p-5">
            <h4 className="font-medium text-foreground mb-3">💡 Tips for Better Feedback</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Be specific about what you experienced or want to see</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>For bugs, include steps to reproduce the issue</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Explain how a feature would improve your experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>We read every submission, but can't reply to all</span>
              </li>
            </ul>
          </PremiumCard>
        </div>
      </div>

      {/* Success Celebration */}
      <SuccessCelebration
        show={showSuccess}
        title="Feedback Sent!"
        message="Thank you for helping us improve"
        onComplete={handleSuccessComplete}
      />
    </ScreenContainer>
  );
}
