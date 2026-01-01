import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

const mockData = [
  { month: 'Jan', revenue: 450000, expenses: 280000, profit: 170000 },
  { month: 'Feb', revenue: 520000, expenses: 310000, profit: 210000 },
  { month: 'Mar', revenue: 480000, expenses: 290000, profit: 190000 },
  { month: 'Apr', revenue: 610000, expenses: 340000, profit: 270000 },
  { month: 'May', revenue: 580000, expenses: 320000, profit: 260000 },
  { month: 'Jun', revenue: 690000, expenses: 380000, profit: 310000 },
];

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(120, 25%, 65%)',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(19, 70%, 40%)',
  },
  profit: {
    label: 'Profit',
    color: 'hsl(120, 40%, 45%)',
  },
} satisfies ChartConfig;

export function ProfitChart() {
  const [period, setPeriod] = useState('6months');
  const [section, setSection] = useState('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card className="col-span-full animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Profit Overview</CardTitle>
        <div className="flex gap-2">
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="poultry">Poultry</SelectItem>
              <SelectItem value="fishery">Fishery</SelectItem>
              <SelectItem value="crops">Crops</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(120, 25%, 65%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(120, 25%, 65%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(120, 40%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(120, 40%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(120, 25%, 65%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="hsl(120, 40%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
