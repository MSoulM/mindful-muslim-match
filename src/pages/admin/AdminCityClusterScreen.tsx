import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Save, Plus, Trash2, Edit, BarChart3 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

type CityKey = 'london' | 'nyc' | 'houston_chicago' | 'dubai' | 'mumbai_dhaka';
type ReferenceType = 'mosque' | 'restaurant' | 'event' | 'organization' | 'landmark';

interface CityCluster {
  city_key: CityKey;
  city_name: string;
  region: string;
  timezone: string;
  tone_style: string | null;
  formality_level: number;
  is_enabled: boolean;
}

interface CityPrompt {
  id: string;
  city_key: CityKey;
  personality_key: string | null;
  prompt_overlay: string;
  tone_adjustments: {
    warmth_modifier: number;
    formality_modifier: number;
    directness_modifier: number;
  };
  is_active: boolean;
}

interface LocalReference {
  id: string;
  city_key: CityKey;
  reference_type: ReferenceType;
  name: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  context_keywords: string[];
  usage_count: number;
  is_verified: boolean;
  is_active: boolean;
}

const CITY_NAMES: Record<CityKey, string> = {
  london: 'London',
  nyc: 'New York City',
  houston_chicago: 'Houston & Chicago',
  dubai: 'Dubai',
  mumbai_dhaka: 'Mumbai & Dhaka'
};

const PERSONALITY_OPTIONS = [
  { value: '', label: 'City-wide (All Personalities)' },
  { value: 'wise_aunty', label: 'Wise Aunty' },
  { value: 'modern_scholar', label: 'Modern Scholar' },
  { value: 'spiritual_guide', label: 'Spiritual Guide' },
  { value: 'cultural_bridge', label: 'Cultural Bridge' }
];

const REFERENCE_TYPES: ReferenceType[] = ['mosque', 'restaurant', 'event', 'organization', 'landmark'];

