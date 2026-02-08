"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface GrowthChartProps {
  data: Array<{ date: string; count: number }>
  days: number
  onDaysChange: (days: number) => void
}

const chartConfig = {
  count: {
    label: "收藏数",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const dayOptions = [
  { label: "7天", value: 7 },
  { label: "30天", value: 30 },
  { label: "90天", value: 90 },
]

export function GrowthChart({ data, days, onDaysChange }: GrowthChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>收藏增长趋势</CardTitle>
            <CardDescription>每日新增收藏数量</CardDescription>
          </div>
          <div className="flex gap-1">
            {dayOptions.map((opt) => (
              <button
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  days === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                key={opt.value}
                onClick={() => onDaysChange(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[250px] w-full" config={chartConfig}>
          <AreaChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={(value: string) => {
                const d = new Date(value)
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("zh-CN")
                  }}
                />
              }
            />
            <defs>
              <linearGradient id="fillCount" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="count"
              fill="url(#fillCount)"
              stroke="var(--color-count)"
              strokeWidth={2}
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
