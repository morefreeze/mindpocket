import { headers } from "next/headers"
import { getChatsByUserId } from "@/db/queries/chat"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get("limit") || "20")
  const endingBefore = searchParams.get("ending_before") || undefined

  const chats = await getChatsByUserId({
    id: session.user.id,
    limit,
    endingBefore,
  })

  const hasMore = chats.length > limit
  const result = hasMore ? chats.slice(0, limit) : chats

  return Response.json({ chats: result, hasMore })
}
