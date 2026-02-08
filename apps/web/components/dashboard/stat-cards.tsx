"use client"

import { Bookmark, BrainCircuit, MessageSquare, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardsProps {
  totalBookmarks: number
  weekBookmarks: number
  totalChats: number
  embeddingRate: number
}

export function StatCards({
  totalBookmarks,
  weekBookmarks,
  totalChats,
  embeddingRate,
}: StatCardsProps) {
  const cards = [
    {
      title: "总收藏",
      value: totalBookmarks,
      icon: Bookmark,
      description: "所有收藏内容",
    },
    {
      title: "本周新增",
      value: weekBookmarks,
      icon: TrendingUp,
      description: "最近 7 天",
    },
    {
      title: "AI 对话",
      value: totalChats,
      icon: MessageSquare,
      description: "对话总数",
    },
    {
      title: "向量化率",
      value: `${embeddingRate}%`,
      icon: BrainCircuit,
      description: "内容已向量化",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
