import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { HelpCategoryCard } from '@/components/help/HelpCategoryCard';
import { HelpArticleItem } from '@/components/help/HelpArticleItem';
import { VideoTutorialCard } from '@/components/help/VideoTutorialCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/CustomButton';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { 
  Search, X, Rocket, User, Heart, Shield, 
  Headphones 
} from 'lucide-react';

export default function HelpCenterScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: <Rocket className="w-8 h-8" />,
      label: 'Getting Started',
      articleCount: 12,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      route: '/help/category/getting-started',
    },
    {
      icon: <User className="w-8 h-8" />,
      label: 'Account & Profile',
      articleCount: 8,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      route: '/help/category/account',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      label: 'Matching & Discovery',
      articleCount: 15,
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      route: '/help/category/matching',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      label: 'Safety & Privacy',
      articleCount: 10,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      route: '/help/category/safety',
    },
  ];

  const popularArticles = [
    { title: 'How does DNA matching work?', views: '1.2k views', id: '1' },
    { title: 'What is ChaiChat?', views: '980 views', id: '2' },
    { title: 'Verifying your profile', views: '850 views', id: '3' },
    { title: 'Subscription benefits', views: '720 views', id: '4' },
    { title: 'Reporting and blocking', views: '650 views', id: '5' },
  ];

  const videoTutorials = [
    { title: 'Getting Started with MuslimSoulmate.ai', duration: '2:30', id: '1' },
    { title: 'Creating Your DNA Profile', duration: '3:45', id: '2' },
    { title: 'Using ChaiChat Effectively', duration: '4:15', id: '3' },
  ];

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Help Center"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="px-5 pt-6 pb-4">
          <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <HelpCategoryCard
                key={category.label}
                icon={category.icon}
                label={category.label}
                articleCount={category.articleCount}
                gradient={category.gradient}
                onClick={() => navigate(category.route)}
              />
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="px-5 py-4">
          <h2 className="text-lg font-semibold mb-3">Popular Articles</h2>
          <div className="space-y-2">
            {popularArticles.map((article) => (
              <HelpArticleItem
                key={article.id}
                title={article.title}
                views={article.views}
                onClick={() => navigate(`/help/article/${article.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="py-4">
          <h2 className="text-lg font-semibold mb-3 px-5">Video Tutorials</h2>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
            {videoTutorials.map((video) => (
              <VideoTutorialCard
                key={video.id}
                title={video.title}
                duration={video.duration}
                onClick={() => navigate(`/help/tutorial/${video.id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
        <BaseCard padding="md" className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Need more help?</h3>
              <p className="text-sm text-muted-foreground">Our team is here for you</p>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/help/contact')}
          >
            Contact Support
          </Button>
        </BaseCard>
      </div>
    </ScreenContainer>
  );
}
