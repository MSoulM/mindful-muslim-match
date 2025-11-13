import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MessageSentAnimationProps {
  show: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
}

export const MessageSentAnimation = ({ 
  show, 
  isDelivered = false,
  isRead = false 
}: MessageSentAnimationProps) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center"
        >
          {isRead ? (
            <motion.div
              initial={{ x: -4 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCheck 
                className="text-primary" 
                size={14}
              />
            </motion.div>
          ) : isDelivered ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCheck 
                className="text-muted-foreground" 
                size={14}
              />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: 'linear' }}
            >
              <Check 
                className="text-muted-foreground" 
                size={14}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
