import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { useResponsive, useViewport, useSafeArea } from '@/hooks/useResponsive';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveShow, ResponsiveText } from '@/components/utils/ResponsiveContainer';
import { MSMLogo } from '@/components/brand/MSMLogo';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, Tablet, Monitor, Info, 
  Maximize, Minimize, RotateCw, CheckCircle2 
} from 'lucide-react';

export default function ResponsiveDemo() {
  const navigate = useNavigate();
  const responsive = useResponsive();
  const viewport = useViewport();
  const safeArea = useSafeArea();
  const [activeTab, setActiveTab] = useState('overview');

  const deviceInfo = [
    { label: 'Breakpoint', value: responsive.breakpoint, icon: Info },
    { label: 'Width', value: `${viewport.width}px`, icon: Maximize },
    { label: 'Height', value: `${viewport.height}px`, icon: Minimize },
    { label: 'Orientation', value: responsive.isPortrait ? 'Portrait' : 'Landscape', icon: RotateCw },
  ];

  const breakpointChecks = [
    { label: 'Mobile (< 768px)', active: responsive.isMobile, icon: Smartphone },
    { label: 'Tablet (768px - 1024px)', active: responsive.isTablet, icon: Tablet },
    { label: 'Desktop (>= 1024px)', active: responsive.isDesktop, icon: Monitor },
  ];

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Responsive Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <ResponsiveContainer maxWidth="2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Responsive Design System
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground reading-width">
              Demonstrating perfect responsive behavior across all device sizes with breakpoint optimization, 
              component adaptations, and platform-specific features.
            </p>
          </div>

          {/* Current Device Status */}
          <BaseCard className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Current Device Status</h2>
              <Badge variant="outline" className="bg-background">
                Live
              </Badge>
            </div>

            <ResponsiveGrid cols={{ xs: 2, sm: 2, md: 4, lg: 4 }} gap="sm">
              {deviceInfo.map((info) => (
                <div key={info.label} className="flex items-center gap-2 p-3 bg-background rounded-lg">
                  <info.icon className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{info.label}</p>
                    <p className="text-sm font-semibold">{info.value}</p>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>

            {/* Breakpoint Indicators */}
            <div className="mt-4 space-y-2">
              {breakpointChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg"
                >
                  <check.icon className={check.active ? 'text-green-600' : 'text-muted-foreground'} />
                  <span className={check.active ? 'font-medium' : 'text-muted-foreground'}>
                    {check.label}
                  </span>
                  {check.active && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
                </div>
              ))}
            </div>

            {/* Safe Area Info */}
            {(safeArea.top > 0 || safeArea.bottom > 0) && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Safe Area Insets Detected
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <div>Top: {safeArea.top}px</div>
                  <div>Bottom: {safeArea.bottom}px</div>
                  <div>Left: {safeArea.left}px</div>
                  <div>Right: {safeArea.right}px</div>
                </div>
              </div>
            )}
          </BaseCard>

          {/* Tabs for Different Demos */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="grids">Grids</TabsTrigger>
              <TabsTrigger value="text">Typography</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <BaseCard>
                <h3 className="font-semibold text-lg mb-4">Breakpoint System</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">xs: 320px</p>
                      <p className="text-sm text-muted-foreground">iPhone SE minimum</p>
                    </div>
                    <Badge variant={responsive.isXs ? 'default' : 'outline'}>
                      {responsive.isXs ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">sm: 375px</p>
                      <p className="text-sm text-muted-foreground">iPhone standard</p>
                    </div>
                    <Badge variant={responsive.isSm ? 'default' : 'outline'}>
                      {responsive.isSm ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">md: 768px</p>
                      <p className="text-sm text-muted-foreground">iPad & tablets</p>
                    </div>
                    <Badge variant={responsive.isMd ? 'default' : 'outline'}>
                      {responsive.isMd ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">lg: 1024px</p>
                      <p className="text-sm text-muted-foreground">Desktop</p>
                    </div>
                    <Badge variant={responsive.isLg ? 'default' : 'outline'}>
                      {responsive.isLg ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </BaseCard>

              <BaseCard>
                <h3 className="font-semibold text-lg mb-4">Conditional Rendering</h3>
                <div className="space-y-4">
                  <ResponsiveShow only="xs">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        ✓ Visible only on xs screens (320px)
                      </p>
                    </div>
                  </ResponsiveShow>

                  <ResponsiveShow only="sm">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        ✓ Visible only on sm screens (375px - 767px)
                      </p>
                    </div>
                  </ResponsiveShow>

                  <ResponsiveShow only="md">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        ✓ Visible only on md screens (768px - 1023px)
                      </p>
                    </div>
                  </ResponsiveShow>

                  <ResponsiveShow above="md">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        ✓ Visible on lg+ screens (1024px and above)
                      </p>
                    </div>
                  </ResponsiveShow>
                </div>
              </BaseCard>
            </TabsContent>

            {/* Logo Tab */}
            <TabsContent value="logo" className="space-y-6">
              <BaseCard>
                <h3 className="font-semibold text-lg mb-4">Responsive Logo Variants</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Logo automatically adapts: icon-only on mobile, full text on tablet/desktop.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Icon variant</p>
                    <MSMLogo variant="icon" />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Compact variant</p>
                    <MSMLogo variant="compact" />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Full variant</p>
                    <MSMLogo variant="full" />
                  </div>
                </div>
              </BaseCard>
            </TabsContent>

            {/* Grids Tab */}
            <TabsContent value="grids" className="space-y-6">
              <BaseCard>
                <h3 className="font-semibold text-lg mb-4">Responsive Grid System</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Grids automatically adapt: 1 column on xs, 2 on sm/md, 3 on lg, 4 on xl.
                </p>

                <ResponsiveGrid>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-primary">{i + 1}</span>
                    </div>
                  ))}
                </ResponsiveGrid>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Current grid:</strong> {' '}
                    {responsive.isXs && '1 column (xs)'}
                    {responsive.isSm && '2 columns (sm)'}
                    {responsive.isMd && '2 columns (md)'}
                    {responsive.isLg && '3 columns (lg)'}
                    {responsive.isXl && '4 columns (xl)'}
                  </p>
                </div>
              </BaseCard>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="text" className="space-y-6">
              <BaseCard>
                <h3 className="font-semibold text-lg mb-4">Responsive Typography</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Text scales appropriately across devices for optimal readability.
                </p>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Heading 3XL (scales)</p>
                    <ResponsiveText size="3xl">
                      <div className="font-bold">The Quick Brown Fox</div>
                    </ResponsiveText>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Heading 2XL (scales)</p>
                    <ResponsiveText size="2xl">
                      <div className="font-bold">The Quick Brown Fox</div>
                    </ResponsiveText>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Body Text (scales)</p>
                    <ResponsiveText size="base">
                      <div className="reading-width">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                        nostrud exercitation ullamco laboris.
                      </div>
                    </ResponsiveText>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Optimal Reading Width (.reading-width class)
                    </p>
                    <div className="reading-width text-sm">
                      This paragraph is constrained to 65 characters width (65ch) which is optimal for 
                      readability. Studies show that line lengths between 50-75 characters are easiest to read.
                    </div>
                  </div>
                </div>
              </BaseCard>
            </TabsContent>
          </Tabs>

          {/* Touch Target Demo */}
          <BaseCard className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Touch Target Compliance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All interactive elements meet the 44x44px minimum touch target requirement.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="min-touch-target">Standard Button</Button>
              <Button variant="outline" className="min-touch-target">Outline</Button>
              <Button variant="secondary" className="min-touch-target">Secondary</Button>
              <Button variant="ghost" className="min-touch-target">Ghost</Button>
            </div>
          </BaseCard>

          {/* Platform Info */}
          <BaseCard>
            <h3 className="font-semibold text-lg mb-4">Platform Detection</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span>Touch Device</span>
                <Badge variant={responsive.isTouch ? 'default' : 'outline'}>
                  {responsive.isTouch ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span>Orientation</span>
                <Badge variant="outline">
                  {responsive.isPortrait ? 'Portrait' : 'Landscape'}
                </Badge>
              </div>
            </div>
          </BaseCard>
        </ResponsiveContainer>
      </div>
    </ScreenContainer>
  );
}
