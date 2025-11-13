import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomNav } from '@/components/layout/BottomNav';
import {
  HeartAnimation, 
  MessageSentAnimation, 
  MatchCelebration,
  DNASelectionFeedback,
  SkeletonShimmer,
  StaggerList,
  SwipeableCard
} from '@/components/ui/animated';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AnimationShowcase = () => {
  const navigate = useNavigate();
  const [showMatch, setShowMatch] = useState(false);
  const [messageStatus, setMessageStatus] = useState<'sent' | 'delivered' | 'read'>('sent');
  const [selectedDNA, setSelectedDNA] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('discover');

  const dnaCategories = [
    { id: 1, name: 'Values & Beliefs', color: '#0D7377' },
    { id: 2, name: 'Interests & Hobbies', color: '#FF6B6B' },
    { id: 3, name: 'Personality Traits', color: '#8B7AB8' },
    { id: 4, name: 'Lifestyle & Habits', color: '#0066CC' },
    { id: 5, name: 'Life Goals', color: '#FDB813' },
  ];

  const listItems = [
    'Animation Item 1',
    'Animation Item 2',
    'Animation Item 3',
    'Animation Item 4',
  ];

  return (
    <>
      <TopBar 
        variant="back"
        title="Animation Showcase"
        onBackClick={() => navigate(-1)}
      />
      
      <ScreenContainer className="space-y-8 pb-24">
        {/* Heart Animation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Heart Animation</h3>
          <div className="flex justify-center">
            <HeartAnimation size={48} />
          </div>
        </Card>

        {/* Message Status Animation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Message Status</h3>
          <div className="flex items-center gap-4 justify-center">
            <MessageSentAnimation 
              show={true} 
              isDelivered={messageStatus === 'delivered' || messageStatus === 'read'}
              isRead={messageStatus === 'read'}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setMessageStatus('sent')}>Sent</Button>
              <Button size="sm" onClick={() => setMessageStatus('delivered')}>Delivered</Button>
              <Button size="sm" onClick={() => setMessageStatus('read')}>Read</Button>
            </div>
          </div>
        </Card>

        {/* Match Celebration */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Match Celebration</h3>
          <Button onClick={() => setShowMatch(true)} className="w-full">
            Show Match Animation
          </Button>
        </Card>

        {/* DNA Selection Feedback */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">DNA Selection Feedback</h3>
          <div className="grid grid-cols-2 gap-3">
            {dnaCategories.slice(0, 4).map((category) => (
              <DNASelectionFeedback
                key={category.id}
                isSelected={selectedDNA.includes(category.id)}
                onSelect={() => {
                  setSelectedDNA(prev => 
                    prev.includes(category.id)
                      ? prev.filter(id => id !== category.id)
                      : [...prev, category.id]
                  );
                }}
                categoryColor={category.color}
              >
                <div className="p-4 text-center">
                  <p className="text-sm font-medium">{category.name}</p>
                </div>
              </DNASelectionFeedback>
            ))}
          </div>
        </Card>

        {/* Skeleton Shimmer */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Skeleton Loading</h3>
          <div className="space-y-3">
            <SkeletonShimmer variant="text" height="1rem" width="60%" />
            <SkeletonShimmer variant="rect" height="120px" />
            <div className="flex gap-3">
              <SkeletonShimmer variant="circle" width="48px" height="48px" />
              <div className="flex-1 space-y-2">
                <SkeletonShimmer variant="text" height="1rem" width="80%" />
                <SkeletonShimmer variant="text" height="1rem" width="60%" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stagger List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Stagger List Animation</h3>
          <StaggerList staggerDelay={0.1}>
            {listItems.map((item, index) => (
              <motion.div
                key={index}
                className="p-4 bg-muted rounded-lg mb-2"
                whileHover={{ scale: 1.02 }}
              >
                {item}
              </motion.div>
            ))}
          </StaggerList>
        </Card>

        {/* Swipeable Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Swipeable Card</h3>
          <p className="text-sm text-muted-foreground mb-4">Drag left or right</p>
          <SwipeableCard
            onSwipeLeft={() => console.log('Swiped left')}
            onSwipeRight={() => console.log('Swiped right')}
            className="relative"
          >
            <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5">
              <p className="text-lg font-medium">Swipe Me!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Drag left for NOPE, right for LIKE
              </p>
            </Card>
          </SwipeableCard>
        </Card>
      </ScreenContainer>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Match Celebration Overlay */}
      <MatchCelebration
        show={showMatch}
        matchName="Sarah"
        onComplete={() => setShowMatch(false)}
      />
    </>
  );
};

export default AnimationShowcase;