export const AdminCityClusterScreen = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminCheckLoading } = useAdminCheck();
  const { getToken } = useAuth();
  
  const [cities, setCities] = useState<CityCluster[]>([]);
  const [prompts, setPrompts] = useState<CityPrompt[]>([]);
  const [references, setReferences] = useState<LocalReference[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedCity, setSelectedCity] = useState<CityKey>('london');
  const [editingCity, setEditingCity] = useState<CityCluster | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<CityPrompt | null>(null);
  const [editingReference, setEditingReference] = useState<LocalReference | null>(null);
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [showReferenceForm, setShowReferenceForm] = useState(false);

  useEffect(() => {
    if (!adminCheckLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminCheckLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [citiesRes, promptsRes, referencesRes, analyticsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-cities`, { headers }),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-city-prompts`, { headers }),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-local-references`, { headers }),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-city-analytics`, { headers })
      ]);

      const [citiesData, promptsData, referencesData, analyticsData] = await Promise.all([
        citiesRes.json(),
        promptsRes.json(),
        referencesRes.json(),
        analyticsRes.json()
      ]);

      setCities(citiesData.cities || []);
      setPrompts(promptsData.prompts || []);
      setReferences(referencesData.references || []);
      setAnalytics(analyticsData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCity = async (cityKey: CityKey, updates: Partial<CityCluster>) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-cities`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city_key: cityKey, updates })
      });

      if (!response.ok) throw new Error('Failed to update city');

      toast({
        title: 'Success',
        description: 'City updated successfully'
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const savePrompt = async (prompt: Partial<CityPrompt>) => {
    try {
      const token = await getToken();
      const method = prompt.id ? 'PUT' : 'POST';
      const body = prompt.id 
        ? JSON.stringify({ id: prompt.id, updates: prompt })
        : JSON.stringify(prompt);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-city-prompts`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (!response.ok) throw new Error('Failed to save prompt');

      toast({
        title: 'Success',
        description: 'City prompt saved successfully'
      });
      
      setShowPromptForm(false);
      setEditingPrompt(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-city-prompts`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete prompt');

      toast({
        title: 'Success',
        description: 'City prompt deleted successfully'
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const saveReference = async (reference: Partial<LocalReference>) => {
    try {
      const token = await getToken();
      const method = reference.id ? 'PUT' : 'POST';
      const body = reference.id 
        ? JSON.stringify({ id: reference.id, updates: reference })
        : JSON.stringify(reference);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-local-references`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (!response.ok) throw new Error('Failed to save reference');

      toast({
        title: 'Success',
        description: 'Local reference saved successfully'
      });
      
      setShowReferenceForm(false);
      setEditingReference(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteReference = async (id: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-local-references`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete reference');

      toast({
        title: 'Success',
        description: 'Local reference deleted successfully'
      });
      
      await loadData();
    } catch (any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (adminCheckLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null;
  }

  const filteredPrompts = prompts.filter(p => p.city_key === selectedCity);
  const filteredReferences = references.filter(r => r.city_key === selectedCity);

  return (
    <>
      <TopBar />
      <ScreenContainer>
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-[#2A9D8F]" />
            <div>
              <h1 className="text-2xl font-bold">City Cluster Management</h1>
              <p className="text-sm text-gray-500">Manage city-specific cultural intelligence for MMAgent</p>
            </div>
          </div>

          <Tabs defaultValue="cities" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cities">City Clusters</TabsTrigger>
              <TabsTrigger value="prompts">City Prompts</TabsTrigger>
              <TabsTrigger value="references">Local References</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="cities">
              <Card>
                <CardHeader>
                  <CardTitle>City Cluster Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>City</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Timezone</TableHead>
                        <TableHead>Formality Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cities.map(city => (
                        <TableRow key={city.city_key}>
                          <TableCell className="font-medium">{city.city_name}</TableCell>
                          <TableCell>{city.region}</TableCell>
                          <TableCell className="text-sm text-gray-500">{city.timezone}</TableCell>
                          <TableCell>{city.formality_level}/10</TableCell>
                          <TableCell>
                            <Switch
                              checked={city.is_enabled}
                              onCheckedChange={(checked) => updateCity(city.city_key, { is_enabled: checked })}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingCity(city)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prompts">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>City-Specific Prompts</CardTitle>
                      <div className="flex gap-2">
                        <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as CityKey)}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CITY_NAMES).map(([key, name]) => (
                              <SelectItem key={key} value={key}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => {
                          setEditingPrompt({
                            id: '',
                            city_key: selectedCity,
                            personality_key: null,
                            prompt_overlay: '',
                            tone_adjustments: { warmth_modifier: 0, formality_modifier: 0, directness_modifier: 0 },
                            is_active: true
                          });
                          setShowPromptForm(true);
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Prompt
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Personality</TableHead>
                          <TableHead>Tone Adjustments</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPrompts.map(prompt => (
                          <TableRow key={prompt.id}>
                            <TableCell>
                              <Badge variant={prompt.personality_key ? 'default' : 'secondary'}>
                                {prompt.personality_key || 'City-wide'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              W:{prompt.tone_adjustments.warmth_modifier} F:{prompt.tone_adjustments.formality_modifier} D:{prompt.tone_adjustments.directness_modifier}
                            </TableCell>
                            <TableCell>
                              {prompt.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingPrompt(prompt);
                                    setShowPromptForm(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deletePrompt(prompt.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {showPromptForm && editingPrompt && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{editingPrompt.id ? 'Edit' : 'Create'} City Prompt</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Personality (leave empty for city-wide)</Label>
                        <Select
                          value={editingPrompt.personality_key || ''}
                          onValueChange={(v) => setEditingPrompt({ ...editingPrompt, personality_key: v || null })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERSONALITY_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Prompt Overlay</Label>
                        <Textarea
                          value={editingPrompt.prompt_overlay}
                          onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_overlay: e.target.value })}
                          rows={6}
                          placeholder="City-specific cultural guidance for MMAgent..."
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Warmth Modifier</Label>
                          <Input
                            type="number"
                            value={editingPrompt.tone_adjustments.warmth_modifier}
                            onChange={(e) => setEditingPrompt({
                              ...editingPrompt,
                              tone_adjustments: { ...editingPrompt.tone_adjustments, warmth_modifier: parseInt(e.target.value) || 0 }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Formality Modifier</Label>
                          <Input
                            type="number"
                            value={editingPrompt.tone_adjustments.formality_modifier}
                            onChange={(e) => setEditingPrompt({
                              ...editingPrompt,
                              tone_adjustments: { ...editingPrompt.tone_adjustments, formality_modifier: parseInt(e.target.value) || 0 }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Directness Modifier</Label>
                          <Input
                            type="number"
                            value={editingPrompt.tone_adjustments.directness_modifier}
                            onChange={(e) => setEditingPrompt({
                              ...editingPrompt,
                              tone_adjustments: { ...editingPrompt.tone_adjustments, directness_modifier: parseInt(e.target.value) || 0 }
                            })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => savePrompt(editingPrompt)}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowPromptForm(false);
                          setEditingPrompt(null);
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="references">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Local References</CardTitle>
                      <div className="flex gap-2">
                        <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as CityKey)}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CITY_NAMES).map(([key, name]) => (
                              <SelectItem key={key} value={key}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => {
                          setEditingReference({
                            id: '',
                            city_key: selectedCity,
                            reference_type: 'mosque',
                            name: '',
                            description: null,
                            address: null,
                            neighborhood: null,
                            context_keywords: [],
                            usage_count: 0,
                            is_verified: false,
                            is_active: true
                          });
                          setShowReferenceForm(true);
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Reference
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Neighborhood</TableHead>
                          <TableHead>Usage Count</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReferences.map(ref => (
                          <TableRow key={ref.id}>
                            <TableCell className="font-medium">{ref.name}</TableCell>
                            <TableCell>
                              <Badge>{ref.reference_type}</Badge>
                            </TableCell>
                            <TableCell>{ref.neighborhood || '-'}</TableCell>
                            <TableCell>{ref.usage_count}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {ref.is_verified && <Badge variant="success">Verified</Badge>}
                                {ref.is_active && <Badge variant="default">Active</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingReference(ref);
                                    setShowReferenceForm(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteReference(ref.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {showReferenceForm && editingReference && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{editingReference.id ? 'Edit' : 'Create'} Local Reference</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={editingReference.name}
                            onChange={(e) => setEditingReference({ ...editingReference, name: e.target.value })}
                            placeholder="East London Mosque"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={editingReference.reference_type}
                            onValueChange={(v) => setEditingReference({ ...editingReference, reference_type: v as ReferenceType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REFERENCE_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editingReference.description || ''}
                          onChange={(e) => setEditingReference({ ...editingReference, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Address</Label>
                          <Input
                            value={editingReference.address || ''}
                            onChange={(e) => setEditingReference({ ...editingReference, address: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Neighborhood</Label>
                          <Input
                            value={editingReference.neighborhood || ''}
                            onChange={(e) => setEditingReference({ ...editingReference, neighborhood: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingReference.is_verified}
                            onCheckedChange={(checked) => setEditingReference({ ...editingReference, is_verified: checked })}
                          />
                          <Label>Verified</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingReference.is_active}
                            onCheckedChange={(checked) => setEditingReference({ ...editingReference, is_active: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => saveReference(editingReference)}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowReferenceForm(false);
                          setEditingReference(null);
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>City Cluster Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">User Distribution by City</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>City</TableHead>
                              <TableHead>Total Users</TableHead>
                              <TableHead>Auto-Detected</TableHead>
                              <TableHead>User-Selected</TableHead>
                              <TableHead>Fallback</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(analytics.user_counts_by_city || {}).map(([cityKey, counts]: [string, any]) => (
                              <TableRow key={cityKey}>
                                <TableCell className="font-medium">{CITY_NAMES[cityKey as CityKey]}</TableCell>
                                <TableCell>{counts.total}</TableCell>
                                <TableCell>{counts.auto_detected}</TableCell>
                                <TableCell>{counts.user_selected}</TableCell>
                                <TableCell>{counts.fallback}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Reference Usage Statistics</h3>
                        <div className="grid gap-4">
                          {Object.entries(analytics.reference_stats_by_city || {}).map(([cityKey, stats]: [string, any]) => (
                            <Card key={cityKey}>
                              <CardHeader>
                                <CardTitle className="text-lg">{CITY_NAMES[cityKey as CityKey]}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {Object.entries(stats).map(([type, data]: [string, any]) => (
                                    <div key={type} className="p-3 bg-gray-50 rounded-lg">
                                      <div className="text-sm font-medium text-gray-500">{type}</div>
                                      <div className="text-lg font-bold">{data.count} refs</div>
                                      <div className="text-xs text-gray-500">{data.total_usage} uses</div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScreenContainer>
    </>
  );
};
