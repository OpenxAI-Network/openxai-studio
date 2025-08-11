import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { HealthSummary, XNodesApps, XNodesHealth } from './health-data'

export default async function DashboardPage() {
  const sessionCookie = cookies().get('userSessionToken')
  if (!sessionCookie) {
    redirect('/login?redirect=/dashboard')
  }

  return (
    <div className="container my-12 max-w-none">
      <section className="space-y-4 rounded border p-6">
        <h2 className="text-xl font-bold">Resources</h2>
        <HealthSummary sessionToken={sessionCookie.value} />
      </section>
      <section className="mt-6 space-y-4 rounded border p-6">
        <h2 className="text-xl font-bold">Individual Nodes</h2>
        <XNodesHealth sessionToken={sessionCookie.value} />
      </section>
      <div className="mt-6 grid grid-cols-2 gap-6">
        <section className="space-y-4 rounded border p-6">
          <h2 className="text-xl font-bold">Rewards</h2>
          <Alert variant="alert">
            <AlertTriangle className="size-5" />
            <AlertTitle>Showcase</AlertTitle>
            <AlertDescription>
              This section contains mock information for demo purposes.
            </AlertDescription>
          </Alert>
          {/* eslint-disable-next-line tailwindcss/migration-from-tailwind-2 */}
          <Table className="w-full overflow-clip rounded">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="h-7">Node</TableHead>
                <TableHead className="h-7">Date of Claim</TableHead>
                <TableHead className="h-7">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {rewardsMockData.map((reward) => (
                <TableRow key={`reward-${reward.dateOfClaim}`}>
                  <TableCell>{reward.node}</TableCell>
                  <TableCell>
                    {format(reward.dateOfClaim, 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{reward.amount}</TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </section>
        <section className="space-y-4 rounded border p-6">
          <h2 className="text-xl font-bold">Running Apps</h2>
          <XNodesApps sessionToken={sessionCookie.value} />
        </section>
      </div>
      {/* <Dashboard /> */}
    </div>
  )
}
