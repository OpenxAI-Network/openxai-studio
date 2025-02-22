import { cookies } from 'next/headers'
import { DemoPool } from './demo-pool'
import Link from 'next/link'
// import DeploymentsList from './deployments-list'

export default function DeploymentsPage() {
  const sessionCookie = cookies().get('userSessionToken')

  return (
    <div className="container my-12 max-w-none">
      {/* Demo Pool */}
      <div className="mb-12">
        <h1 className="mb-6 text-3xl font-bold">OpenxAI Launch Demo Pool</h1>

        <p className="mb-6 text-lg">
          During the <Link href="https://dashboard.openxai.org/genesis" className="font-bold underline">OpenxAI Genesis Event</Link>, 
          test your AI applications on our demo nodes. Each node is available for 1 hour - check out our{' '}
          <Link href="/app-store" className="text-primary hover:underline" className="font-bold underline">AI App Store</Link> to get started.
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
