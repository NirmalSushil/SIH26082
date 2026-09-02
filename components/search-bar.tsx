'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { City } from '@/lib/types';
import { debounce } from '@/lib/utils';
import { Search, MapPin, Loader2, X, Sparkles, Navigation, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  onCitySelect: (city: City) => void;
  isLoading?: boolean;
}

const POPULAR_CITIES: City[] = [
  { id: 1273294, name: 'New Delhi', latitude: 28.6139, longitude: 77.209, country: 'India', displayName: 'New Delhi, India' },
  { id: 2643743, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', displayName: 'London, United Kingdom' },
  { id: 5128581, name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'United States', displayName: 'New York, United States' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', displayName: 'Tokyo, Japan' },
  { id: 1275339, name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'India', displayName: 'Mumbai, India' },
  { id: 2988507, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', displayName: 'Paris, France' },
  { id: 1816670, name: 'Beijing', latitude: 39.9042, longitude: 116.4074, country: 'China', displayName: 'Beijing, China' },
];

export function SearchBar({ onCitySelect, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search for live dropdown suggestions
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsFetching(true);
      setError(null);

      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery.trim() }),
        });

        if (!response.ok) {
          throw new Error('Geocoding service unavailable');
        }

        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          setSuggestions(data.data.slice(0, 8));
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Geocode search error:', err);
      } finally {
        setIsFetching(false);
      }
    }, 250),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelectCity = (city: City) => {
    setQuery(city.displayName);
    setIsOpen(false);
    setSuggestions([]);
    setError(null);
    onCitySelect(city);
  };

  // Immediate search on Enter key or clicking Search button
  const handleImmediateSearch = async () => {
    if (!query.trim()) return;

    // If suggestions are currently loaded, pick the first one
    if (suggestions.length > 0) {
      handleSelectCity(suggestions[0]);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const bestMatch = data.data[0];
        handleSelectCity(bestMatch);
      } else {
        setError(`No coordinates found for "${query}". Try selecting from popular cities.`);
      }
    } catch (err) {
      setError('Search lookup failed. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleImmediateSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setError(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geoCity: City = {
          id: 0,
          name: 'Current Coordinates',
          latitude: Number(latitude.toFixed(4)),
          longitude: Number(longitude.toFixed(4)),
          country: 'GPS Fix',
          displayName: `Current Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
        };
        setQuery(geoCity.displayName);
        setIsLocating(false);
        onCitySelect(geoCity);
      },
      (geoError) => {
        setIsLocating(false);
        setError(geoError.message || 'Unable to access your current GPS location.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-3">
      {/* Control Bar */}
      <div className="relative w-full">
        <div className="flex gap-2 items-stretch">
          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city by name or region (e.g., Tokyo, London, Paris, New Delhi, Berlin)..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim().length >= 2 && suggestions.length > 0) setIsOpen(true);
              }}
              disabled={isLoading || isLocating}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-normal focus:outline-none focus:border-slate-500 dark:focus:border-slate-600 focus:ring-1 focus:ring-slate-400/20 disabled:opacity-60 transition-colors shadow-xs"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Action Button */}
          <button
            onClick={handleImmediateSearch}
            disabled={isLoading || isLocating || isFetching || !query.trim()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
            title="Search location"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Geolocation Button */}
          <button
            onClick={handleGeolocation}
            disabled={isLoading || isLocating || isFetching}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
            title="Use current GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-300" />
            ) : (
              <Navigation className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
            <span className="hidden md:inline">GPS</span>
          </button>
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/60">
              Matching Municipalities
            </div>
            {suggestions.map((city) => (
              <button
                key={`${city.id}-${city.latitude}-${city.longitude}`}
                onClick={() => handleSelectCity(city)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {city.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading status */}
        {isFetching && (
          <div className="absolute top-full left-0 right-0 mt-1.5 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md flex items-center gap-2 z-50 text-slate-600 dark:text-slate-300 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            <span>Resolving coordinates...</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="absolute top-full left-0 right-0 mt-1.5 p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 shadow-md z-50">
            {error}
          </div>
        )}
      </div>

      {/* Popular City Quick-Select Bar */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <span className="text-slate-400 dark:text-slate-500 mr-1 font-medium">Quick presets:</span>
        {POPULAR_CITIES.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelectCity(c)}
            disabled={isLoading || isLocating}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors font-medium text-xs shadow-2xs active:scale-95"
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
