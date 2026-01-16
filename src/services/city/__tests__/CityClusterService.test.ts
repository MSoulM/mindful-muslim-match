import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CityClusterService } from '../CityClusterService';

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  is: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase),
  maybeSingle: vi.fn(),
  single: vi.fn(),
  update: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase)
};

describe('CityClusterService', () => {
  let service: CityClusterService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CityClusterService(mockSupabase as any);
  });

  describe('detectCityCluster', () => {
    it('should detect London for coordinates in London', () => {
      const result = service.detectCityCluster({ lat: 51.5074, lng: -0.1278 });
      expect(result).toBe('london');
    });

    it('should detect NYC for coordinates in New York', () => {
      const result = service.detectCityCluster({ lat: 40.7128, lng: -74.0060 });
      expect(result).toBe('nyc');
    });

    it('should detect Houston for coordinates in Houston', () => {
      const result = service.detectCityCluster({ lat: 29.7604, lng: -95.3698 });
      expect(result).toBe('houston_chicago');
    });

    it('should detect Chicago for coordinates in Chicago', () => {
      const result = service.detectCityCluster({ lat: 41.8781, lng: -87.6298 });
      expect(result).toBe('houston_chicago');
    });

    it('should detect Dubai for coordinates in Dubai', () => {
      const result = service.detectCityCluster({ lat: 25.2048, lng: 55.2708 });
      expect(result).toBe('dubai');
    });

    it('should detect Mumbai for coordinates in Mumbai', () => {
      const result = service.detectCityCluster({ lat: 19.0760, lng: 72.8777 });
      expect(result).toBe('mumbai_dhaka');
    });

    it('should detect Dhaka for coordinates in Dhaka', () => {
      const result = service.detectCityCluster({ lat: 23.8103, lng: 90.4125 });
      expect(result).toBe('mumbai_dhaka');
    });

    it('should return null for coordinates outside all city clusters', () => {
      const result = service.detectCityCluster({ lat: -33.8688, lng: 151.2093 });
      expect(result).toBeNull();
    });

    it('should return null for coordinates in middle of ocean', () => {
      const result = service.detectCityCluster({ lat: 0, lng: 0 });
      expect(result).toBeNull();
    });
  });

  describe('getFallbackCity', () => {
    it('should return first enabled city from database', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: { city_key: 'london' },
        error: null
      });

      const result = await service.getFallbackCity();
      expect(result).toBe('london');
      expect(mockSupabase.from).toHaveBeenCalledWith('city_clusters');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_enabled', true);
    });

    it('should return default fallback on database error', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await service.getFallbackCity();
      expect(result).toBe('london');
    });
  });

  describe('assignCityFromLocation', () => {
    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'assignment-123',
          clerk_user_id: 'clerk-user-123',
          city_key: 'london',
          assignment_method: 'auto_detected',
          is_current: true
        },
        error: null
      });
    });

    it('should assign detected city for valid coordinates', async () => {
      const result = await service.assignCityFromLocation('clerk-user-123', { lat: 51.5074, lng: -0.1278 });
      
      expect(result.city_key).toBe('london');
      expect(result.assignment_method).toBe('auto_detected');
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should assign fallback city for undetected coordinates', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { city_key: 'london' }, error: null });

      const result = await service.assignCityFromLocation('clerk-user-123', { lat: 0, lng: 0 });
      
      expect(result.assignment_method).toBe('fallback');
    });
  });

  describe('userSelectCity', () => {
    beforeEach(() => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { city_key: 'nyc', is_enabled: true }, error: null });
      
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'assignment-123',
          clerk_user_id: 'clerk-user-123',
          city_key: 'nyc',
          assignment_method: 'user_selected',
          is_current: true
        },
        error: null
      });
    });

    it('should allow user to select an enabled city', async () => {
      const result = await service.userSelectCity('clerk-user-123', 'nyc');
      
      expect(result.city_key).toBe('nyc');
      expect(result.assignment_method).toBe('user_selected');
    });

    it('should throw error for disabled city', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await expect(service.userSelectCity('clerk-user-123', 'dubai')).rejects.toThrow();
    });
  });

  describe('getCityPromptOverlay', () => {
    it('should return personality-specific overlay if available', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: {
          id: 'prompt-123',
          city_key: 'london',
          personality_key: 'wise_aunty',
          prompt_overlay: 'London-specific Amina prompt',
          tone_adjustments: { warmth_modifier: 1, formality_modifier: 1, directness_modifier: -1 }
        },
        error: null
      });

      const result = await service.getCityPromptOverlay('london', 'wise_aunty');
      
      expect(result).toBeTruthy();
      expect(result?.prompt_overlay).toBe('London-specific Amina prompt');
      expect(result?.personality_key).toBe('wise_aunty');
    });

    it('should fallback to city-wide overlay if personality-specific not found', async () => {
      mockSupabase.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({
          data: {
            id: 'prompt-456',
            city_key: 'london',
            personality_key: null,
            prompt_overlay: 'London city-wide prompt'
          },
          error: null
        });

      const result = await service.getCityPromptOverlay('london', 'wise_aunty');
      
      expect(result).toBeTruthy();
      expect(result?.prompt_overlay).toBe('London city-wide prompt');
      expect(result?.personality_key).toBeNull();
    });
  });

  describe('getLocalReference', () => {
    it('should return random reference and increment usage count', async () => {
      const mockReferences = [
        { id: 'ref-1', name: 'East London Mosque', usage_count: 5 },
        { id: 'ref-2', name: 'London Central Mosque', usage_count: 3 }
      ];

      mockSupabase.maybeSingle.mockResolvedValue({ data: mockReferences, error: null });

      vi.spyOn(Math, 'random').mockReturnValue(0.1);

      const result = await service.getLocalReference('london', 'mosque');
      
      expect(result).toBeTruthy();
      expect(result?.name).toBe('East London Mosque');
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    it('should return null if no references found', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: [], error: null });

      const result = await service.getLocalReference('london', 'mosque');
      
      expect(result).toBeNull();
    });
  });
});
