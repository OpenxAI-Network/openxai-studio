import serviceDefinitons from '@/utils/service-definitions.json'

import type { Xnode } from '@/types/node'

export const mockXNodes: Xnode[] = [
  {
    id: '00000000000-00000000001',
    provider: 'Unit',
    services: Buffer.from(
      JSON.stringify({
        services: [
          serviceDefinitons.find((service) => service.nixName === 'ollama') ??
            serviceDefinitons[0]!,
          serviceDefinitons.find(
            (service) => service.nixName === 'open-webui'
          ) ?? serviceDefinitons[0]!,
        ],
        'users.users': [],
      })
    ).toString('base64'),
    heartbeatData: {
      id: '00000000000-00000000001',
      cpuPercent: 2,
      cpuPercentPeek: 4,
      ramMbUsed: 1000,
      ramMbPeek: 1400,
      ramMbTotal: 16384,
      storageMbUsed: 1024,
      storageMbTotal: 10240,
    },
    name: 'DEMO Xnode',
    description: 'Fictional Xnode for showcasing information and interactions.',
    status: 'online',
    deploymentAuth:
      '17827232184123519446329250419182865457105292133342177219703170160523741091636',
    openmeshExpertUserId: '00000000000-00000000001',

    ipAddress: '127.0.0.1',
    isUnit: true,
    unitClaimTime: new Date(),
    updateGenerationWant: 0,
    updateGenerationHave: 0,
    configGenerationWant: 0,
    configGenerationHave: 0,
    location: 'NYC1',
    createdAt: new Date(),
    updatedAt: new Date(),
    cores: 16,
    ram: 32 * 1024 ** 3, 
    storage: 1 * 1024 ** 3, 
    gpu: 'A4000',

  },
]
