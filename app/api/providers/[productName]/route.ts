import { NextRequest } from 'next/server'
import { db } from '@/db'
import { Providers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function GET(
  _: NextRequest,
  { params }: { params: { productName: string } }
) {
  const productName = z.string().parse(params.productName)

  const data = await db.query.Providers.findFirst({
    where: eq(Providers.productName, productName),
  })

  if (!data)
    return Response.json({ error: "Couldn't find a matching Baremetal Server" })
  return Response.json(data)
}
