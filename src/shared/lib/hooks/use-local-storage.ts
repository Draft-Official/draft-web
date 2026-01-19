'use client';

import { useState, useEffect, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. Initialize state with initialValue to match server render (hydration safety)
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Use a ref to store initialValue to avoid effect dependency issues
  const initialValueRef = useRef(initialValue);

  // Update ref if initialValue changes, but don't trigger the main effect
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    // 2. Perform local storage logic only on the client
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        // If not found, use initialValue from ref
        setStoredValue(initialValueRef.current);
      }
    } catch (error) {
      console.error(error);
    }
    setIsHydrated(true);
  }, [key]); // Remove initialValue from dependency array

  // 3. Wrapper to set value both in state and localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, isHydrated] as const;
}
