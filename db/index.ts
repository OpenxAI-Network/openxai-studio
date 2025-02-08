import * as schema from './schema'

const mockData = [{
  id: 1,
  providerName: "Mock Provider 1",
  productName: "Mock Product 1",
  country: "USA",
  location: "New York",
  cpuCores: 4,
  cpuThreads: 8,
  cpuGHZ: 3.5,
  ram: 16,
  storageTotal: 500,
  bandwidthNetwork: 1000,
  priceMonth: 50,
  priceSale: 45
}, {
  id: 2,
  providerName: "Mock Provider 2",
  productName: "Mock Product 2",
  country: "UK",
  location: "London",
  cpuCores: 8,
  cpuThreads: 16,
  cpuGHZ: 4.0,
  ram: 32,
  storageTotal: 1000,
  bandwidthNetwork: 2000,
  priceMonth: 100,
  priceSale: 90
}]

const simulatedStats = [{
  count: 2,
  countries: 172,
  providers: 32,
  regions: 482,
  storage: 900,
  ram: 26,
  bandwidth: 900
}]

const mockDb = {
  select: (params = {}) => ({
    from: (_table: any) => ({
      limit: (_limit?: any) => simulatedStats,
      where: (_clause?: any) => ({
        limit: (_limit?: any) => simulatedStats
      })
    })
  }),
  query: {
    Providers: {
      findFirst: async (params?: any) => mockData[0],
      findMany: async (params?: any) => mockData
    }
  }
}

export const db = mockDb
