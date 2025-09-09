'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import locations from './locations.json'
import ResourcesTable from './resources-table'

// Dynamically import the MapComponent with no SSR
const MapComponent = dynamic(() => import('./map-client-component'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center bg-gray-100">
      Loading map...
    </div>
  ),
})

async function fetchProviders() {
  try {
    console.log('[ResourcesPage] Fetching providers from API')
    // Reduce the limit to improve performance
    const response = await fetch('/api/providers?limit=20000')
    if (!response.ok) {
      throw new Error(
        `Failed to fetch providers: ${response.status} ${response.statusText}`
      )
    }
    const result = await response.json()

    // Handle both array responses and paginated responses with data property
    const providers = Array.isArray(result) ? result : result.data || []

    console.log(
      `[ResourcesPage] Successfully fetched ${providers.length} providers from API`
    )
    return providers
  } catch (error) {
    console.error('Error fetching providers:', error)
    return []
  }
}

// Create a cache for location lookups to avoid repeated processing
const locationCache = new Map<string, [number, number] | null>()

function getCoordinatesForLocation(
  location: string | undefined
): [number, number] | null {
  if (!location) {
    return null
  }

  // Clean up the location string
  const cleanLocation = location.trim()

  // Check cache first
  if (locationCache.has(cleanLocation)) {
    return locationCache.get(cleanLocation)
  }

  // Check for exact match first
  if (locations[cleanLocation as keyof typeof locations]) {
    const locationData = locations[cleanLocation as keyof typeof locations]
    const coordinates: [number, number] = [
      locationData.latitude,
      locationData.longitude,
    ]
    locationCache.set(cleanLocation, coordinates)
    return coordinates
  }

  // Check for partial matches
  const partialMatch = Object.keys(locations).find(
    (city) =>
      cleanLocation.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(cleanLocation.toLowerCase())
  )

  if (partialMatch) {
    const locationData = locations[partialMatch as keyof typeof locations]
    const coordinates: [number, number] = [
      locationData.latitude,
      locationData.longitude,
    ]
    locationCache.set(cleanLocation, coordinates)
    return coordinates
  }

  // No match found
  locationCache.set(cleanLocation, null)
  return null
}

export default function ResourcesPage() {
  console.log('ResourcesPage component is rendering')

  const [providers, setProviders] = useState<any[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    provider: '',
    minStorage: 0,
    minRAM: 0,
    minGPUs: 0,
    minBandwidth: 0,
  })

  useEffect(() => {
    async function loadProviders() {
      try {
        const data = await fetchProviders()

        if (!Array.isArray(data)) {
          console.error('[ResourcesPage] API returned non-array data:', data)
          return
        }

        console.log(
          `[ResourcesPage] Processing ${data.length} providers for map visualization`
        )

        // Create a map to track unique provider+location combinations
        const uniqueProviderLocations = new Map()

        // Process providers and deduplicate based on provider name and location
        const providersWithCoordinates = data.map((provider: any) => {
          // Try to get location from various fields
          let location = provider.location || provider.region

          // If location is still undefined, try to extract from other fields
          if (!location) {
            if (provider.country) {
              location = provider.country
            } else if (provider.provider) {
              location = provider.provider
            } else if (provider.providerName) {
              location = provider.providerName
            }
          }

          // Create a unique key for this provider+location
          const providerName =
            provider.providerName || provider.name || provider.provider
          const uniqueKey = `${providerName}:${location}`

          // Skip processing if we've already seen this provider+location
          if (uniqueProviderLocations.has(uniqueKey)) {
            return {
              ...provider,
              coordinates: uniqueProviderLocations.get(uniqueKey),
            }
          }

          // Only log once at the beginning of processing
          if (uniqueProviderLocations.size === 0) {
            console.log(
              `[ResourcesPage] Processing provider sample: ${providerName} at location: ${location}`
            )
          }

          uniqueProviderLocations.set(uniqueKey, true)

          const coordinates = getCoordinatesForLocation(location)
          if (coordinates) {
            uniqueProviderLocations.set(uniqueKey, coordinates)
            return {
              ...provider,
              coordinates,
            }
          } else {
            // If no coordinates found, try using the country as fallback
            if (provider.country && provider.country !== location) {
              const countryCoordinates = getCoordinatesForLocation(
                provider.country
              )
              if (countryCoordinates) {
                uniqueProviderLocations.set(uniqueKey, countryCoordinates)
                return {
                  ...provider,
                  coordinates: countryCoordinates,
                }
              }
            }
          }

          return {
            ...provider,
            coordinates: null,
          }
        })

        const validCoordinatesCount = providersWithCoordinates.filter(
          (p) => p.coordinates
        ).length
        const uniqueLocationsCount = new Set(
          providersWithCoordinates
            .filter((p) => p.coordinates)
            .map((p) => `${p.coordinates[0]},${p.coordinates[1]}`)
        ).size

        console.log(
          `[ResourcesPage] Total providers: ${providersWithCoordinates.length}, With valid coordinates: ${validCoordinatesCount}, Unique locations: ${uniqueLocationsCount}`
        )

        setProviders(providersWithCoordinates)
      } catch (error) {
        console.error('Error loading providers:', error)
      }
    }

    loadProviders()
  }, [])

  const handleSearchChange = (value: string) => {
    console.log(`[ResourcesPage] Search changed to: "${value}"`)
    setSearchInput(value)
  }

  const handleFiltersChange = (filters: any) => {
    console.log('[ResourcesPage] Filters changed:', filters)
    setActiveFilters(filters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-[16px]  text-[#8F8F8F]">Compute Resources</h1>
      <div className="mb-8">
        <h2 className="mb-6 text-[30px]  text-[#141414] font-bold">Provider Locations</h2>
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
  )
}
