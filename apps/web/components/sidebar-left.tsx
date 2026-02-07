"use client"

import {
  Bookmark,
  Brain,
  ChevronRight,
  Github,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Twitter,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { NavUser } from "@/components/nav-user"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface ChatItem {
  id: string
  title: string
  createdAt: string
}

interface FolderItem {
  id: string
  name: string
  emoji: string
  sortOrder: number
  items: { id: string; title: string }[]
}

interface UserInfo {
  name: string
  email: string
  avatar: string
}

const socialLinks = [
  { name: "GitHub", icon: Github, url: "https://github.com" },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com" },
]

export function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [chats, setChats] = useState<ChatItem[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "", avatar: "" })

  // 初始加载文件夹和用户信息（只加载一次）
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [foldersRes, userRes] = await Promise.all([fetch("/api/folders"), fetch("/api/user")])
        if (cancelled) {
          return
        }

        if (foldersRes.ok) {
          const data = await foldersRes.json()
          setFolders(data.folders)
        }
        if (userRes.ok) {
          const data = await userRes.json()
          setUserInfo(data)
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) {
          setIsLoadingFolders(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // 聊天记录随 pathname 变化重新加载
  useEffect(() => {
    // pathname 变化时触发重新加载（如创建/删除聊天后）
    const _path = pathname
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/history?limit=20")
        if (res.ok && !cancelled) {
          setChats((await res.json()).chats)
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) {
          setIsLoadingChats(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [pathname])

  const handleDeleteChat = useCallback(
    async (e: React.MouseEvent, chatId: string) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        const res = await fetch("/api/chat", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: chatId }),
        })
        if (res.ok) {
          setChats((prev) => prev.filter((c) => c.id !== chatId))
          if (pathname === `/chat/${chatId}`) {
            router.push("/chat")
          }
          toast.success("已删除对话")
        }
      } catch {
        toast.error("删除失败")
      }
    },
    [pathname, router]
  )

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Brain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MindPocket</span>
                  <span className="truncate text-muted-foreground text-xs">口袋大脑</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 主导航 */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/chat"}>
              <Link href="/chat">
                <Sparkles />
                <span>AI 对话</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/search"}>
              <Link href="/search">
                <Search />
                <span>搜索</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>数据看板</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"}>
              <Link href="/">
                <Bookmark />
                <span>所有收藏</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* 聊天记录 */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <MessageSquare className="mr-1 size-3" />
            聊天记录
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoadingChats && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Loader2 className="size-4 animate-spin" />
                    <span>加载中...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!isLoadingChats && chats.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-muted-foreground text-xs">暂无对话</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!isLoadingChats &&
                chats.length > 0 &&
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`}>
                      <Link href={`/chat/${chat.id}`}>
                        <span className="truncate">{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction onClick={(e) => handleDeleteChat(e, chat.id)}>
                      <Trash2 className="size-3" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 文件夹分类 */}
        <SidebarGroup>
          <SidebarGroupLabel>文件夹</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoadingFolders && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Loader2 className="size-4 animate-spin" />
                    <span>加载中...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!isLoadingFolders && folders.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-muted-foreground text-xs">暂无文件夹</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!isLoadingFolders &&
                folders.map((f) => (
                  <Collapsible key={f.id}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === `/folders/${f.id}`}>
                        <Link href={`/folders/${f.id}`}>
                          <span>{f.emoji}</span>
                          <span>{f.name}</span>
                        </Link>
                      </SidebarMenuButton>
                      {f.items.length > 0 && (
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction>
                            <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                      )}
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {f.items.map((item) => (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/items/${item.id}`}>
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}

              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <Plus className="size-4" />
                  <span>新建文件夹</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        {/* 用户信息 */}
        <NavUser user={userInfo} />

        {/* 社交媒体链接 */}
        <div className="flex items-center gap-1 px-2 py-1">
          {socialLinks.map((link) => (
            <a
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              href={link.url}
              key={link.name}
              rel="noopener noreferrer"
              target="_blank"
            >
              <link.icon className="size-4" />
              <span className="sr-only">{link.name}</span>
            </a>
          ))}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
