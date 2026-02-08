import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getFolderById } from "@/db/queries/folder"
import { auth } from "@/lib/auth"
import { FolderDetailClient } from "./folder-detail-client"

export default async function FolderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect("/login")
  }

  const folder = await getFolderById({ id, userId: session.user.id })
  if (!folder) {
    redirect("/")
  }

  return <FolderDetailClient folder={folder} />
}
