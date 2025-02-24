// app/resources/map-component.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet'; // Type-only import for LatLngTuple

// Define a custom Leaflet icon using built-in styles (no external images)
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwODAwMCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPjwvc3ZnPg==', // Green circle (simple SVG)
  iconSize: [20, 20], // Size of the icon
  iconAnchor: [10, 10], // Anchor point (center of the icon)
  popupAnchor: [0, -10], // Offset for popup
});

interface MapComponentProps {
  data: Array<{
    providerName: string;
    location: string | null;
    latitude: number;
    longitude: number;
    // Add other fields you want to display in popups
    id: number;
    productName: string;
  }>;
  searchQuery: string;
  filters: {
    provider: string;
    minStorage: number;
    minRAM: number;
    minGPUs: number;
    minBandwidth: number;
  };
}

export default function MapComponent({ data, searchQuery, filters }: MapComponentProps) {
  const defaultCenter: LatLngTuple = [0, 0];
  
  // Improve the filtering logic
  const providersToPlot = data.filter(provider => {
    // Consider a location valid if either latitude or longitude is non-zero
    const isValidLocation = provider.latitude !== 0 || provider.longitude !== 0;
    
    // Log each filtered provider for debugging
    console.log(`Provider ${provider.providerName} (${provider.location}): valid location = ${isValidLocation}, coords = [${provider.latitude}, ${provider.longitude}]`);
    
    return isValidLocation;
  });

  console.log('Providers to plot:', providersToPlot);
  if (providersToPlot.length === 0) {
    console.warn('No providers to plot on the map');
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={2}
      className="h-[600px] w-full rounded-lg"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {providersToPlot.length > 0 ? (
        providersToPlot.map((provider, index) => (
          <Marker key={index} position={[provider.latitude, provider.longitude]} icon={customIcon}>
            <Popup>
              {provider.providerName} <br /> {provider.location || 'Unknown Location'}
            </Popup>
          </Marker>
        ))
      ) : (
        <Marker position={defaultCenter} icon={customIcon}>
          <Popup>No valid locations found</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}