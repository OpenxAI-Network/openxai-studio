import { cookies } from 'next/headers'
import { DemoPool } from './demo-pool'
import DeploymentsList from './deployments-list'

export default function DeploymentsPage() {
  const sessionCookie = cookies().get('userSessionToken')

  return (
    <div className="container my-12 max-w-none">
      {/* Demo Pool */}
      <div className="mb-12">
        <h1 className="mb-6 text-3xl font-bold">OpenxAI Launch Demo Pool</h1>
        <DemoPool />
      </div>

      {/* Regular deployments require login */}
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
      )}
    </div>
  )
}
