import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/msm-logo.jpg';

interface MSMLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export const MSMLogo = ({ 
  variant = 'full', 
  onClick, 
  className,
  loading = false 
}: MSMLogoProps) => {
  // Skeleton loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-9 h-9 bg-neutral-200 rounded-lg" />
        <div className="space-y-1">
          <div className="h-5 w-20 bg-neutral-200 rounded" />
          <div className="h-3 w-28 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  // Logo Icon Component (20% bigger)
  const LogoIcon = ({ size = 50 }: { size?: number }) => (
    <motion.div
      className={cn(
        "flex items-center justify-center"
      )}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img 
        src={logoImage}
        alt="MuslimSoulmate.ai"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );

  // Icon variant - just the icon with proper touch target
  if (variant === 'icon') {
    return (
      <motion.button
        onClick={onClick}
        className={cn(
          "p-1 min-w-[44px] min-h-[44px] flex items-center justify-center",
          "touch-feedback focus-visible:focus transition-all duration-200",
          onClick && "cursor-pointer",
          className
        )}
        whileTap={{ scale: 0.97 }}
        aria-label="MuslimSoulmate.ai"
      >
        <LogoIcon size={50} />
      </motion.button>
    );
  }

  // Compact variant - icon + name only
  if (variant === 'compact') {
    return (
      <motion.button
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "flex items-center gap-2 min-h-[44px] px-2",
          "touch-feedback transition-all duration-200",
          onClick && "cursor-pointer",
          !onClick && "cursor-default",
          className
        )}
        whileTap={onClick ? { scale: 0.97, opacity: 0.9 } : undefined}
        aria-label="MuslimSoulmate.ai - Mindful Matchmaking"
      >
        <LogoIcon size={44} />
        <span className="text-lg font-bold text-primary-forest leading-none">
          MuslimSoulmate.ai
        </span>
      </motion.button>
    );
  }

  // Full variant - icon + name + tagline
  return (
    <motion.button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex items-center gap-2 min-h-[44px] px-2",
        "touch-feedback transition-all duration-200",
        onClick && "cursor-pointer",
        !onClick && "cursor-default",
        className
      )}
      whileTap={onClick ? { scale: 0.97, opacity: 0.9 } : undefined}
      aria-label="MuslimSoulmate.ai - Mindful Matchmaking"
    >
      <LogoIcon size={50} />
      <div className="flex flex-col items-start">
        <span className="text-xl font-bold text-primary-forest leading-none">
          MuslimSoulmate.ai
        </span>
        <span className="text-xs font-semibold text-primary-gold leading-none mt-0.5">
          Mindful Matchmaking
        </span>
      </div>
    </motion.button>
  );
};

// Responsive logo that adapts to screen size
export const ResponsiveMSMLogo = ({ 
  onClick, 
  className 
}: Omit<MSMLogoProps, 'variant'>) => {
  return (
    <>
      {/* xs screens: icon only */}
      <div className="xs:block sm:hidden">
        <MSMLogo variant="icon" onClick={onClick} className={className} />
      </div>
      
      {/* sm to md screens: compact */}
      <div className="hidden sm:block md:hidden">
        <MSMLogo variant="compact" onClick={onClick} className={className} />
      </div>
      
      {/* md+ screens: full */}
      <div className="hidden md:block">
        <MSMLogo variant="full" onClick={onClick} className={className} />
      </div>
    </>
  );
};
