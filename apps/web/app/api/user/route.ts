import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  return Response.json({
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || "",
  })
}
