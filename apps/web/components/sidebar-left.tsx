"use client"

import {
  Bookmark,
  Brain,
  ChevronRight,
  Github,
  LayoutDashboard,
  MessageSquare,
  Pin,
  Plus,
  Search,
  Sparkles,
  Twitter,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type * as React from "react"

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

// TODO: 从数据库获取用户信息
const user = {
  name: "Admin",
  email: "admin@mindpocket.com",
  avatar: "",
}

// 系统默认文件夹（固定置顶，不可删除）
const systemFolders = [
  {
    name: "聊天记录",
    id: "chats",
    pinned: true,
    items: [
      { name: "关于 React 性能优化", id: "chat-1" },
      { name: "Next.js 部署方案讨论", id: "chat-2" },
      { name: "RAG 原理解析", id: "chat-3" },
    ],
  },
]

// TODO: 从数据库获取文件夹列表
const userFolders = [
  {
    name: "前端开发",
    emoji: "💻",
    id: "frontend",
    items: [
      { name: "React 19 新特性总结", id: "item-1" },
      { name: "Tailwind CSS 最佳实践", id: "item-2" },
    ],
  },
  {
    name: "AI 论文",
    emoji: "🤖",
    id: "ai-papers",
    items: [{ name: "Attention Is All You Need", id: "item-3" }],
  },
  { name: "设计灵感", emoji: "🎨", id: "design", items: [] },
  { name: "读书笔记", emoji: "📚", id: "reading", items: [] },
]

const socialLinks = [
  { name: "GitHub", icon: Github, url: "https://github.com" },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com" },
]

export function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

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
        {/* 文件夹分类 */}
        <SidebarGroup>
          <SidebarGroupLabel>文件夹</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 系统默认文件夹 - 置顶 */}
              {systemFolders.map((folder) => (
                <Collapsible key={folder.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === `/folders/${folder.id}`}>
                      <Link href={`/folders/${folder.id}`}>
                        <MessageSquare className="size-4" />
                        <span>{folder.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction>
                        <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <Pin className="pointer-events-none absolute right-7 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/50" />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {folder.items.map((item) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton asChild>
                              <Link href={`/chat/${item.id}`}>
                                <span>{item.name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}

              {/* 用户自建文件夹 */}
              {userFolders.map((folder) => (
                <Collapsible key={folder.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === `/folders/${folder.id}`}>
                      <Link href={`/folders/${folder.id}`}>
                        <span>{folder.emoji}</span>
                        <span>{folder.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    {folder.items.length > 0 && (
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction>
                          <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                    )}
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {folder.items.map((item) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton asChild>
                              <Link href={`/items/${item.id}`}>
                                <span>{item.name}</span>
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
        <NavUser user={user} />

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
