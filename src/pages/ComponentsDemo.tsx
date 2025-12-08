import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/CustomButton';
import { IconButton } from '@/components/ui/IconButton';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { StatCard } from '@/components/ui/Cards/StatCard';
import { FeatureCard } from '@/components/ui/Cards/FeatureCard';
import { TextInput } from '@/components/ui/Input/TextInput';
import { TextArea } from '@/components/ui/Input/TextArea';
import { Select } from '@/components/ui/Input/Select';
import { Toast } from '@/components/ui/Feedback/Toast';
import { ProgressBar } from '@/components/ui/Feedback/ProgressBar';
import { Skeleton } from '@/components/ui/Feedback/Skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { Heart, Send, User, Mail, AlertCircle, TrendingUp, Settings, HelpCircle, Star } from 'lucide-react';

const ComponentsDemo = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('discover');
  const [showToast, setShowToast] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [loading, setLoading] = useState(false);

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const handleLoadingDemo = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <TopBar
        variant="back"
        title="Components Demo"
        onBackClick={() => window.history.back()}
        notificationCount={unreadCount}
        onNotificationClick={() => navigate('/notifications')}
      />

      <ScreenContainer hasTopBar hasBottomNav padding scrollable>
        <div className="space-y-8 py-6">
          {/* Section: Buttons */}
          <section>
            <h2 className="text-xl font-bold text-primary-forest mb-4">Buttons</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm">Small Primary</Button>
                <Button variant="primary" size="md">Medium Primary</Button>
                <Button variant="primary" size="lg">Large Primary</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button variant="primary" icon={<Heart />}>With Icon</Button>
                <Button variant="primary" icon={<Send />} iconPosition="right">Icon Right</Button>
              </div>
              <Button variant="primary" fullWidth>Full Width Button</Button>
            </div>
          </section>

          {/* Section: Icon Buttons */}
          <section>
            <h2 className="text-xl font-bold text-primary-forest mb-4">Icon Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <IconButton icon={<Heart />} ariaLabel="Like" />
              <IconButton icon={<Heart />} variant="primary" ariaLabel="Like" />
              <IconButton icon={<Heart />} badge={5} ariaLabel="Like with badge" />
              <IconButton icon={<Star />} badge="99+" badgeColor="gold" ariaLabel="Star" />
              <IconButton icon={<Settings />} size="sm" ariaLabel="Settings" />
              <IconButton icon={<Settings />} size="lg" ariaLabel="Settings" />
            </div>
          </section>

          {/* Section: Cards */}
          <section>
            <h2 className="text-xl font-bold text-primary-forest mb-4">Cards</h2>
            <div className="space-y-4">
              <BaseCard>
                <h3 className="text-lg font-semibold mb-2">Base Card</h3>
                <p className="text-sm text-neutral-600">This is a basic card component with default styling.</p>
              </BaseCard>

              <InfoCard
                variant="highlight"
                icon={<AlertCircle />}
                title="Highlighted Info"
                description="This is an info card with a highlight variant and an action button."
                action={{
                  label: 'Learn More',
                  onClick: () => alert('Action clicked'),
                }}
              />

              <InfoCard
                variant="warning"
                icon={<AlertCircle />}
                description="Warning: Please complete your profile to get better matches."
              />

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Heart />}
                  label="Total Likes"
                  value="142"
                  trend={{ direction: 'up', value: '+12%' }}
                />
                <StatCard
                  icon={<User />}
                  label="Profile Views"
                  value="1.2K"
                  trend={{ direction: 'down', value: '-3%' }}
                />
              </div>

              <FeatureCard
                icon={<Settings />}
                title="Account Settings"
                description="Manage your account preferences and privacy settings"
                onClick={() => alert('Feature clicked')}
              />

              <FeatureCard
                icon={<HelpCircle />}
                title="Help & Support"
                rightElement={<span className="text-xs text-neutral-500">24/7</span>}
                onClick={() => alert('Help clicked')}
              />
            </div>
          </section>

          {/* Section: Inputs */}
          <section>
            <h2 className="text-xl font-bold text-primary-forest mb-4">Input Fields</h2>
            <div className="space-y-4">
              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                value={textValue}
                onChange={setTextValue}
                type="email"
                icon={<Mail />}
                required
              />

              <TextInput
                label="Password"
                placeholder="Enter your password"
                value=""
                onChange={() => {}}
                type="password"
              />

              <TextInput
                label="With Error"
                placeholder="Enter something"
                value=""
                onChange={() => {}}
                error="This field is required"
              />

              <TextArea
                label="Bio"
                placeholder="Tell us about yourself..."
                value={textAreaValue}
                onChange={setTextAreaValue}
                maxLength={500}
                helperText="Share what makes you unique"
              />

              <Select
                label="Country"
                placeholder="Select your country"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                required
              />
            </div>
          </section>

          {/* Section: Feedback */}
          <section>
            <h2 className="text-xl font-bold text-primary-forest mb-4">Feedback Components</h2>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">Progress Bars</p>
                <div className="space-y-4">
                  <ProgressBar value={75} label="Profile Completion" />
                  <ProgressBar value={45} color="success" size="sm" />
                  <ProgressBar value={90} color="warning" showPercentage={false} />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">Skeleton Loaders</p>
                <div className="space-y-3">
                  <Skeleton variant="text" width="60%" />
                  <div className="flex gap-3">
                    <Skeleton variant="circle" width={48} height={48} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="80%" />
                    </div>
                  </div>
                  <Skeleton variant="rect" height={120} />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowToast(true)}
                fullWidth
              >
                Show Toast Notification
              </Button>
            </div>
          </section>
        </div>
      </ScreenContainer>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Toast Notification */}
      <Toast
        isOpen={showToast}
        type="success"
        title="Success!"
        description="This is a toast notification with auto-dismiss."
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ComponentsDemo;
