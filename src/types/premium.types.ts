export type PlanType = 'free' | 'monthly' | '3month' | 'annual';

export type TransactionStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'paypal';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  description: string;
  invoiceUrl?: string;
  paymentMethod?: string;
}

export interface PlanDetails {
  id: PlanType;
  name: string;
  price: number;
  currency: string;
  billingCycle: string;
  savings?: number;
  savingsPercentage?: number;
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPremium: boolean;
  isAvailable: boolean;
}

export interface PremiumState {
  isSubscribed: boolean;
  currentPlan: PlanType;
  expiryDate: Date | null;
  features: string[];
  billingHistory: Transaction[];
  paymentMethods: PaymentMethod[];
}

export interface SubscriptionDetails extends PremiumState {
  nextBillingDate: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
  subscriptionId?: string;
}

// Predefined plan details
export const PLAN_DETAILS: Record<PlanType, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'GBP',
    billingCycle: 'Forever',
    features: [
      'Basic matching',
      'Limited likes per day',
      'Standard filters',
      'Message matches',
    ],
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: 29.99,
    currency: 'GBP',
    billingCycle: 'per month',
    features: [
      'Unlimited likes',
      'See who likes you',
      'Advanced filters',
      'Priority matching',
      'ChaiChat Pro',
      'Read receipts',
    ],
  },
  '3month': {
    id: '3month',
    name: '3-Month',
    price: 23.99,
    currency: 'GBP',
    billingCycle: 'per month',
    savings: 18,
    savingsPercentage: 20,
    badge: 'Save 20%',
    isPopular: true,
    features: [
      'Everything in Monthly',
      'Save £18 total',
      'Billed £71.97 every 3 months',
    ],
  },
  annual: {
    id: 'annual',
    name: 'Annual',
    price: 17.99,
    currency: 'GBP',
    billingCycle: 'per month',
    savings: 144,
    savingsPercentage: 40,
    badge: 'Best Value - Save 40%',
    features: [
      'Everything in Monthly',
      'Save £144 per year',
      'Billed £215.88 per year',
      'Priority support',
    ],
  },
};

// Premium feature definitions
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited_likes',
    name: 'Unlimited Likes',
    description: 'Connect without limits',
    icon: 'Heart',
    isPremium: true,
    isAvailable: true,
  },
  {
    id: 'see_likes',
    name: 'See Who Likes You',
    description: 'View all your admirers',
    icon: 'Eye',
    isPremium: true,
    isAvailable: true,
  },
  {
    id: 'advanced_filters',
    name: 'Advanced Filters',
    description: 'Find your perfect match',
    icon: 'Filter',
    isPremium: true,
    isAvailable: true,
  },
  {
    id: 'priority_matching',
    name: 'Priority Matching',
    description: 'Get seen first',
    icon: 'Zap',
    isPremium: true,
    isAvailable: true,
  },
  {
    id: 'chaichat_pro',
    name: 'ChaiChat Pro',
    description: 'Enhanced AI insights',
    icon: 'MessageSquare',
    isPremium: true,
    isAvailable: true,
  },
  {
    id: 'read_receipts',
    name: 'Read Receipts',
    description: 'Know when seen',
    icon: 'CheckCheck',
    isPremium: true,
    isAvailable: true,
  },
];

// Subscription action types
export type SubscriptionAction =
  | { type: 'SET_SUBSCRIPTION'; payload: PremiumState }
  | { type: 'UPGRADE_PLAN'; payload: PlanType }
  | { type: 'CANCEL_SUBSCRIPTION' }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'REMOVE_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_DEFAULT_PAYMENT'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction };
