'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Provider } from '@/db/schema';

import ResourcesTable from './resources-table';
import MapVisualization from './map-visualization';
import locations from './locations.json';

// Add the Stats interface here
interface Stats {
  countries: number;
  providers: number;
  regions: number;
  storage: number;
  ram: number;
  gpus: number;
  bandwidth: number;
}

let unplottableLocations: string[] = [];

type StatsItemProps = {
  title: string
  value: string | number
  unit?: string
  }

  function StatsItem({ title, value, unit }: StatsItemProps) {
    return (
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-medium text-darkGray">{title}</h1>
        <p className="font-bold text-primary">
          <span className="text-4xl">{value}</span>
          <span className="text-xl">{unit}</span>
        </p>
      </div>
    )
  }

function getCoordinates(location: string | null | undefined) {
  if (!location) {
    console.log(`[Location Processing] Location is null, defaulting to U.S. centroid.`);
    return { latitude: 37.0902, longitude: -95.7129 };
  }

  const originalLocation = location;
  // Improve location normalization
  const normalizedLocation = location
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    // Remove trailing spaces and commas
    .replace(/[\s,]+$/, '')
    // Remove state/country codes
    .replace(/, [a-z]{2}$/i, '');

  console.log(`[Location Processing] Normalizing location: "${originalLocation}" to "${normalizedLocation}"`);
  
  // Try exact match first
  let coords = locations[normalizedLocation as keyof typeof locations];
  
  // If no exact match, try to find partial match
  if (!coords) {
    const locationKey = Object.keys(locations).find(key => 
      key.toLowerCase().includes(normalizedLocation) || 
      normalizedLocation.includes(key.toLowerCase())
    );
    if (locationKey) {
      coords = locations[locationKey as keyof typeof locations];
      console.log(`[Location Processing] Found partial match: "${locationKey}" for "${normalizedLocation}"`);
    }
  }

  if (coords) {
    console.log(`[Location Processing] Successfully mapped "${originalLocation}" to coordinates: [${coords.latitude}, ${coords.longitude}]`);
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  }

  unplottableLocations.push(normalizedLocation);
  console.warn(`[Location Processing] Location "${originalLocation}" (normalized to "${normalizedLocation}") is unplottable. Please update locations.json.`);
  return { latitude: 37.0902, longitude: -95.7129 }; // Default to US centroid instead of 0,0
}

interface ProviderWithCoordinates extends Provider {
  longitude: number;
  latitude: number;
}

export default function ResourcesPage() {
  console.log('ResourcesPage component is rendering');

  const [searchInput, setSearchInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    provider: '',
    minStorage: 0,
    minRAM: 0,
    minGPUs: 0,
    minBandwidth: 0,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const { data: providersResponse = { data: [], stats: {} as Stats }, isLoading, error } = useQuery({
    queryKey: ['providers', 'stats'],
    queryFn: async () => {
      if (typeof window === 'undefined') {
        return { data: [], stats: {} as Stats };
      }

      try {
        const res = await fetch('/api/providers?includeStats=true');
        if (!res.ok) {
          console.error('[Simulated Backend] Failed to fetch providers:', res.status, await res.text());
          throw new Error('Network response was not ok');
        }
        const response = await res.json();
        console.log('[Simulated Backend] Raw API response:', response);
        const { data, stats } = response;

        if (data.length === 0) {
          console.warn('[Simulated Backend] No data received from API');
        }

        const providersWithCoords = data.map((provider: Provider) => {
          const coords = getCoordinates(provider.location);
          console.log(`[Simulated Backend] Processing provider ${provider.id} -> Coordinates: [${coords.latitude}, ${coords.longitude}]`);
          return {
            ...provider,
            longitude: coords.longitude,
            latitude: coords.latitude,
          };
        });

        console.log('[Simulated Backend] Providers with coordinates:', providersWithCoords);
        if (providersWithCoords.length === 0) {
          console.warn('[Simulated Backend] No providers with valid coordinates');
        }

        return { data: providersWithCoords, stats: stats || {} as Stats };
      } catch (error) {
        console.error('[Simulated Backend] Error fetching providers:', error);
        return { data: [], stats: {} as Stats };
      }
    },
    placeholderData: {
      data: [],
      stats: {
        countries: 172,
        providers: 32,
        regions: 482,
        storage: 900,
        ram: 26,
        gpus: 335,
        bandwidth: 900,
      },
    },
    enabled: typeof window !== 'undefined',
  });

  const { data: providers, stats } = providersResponse;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (error) {
      console.error('[Simulated Backend] Query error:', error);
    }

    const uniqueUnplottable = [...new Set(unplottableLocations.filter(l => l !== null))];
    if (uniqueUnplottable.length > 0) {
      console.warn(`[Simulated Backend] Unplottable locations detected (not in locations.json). Please update locations.json to include: ${uniqueUnplottable.join(', ')}`);
    }
    unplottableLocations = [];
  }, [providers, error]);

  const safeStats: Stats = stats || {
    countries: 0,
    providers: 0,
    regions: 0,
    storage: 0,
    ram: 0,
    gpus: 0,
    bandwidth: 0,
  };

  return (
    <div className="container mt-12 p-2">
      <section className="flex flex-col justify-center gap-4 text-center">
        <h1 className="text-4xl font-semibold text-black">
          A large network of data centres, all around the world
        </h1>
        <div className="h-[600px] w-full overflow-hidden rounded-lg">
        {isLoading ? (
          <div>Loading map...</div>
        ) : (
          <>
            <MapVisualization
              data={providers}
              searchQuery={searchInput}
              filters={activeFilters}
            />
            {console.log('Data passed to MapVisualization:', providers)}
          </>
        )}
        </div>
      </section>
      <section className="mt-10 grid grid-cols-7 gap-6 rounded p-6 shadow-[0_0.75rem_1rem_hsl(0_0_0/0.05)]">
        <StatsItem title="Countries" value={safeStats.countries} />
        <StatsItem title="Providers" value={safeStats.providers} />
        <StatsItem title="Regions" value={safeStats.regions} />
        <StatsItem title="Storage" value={safeStats.storage} unit="PB" />
        <StatsItem title="GPUs" value={safeStats.gpus} unit="GF" />
        <StatsItem title="RAM" value={safeStats.ram} unit="PB" />
        <StatsItem title="Bandwidth" value={safeStats.bandwidth} unit="PB" />
      </section>
      <section className="my-12">
        <ResourcesTable
          onSearchChange={setSearchInput}
          onFiltersChange={setActiveFilters}
        />
      </section>
    </div>
  );
}