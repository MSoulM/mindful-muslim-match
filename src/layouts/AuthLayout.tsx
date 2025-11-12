import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { MSMLogo } from '@/components/brand/MSMLogo';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  showLogo?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export const AuthLayout = ({
  children,
  showLogo = true,
  showBack = false,
  onBack,
  className
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SafeArea top>
        <div className="py-6 px-5">
          {/* Header Section */}
          <div className="relative flex items-center justify-center mb-8">
            {showBack && (
              <button
                onClick={onBack}
                className="absolute left-0 w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-foreground" />
              </button>
            )}
            
            {showLogo && (
              <div className="flex justify-center">
                <MSMLogo variant="full" />
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className={cn(
            "mx-auto max-w-[400px] w-full",
            className
          )}>
            {children}
          </div>
        </div>
      </SafeArea>
    </div>
  );
};
