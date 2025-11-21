import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { FAQItem } from '@/components/help/FAQItem';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/CustomButton';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'all' | 'general' | 'matching' | 'account' | 'payment' | 'safety';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: Category;
}

export default function FAQScreen() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const categories: { label: string; value: Category }[] = [
    { label: 'All', value: 'all' },
    { label: 'General', value: 'general' },
    { label: 'Matching', value: 'matching' },
    { label: 'Account', value: 'account' },
    { label: 'Payment', value: 'payment' },
    { label: 'Safety', value: 'safety' },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How does MuslimSoulmate.ai ensure Islamic values?',
      answer: 'MuslimSoulmate.ai is built with Islamic values at its core. We:\n\n• Require profile verification to ensure authenticity\n• Provide modesty-first features like photo privacy controls\n• Facilitate meaningful conversations focused on compatibility\n• Include religious preference matching in our DNA algorithm\n• Have strict community guidelines based on Islamic principles\n• Offer prayer time reminders and Islamic etiquette features',
      category: 'general',
    },
    {
      id: '2',
      question: 'What makes DNA matching unique?',
      answer: 'Our MySoul DNA feature goes beyond surface-level matching:\n\n• Analyzes 5 core compatibility dimensions: Values & Beliefs, Interests & Hobbies, Personality Traits, Lifestyle & Habits, and Life Goals & Ambitions\n• Uses AI to understand depth and nuance in your responses\n• Calculates compatibility across multiple factors\n• Provides rarity scores showing what makes you unique\n• Continuously learns from your interactions to improve matches\n• Matches based on both similarities and complementary differences',
      category: 'matching',
    },
    {
      id: '3',
      question: 'Can I pause my account?',
      answer: 'Yes, you can pause your account at any time:\n\n1. Go to Settings > Account\n2. Select "Pause Account"\n3. Choose your pause duration (1 week, 1 month, 3 months)\n4. Your profile will be hidden from discovery\n5. Existing matches can still message you if you choose\n6. All your data and matches are preserved\n7. Resume anytime by going back to settings\n\nPausing is a great alternative to deleting your account if you need a break.',
      category: 'account',
    },
    {
      id: '4',
      question: 'What is ChaiChat and how does it work?',
      answer: 'ChaiChat is our AI-powered compatibility analysis feature:\n\n• Our AI agents have conversations on your behalf with potential matches\n• Conversations explore key compatibility topics (values, goals, lifestyle)\n• You review the conversation summaries to understand compatibility depth\n• Topics are color-coded: Green (strongly aligned), Blue (good alignment), Orange (needs discussion)\n• Helps you make informed decisions before connecting\n• Saves time by pre-screening compatibility on important topics\n• Available for all matches with opt-in from both parties',
      category: 'matching',
    },
    {
      id: '5',
      question: 'What payment methods do you accept?',
      answer: 'We accept multiple payment methods for your convenience:\n\n• Apple Pay (iOS devices)\n• Google Pay (Android devices)\n• Credit/Debit cards (Visa, Mastercard, Amex)\n• PayPal\n\nAll payments are processed securely through industry-standard encryption. Your payment information is never stored on our servers.',
      category: 'payment',
    },
    {
      id: '6',
      question: 'How do I report or block someone?',
      answer: 'Your safety is our priority. To report or block:\n\n**To Block:**\n1. Go to the user\'s profile\n2. Tap the three dots menu\n3. Select "Block User"\n4. Confirm your choice\n5. They won\'t be able to contact you or see your profile\n\n**To Report:**\n1. Go to the user\'s profile\n2. Tap the three dots menu\n3. Select "Report User"\n4. Choose a reason (inappropriate content, harassment, fake profile, etc.)\n5. Provide details if needed\n6. Submit report\n\nOur moderation team reviews all reports within 24 hours.',
      category: 'safety',
    },
    {
      id: '7',
      question: 'Can I get a refund on my subscription?',
      answer: 'We offer refunds within 14 days of purchase:\n\n• Request must be made within 14 days of initial subscription\n• Refunds are only available for first-time subscribers\n• To request: Go to Settings > Subscription > Request Refund\n• Provide reason for refund request\n• Refunds are processed within 5-7 business days\n• No refunds available for renewed subscriptions\n• Pro-rated refunds not available for mid-cycle cancellations',
      category: 'payment',
    },
    {
      id: '8',
      question: 'How is my data protected?',
      answer: 'We take data protection seriously:\n\n• End-to-end encryption for all messages\n• Secure servers with regular security audits\n• GDPR and data protection compliant\n• You control who sees your profile and photos\n• Option to download all your data anytime\n• Option to permanently delete your account and data\n• No selling of user data to third parties\n• Two-factor authentication available\n• Regular privacy policy updates',
      category: 'safety',
    },
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="FAQs"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Category Tabs */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={cn(
                  'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all',
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="px-5 pt-4">
          {filteredFAQs.map((faq) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>

      {/* Can't Find Answer */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
        <BaseCard padding="md" className="bg-muted/50">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Still have questions?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Can't find what you're looking for? Contact our support team.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/help/contact')}
          >
            Contact Support
          </Button>
        </BaseCard>
      </div>
    </ScreenContainer>
  );
}
