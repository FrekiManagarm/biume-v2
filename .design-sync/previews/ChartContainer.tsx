import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@biume/ui/components/chart"

const data = [
  { month: "Jan", revenue: 4200, expenses: 2400 },
  { month: "Feb", revenue: 3800, expenses: 2210 },
  { month: "Mar", revenue: 5100, expenses: 2290 },
  { month: "Apr", revenue: 4780, expenses: 2000 },
  { month: "May", revenue: 5890, expenses: 2181 },
  { month: "Jun", revenue: 6390, expenses: 2500 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Default() {
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ minHeight: 224, maxWidth: 480 }}
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
