import { Lock, Crown } from 'lucide-react';
import { Button } from '../button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PermissionErrorProps {
  variant?: 'locked' | 'premium';
  feature: string;
  description?: string;
  fullScreen?: boolean;
}

/**
 * Permission/locked feature error state
 * Shows when users try to access premium or locked features
 */
export const PermissionError = ({
  variant = 'locked',
  feature,
  description,
  fullScreen = false
}: PermissionErrorProps) => {
  const navigate = useNavigate();
  
  const isPremium = variant === 'premium';
  const icon = isPremium ? Crown : Lock;
  const Icon = icon;
  
  const defaultDescription = isPremium
    ? `${feature} is available with Premium. Upgrade to unlock this feature and many more.`
    : `You don't have permission to access ${feature}. Contact support if you believe this is an error.`;

  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'py-12';

  return (
    <div className={containerClass}>
      <motion.div 
        className="text-center max-w-md mx-auto px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Icon */}
        <motion.div 
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Icon className="w-10 h-10 text-primary" />
        </motion.div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground mb-3">
          {isPremium ? 'Premium Feature' : 'Access Denied'}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {description || defaultDescription}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {isPremium ? (
            <>
              <Button
                onClick={() => navigate('/premium')}
                className="w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate('/help')}
                className="w-full"
              >
                Contact Support
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Go Home
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
