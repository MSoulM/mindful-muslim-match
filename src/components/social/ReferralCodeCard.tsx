import { useState } from 'react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/CustomButton';
import { Copy, Check, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralCodeCardProps {
  code: string;
  referralCount: number;
  rewardAmount?: string;
}

export const ReferralCodeCard = ({ 
  code, 
  referralCount,
  rewardAmount = '1 month free'
}: ReferralCodeCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: 'Code copied!',
        description: 'Share it with friends to earn rewards.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <BaseCard padding="md" className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Your Referral Code</h3>
          <p className="text-sm text-muted-foreground">
            Invite friends and get {rewardAmount}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-background rounded-lg px-4 py-3 font-mono text-lg font-bold text-center border-2 border-primary/20">
          {code}
        </div>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleCopy}
          className="px-4"
        >
          {copied ? (
            <Check className="w-5 h-5 text-semantic-success" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{referralCount}</span> friends referred
        </p>
      </div>
    </BaseCard>
  );
};
