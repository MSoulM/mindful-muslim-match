import { FileText, ChevronRight } from 'lucide-react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';

interface HelpArticleItemProps {
  title: string;
  views: string;
  onClick: () => void;
}

export const HelpArticleItem = ({ title, views, onClick }: HelpArticleItemProps) => {
  return (
    <BaseCard
      padding="md"
      interactive
      onClick={onClick}
      className="flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-foreground">{views}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </BaseCard>
  );
};
