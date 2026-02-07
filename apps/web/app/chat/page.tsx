"use client"

import { nanoid } from "nanoid"
import { useMemo } from "react"
import { Chat } from "@/components/chat"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function ChatPage() {
  const id = useMemo(() => nanoid(), [])

  return (
    <>
      <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
          <span className="text-sm">新对话</span>
        </div>
      </header>
      <Chat id={id} />
    </>
  )
}
