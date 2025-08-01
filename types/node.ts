export type HeartbeatData = {
  id: string
  cpuPercent: number
  cpuPercentPeek: number
  ramMbUsed: number
  ramMbPeek: number
  ramMbTotal: number

  storageMbUsed: number
  storageMbTotal: number

  wantUpdate?: boolean
}

export type Xnode = {
  id: string

  provider: string
  services: string

  heartbeatData?: HeartbeatData

  name: string
  description: string
  status: string
  deploymentAuth: string
  openmeshExpertUserId: string

  ipAddress: string

  isUnit: boolean
  unitClaimTime: Date

  updateGenerationWant: number
  updateGenerationHave: number
  configGenerationWant: number
  configGenerationHave: number

  location: string
  createdAt: Date
  updatedAt: Date
  cores: number
  ram: number 
  storage: number 
  gpu: string
}
