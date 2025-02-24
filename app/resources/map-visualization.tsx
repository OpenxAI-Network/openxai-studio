// app/resources/map-visualization.tsx
'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => <div>Loading map...</div>, // Fallback while loading
});

interface ProviderWithCoordinates {
  providerName: string;
  location: string;
  latitude: number;
  longitude: number;
  id: number;
  productName: string;
  // Add other properties as needed
}

interface MapVisualizationProps {
  data: ProviderWithCoordinates[];
  searchQuery: string;
  filters: {
    provider: string;
    minStorage: number;
    minRAM: number;
    minGPUs: number;
    minBandwidth: number;
  };
}

export default function MapVisualization({ data, searchQuery, filters }: MapVisualizationProps) {
  console.log('MapVisualization rendering with data:', data);
  return <MapComponent data={data} searchQuery={searchQuery} filters={filters} />;
}