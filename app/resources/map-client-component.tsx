'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues - use only this approach
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define props interface
interface MapClientComponentProps {
  providers: any[];
  searchQuery?: string;
  filters?: any;
}

const MapComponent: React.FC<MapClientComponentProps> = ({ providers, searchQuery, filters }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [visibleProviders, setVisibleProviders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    countries: 0,
    providers: 0,
    regions: 0,
    storage: 0,
    ram: 0,
    bandwidth: 0
  });
  
  // Filter providers based on search query and filters
  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      // Apply search filter if provided
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (provider.name?.toLowerCase().includes(query)) || 
          (provider.location?.toLowerCase().includes(query)) ||
          (provider.description?.toLowerCase().includes(query)) ||
          (provider.providerName?.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }
      
      // Apply other filters if provided
      if (filters) {
        if (filters.provider && filters.provider !== '' && 
            provider.name !== filters.provider && 
            provider.providerName !== filters.provider) return false;
        if (filters.minStorage > 0 && provider.storage < filters.minStorage) return false;
        if (filters.minRAM > 0 && provider.ram < filters.minRAM) return false;
        if (filters.minGPUs > 0 && provider.gpus < filters.minGPUs) return false;
        if (filters.minBandwidth > 0 && provider.bandwidth < filters.minBandwidth) return false;
      }
      
      return true;
    });
  }, [providers, searchQuery, filters]);

  // Calculate final stats with useMemo
  const finalStats = useMemo(() => ({
    countries: new Set(filteredProviders.map(p => p.country)).size,
    providers: new Set(filteredProviders.map(p => p.providerName || p.name)).size,
    regions: new Set(filteredProviders.map(p => p.location)).size,
    storage: filteredProviders.reduce((sum, p) => sum + (Number(p.storageTotal) || Number(p.storage) || 0), 0),
    ram: filteredProviders.reduce((sum, p) => sum + (Number(p.ram) || 0), 0),
    bandwidth: filteredProviders.reduce((sum, p) => sum + (Number(p.bandwidthNetwork) || Number(p.bandwidth) || 0), 0)
  }), [filteredProviders]);

  console.log(`MapComponent received ${providers.length} providers`);
  
  useEffect(() => {
    // Initialize map if it doesn't exist yet
    if (!leafletMap.current && mapRef.current) {
      leafletMap.current = L.map(mapRef.current).setView([20, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
      
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    }
    
    // Reset when providers change
    setVisibleProviders([]);
    setStats({
      countries: 0,
      providers: 0,
      regions: 0,
      storage: 0,
      ram: 0,
      bandwidth: 0
    });
    
    // Filter providers with valid coordinates
    const validProviders = filteredProviders.filter(p => p.coordinates && p.coordinates.length === 2);
    
    // Animate adding providers
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= validProviders.length) {
        clearInterval(interval);
        // Set final stats when complete
        setStats(finalStats);
        return;
      }
      
      // Add next provider
      const nextProvider = validProviders[currentIndex];
      setVisibleProviders(prev => [...prev, nextProvider]);
      
      // Update stats with percentage of completion
      const progress = (currentIndex + 1) / validProviders.length;
      setStats({
        countries: Math.floor(finalStats.countries * progress),
        providers: Math.floor(finalStats.providers * progress),
        regions: Math.floor(finalStats.regions * progress),
        storage: Math.floor(finalStats.storage * progress),
        ram: Math.floor(finalStats.ram * progress),
        bandwidth: Math.floor(finalStats.bandwidth * progress)
      });
      
      currentIndex++;
    }, 5); // Faster animation (5ms instead of 10ms)
    
    return () => clearInterval(interval);
  }, [providers, searchQuery, filters, filteredProviders, finalStats]);
  
  useEffect(() => {
    // Clear existing markers
    if (markersLayer.current) {
      markersLayer.current.clearLayers();
    }
    
    // Group providers by coordinates to avoid overlapping markers
    const locationGroups: { [key: string]: any[] } = {};
    
    visibleProviders.forEach(provider => {
      if (provider.coordinates) {
        const key = `${provider.coordinates[0]},${provider.coordinates[1]}`;
        if (!locationGroups[key]) {
          locationGroups[key] = [];
        }
        locationGroups[key].push(provider);
      }
    });
    
    // Add markers for each location group
    Object.entries(locationGroups).forEach(([key, providersAtLocation]) => {
      const [lat, lng] = key.split(',').map(Number);
      
      // Create popup content with all providers at this location
      const popupContent = providersAtLocation.map(provider => 
        `<strong>${provider.providerName || provider.name || provider.provider || 'Unknown Provider'}</strong><br>
         Location: ${provider.location || provider.region || 'Unknown Location'}<br>
         ${provider.description ? `Description: ${provider.description}<br>` : ''}`
      ).join('<hr>');
      
      const marker = L.marker([lat, lng])
        .bindPopup(popupContent)
        .addTo(markersLayer.current!);
    });
    
    const validCoordinatesCount = visibleProviders.filter(p => p.coordinates).length;
    console.log(`Providers with valid coordinates: ${validCoordinatesCount}`);
    console.log(`Sample providers:`, visibleProviders.slice(0, 3));
    
  }, [visibleProviders]);
  
  return (
    <div className="flex flex-col gap-6">
      <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
      
      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Countries" value={stats.countries} />
        <StatCard title="Providers" value={stats.providers} />
        <StatCard title="Regions" value={stats.regions} />
        <StatCard title="Storage (TB)" value={Math.floor(stats.storage / 1024)} />
        <StatCard title="RAM (GB)" value={Math.floor(stats.ram)} />
        <StatCard title="Bandwidth (Gbps)" value={Math.floor(stats.bandwidth)} />
      </div>
    </div>
  );
};

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-1 text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

export default MapComponent;