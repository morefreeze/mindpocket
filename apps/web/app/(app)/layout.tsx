"use client"

import dynamic from "next/dynamic"
import { SidebarProvider } from "@/components/ui/sidebar"

const SidebarLeft = dynamic(() => import("@/components/sidebar-left").then((m) => m.SidebarLeft), {
  ssr: false,
})

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      {children}
    </SidebarProvider>
  )
}
