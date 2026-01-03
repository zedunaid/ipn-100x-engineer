'use client';

import { useState, FormEvent, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface SearchFormProps {
  onSearch: (query: string) => void; // eslint-disable-line no-unused-vars
  onLocationSearch?: (coords: Coordinates) => void; // eslint-disable-line no-unused-vars
  isLoading: boolean;
}

type GeolocationErrorType = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'UNKNOWN';

interface GeolocationState {
  isLoading: boolean;
  error: string | null;
  errorType: GeolocationErrorType | null;
}

const GEOLOCATION_ERROR_MESSAGES: Record<GeolocationErrorType, string> = {
  PERMISSION_DENIED: 'Location access was denied. Please enable location permissions in your browser settings.',
  POSITION_UNAVAILABLE: 'Unable to determine your location. Please try again or enter your address manually.',
  TIMEOUT: 'Location request timed out. Please try again.',
  NOT_SUPPORTED: 'Geolocation is not supported by your browser. Please enter your address manually.',
  UNKNOWN: 'An unexpected error occurred while getting your location. Please try again.',
};

export default function SearchForm({ onSearch, onLocationSearch, isLoading }: SearchFormProps) {
  const [location, setLocation] = useState('');
  const [geolocationState, setGeolocationState] = useState<GeolocationState>({
    isLoading: false,
    error: null,
    errorType: null,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      // Clear any geolocation errors when searching by address
      setGeolocationState({ isLoading: false, error: null, errorType: null });
      onSearch(location.trim());
    }
  };

  const getErrorTypeFromCode = (code: number): GeolocationErrorType => {
    switch (code) {
      case 1: // GeolocationPositionError.PERMISSION_DENIED
        return 'PERMISSION_DENIED';
      case 2: // GeolocationPositionError.POSITION_UNAVAILABLE
        return 'POSITION_UNAVAILABLE';
      case 3: // GeolocationPositionError.TIMEOUT
        return 'TIMEOUT';
      default:
        return 'UNKNOWN';
    }
  };

  const handleUseMyLocation = useCallback(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setGeolocationState({
        isLoading: false,
        error: GEOLOCATION_ERROR_MESSAGES.NOT_SUPPORTED,
        errorType: 'NOT_SUPPORTED',
      });
      return;
    }

    // Check if we have a callback to handle coordinates
    if (!onLocationSearch) {
      // Fall back to setting a text value if no coordinate handler is provided
      setGeolocationState({
        isLoading: false,
        error: 'Location search is not available.',
        errorType: 'UNKNOWN',
      });
      return;
    }

    // Start loading state
    setGeolocationState({
      isLoading: true,
      error: null,
      errorType: null,
    });

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeolocationState({
          isLoading: false,
          error: null,
          errorType: null,
        });
        // Clear the text input since we're using coordinates
        setLocation('');
        // Pass coordinates to parent
        onLocationSearch({ latitude, longitude });
      },
      // Error callback
      (error) => {
        const errorType = getErrorTypeFromCode(error.code);
        setGeolocationState({
          isLoading: false,
          error: GEOLOCATION_ERROR_MESSAGES[errorType],
          errorType,
        });
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 60000, // Cache position for 1 minute
      }
    );
  }, [onLocationSearch]);

  const clearError = () => {
    setGeolocationState({
      isLoading: false,
      error: null,
      errorType: null,
    });
  };

  const isAnyLoading = isLoading || geolocationState.isLoading;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter address, city, or zip code..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            disabled={isAnyLoading}
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isAnyLoading || !location.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Searching...' : 'Find Restaurants'}
          </button>
          {onLocationSearch && (
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isAnyLoading}
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              aria-label="Use my current location"
            >
              {geolocationState.isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Locating...</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Use my location</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Geolocation Error Message */}
      {geolocationState.error && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <svg
            className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-amber-800">{geolocationState.error}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-amber-500 hover:text-amber-700 transition-colors"
            aria-label="Dismiss error"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      )}

      <p className="mt-3 text-sm text-gray-500">
        Tip: Try searching for &quot;San Francisco&quot;, &quot;Downtown&quot;, or a zip code like &quot;94102&quot;
      </p>
    </form>
  );
}
