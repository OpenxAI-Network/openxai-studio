import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prefix } from '@/utils/prefix'
import {
  AlertTriangle,
  AppWindow,
  Cpu,
  HardDrive,
  MemoryStick,
} from 'lucide-react'
import { remark } from 'remark'
import html from 'remark-html'
import { z } from 'zod'

import {
  getSpecsByTemplate,
  serviceByName,
  usecaseById,
  type AppStoreItem,
  type AppStorePageType,
  type ServiceData,
  type Specs,
} from '@/types/dataProvider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DeploymentContextProvider } from './deployment-context'
import { DeploymentEdit } from './deployment-edit'
import DeploymentFlow from './deployment-flow'

type DeployPageProps = {
  searchParams: {
    templateId?: string
    useCaseId?: string
    advanced?: string
  }
}

export default async function DeployPage({ searchParams }: DeployPageProps) {
  const templateId = z.string().optional().parse(searchParams.templateId)
  const useCaseId = z.string().optional().parse(searchParams.useCaseId)
  const advanced = z.string().optional().parse(searchParams.advanced)

  const sessionCookie = cookies().get('userSessionToken')
  // Temporarily comment out session check for demo
  /* if (!sessionCookie) {
    const params = [
      {
        name: 'templateId',
        value: templateId,
      },
      {
        name: 'useCaseId',
        value: useCaseId,
      },
      {
        name: 'advanced',
        value: advanced,
      },
    ]
      .filter((param) => param.value)
      .map((param) => `${param.name}=${param.value}`)
      .join('&')
    redirect(`/login?redirect=/deploy?${params}`)
  } */
    const sessionToken = sessionCookie?.value || 'demo-token' // Add fallback for demo mode
  
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
        .filter((s) => s !== undefined)
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

  if (data === undefined || type === undefined || services === undefined)
    redirect('/app-store')

  const [longDesc, useCases, support] = await Promise.all([
    data.longDesc
      ? remark()
          .use(html)
          .process(data.longDesc)
          .then((file) => file.toString())
          .then((html) => html.replaceAll('href=', 'target="blank" href='))
      : undefined,
    data.useCases
      ? remark()
          .use(html)
          .process(data.useCases)
          .then((file) => file.toString())
          .then((html) => html.replaceAll('href=', 'target="blank" href='))
      : undefined,
    data.support
      ? remark()
          .use(html)
          .process(data.support)
          .then((file) => file.toString())
          .then((html) => html.replaceAll('href=', 'target="blank" href='))
      : undefined,
  ])

  return (
    <DeploymentContextProvider
      initialData={{ name: data.name, description: data.desc, services }}
    >
      <div className="container my-8">
        <div className="flex items-center gap-2 text-muted-foreground/75">
          <Link href="/app-store">App Store</Link>
          <span>/</span>
          <span className="text-primary/75">{data.name}</span>
        </div>
        <section className="mt-8 flex justify-between gap-12">
          <div className="flex flex-1 flex-col rounded border p-6">
            <div className="flex flex-1 items-start gap-3">
              {data.logo && data.logo !== '' ? (
                <img
                  src={
                    data.logo.startsWith('https://')
                      ? data.logo
                      : `${prefix}${data.logo}`
                  }
                  alt={`${data.name} logo`}
                  width={48}
                  height={48}
                />
              ) : (
                <AppWindow
                  className="size-12 text-muted-foreground"
                  strokeWidth={1.5}
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-primary">{data.name}</h2>
                <p className="mt-2 line-clamp-2 max-w-prose text-muted-foreground">
                  {data.desc}
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <DeploymentFlow
                sessionToken={sessionToken}
                item={data}
                type={type}
                specs={specs}
              />
              <DeploymentEdit />
            </div>
          </div>
          <div className="rounded border px-12 py-6">
            <h2>Minimum Requirements</h2>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <Cpu className="size-6 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">CPU</p>
                  <p className="font-mono leading-none">-</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MemoryStick className="size-6 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">RAM</p>
                  <p className="font-mono leading-none">
                    ~{((specs?.ram ?? 0) / 1000).toString()} GB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <HardDrive className="size-6 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="font-mono leading-none">
                    ~{((specs?.storage ?? 0) / 1000).toString()} GB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {services.some((s) => s.tags.includes('Validator')) && (
          <section className="mt-3">
            <Alert className="bg-orange-200/80 hover:bg-orange-200">
              <AlertTriangle />
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Blockchain nodes can take days to synchronize upon installation.
                It can take a while before you are able to interact with your
                node.
              </AlertDescription>
            </Alert>
          </section>
        )}
        <section className="mt-4 rounded border p-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-transparent">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent hover:border-muted data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              {data.useCases && data.useCases !== '' ? (
                <TabsTrigger
                  value="use-cases"
                  className="rounded-none border-b-2 border-transparent hover:border-muted data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Use Cases
                </TabsTrigger>
              ) : null}
              {data.support && data.support !== '' ? (
                <TabsTrigger
                  value="support"
                  className="rounded-none border-b-2 border-transparent hover:border-muted data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Support
                </TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent
              value="overview"
              className="prose prose-sm text-muted-foreground"
            >
              {data.longDesc && data.longDesc !== '' ? (
                <div dangerouslySetInnerHTML={{ __html: longDesc }} />
              ) : (
                data.desc
              )}
            </TabsContent>
            {data.useCases && data.useCases !== '' ? (
              <TabsContent
                value="use-cases"
                className="prose prose-sm text-muted-foreground"
              >
                <div dangerouslySetInnerHTML={{ __html: useCases }} />
              </TabsContent>
            ) : null}
            {data.support && data.support !== '' ? (
              <TabsContent
                value="support"
                className="prose prose-sm text-muted-foreground"
              >
                <div dangerouslySetInnerHTML={{ __html: support }} />
              </TabsContent>
            ) : null}
          </Tabs>
        </section>
      </div>
    </DeploymentContextProvider>
  )
}
