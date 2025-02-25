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
    bandwidth: 0,
    gpus: 0
  });
  
  // Log only once when providers are initially received
  useEffect(() => {
    const validCoordinatesCount = providers.filter(p => p.coordinates).length;
    console.log(`MapComponent: Processing ${providers.length} providers (${validCoordinatesCount} with valid coordinates)`);
    
    // Rest of your initialization code...
  }, [providers]); // Changed from providers.length to providers
  
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

  // Calculate final stats with real world values
  const finalStats = useMemo(() => ({
    countries: 172, // Total countries
    providers: 32,  // Total bare metal providers
    regions: 482,   // Total regions
    storage: 900 * 1024 * 1024, // 900PB in TB
    ram: 26 * 1024 * 1024,      // 26PB in GB
    bandwidth: 900 * 1024 * 1024, // 900PB in Gbps
    gpus: 335
  }), []);

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
      bandwidth: 0,
      gpus: 0
    });
    
    // Filter providers with valid coordinates
    const validProviders = filteredProviders.filter(p => p.coordinates && p.coordinates.length === 2);
    
    console.log(`MapComponent: Starting to add ${validProviders.length} valid providers to map`);
    
    // For better performance, add providers in larger batches
    const BATCH_SIZE = 500; // Increased batch size
    let currentIndex = 0;
    
    const addBatch = () => {
      const endIndex = Math.min(currentIndex + BATCH_SIZE, validProviders.length);
      const batch = validProviders.slice(currentIndex, endIndex);
      
      setVisibleProviders(prev => [...prev, ...batch]);
      
      // Update stats with percentage of completion
      const progress = endIndex / validProviders.length;
      setStats({
        countries: Math.floor(finalStats.countries * progress),
        providers: Math.floor(finalStats.providers * progress),
        regions: Math.floor(finalStats.regions * progress),
        storage: Math.floor(finalStats.storage * progress),
        ram: Math.floor(finalStats.ram * progress),
        bandwidth: Math.floor(finalStats.bandwidth * progress),
        gpus: Math.floor(finalStats.gpus * progress)
      });
      
      currentIndex = endIndex;
      
      // Log progress at 25%, 50%, 75% and 100%
      const progressPercent = Math.round((endIndex / validProviders.length) * 100);
      if (progressPercent === 25 || progressPercent === 50 || 
          progressPercent === 75 || progressPercent === 100) {
        console.log(`MapComponent: Loaded ${progressPercent}% of providers (${endIndex}/${validProviders.length})`);
      }
      
      if (currentIndex < validProviders.length) {
        setTimeout(addBatch, 100); // Increased delay between batches
      } else {
        // Set final stats when complete
        setStats(finalStats);
        console.log(`MapComponent: Finished loading all ${validProviders.length} providers`);
      }
    };
    
    // Start adding batches
    if (validProviders.length > 0) {
      addBatch();
    } else {
      setStats(finalStats);
    }
    
    return () => {
      // No need to clear interval as we're using setTimeout
    };
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
      
      // De-duplicate providers by provider name + location
      const uniqueProviders = new Map();
      providersAtLocation.forEach(provider => {
        const providerName = provider.providerName || provider.name || provider.provider || 'Unknown Provider';
        const location = provider.location || provider.region || 'Unknown Location';
        const uniqueKey = `${providerName}:${location}`;
        
        if (!uniqueProviders.has(uniqueKey)) {
          uniqueProviders.set(uniqueKey, provider);
        }
      });
      
      // Create popup content with unique providers at this location
      const popupContent = Array.from(uniqueProviders.values()).map(provider => 
        `<strong>${provider.providerName || provider.name || provider.provider || 'Unknown Provider'}</strong><br>
         Location: ${provider.location || provider.region || 'Unknown Location'}<br>
         ${provider.description ? `Description: ${provider.description}<br>` : ''}`
      ).join('<hr>');
      
      const marker = L.marker([lat, lng])
        .bindPopup(popupContent)
        .addTo(markersLayer.current!);
    });
    
    // Log only when markers are first added or when the count changes significantly
    const markerCount = Object.keys(locationGroups).length;
    if (markerCount > 0 && 
        (prevMarkerCountRef.current === 0 || 
         Math.abs(markerCount - prevMarkerCountRef.current) > 10 ||
         markerCount === visibleProviders.length)) {
      console.log(`MapComponent: Added ${markerCount} markers to the map (${Math.round(markerCount/providers.length*100)}% of total)`);
      prevMarkerCountRef.current = markerCount;
    }
    
  }, [visibleProviders, providers.length]);
  
  // Add this ref to track previous marker count
  const prevMarkerCountRef = useRef(0);
  
  return (
    <div className="flex flex-col gap-6">
      <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
      
      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
        <StatCard title="Countries" value={stats.countries} />
        <StatCard title="Providers" value={stats.providers} />
        <StatCard title="Regions" value={stats.regions} />
        <StatCard title="Storage" value={`${Math.floor(stats.storage / (1024 * 1024))}PB`} isText />
        <StatCard title="GPUs" value={`${stats.gpus}G/F`} isText />
        <StatCard title="Memory" value={`${Math.floor(stats.ram / (1024 * 1024))}PB`} isText />
        <StatCard title="Bandwidth" value={`${Math.floor(stats.bandwidth / (1024 * 1024))}PB`} isText />
      </div>
    </div>
  );
};

function StatCard({ title, value, isText = false }: { title: string; value: number | string; isText?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-1 text-2xl font-bold">
        {isText ? value : (value as number).toLocaleString()}
      </p>
    </div>
  );
}

export default MapComponent;