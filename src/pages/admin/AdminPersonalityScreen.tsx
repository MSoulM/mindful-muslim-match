import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Save, History, TestTube, Globe, Sliders } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { PersonalityAdminService, PersonalityKey, ToneParameters, PromptRecord, CulturalVariantRecord, TestHistoryRecord } from '@/services/admin/PersonalityAdminService';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const PERSONALITY_NAMES: Record<PersonalityKey, string> = {
  wise_aunty: 'Amina (Wise Aunty)',
  modern_scholar: 'Amir (Modern Scholar)',
  spiritual_guide: 'Noor (Spiritual Guide)',
  cultural_bridge: 'Zara (Cultural Bridge)'
};

const CULTURAL_REGIONS = [
  { value: 'south_asian', label: 'South Asian' },
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'southeast_asian', label: 'Southeast Asian' },
  { value: 'western_convert', label: 'Western Convert' },
  { value: 'african', label: 'African' }
];

export const AdminPersonalityScreen = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminCheck();
  const { userId } = useAuth();
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityKey>('wise_aunty');
  const [activePrompt, setActivePrompt] = useState<PromptRecord | null>(null);
  const [versions, setVersions] = useState<PromptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [draftPrompt, setDraftPrompt] = useState('');
  const [toneParams, setToneParams] = useState<ToneParameters>({
    warmth: 5,
    formality: 5,
    energy: 5,
    empathy: 5,
    religiosity: 5
  });
  const [changeNotes, setChangeNotes] = useState('');
  
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<TestHistoryRecord | null>(null);
  const [testing, setTesting] = useState(false);
  
  const [culturalVariants, setCulturalVariants] = useState<CulturalVariantRecord[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<CulturalVariantRecord | null>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, selectedPersonality]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [active, versionsList, variants] = await Promise.all([
        PersonalityAdminService.getActivePrompt(selectedPersonality),
        PersonalityAdminService.getVersions(selectedPersonality),
        PersonalityAdminService.getCulturalVariants(selectedPersonality)
      ]);
      
      setActivePrompt(active);
      setVersions(versionsList);
      setCulturalVariants(variants);
      
      if (active) {
        setDraftPrompt(active.system_prompt);
        setToneParams(active.tone_parameters);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID not available',
        variant: 'destructive'
      });
      return;
    }

    try {
      const tokenCount = Math.ceil(draftPrompt.length / 4);
      if (tokenCount > 2000) {
        toast({
          title: 'Error',
          description: `Prompt exceeds 2000 token limit (estimated: ${tokenCount} tokens)`,
          variant: 'destructive'
        });
        return;
      }

      await PersonalityAdminService.saveDraft(
        selectedPersonality,
        draftPrompt,
        toneParams,
        changeNotes,
        userId
      );
      
      toast({
        title: 'Success',
        description: 'Draft saved successfully'
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save draft',
        variant: 'destructive'
      });
    }
  };

  const handleActivate = async (promptId: string) => {
    if (!userId) return;
    
    try {
      await PersonalityAdminService.activatePrompt(promptId, userId);
      toast({
        title: 'Success',
        description: 'Prompt activated successfully'
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate prompt',
        variant: 'destructive'
      });
    }
  };

  const handleRollback = async (version: number) => {
    if (!userId) return;
    
    try {
      await PersonalityAdminService.rollback(selectedPersonality, version, userId);
      toast({
        title: 'Success',
        description: `Rolled back to version ${version}`
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to rollback',
        variant: 'destructive'
      });
    }
  };

  const handleTest = async () => {
    if (!testInput.trim() || !activePrompt || !userId) return;
    
    setTesting(true);
    try {
      const result = await PersonalityAdminService.testPrompt(
        activePrompt.id,
        testInput,
        userId
      );
      setTestResult(result);
      toast({
        title: 'Test completed',
        description: `Response time: ${result.response_time_ms}ms, Tokens: ${result.token_usage}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Test failed',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <ScreenContainer>
        <TopBar title="MMAgent Personality Admin" />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TopBar title="MMAgent Personality Admin" />
      
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Personality</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedPersonality}
              onValueChange={(value) => setSelectedPersonality(value as PersonalityKey)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERSONALITY_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="editor">
              <Brain className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="test">
              <TestTube className="w-4 h-4 mr-2" />
              Test
            </TabsTrigger>
            <TabsTrigger value="cultural">
              <Globe className="w-4 h-4 mr-2" />
              Cultural
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Prompt Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>System Prompt</Label>
                  <Textarea
                    value={draftPrompt}
                    onChange={(e) => setDraftPrompt(e.target.value)}
                    rows={10}
                    placeholder="Enter system prompt..."
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Estimated tokens: {Math.ceil(draftPrompt.length / 4)} / 2000
                  </p>
                </div>

                <div>
                  <Label>Tone Parameters</Label>
                  <div className="space-y-4 mt-4">
                    {(['warmth', 'formality', 'energy', 'empathy', 'religiosity'] as const).map((param) => (
                      <div key={param} className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="capitalize">{param}</Label>
                          <span className="text-sm text-muted-foreground">{toneParams[param]}</span>
                        </div>
                        <Slider
                          value={[toneParams[param]]}
                          onValueChange={([value]) => setToneParams({ ...toneParams, [param]: value })}
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Change Notes</Label>
                  <Input
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    placeholder="Describe what changed and why..."
                  />
                </div>

                <Button onClick={handleSaveDraft} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell>{version.version}</TableCell>
                        <TableCell>
                          {version.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : version.is_draft ? (
                            <Badge variant="secondary">Draft</Badge>
                          ) : (
                            <Badge variant="outline">Archived</Badge>
                          )}
                        </TableCell>
                        <TableCell>{version.token_count || 'N/A'}</TableCell>
                        <TableCell>{new Date(version.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{version.change_notes || '-'}</TableCell>
                        <TableCell>
                          {!version.is_active && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleActivate(version.id)}
                              >
                                Activate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRollback(version.version)}
                              >
                                Rollback
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Simulator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Test Input</Label>
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    rows={4}
                    placeholder="Enter a test message..."
                  />
                </div>

                <Button
                  onClick={handleTest}
                  disabled={!testInput.trim() || !activePrompt || testing}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testing ? 'Testing...' : 'Run Test'}
                </Button>

                {testResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label>Response</Label>
                        <p className="text-sm mt-1">{testResult.test_output}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Response Time</Label>
                          <p className="text-sm">{testResult.response_time_ms}ms</p>
                        </div>
                        <div>
                          <Label>Token Usage</Label>
                          <p className="text-sm">{testResult.token_usage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cultural" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cultural Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    value={selectedVariant?.cultural_region || ''}
                    onValueChange={(value) => {
                      const variant = culturalVariants.find(v => v.cultural_region === value);
                      setSelectedVariant(variant || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {CULTURAL_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVariant && (
                  <div className="space-y-4">
                    <div>
                      <Label>Prompt Overlay</Label>
                      <Textarea
                        value={selectedVariant.prompt_overlay}
                        onChange={(e) => setSelectedVariant({ ...selectedVariant, prompt_overlay: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            await PersonalityAdminService.updateCulturalVariant(
                              selectedVariant.id,
                              selectedVariant
                            );
                            toast({ title: 'Success', description: 'Variant updated' });
                            await loadData();
                          } catch (error: any) {
                            toast({
                              title: 'Error',
                              description: error.message,
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await PersonalityAdminService.updateCulturalVariant(
                              selectedVariant.id,
                              { is_active: !selectedVariant.is_active }
                            );
                            toast({ title: 'Success', description: 'Variant toggled' });
                            await loadData();
                          } catch (error: any) {
                            toast({
                              title: 'Error',
                              description: error.message,
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        {selectedVariant.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label>All Variants</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region</TableHead>
                        <TableHead>A/B</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {culturalVariants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell>{CULTURAL_REGIONS.find(r => r.value === variant.cultural_region)?.label}</TableCell>
                          <TableCell>{variant.ab_test_variant || '-'}</TableCell>
                          <TableCell>{variant.ab_test_weight}%</TableCell>
                          <TableCell>
                            <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                              {variant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScreenContainer>
  );
};
