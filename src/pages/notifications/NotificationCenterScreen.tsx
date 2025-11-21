import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';

type FilterType = 'all' | 'unread' | 'matches' | 'messages';

export const NotificationCenterScreen = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Mock personality type - in production this would come from user profile/context
  const userPersonality: UserPersonalityType = 'wise_aunty';
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'matches', label: 'Matches' },
    { id: 'messages', label: 'Messages' }
  ];
  
  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'matches') return notif.type === 'match';
    if (activeFilter === 'messages') return notif.type === 'message';
    return true;
  });
  
  const groupByDate = (notifications: typeof filteredNotifications) => {
    const groups: Record<string, typeof notifications> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: []
    };
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    notifications.forEach(notif => {
      const notifDate = new Date(notif.timestamp);
      if (notifDate.toDateString() === today.toDateString()) {
        groups.today.push(notif);
      } else if (notifDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(notif);
      } else if (notifDate >= weekAgo) {
        groups.thisWeek.push(notif);
      } else {
        groups.earlier.push(notif);
      }
    });
    
    return groups;
  };
  
  const groupedNotifications = groupByDate(filteredNotifications);
  const hasNotifications = filteredNotifications.length > 0;
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <>
      <TopBar 
        variant="logo"
        onNotificationClick={() => navigate('/notifications')}
        onProfileClick={() => navigate('/profile')}
      />
      <ScreenContainer hasTopBar hasBottomNav>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-primary"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
        </div>
      
      {/* Filter Chips */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as FilterType)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {filter.label}
              {filter.id === 'unread' && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary-foreground text-primary rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {hasNotifications ? (
          <div className="pb-20">
            {groupedNotifications.today.length > 0 && (
              <div>
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm px-4 py-2 border-b border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground">Today</h3>
                </div>
                {groupedNotifications.today.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    personalityType={userPersonality}
                    onPress={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        navigate(notification.actionUrl);
                      }
                    }}
                    onDelete={() => deleteNotification(notification.id)}
                    onToggleRead={() => markAsRead(notification.id)}
                  />
                ))}
              </div>
            )}
            
            {groupedNotifications.yesterday.length > 0 && (
              <div>
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm px-4 py-2 border-b border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground">Yesterday</h3>
                </div>
                {groupedNotifications.yesterday.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    personalityType={userPersonality}
                    onPress={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        navigate(notification.actionUrl);
                      }
                    }}
                    onDelete={() => deleteNotification(notification.id)}
                    onToggleRead={() => markAsRead(notification.id)}
                  />
                ))}
              </div>
            )}
            
            {groupedNotifications.thisWeek.length > 0 && (
              <div>
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm px-4 py-2 border-b border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground">This Week</h3>
                </div>
                {groupedNotifications.thisWeek.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    personalityType={userPersonality}
                    onPress={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        navigate(notification.actionUrl);
                      }
                    }}
                    onDelete={() => deleteNotification(notification.id)}
                    onToggleRead={() => markAsRead(notification.id)}
                  />
                ))}
              </div>
            )}
            
            {groupedNotifications.earlier.length > 0 && (
              <div>
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm px-4 py-2 border-b border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground">Earlier</h3>
                </div>
                {groupedNotifications.earlier.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    personalityType={userPersonality}
                    onPress={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        navigate(notification.actionUrl);
                      }
                    }}
                    onDelete={() => deleteNotification(notification.id)}
                    onToggleRead={() => markAsRead(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <EmptyState
              icon={<BellOff className="h-12 w-12" />}
              title="All Caught Up!"
              description="No new notifications"
            />
          </div>
        )}
      </ScrollArea>
      </ScreenContainer>
      
      <BottomNav activeTab="notifications" onTabChange={(tab) => navigate(`/${tab}`)} />
    </>
  );
};
