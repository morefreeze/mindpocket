import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/db/client"
import { bookmark } from "@/db/schema/bookmark"
import { folder } from "@/db/schema/folder"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const folders = await db
    .select({
      id: folder.id,
      name: folder.name,
      emoji: folder.emoji,
      sortOrder: folder.sortOrder,
    })
    .from(folder)
    .where(eq(folder.userId, session.user.id))
    .orderBy(folder.sortOrder)

  // 获取每个文件夹下的书签（最多显示 5 条）
  const foldersWithBookmarks = await Promise.all(
    folders.map(async (f) => {
      const bookmarks = await db
        .select({ id: bookmark.id, title: bookmark.title })
        .from(bookmark)
        .where(eq(bookmark.folderId, f.id))
        .limit(5)

      return { ...f, items: bookmarks }
    })
  )

  return Response.json({ folders: foldersWithBookmarks })
}
