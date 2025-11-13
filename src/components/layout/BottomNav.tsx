import { motion } from 'framer-motion';
import { LucideIcon, Compass, Bot, Fingerprint, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import mySoulDNAIcon from '@/assets/mysouldna-nav-icon.png';
import discoverIcon from '@/assets/discover-icon.jpg';
import myAgentIcon from '@/assets/myagent-icon.jpg';
import chaiChatIcon from '@/assets/chaichat-icon.jpg';

interface NavTab {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  isHero?: boolean;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs?: NavTab[];
  chaiChatBadge?: number;
  messagesBadge?: number;
}

const defaultTabs: NavTab[] = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'myagent', label: 'MyAgent', icon: Bot },
  { id: 'dna', label: 'MySoulDNA', icon: Fingerprint, isHero: true },
  { id: 'chaichat', label: 'ChaiChat', icon: MessageCircle, badge: 2 },
  { id: 'messages', label: 'Messages', icon: MessageCircle, badge: 3 },
];

export const BottomNav = ({
  activeTab,
  onTabChange,
  tabs = defaultTabs,
  chaiChatBadge = 0,
  messagesBadge = 0,
}: BottomNavProps) => {
  // Override default badge counts with dynamic ones
  const tabsWithDynamicBadges = tabs.map(tab => {
    if (tab.id === 'chaichat') {
      return { ...tab, badge: chaiChatBadge };
    }
    if (tab.id === 'messages') {
      return { ...tab, badge: messagesBadge };
    }
    return tab;
  });

  return (
    <motion.nav
      role="navigation"
      aria-label="Bottom navigation"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100 shadow-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="h-[60px] flex items-stretch justify-around">
        {tabsWithDynamicBadges.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          // Hero DNA Tab (special treatment)
          if (tab.isHero) {
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 max-w-[80px] px-1 touch-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                whileTap={{ scale: 0.95 }}
                animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                role="link"
              >
                {/* Hero Icon Circle */}
                <motion.div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary-pink to-primary-gold",
                    isActive && "shadow-lg shadow-primary-gold/25"
                  )}
                  animate={{
                    boxShadow: isActive 
                      ? '0 8px 16px rgba(212,165,116,0.36)' 
                      : '0 4px 10px rgba(212,165,116,0.24)',
                  }}
                  aria-hidden="true"
                >
                  <img 
                    src={mySoulDNAIcon} 
                    alt="MySoul DNA" 
                    className="w-8 h-8 object-contain"
                    aria-hidden="true"
                  />
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium leading-none",
                    isActive ? "text-primary-forest" : "text-neutral-500"
                  )}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          }

          // Normal Tab
          return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 max-w-[80px] px-1 py-2 touch-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                whileTap={{ scale: 0.97 }}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                role="link"
              >
              {/* Icon Container */}
              <div className="relative">
                {tab.id === 'discover' ? (
                  <img 
                    src={discoverIcon} 
                    alt="Discover" 
                    className="w-[30px] h-[30px] object-contain"
                    aria-hidden="true"
                  />
                ) : tab.id === 'myagent' ? (
                  <img 
                    src={myAgentIcon} 
                    alt="MyAgent" 
                    className="w-[30px] h-[30px] object-contain"
                    aria-hidden="true"
                  />
                ) : tab.id === 'chaichat' ? (
                  <img 
                    src={chaiChatIcon} 
                    alt="ChaiChat" 
                    className="w-[38px] h-[38px] object-contain"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      isActive ? "text-primary-forest" : "text-neutral-500"
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Badge */}
                {tab.badge && tab.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-semantic-error flex items-center justify-center"
                    role="status"
                    aria-label={`${tab.badge} ${tab.label.toLowerCase()} notifications`}
                  >
                    <span className="text-[10px] font-bold text-white leading-none" aria-hidden="true">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[11px] font-medium leading-none transition-colors duration-200",
                  isActive ? "text-primary-forest" : "text-neutral-500"
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
