import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillingHistoryItemProps {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

export const BillingHistoryItem = ({
  id,
  date,
  amount,
  status,
  description,
  invoiceUrl,
}: BillingHistoryItemProps) => {
  const statusConfig = {
    paid: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Paid',
      color: 'bg-semantic-success/10 text-semantic-success border-semantic-success/20',
    },
    pending: {
      icon: <Clock className="w-4 h-4" />,
      label: 'Pending',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    failed: {
      icon: <XCircle className="w-4 h-4" />,
      label: 'Failed',
      color: 'bg-semantic-error/10 text-semantic-error border-semantic-error/20',
    },
  };

  const config = statusConfig[status];

  return (
    <BaseCard padding="md" className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-foreground">{description}</h3>
          <Badge variant="outline" className={cn('flex items-center gap-1', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{date}</span>
          <span>•</span>
          <span className="font-mono text-xs">{id}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-semibold text-lg">{amount}</span>
        {invoiceUrl && (
          <button
            onClick={() => window.open(invoiceUrl, '_blank')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Download invoice"
          >
            <Download className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </BaseCard>
  );
};
