"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DepartmentBarChartProps = {
  data?: {
    department: string;
    count: number;
  }[];
  dataKey?: string;
  barColor?: string;
  height?: number;
};

export default function DepartmentBarChart({
  data,
  dataKey = "count",
  barColor = "#4f46e5",
  height = 300,
}: DepartmentBarChartProps) {
  // Transform data for the chart
  const chartData = data?.map((item) => ({
    name: item.department,
    [dataKey]: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
