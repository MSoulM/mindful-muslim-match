import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupportTicketCardProps {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  lastUpdated: string;
  unreadMessages?: number;
  onClick: () => void;
}

export const SupportTicketCard = ({
  id,
  subject,
  status,
  category,
  lastUpdated,
  unreadMessages = 0,
  onClick,
}: SupportTicketCardProps) => {
  const statusConfig = {
    open: {
      icon: <MessageSquare className="w-3 h-3" />,
      label: 'Open',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    in_progress: {
      icon: <Clock className="w-3 h-3" />,
      label: 'In Progress',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    resolved: {
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'Resolved',
      color: 'bg-semantic-success/10 text-semantic-success border-semantic-success/20',
    },
    closed: {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Closed',
      color: 'bg-muted text-muted-foreground border-border',
    },
  };

  const config = statusConfig[status];

  return (
    <BaseCard
      padding="md"
      interactive
      onClick={onClick}
      className={cn(
        'relative',
        unreadMessages > 0 && 'border-primary/30 bg-primary/5'
      )}
    >
      {unreadMessages > 0 && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-white">{unreadMessages}</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{id}</span>
            <Badge variant="outline" className={cn('flex items-center gap-1', config.color)}>
              {config.icon}
              {config.label}
            </Badge>
          </div>
          <h3 className="font-semibold line-clamp-2">{subject}</h3>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded bg-muted">{category}</span>
        <span>•</span>
        <span>Updated {lastUpdated}</span>
      </div>
    </BaseCard>
  );
};
