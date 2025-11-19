import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomNav } from '@/components/layout/BottomNav';
import { DepthIndicator } from '@/components/profile/DepthIndicator';
import { DepthAnalyzer } from '@/components/profile/DepthAnalyzer';
import { DepthCoachingPrompts } from '@/components/profile/DepthCoachingPrompts';
import { DepthProgress } from '@/components/profile/DepthProgress';
import { DepthAchievements } from '@/components/profile/DepthAchievements';
import { EnhancedProfileSeed } from '@/components/profile/EnhancedProfileSeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Award, BookOpen } from 'lucide-react';

const DepthSystemDemo = () => {
  const navigate = useNavigate();
  const [selectedDepth, setSelectedDepth] = useState<1 | 2 | 3 | 4>(2);
  const [analyzerDepth, setAnalyzerDepth] = useState(1);
  const [activeTab, setActiveTab] = useState('dna');

  // Example profile seed for demo
  const exampleSeed = {
    id: 'demo-1',
    question: 'What brings you joy in daily life?',
    prompt: 'Share what makes you smile and why it matters to you',
    topic: 'daily joy'
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <>
      <TopBar 
        variant="back" 
        title="Depth System Demo"
        onBackClick={() => navigate(-1)}
      />
      <ScreenContainer>
        <div className="space-y-6 pb-20">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">DNA Depth Multiplier System</h1>
            </div>
            <p className="text-muted-foreground">
              Quality over quantity: Deeper sharing earns exponentially more DNA points
            </p>
          </div>

          {/* Quick Overview Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                How It Works
              </CardTitle>
              <CardDescription>
                Each level of depth multiplies your DNA impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-2xl mb-1">🌊</div>
                  <div className="font-semibold text-sm">Surface (1x)</div>
                  <div className="text-xs text-muted-foreground">Basic facts</div>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-semibold text-sm">Context (2x)</div>
                  <div className="text-xs text-muted-foreground">With meaning</div>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-2xl mb-1">💜</div>
                  <div className="font-semibold text-sm">Emotional (3x)</div>
                  <div className="text-xs text-muted-foreground">With feelings</div>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-2xl mb-1">✨</div>
                  <div className="font-semibold text-sm">Transform (5x)</div>
                  <div className="text-xs text-muted-foreground">Growth story</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Components */}
          <Tabs defaultValue="indicators" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
              <TabsTrigger value="analyzer">Live Analyzer</TabsTrigger>
            </TabsList>

            {/* Depth Indicators Tab */}
            <TabsContent value="indicators" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Depth Level Examples</CardTitle>
                  <CardDescription>
                    See how each depth level is visualized
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Level 1: Surface</div>
                    <DepthIndicator
                      text="I like reading"
                      depthLevel={1}
                      multiplier={1}
                    />
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "I like reading" - Just a basic fact with no context
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Level 2: Context</div>
                    <DepthIndicator
                      text="I like reading because it helps me understand different perspectives"
                      depthLevel={2}
                      multiplier={2}
                    />
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Added the "why" - explains the meaning behind the interest
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Level 3: Emotional</div>
                    <DepthIndicator
                      text="Reading makes me feel connected to humanity across time and space"
                      depthLevel={3}
                      multiplier={3}
                    />
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Shares feelings and emotional connection to the activity
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Level 4: Transformational</div>
                    <DepthIndicator
                      text="Reading transformed how I see the world. Before, I was closed-minded, but books opened my heart to understanding people different from me."
                      depthLevel={4}
                      multiplier={5}
                    />
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      A growth story showing transformation and personal evolution
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Depth Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interactive Preview</CardTitle>
                  <CardDescription>
                    Select a depth level to see how it displays
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedDepth(level as 1 | 2 | 3 | 4)}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          selectedDepth === level
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-xl mb-1">
                          {level === 1 && '🌊'}
                          {level === 2 && '🎯'}
                          {level === 3 && '💜'}
                          {level === 4 && '✨'}
                        </div>
                        <div className="text-xs font-medium">Level {level}</div>
                      </button>
                    ))}
                  </div>

                  <DepthIndicator
                    text="Your selected depth level"
                    depthLevel={selectedDepth}
                    multiplier={selectedDepth === 1 ? 1 : selectedDepth === 2 ? 2 : selectedDepth === 3 ? 3 : 5}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Analyzer Tab */}
            <TabsContent value="analyzer" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Real-Time Depth Analysis</CardTitle>
                  <CardDescription>
                    Type to see automatic depth detection in action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DepthAnalyzer onDepthChange={setAnalyzerDepth} />
                  
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="text-sm font-medium mb-2">💡 Pro Tips:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Add "because" or "why" to boost to Context level</li>
                      <li>• Include emotional words like "feel", "heart", "love" for Emotional</li>
                      <li>• Share transformation with words like "changed", "grew", "learned" for max impact</li>
                      <li>• Write 80+ words with transformation language to reach 5x multiplier</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Coaching Prompts Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Coaching Prompts</CardTitle>
                  <CardDescription>
                    Get guided questions to deepen your sharing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DepthCoachingPrompts 
                    currentDepth={analyzerDepth} 
                    topic="reading"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Progress & Stats Tab */}
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="progress">
                <BookOpen className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="mt-4">
              <DepthProgress />
            </TabsContent>

            <TabsContent value="achievements" className="mt-4">
              <DepthAchievements />
            </TabsContent>
          </Tabs>

          {/* Enhanced Profile Seed Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Complete Flow Example
              </CardTitle>
              <CardDescription>
                Try responding to this profile seed with depth analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedProfileSeed 
                seed={exampleSeed}
                onSubmit={(response, depth) => {
                  console.log('Submitted:', { response, depth });
                }}
              />
            </CardContent>
          </Card>

          {/* Impact Comparison */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Impact Comparison</CardTitle>
              <CardDescription>
                See how depth multiplies your DNA points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">10 Surface shares</div>
                    <div className="text-xs text-muted-foreground">1x multiplier each</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div>
                    <div className="font-medium">5 Context shares</div>
                    <div className="text-xs text-muted-foreground">2x multiplier each</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">10</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div>
                    <div className="font-medium">3 Emotional shares</div>
                    <div className="text-xs text-muted-foreground">3x multiplier each</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">9</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
                  <div>
                    <div className="font-medium">2 Transformational shares</div>
                    <div className="text-xs text-muted-foreground">5x multiplier each</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-600">10</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <div className="text-sm font-semibold text-center">
                    💡 Same points with fewer but deeper shares!
                  </div>
                  <div className="text-xs text-center text-muted-foreground mt-1">
                    Quality truly matters more than quantity
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Philosophy */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-base">Why Depth Matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Authentic Connection:</strong> Deeper shares reveal who you truly are, creating stronger compatibility matches.
              </p>
              <p>
                <strong className="text-foreground">Quality Over Quantity:</strong> One transformational story builds more DNA than ten surface facts.
              </p>
              <p>
                <strong className="text-foreground">No Pressure:</strong> This system gently encourages depth but never requires it. Share at your comfort level.
              </p>
              <p>
                <strong className="text-foreground">Evolutionary Insight:</strong> The more authentic you are, the better we understand who would truly complement you.
              </p>
            </CardContent>
          </Card>
        </div>
      </ScreenContainer>
      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </>
  );
};

export default DepthSystemDemo;
