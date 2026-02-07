"use client"

import dynamic from "next/dynamic"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const SidebarLeft = dynamic(() => import("@/components/sidebar-left").then((m) => m.SidebarLeft), {
  ssr: false,
})

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset className="flex h-dvh flex-col overflow-hidden">{children}</SidebarInset>
    </SidebarProvider>
  )
}
