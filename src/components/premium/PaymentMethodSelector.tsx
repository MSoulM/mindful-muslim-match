import { useState } from 'react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'paypal';
  label: string;
  icon: React.ReactNode;
  available: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onChange: (methodId: string) => void;
}

export const PaymentMethodSelector = ({ 
  selectedMethod, 
  onChange 
}: PaymentMethodSelectorProps) => {
  const methods: PaymentMethod[] = [
    {
      id: 'apple_pay',
      type: 'apple_pay',
      label: 'Apple Pay',
      icon: <Smartphone className="w-5 h-5" />,
      available: true,
    },
    {
      id: 'google_pay',
      type: 'google_pay',
      label: 'Google Pay',
      icon: <Smartphone className="w-5 h-5" />,
      available: true,
    },
    {
      id: 'card',
      type: 'card',
      label: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      available: true,
    },
    {
      id: 'paypal',
      type: 'paypal',
      label: 'PayPal',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h8.53c2.347 0 4.182.587 5.45 1.745 1.242 1.134 1.817 2.75 1.817 5.093 0 3.504-1.463 6.03-4.356 7.516-1.4.72-3.03 1.083-4.854 1.083h-.97a.77.77 0 0 0-.76.653l-.403 2.546a.641.641 0 0 1-.633.634z" />
        </svg>
      ),
      available: true,
    },
  ];

  return (
    <div className="space-y-2">
      {methods.map((method) => (
        <BaseCard
          key={method.id}
          padding="md"
          interactive={method.available}
          onClick={() => method.available && onChange(method.id)}
          className={cn(
            'flex items-center justify-between transition-all',
            selectedMethod === method.id && 'border-primary bg-primary/5',
            !method.available && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              selectedMethod === method.id 
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            )}>
              {method.icon}
            </div>
            <span className="font-medium">{method.label}</span>
          </div>
          {selectedMethod === method.id && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </BaseCard>
      ))}
    </div>
  );
};
