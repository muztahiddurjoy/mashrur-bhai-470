// src/components/dashboard/spending-by-category.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface CategorySpending {
  _id: string;
  total: number;
}

interface SpendingByCategoryProps {
  data: CategorySpending[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#A28FD0', '#FF6666', '#4ECDC4', '#FF6B6B',
  '#45B7D1', '#F9A825', '#E1BEE7', '#D4E157'
];

export function SpendingByCategory({ data }: SpendingByCategoryProps) {
  // Filter out income categories and sort by amount
  const spendingData = data
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total);

  if (spendingData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No spending data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[#8884d8] font-bold">{payload[0].name}</span>
            <span className="text-foreground">
              {formatCurrency(payload[0].value)}
            </span>
            <span className="text-muted-foreground">
              {((payload[0].value / spendingData.reduce((sum, item) => sum + item.total, 0)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    const total = spendingData.reduce((sum, item) => sum + item.total, 0);

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center text-sm">
            <div
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="mr-1 font-medium">{entry.value}</span>
            <span className="text-muted-foreground">
              ({((entry.payload.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={spendingData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="total"
            nameKey="_id"
            labelLine={false}
          >
            {spendingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}