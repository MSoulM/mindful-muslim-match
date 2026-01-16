import { useState, useEffect } from 'react';
import { MapPin, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';

type CityKey = 'london' | 'nyc' | 'houston_chicago' | 'dubai' | 'mumbai_dhaka';

interface CityCluster {
  city_key: CityKey;
  city_name: string;
  region: string;
  timezone: string;
}

interface CityAssignment {
  city_key: CityKey;
  assignment_method: 'auto_detected' | 'user_selected' | 'fallback';
  detected_location: { lat: number; lng: number } | null;
}

export const CityClusterSelector = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [cities, setCities] = useState<CityCluster[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<CityAssignment | null>(null);
  const [currentCluster, setCurrentCluster] = useState<CityCluster | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [citiesRes, currentRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/city-list`),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/city-current`, { headers })
      ]);

      const citiesData = await citiesRes.json();
      setCities(citiesData.cities || []);

      if (currentRes.ok) {
        const currentData = await currentRes.json();
        setCurrentAssignment(currentData.assignment);
        setCurrentCluster(currentData.cluster);
      }
    } catch (error: any) {
      console.error('Error loading city data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load city information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectCity = async (cityKey: CityKey) => {
    try {
      setSelecting(true);
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/city-select`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city_key: cityKey })
      });

      if (!response.ok) {
        throw new Error('Failed to select city');
      }

      const data = await response.json();
      setCurrentAssignment(data.assignment);
      setCurrentCluster(data.cluster);

      toast({
        title: 'City Selected',
        description: `Your city cluster has been updated to ${data.cluster.city_name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to select city',
        variant: 'destructive'
      });
    } finally {
      setSelecting(false);
    }
  };

  const autoDetectCity = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive'
      });
      return;
    }

    setSelecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = await getToken();
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/city-auto-detect`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          });

          if (!response.ok) {
            throw new Error('Failed to detect city');
          }

          const data = await response.json();
          setCurrentAssignment(data.assignment);
          setCurrentCluster(data.cluster);

          toast({
            title: data.detected ? 'City Detected' : 'Using Fallback',
            description: data.message,
          });
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to auto-detect city',
            variant: 'destructive'
          });
        } finally {
          setSelecting(false);
        }
      },
      (error) => {
        setSelecting(false);
        toast({
          title: 'Location Error',
          description: 'Unable to access your location',
          variant: 'destructive'
        });
      }
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getAssignmentMethodBadge = (method: string) => {
    switch (method) {
      case 'auto_detected':
        return <Badge variant="success">Auto-Detected</Badge>;
      case 'user_selected':
        return <Badge variant="default">User-Selected</Badge>;
      case 'fallback':
        return <Badge variant="secondary">Fallback</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#2A9D8F]" />
          <CardTitle>City Cluster Preference</CardTitle>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          MMAgent adapts to your local culture and provides city-specific guidance. Choose your city cluster or let us detect it automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentCluster && currentAssignment && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">{currentCluster.city_name}</span>
              </div>
              {getAssignmentMethodBadge(currentAssignment.assignment_method)}
            </div>
            <div className="text-sm text-gray-600">
              <div>{currentCluster.region}</div>
              <div className="text-xs text-gray-500 mt-1">Timezone: {currentCluster.timezone}</div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Select Your City Cluster</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={autoDetectCity}
              disabled={selecting}
            >
              {selecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              Auto-Detect
            </Button>
          </div>

          <div className="grid gap-3">
            {cities.map((city) => {
              const isSelected = currentAssignment?.city_key === city.city_key;
              return (
                <button
                  key={city.city_key}
                  onClick={() => selectCity(city.city_key)}
                  disabled={selecting || isSelected}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${isSelected 
                      ? 'border-[#2A9D8F] bg-[#2A9D8F]/5' 
                      : 'border-gray-200 hover:border-[#2A9D8F]/50 hover:bg-gray-50'
                    }
                    ${selecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{city.city_name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#2A9D8F]" />}
                      </div>
                      <div className="text-sm text-gray-600">{city.region}</div>
                      <div className="text-xs text-gray-500 mt-1">{city.timezone}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>💡 <strong>How it works:</strong> Your city cluster selection helps MMAgent provide culturally relevant guidance, local references, and appropriate tone adjustments for your region.</p>
        </div>
      </CardContent>
    </Card>
  );
};
