import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Eye, 
  Filter, 
  Zap, 
  MessageSquare, 
  CheckCheck,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Wallet
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { PremiumBenefitCard } from '@/components/premium/PremiumBenefitCard';
import { PlanCard } from '@/components/premium/PlanCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePremium } from '@/hooks/usePremium';
import { PlanType, PLAN_DETAILS } from '@/types/premium.types';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface Plan {
  id: PlanType;
  title: string;
  price: string;
  priceValue: number;
  billing: string;
  total?: string;
  savings?: string;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    title: 'Monthly Plan',
    price: '£29.99',
    priceValue: 29.99,
    billing: 'Billed monthly',
  },
  {
    id: '3month',
    title: '3-Month Plan',
    price: '£23.99',
    priceValue: 23.99,
    billing: 'per month',
    total: '£71.97 every 3 months',
    savings: 'You save £18',
    badge: 'Save 20%',
  },
  {
    id: 'annual',
    title: 'Annual Plan',
    price: '£17.99',
    priceValue: 17.99,
    billing: 'per month',
    total: '£215.88 per year',
    savings: 'You save £144',
    badge: 'Best Value - Save 40%',
  },
];

export default function PremiumScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { upgradePlan, addTransaction } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('3month');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentPlan = plans.find(p => p.id === selectedPlan)!;

  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleSubscribe = async () => {
    hapticFeedback();
    setIsLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Upgrade plan
      upgradePlan(selectedPlan);
      
      // Add transaction
      const planDetails = PLAN_DETAILS[selectedPlan];
      const totalPrice = selectedPlan === 'monthly' 
        ? planDetails.price 
        : selectedPlan === '3month' 
        ? planDetails.price * 3 
        : planDetails.price * 12;
      
      addTransaction({
        id: `INV-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        amount: `£${totalPrice.toFixed(2)}`,
        currency: 'GBP',
        status: 'paid',
        description: `${planDetails.name} Plan Subscription`,
      });
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setIsLoading(false);
      navigate('/subscription/success');
    } catch (error) {
      toast({
        title: 'Payment failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <TopBar
          variant="back"
          title="Premium"
          onBackClick={() => navigate(-1)}
        />

        <ScreenContainer hasTopBar scrollable>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-br from-primary-forest to-[#4A8B8C] p-8 mb-6 min-h-[280px] flex flex-col items-center justify-center text-center"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
            
            {/* Decorative circles */}
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Star icon with glow */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              >
                ⭐
              </motion.div>

              <h1 className="text-[28px] font-bold text-white mb-2">
                Upgrade to Premium
              </h1>
              
              <p className="text-base text-white/90 mb-4">
                Unlock your full matchmaking potential
              </p>

              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                Free Member
              </Badge>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <div className="px-4 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Premium Benefits
            </h2>

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
              <PremiumBenefitCard
                icon={Heart}
                title="Unlimited Likes"
                description="Connect without limits"
                badge="Most Popular"
              />
              
              <PremiumBenefitCard
                icon={Eye}
                title="See Who Likes You"
                description="View all your admirers"
              />
              
              <PremiumBenefitCard
                icon={Filter}
                title="Advanced Filters"
                description="Find your perfect match"
              />
              
              <PremiumBenefitCard
                icon={Zap}
                title="Priority Matching"
                description="Get seen first"
              />
              
              <PremiumBenefitCard
                icon={MessageSquare}
                title="ChaiChat Pro"
                description="Enhanced AI insights"
                badge="Exclusive"
              />
              
              <PremiumBenefitCard
                icon={CheckCheck}
                title="Read Receipts"
                description="Know when seen"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="px-4 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Choose Your Plan
            </h2>

            <div className="space-y-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  title={plan.title}
                  price={plan.price}
                  billing={plan.billing}
                  total={plan.total}
                  savings={plan.savings}
                  badge={plan.badge}
                  isSelected={selectedPlan === plan.id}
                  onSelect={() => {
                    hapticFeedback();
                    setSelectedPlan(plan.id);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="px-4 mb-24">
            <motion.div
              initial={false}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
            >
              <button
                onClick={() => {
                  hapticFeedback();
                  setShowPaymentMethods(!showPaymentMethods);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
              >
                <span className="text-base font-semibold text-neutral-900">
                  Payment Method
                </span>
                {showPaymentMethods ? (
                  <ChevronUp className="w-5 h-5 text-neutral-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-600" />
                )}
              </button>

              {showPaymentMethods && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-neutral-200 p-4 space-y-3"
                >
                  <button className="w-full h-12 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition-colors">
                     Pay
                  </button>
                  
                  <button className="w-full h-12 bg-white border-2 border-neutral-300 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-50 transition-colors">
                    G Pay
                  </button>
                  
                  <button className="w-full h-12 bg-white border-2 border-neutral-300 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Credit/Debit Card
                  </button>
                  
                  <button className="w-full h-12 bg-[#0070BA] text-white rounded-lg font-semibold hover:bg-[#005EA6] transition-colors flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5" />
                    PayPal
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </ScreenContainer>

        {/* Sticky Subscribe Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-20">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe}
            disabled={isLoading}
            className={cn(
              'w-full h-14 rounded-xl font-bold text-white text-base',
              'bg-gradient-to-r from-primary-forest to-[#4A8B8C]',
              'hover:shadow-lg transition-shadow',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              `Subscribe Now - ${currentPlan.price}/month`
            )}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
