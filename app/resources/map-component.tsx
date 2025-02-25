// app/resources/map-component.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Define props interface
interface MapComponentProps {
  providers: any[];
  searchQuery?: string;
  filters?: any;
}

// Create a component that will be dynamically loaded only on the client side
const MapWithNoSSR = dynamic(() => import('./map-client-component'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

const MapComponent: React.FC<MapComponentProps> = ({ providers, searchQuery, filters }) => {
  return <MapWithNoSSR providers={providers} searchQuery={searchQuery} filters={filters} />;
};

export default MapComponent;