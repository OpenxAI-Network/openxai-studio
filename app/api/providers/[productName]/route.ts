import { NextRequest } from 'next/server'
import { db } from '@/db'
import { Providers } from '@/db/schema'
import { z } from 'zod'

export async function GET(
  _: NextRequest,
  { params }: { params: { productName: string } }
) {
  const productName = z.string().parse(params.productName)

  const data = await db.query.Providers.findFirst()

  return Response.json(data ?? null)
}
