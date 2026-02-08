"use client"

import { useCallback, useEffect, useState } from "react"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { IngestDialog } from "@/components/ingest-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function Web() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [folders, setFolders] = useState<Array<{ id: string; name: string; emoji: string }>>([])

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders")
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders)
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const handleIngestSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <SidebarInset>
      <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">所有收藏</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="pr-3">
          <IngestDialog folders={folders} onSuccess={handleIngestSuccess} />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <BookmarkGrid refreshKey={refreshKey} />
      </div>
    </SidebarInset>
  )
}
