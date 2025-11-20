import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Info,
  Edit,
  Brain,
  Sparkles,
  ChevronDown,
  Rocket,
  Plus,
  User,
  Heart,
  HeartHandshake,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TopicEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent?: () => void;
  onViewProfile?: () => void;
}

const MODAL_VIEWED_KEY = 'topic_education_modal_viewed';

export const TopicEducationModal = ({
  isOpen,
  onClose,
  onAddContent,
  onViewProfile,
}: TopicEducationModalProps) => {
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // Check if modal has been viewed before
    const hasViewed = localStorage.getItem(MODAL_VIEWED_KEY);
    if (!hasViewed) {
      setIsFirstTime(true);
    }
  }, []);

  const handleClose = () => {
    // Mark modal as viewed
    localStorage.setItem(MODAL_VIEWED_KEY, 'true');
    setIsFirstTime(false);
    onClose();
  };

  const handleAddContent = () => {
    handleClose();
    onAddContent?.();
  };

  const handleViewProfile = () => {
    handleClose();
    onViewProfile?.();
  };

  // Category data
  const categories = [
    {
      id: 'values_beliefs',
      name: 'Values & Beliefs',
      icon: Heart,
      color: '#D4A574',
      requiredCount: 4,
      topics: [
        { name: 'Religious Practice', description: 'Daily Islamic practices like prayer, fasting, and worship' },
        { name: 'Spiritual Values', description: 'Core Islamic values like taqwa, ihsan, and good character' },
        { name: 'Community Involvement', description: 'Charity work, volunteering, and community service' },
        { name: 'Islamic Knowledge & Education', description: 'Quranic study, Islamic courses, seeking knowledge' },
      ],
    },
    {
      id: 'relationship_goals',
      name: 'Relationship Goals',
      icon: HeartHandshake,
      color: '#EC4899',
      requiredCount: 3,
      topics: [
        { name: 'Marriage Timeline Expectations', description: 'When you want to get married and your readiness' },
        { name: 'Children & Family Planning', description: 'Preferences about having children and family size' },
        { name: 'Lifestyle & Living Arrangements', description: 'Career-family balance, where to live, lifestyle preferences' },
      ],
    },
    {
      id: 'family_cultural',
      name: 'Family & Cultural',
      icon: Users,
      color: '#F59E0B',
      requiredCount: 2,
      topics: [
        { name: 'Family Involvement & Wali Role', description: 'Family role in marriage, wali requirements, family dynamics' },
        { name: 'Cultural Heritage & Traditions', description: 'Cultural background, traditions, celebrations, food, language' },
      ],
    },
  ];

  const steps = [
    {
      number: 1,
      icon: Edit,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      title: 'You Share Content',
      description: 'Post text, upload photos, record voice notes, or share videos about yourself',
    },
    {
      number: 2,
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'AI Analyzes',
      description: 'Our AI reads your content and identifies which topics you\'ve covered based on keywords and context',
    },
    {
      number: 3,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      title: 'Topics Auto-Mark',
      description: 'Topics are automatically marked as covered when detected. You can review and add more if needed',
    },
  ];

  const tips = [
    {
      title: 'Be specific and detailed in your posts',
      example: 'Instead of "I pray," say "I pray all five daily prayers and never miss Fajr"',
    },
    {
      title: 'Use natural language - talk like you would to a friend',
      example: 'Share stories and experiences, not just facts',
    },
    {
      title: 'Cover different aspects of each topic',
      example: 'For Religious Practice, mention prayer, fasting, and Quran reading',
    },
    {
      title: 'Don\'t rush - build your profile over weeks',
      example: 'Add 2-3 posts per week naturally',
    },
    {
      title: 'Use our suggested prompts if you need inspiration',
      example: 'Click on missing topics to see helpful questions',
    },
  ];

  const faqs = [
    {
      question: 'What happens if I don\'t cover all topics?',
      answer: 'You can still use MuslimSoulmate.ai, but your profile completion will be lower, affecting match quality. We recommend covering at least 75% of required topics.',
    },
    {
      question: 'Can I cover topics in any order?',
      answer: 'Yes! Share content naturally. Topics are detected automatically regardless of order.',
    },
    {
      question: 'How do I know if a topic is covered?',
      answer: 'Check your profile completion page. Covered topics show with a ✓ checkmark and example of your content.',
    },
    {
      question: 'Can I manually mark topics as covered?',
      answer: 'Topics are auto-detected from your content. Simply share relevant content and the system will recognize it.',
    },
    {
      question: 'What if I want to add more detail to a covered topic?',
      answer: 'Great! Adding more content improves your profile depth (Factor 2). There\'s no limit to how much you can share.',
    },
    {
      question: 'Do topics expire or need updating?',
      answer: 'No, once covered, topics stay covered. But you can always add fresh content to keep your profile current.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl p-8 text-white">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-white hover:text-white/80 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center">
                  <Lightbulb className="w-12 h-12 mb-4" />
                  <h2 className="text-3xl font-bold text-center mb-2">
                    Understanding Topic Coverage
                  </h2>
                  <p className="text-base text-white/90 text-center">
                    How topics help build your complete profile
                  </p>
                </div>
              </div>

              {/* Introduction Section */}
              <div className="bg-blue-50 border-b border-blue-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Why Topics Matter
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-3">
                  Topics ensure your profile covers all important aspects of who you are. Complete coverage leads to better matches because our AI understands you more deeply.
                </p>
                <div className="space-y-2">
                  {['Better quality matches', 'More accurate compatibility scores', 'Deeper understanding by AI'].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown Section */}
              <div className="p-6 bg-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Required Topics by Category
                </h3>

                <div className="space-y-4">
                  {categories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 border-2 rounded-xl p-5 hover:shadow-md transition-shadow"
                        style={{ borderColor: category.color }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-8 h-8" style={{ color: category.color }} />
                            <h4 className="text-xl font-bold text-gray-900">{category.name}</h4>
                          </div>
                          <Badge
                            className="px-3 py-1 text-sm font-semibold rounded-full"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                            }}
                          >
                            {category.requiredCount} topics required
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Required Topics:</p>
                          {category.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="mb-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500">{topicIndex + 1}.</span>
                                <div>
                                  <span className="font-bold" style={{ color: category.color }}>
                                    {topic.name}
                                  </span>
                                  <p className="text-sm text-gray-600">{topic.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Free-Form Explanation */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-purple-900 mb-2">
                        What about other categories?
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Interests & Hobbies and Lifestyle & Personality are free-form! Share anything you want - there are no specific topics required. The more you share, the better.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-t border-green-100 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  How We Detect Topics
                </h3>

                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.number}>
                        <div className={cn('flex gap-4 bg-white border-2 border-gray-200 rounded-lg p-4', step.bgColor)}>
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center font-bold text-gray-900">
                              {step.number}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={cn('w-8 h-8', step.color)} />
                              <h4 className="text-lg font-bold text-gray-900">{step.title}</h4>
                            </div>
                            <p className="text-sm text-gray-700">{step.description}</p>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="flex justify-center my-2">
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips Section */}
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  💡 Tips for Complete Coverage
                </h3>

                <div className="space-y-2">
                  {tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-md p-3"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
                          <p className="text-sm text-gray-600 italic mt-1">Example: {tip.example}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-gray-50 border-t border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>

                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 py-3 text-base font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-3 text-sm text-gray-700 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* CTA Footer */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-b-2xl p-6 text-center">
                <Rocket className="w-10 h-10 text-white mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to Complete Your Topics?
                </h3>
                <p className="text-base text-white/90 mb-6">
                  Start sharing your story and watch your profile completion grow!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleAddContent}
                    className="bg-white text-green-700 hover:bg-gray-100 py-3 px-8 rounded-lg text-base font-bold min-h-[44px] transition-transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Content Now
                  </Button>
                  <Button
                    onClick={handleViewProfile}
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-3 px-8 rounded-lg text-base font-bold min-h-[44px]"
                  >
                    <User className="w-5 h-5 mr-2" />
                    View My Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Trigger Button Component
interface TopicEducationTriggerProps {
  onClick: () => void;
  showText?: boolean;
  className?: string;
}

export const TopicEducationTrigger = ({
  onClick,
  showText = false,
  className,
}: TopicEducationTriggerProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors',
        className
      )}
    >
      <HelpCircle className="w-5 h-5" />
      {showText && <span className="text-sm font-medium">What are required topics?</span>}
    </button>
  );
};
