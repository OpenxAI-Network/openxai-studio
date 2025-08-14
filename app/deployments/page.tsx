import Link from 'next/link'

import { DemoPool } from './demo-pool'
import { MyXnodes } from './my-xnodes'

export default function DeploymentsPage() {
  return (
    <div className="container my-12 flex max-w-none flex-col gap-6">
      <MyXnodes />
      {/* Demo Pool */}
      <div>
        <h1 className="mb-6 text-3xl font-bold">OpenxAI Launch Demo Pool</h1>

        <p className="mb-3 text-lg">
          During the{' '}
          <Link
            href="https://studio.openxai.org/global-accelerator-2025"
            className="font-bold underline"
          >
            OpenxAI Deployable Demo App
          </Link>
          , test your AI applications on our demo nodes. Each node is available
          for 30 minutes - check out our{' '}
          <Link href="/app-store" className="text-primary hover:underline">
            AI App Store
          </Link>{' '}
          to get started.
        </p>

        <DemoPool />
      </div>

      {/* Commented out for now - may add back later
      {sessionCookie ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Deployed Nodes</h2>
          <DeploymentsList sessionToken={sessionCookie.value} />
        </div>
      ) : (
        <div className="text-center">
          <a href="/login?redirect=/deployments" className="text-primary hover:underline">
            Login to view your deployments
          </a>
        </div>
      )} */}
    </div>
  )
}
