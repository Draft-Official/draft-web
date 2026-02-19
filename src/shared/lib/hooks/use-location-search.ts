import { useState, useRef, useCallback } from 'react';
import type { LocationData } from '@/shared/types/location.types';
import type { GymFacilities } from '@/shared/types/jsonb.types';

export interface UseLocationSearchReturn {
  location: string;
  locationData: LocationData | null;
  searchResults: LocationData[];
  isDropdownOpen: boolean;
  isExistingGym: boolean;
  gymFacilities: GymFacilities | null;
  handleSearch: (query: string) => void;
  handleSelect: (data: LocationData) => Promise<void>;
  handleClear: () => void;
  openKakaoMap: () => void;
}

export function useLocationSearch(): UseLocationSearchReturn {
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExistingGym, setIsExistingGym] = useState(false);
  const [gymFacilities, setGymFacilities] = useState<GymFacilities | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  interface KakaoPlaceResult {
    road_address_name?: string;
    address_name: string;
    place_name: string;
    place_url: string;
    x: string;
    y: string;
    id: string;
  }

  const formatLocation = (data: LocationData): string => {
    if (data.buildingName) {
      return `${data.address} (${data.buildingName})`;
    }
    return data.address;
  };

  const handleSearch = useCallback((query: string) => {
    setLocation(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { searchPlaces } = await import('@/shared/api/kakao-map');
        const results = await searchPlaces(query);
        const mappedResults: LocationData[] = results.map((place: KakaoPlaceResult) => ({
          address: place.road_address_name || place.address_name,
          buildingName: place.place_name,
          bname: place.address_name.split(' ')[2],
          placeUrl: place.place_url,
          x: place.x,
          y: place.y,
          kakaoPlaceId: place.id,
        }));

        setSearchResults(mappedResults);
        setIsDropdownOpen(mappedResults.length > 0);
      } catch (error) {
        console.error('Search error', error);
      }
    }, 200);
  }, []);

  const handleSelect = useCallback(async (data: LocationData) => {
    setLocationData(data);
    setLocation(formatLocation(data));
    setIsDropdownOpen(false);

    if (data.kakaoPlaceId) {
      try {
        const { lookupGymByKakaoPlaceId } = await import('@/entities/gym');
        const existingGym = await lookupGymByKakaoPlaceId(data.kakaoPlaceId);

        if (existingGym && existingGym.facilities) {
          setIsExistingGym(true);
          setGymFacilities(existingGym.facilities);
        } else {
          setIsExistingGym(false);
          setGymFacilities(null);
        }
      } catch (error) {
        console.error('Gym lookup error:', error);
        setIsExistingGym(false);
        setGymFacilities(null);
      }
    } else {
      setIsExistingGym(false);
      setGymFacilities(null);
    }
  }, []);

  const handleClear = useCallback(() => {
    setLocationData(null);
    setLocation('');
    setIsExistingGym(false);
    setGymFacilities(null);
  }, []);

  const openKakaoMap = useCallback(() => {
    if (locationData?.placeUrl) {
      window.open(locationData.placeUrl, '_blank');
    }
  }, [locationData]);

  return {
    location,
    locationData,
    searchResults,
    isDropdownOpen,
    isExistingGym,
    gymFacilities,
    handleSearch,
    handleSelect,
    handleClear,
    openKakaoMap,
  };
}
