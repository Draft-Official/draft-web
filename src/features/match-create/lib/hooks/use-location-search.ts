import { useState, useRef, useCallback } from 'react';
import type { LocationData } from '@/features/match-create/model/types';
import type { GymFacilities } from '@/shared/types/database.types';

export interface UseLocationSearchReturn {
  // State
  location: string;
  locationData: LocationData | null;
  searchResults: LocationData[];
  isDropdownOpen: boolean;
  isExistingGym: boolean;
  gymFacilities: GymFacilities | null;
  
  // Handlers
  handleSearch: (query: string) => void;
  handleSelect: (data: LocationData) => Promise<void>;
  handleClear: () => void;
  openKakaoMap: () => void;
}

/**
 * Kakao 장소 검색 및 Gym 프리필 로직을 관리하는 커스텀 훅
 * 
 * @returns {UseLocationSearchReturn} location 검색 관련 상태 및 핸들러
 * 
 * @example
 * ```tsx
 * const {
 *   location,
 *   locationData,
 *   searchResults,
 *   isDropdownOpen,
 *   handleSearch,
 *   handleSelect,
 *   handleClear,
 *   gymFacilities
 * } = useLocationSearch();
 * ```
 */
export function useLocationSearch(): UseLocationSearchReturn {
  // State
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExistingGym, setIsExistingGym] = useState(false);
  const [gymFacilities, setGymFacilities] = useState<GymFacilities | null>(null);
  
  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format location string: "address (buildingName)" if buildingName exists
  const formatLocation = (data: LocationData): string => {
    if (data.buildingName) {
      return `${data.address} (${data.buildingName})`;
    }
    return data.address;
  };

  // Handle location search with debounce
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
        const mappedResults: LocationData[] = results.map((place: any) => ({
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
      } catch (e) {
        console.error("Search error", e);
      }
    }, 200);
  }, []);

  // Handle location selection with Gym lookup and prefill
  const handleSelect = useCallback(async (data: LocationData) => {
    setLocationData(data);
    setLocation(formatLocation(data));
    setIsDropdownOpen(false);

    // Gym 조회 및 프리필
    if (data.kakaoPlaceId) {
      try {
        const { lookupGymByKakaoPlaceId } = await import('@/shared/api/gym');
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

  // Clear location selection
  const handleClear = useCallback(() => {
    setLocationData(null);
    setLocation("");
    setIsExistingGym(false);
    setGymFacilities(null);
  }, []);

  // Open Kakao Map
  const openKakaoMap = useCallback(() => {
    if (locationData?.placeUrl) {
      window.open(locationData.placeUrl, '_blank');
    }
  }, [locationData]);

  return {
    // State
    location,
    locationData,
    searchResults,
    isDropdownOpen,
    isExistingGym,
    gymFacilities,
    
    // Handlers
    handleSearch,
    handleSelect,
    handleClear,
    openKakaoMap,
  };
}
