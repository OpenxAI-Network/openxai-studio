import { NextRequest } from 'next/server'
import { db } from '@/db'
import { Providers } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams
  const provider = params.get('provider')

  let query = db.query.Providers.findMany({
    where: provider ? eq(Providers.providerName, provider) : undefined,
  })

  const data = await query

  return Response.json(data)
} 