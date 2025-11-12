import { useState, useEffect } from 'react';
import { 
  PremiumState, 
  PlanType, 
  Transaction, 
  PaymentMethod,
  PLAN_DETAILS 
} from '@/types/premium.types';

const DEFAULT_PREMIUM_STATE: PremiumState = {
  isSubscribed: false,
  currentPlan: 'free',
  expiryDate: null,
  features: [],
  billingHistory: [],
  paymentMethods: [],
};

export const usePremium = () => {
  const [premiumState, setPremiumState] = useState<PremiumState>(() => {
    const stored = localStorage.getItem('premium-subscription');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.expiryDate) {
          parsed.expiryDate = new Date(parsed.expiryDate);
        }
        return parsed;
      } catch {
        return DEFAULT_PREMIUM_STATE;
      }
    }
    return DEFAULT_PREMIUM_STATE;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('premium-subscription', JSON.stringify(premiumState));
  }, [premiumState]);

  const upgradePlan = (plan: PlanType) => {
    const expiryDate = new Date();
    
    // Calculate expiry based on plan
    if (plan === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan === '3month') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else if (plan === 'annual') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const planDetails = PLAN_DETAILS[plan];
    
    setPremiumState(prev => ({
      ...prev,
      isSubscribed: plan !== 'free',
      currentPlan: plan,
      expiryDate: plan === 'free' ? null : expiryDate,
      features: planDetails.features,
    }));
  };

  const cancelSubscription = () => {
    setPremiumState(prev => ({
      ...prev,
      isSubscribed: false,
      currentPlan: 'free',
      expiryDate: null,
      features: PLAN_DETAILS.free.features,
    }));
  };

  const addPaymentMethod = (method: PaymentMethod) => {
    setPremiumState(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, method],
    }));
  };

  const removePaymentMethod = (methodId: string) => {
    setPremiumState(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(m => m.id !== methodId),
    }));
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    setPremiumState(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === methodId,
      })),
    }));
  };

  const addTransaction = (transaction: Transaction) => {
    setPremiumState(prev => ({
      ...prev,
      billingHistory: [transaction, ...prev.billingHistory],
    }));
  };

  const hasFeature = (featureId: string): boolean => {
    return premiumState.features.some(f => 
      f.toLowerCase().includes(featureId.toLowerCase())
    );
  };

  const getDaysUntilExpiry = (): number | null => {
    if (!premiumState.expiryDate) return null;
    const now = new Date();
    const expiry = new Date(premiumState.expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isExpiringSoon = (): boolean => {
    const days = getDaysUntilExpiry();
    return days !== null && days <= 7 && days > 0;
  };

  const isExpired = (): boolean => {
    const days = getDaysUntilExpiry();
    return days !== null && days <= 0;
  };

  const getCurrentPlanDetails = () => {
    return PLAN_DETAILS[premiumState.currentPlan];
  };

  const getMonthlyPrice = (): number => {
    return PLAN_DETAILS[premiumState.currentPlan].price;
  };

  const getTotalPrice = (): number => {
    const plan = PLAN_DETAILS[premiumState.currentPlan];
    if (plan.id === 'monthly') return plan.price;
    if (plan.id === '3month') return plan.price * 3;
    if (plan.id === 'annual') return plan.price * 12;
    return 0;
  };

  return {
    premiumState,
    upgradePlan,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    addTransaction,
    hasFeature,
    getDaysUntilExpiry,
    isExpiringSoon,
    isExpired,
    getCurrentPlanDetails,
    getMonthlyPrice,
    getTotalPrice,
  };
};
