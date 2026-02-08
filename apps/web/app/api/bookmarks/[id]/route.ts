import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { getBookmarkById, getBookmarkTags } from "@/db/queries/bookmark"
import { bookmark } from "@/db/schema/bookmark"
import { auth } from "@/lib/auth"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const item = await getBookmarkById({ id, userId: session.user.id })
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const tags = await getBookmarkTags(id)

  return NextResponse.json({ ...item, tags })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await getBookmarkById({ id, userId: session.user.id })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()
  const { title, content, description } = body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) {
    updates.title = title
  }
  if (content !== undefined) {
    updates.content = content
  }
  if (description !== undefined) {
    updates.description = description
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  await db.update(bookmark).set(updates).where(eq(bookmark.id, id))

  return NextResponse.json({ success: true })
}
