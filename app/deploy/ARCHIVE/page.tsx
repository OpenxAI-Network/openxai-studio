import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import Image from 'next/image'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { remark } from 'remark'
import html from 'remark-html'

import {
  getSpecsByTemplate,
  serviceByName,
  usecaseById,
  type AppStoreItem,
  type AppStorePageType,
  type ServiceData,
  type Specs,
} from '@/types/dataProvider'

import { DeploymentContextProvider } from '../deployment-context'
import { DeploymentPanel } from '../one-click/components/deployment-panel'

type OneClickDeployProps = {
  searchParams: {
    templateId?: string
    useCaseId?: string
    advanced?: string
  }
}

export default async function OneClickDeploy({ searchParams }: OneClickDeployProps) {
  const templateId = z.string().optional().parse(searchParams.templateId)
  const useCaseId = z.string().optional().parse(searchParams.useCaseId)
  const advanced = z.string().optional().parse(searchParams.advanced)

  const sessionCookie = cookies().get('userSessionToken')
  const sessionToken = sessionCookie?.value || 'demo-token'

  function getData() {
    if (!templateId && !useCaseId && !advanced) redirect('/app-store')
    let data: AppStoreItem | undefined
    let specs: Specs | undefined
    let type: AppStorePageType | undefined
    let services: ServiceData[] | undefined

    if (useCaseId) {
      const useCase = usecaseById(useCaseId)
      if (useCase === undefined) redirect('/app-store')
      data = useCase
      specs = getSpecsByTemplate(useCase)
      services = useCase.serviceNames
        .map((service) => serviceByName(service))
        .filter((s) => s !== undefined) as ServiceData[]
      type = 'use-cases'
    }

    if (templateId) {
      const service = serviceByName(templateId)
      if (service === undefined) redirect('/app-store')
      data = { ...service, id: service.nixName }
      specs = service.specs
      services = [service]
      type = 'templates'
    }

    if (advanced) {
      const custom = JSON.parse(
        Buffer.from(advanced, 'base64url').toString('utf8')
      )
      data = custom.data
      specs = custom.specs
      services = custom.services
      type = custom.type
    }

    return { data, services, specs, type }
  }

  const { data, services, specs, type } = getData()
  
  if (data === undefined || type === undefined || services === undefined) {
    redirect('/app-store')
  }

  const overview = await remark()
    .use(html)
    .process(data.desc || '')
  const overviewHtml = overview.toString()

  return (
    <DeploymentContextProvider
      initialData={{ name: data.name, description: data.desc, services }}
    >
      <div className="container my-8 grid grid-cols-12 gap-8">
        {/* Left Content Panel */}
        <div className="col-span-8">
          <div className="mb-8 flex items-center gap-2 text-muted-foreground/75">
            <Link href="/app-store">App Store</Link>
            <span>/</span>
            <span className="text-primary/75">{data.name}</span>
          </div>

          {/* Main Content Area */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="relative size-16">
                <Image
                  src={data.logo || '/placeholder.png'}
                  alt={data.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{data.name}</h1>
                <p className="text-sm text-muted-foreground">{data.desc}</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {data.useCases && <TabsTrigger value="use-cases">Use Cases</TabsTrigger>}
                {data.support && <TabsTrigger value="support">Support</TabsTrigger>}
              </TabsList>
              <TabsContent value="overview" className="prose prose-sm text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: overviewHtml }} />
              </TabsContent>
              {data.useCases && (
                <TabsContent value="use-cases" className="prose prose-sm text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: data.useCases }} />
                </TabsContent>
              )}
              {data.support && (
                <TabsContent value="support" className="prose prose-sm text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: data.support }} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        {/* Right Deployment Panel */}
        <div className="col-span-4">
          <DeploymentPanel />
        </div>
      </div>
    </DeploymentContextProvider>
  )
}