"use client";

import { useState, useEffect } from 'react';
import MapComponent from './map-client-component';
import ResourcesTable from './resources-table';
import locations from './locations.json';

async function fetchProviders() {
  try {
    console.log('[ResourcesPage] Fetching providers from API');
    // Increase the limit to fetch more providers (if the API supports pagination)
    const response = await fetch('/api/providers?limit=1000');
    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    
    // Handle both array responses and paginated responses with data property
    const providers = Array.isArray(result) ? result : (result.data || []);
    
    console.log(`[ResourcesPage] Successfully fetched ${providers.length} providers from API`);
    return providers;
  } catch (error) {
    console.error('Error fetching providers:', error);
    return [];
  }
}

// Simple function to get coordinates from locations.json
function getCoordinatesForLocation(location: string | undefined): [number, number] | null {
  if (!location) {
    console.log('[Map] No location provided for provider');
    return null;
  }
  
  // Clean up the location string
  const cleanLocation = location.trim();
  
  // Check for exact match first
  if (locations[cleanLocation as keyof typeof locations]) {
    console.log(`[Map] Found exact match for "${cleanLocation}"`);
    const locationData = locations[cleanLocation as keyof typeof locations];
    // Explicitly create a tuple from the object properties
    return [locationData.latitude, locationData.longitude];
  }
  
  // Check for partial matches
  const partialMatch = Object.keys(locations).find(city => 
    cleanLocation.toLowerCase().includes(city.toLowerCase()) || 
    city.toLowerCase().includes(cleanLocation.toLowerCase()));
  
  if (partialMatch) {
    console.log(`[Map] Found partial match for "${cleanLocation}" -> "${partialMatch}"`);
    const locationData = locations[partialMatch as keyof typeof locations];
    // Explicitly create a tuple from the object properties
    return [locationData.latitude, locationData.longitude];
  }
  
  console.log(`[Map] ⚠️ No match found for "${cleanLocation}"`);
  return null;
}

export default function ResourcesPage() {
  console.log('ResourcesPage component is rendering');
  
  const [providers, setProviders] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    provider: '',
    minStorage: 0,
    minRAM: 0,
    minGPUs: 0,
    minBandwidth: 0,
  });

  useEffect(() => {
    async function loadProviders() {
      try {
        const data = await fetchProviders();
        
        if (!Array.isArray(data)) {
          console.error('[ResourcesPage] API returned non-array data:', data);
          return;
        }
        
        console.log(`[ResourcesPage] Processing ${data.length} providers for map visualization`);
        
        // Create a map to track unique provider+location combinations
        const uniqueProviderLocations = new Map();
        
        // Process providers and deduplicate based on provider name and location
        const providersWithCoordinates = data.map((provider: any) => {
          // Try to get location from various fields
          let location = provider.location || provider.region;
          
          // If location is still undefined, try to extract from other fields
          if (!location) {
            if (provider.country) {
              location = provider.country;
            } else if (provider.provider) {
              location = provider.provider;
            } else if (provider.providerName) {
              location = provider.providerName;
            }
          }
          
          // Create a unique key for this provider+location
          const providerName = provider.providerName || provider.name || provider.provider;
          const uniqueKey = `${providerName}:${location}`;
          
          // Skip logging for duplicates to reduce console noise
          if (!uniqueProviderLocations.has(uniqueKey)) {
            console.log(`[ResourcesPage] Processing provider: ${providerName} at location: ${location}`);
            uniqueProviderLocations.set(uniqueKey, true);
          }
          
          const coordinates = getCoordinatesForLocation(location);
          if (coordinates) {
            // Only log for unique provider+location combinations
            if (uniqueProviderLocations.get(uniqueKey) === true) {
              console.log(`[ResourcesPage] Found coordinates for ${location}: [${coordinates[0]}, ${coordinates[1]}]`);
              uniqueProviderLocations.set(uniqueKey, coordinates);
            }
          } else {
            // If no coordinates found, try using the country as fallback
            if (provider.country && provider.country !== location) {
              const countryCoordinates = getCoordinatesForLocation(provider.country);
              if (countryCoordinates) {
                if (uniqueProviderLocations.get(uniqueKey) === true) {
                  console.log(`[ResourcesPage] Found fallback coordinates for country ${provider.country}: [${countryCoordinates[0]}, ${countryCoordinates[1]}]`);
                  uniqueProviderLocations.set(uniqueKey, countryCoordinates);
                }
                return {
                  ...provider,
                  coordinates: countryCoordinates
                };
              }
            }
            if (uniqueProviderLocations.get(uniqueKey) === true) {
              console.log(`[ResourcesPage] ⚠️ No coordinates found for ${location}`);
            }
          }
          
          return {
            ...provider,
            coordinates
          };
        });
        
        const validCoordinatesCount = providersWithCoordinates.filter(p => p.coordinates).length;
        const uniqueLocationsCount = new Set(
          providersWithCoordinates
            .filter(p => p.coordinates)
            .map(p => `${p.coordinates[0]},${p.coordinates[1]}`)
        ).size;
        
        console.log(`[ResourcesPage] Total providers: ${providersWithCoordinates.length}, With valid coordinates: ${validCoordinatesCount}, Unique locations: ${uniqueLocationsCount}`);
        
        setProviders(providersWithCoordinates);
      } catch (error) {
        console.error('Error loading providers:', error);
      }
    }
    
    loadProviders();
  }, []);

  const handleSearchChange = (value: string) => {
    console.log(`[ResourcesPage] Search changed to: "${value}"`);
    setSearchInput(value);
  };

  const handleFiltersChange = (filters: any) => {
    console.log('[ResourcesPage] Filters changed:', filters);
    setActiveFilters(filters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Compute Resources</h1>
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Provider Locations</h2>
          <MapComponent 
            providers={providers} 
            searchQuery={searchInput}
            filters={activeFilters}
          />
        </div>
      
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Resources</h2>
        <ResourcesTable 
          providers={providers}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          searchQuery={searchInput}
          filters={activeFilters}
        />
      </div>
    </div>
  );
}