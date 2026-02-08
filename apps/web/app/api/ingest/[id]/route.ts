import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { bookmark } from "@/db/schema/bookmark"
import { auth } from "@/lib/auth"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const result = await db
    .select({
      id: bookmark.id,
      title: bookmark.title,
      type: bookmark.type,
      ingestStatus: bookmark.ingestStatus,
      ingestError: bookmark.ingestError,
      createdAt: bookmark.createdAt,
    })
    .from(bookmark)
    .where(eq(bookmark.id, id))

  const item = result[0]
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(item)
}
