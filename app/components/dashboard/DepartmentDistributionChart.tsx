"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { getDepartmentStyle } from "@/app/lib/theme";

type ChartData = {
  name: string;
  shortName: string; // Add short name for legend display
  value: number;
  color: string;
};

type DepartmentData = {
  department: string;
  count: number;
};

type DepartmentDistributionChartProps = {
  dataKey?: "faculty" | "students";
  height?: number;
  data?: DepartmentData[];
};

// Custom label render props type
type CustomLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
};

// Utility function to abbreviate department names
const getShortName = (name: string): string => {
  // Return abbreviations for known departments with long names
  if (name === "Electronics and Telecommunication Engineering") return "ExTC";
  if (name === "Computer Engineering") return "CSE";
  if (name === "Mechanical Engineering") return "ME";
  if (name === "Electrical Engineering") return "EE";
  if (name === "Information Technology") return "IT";

  // For unknown departments or already short names
  if (name.length > 15) {
    return name.substring(0, 12) + "...";
  }
  return name;
};

export default function DepartmentDistributionChart({
  dataKey = "faculty",
  height = 300,
  data,
}: DepartmentDistributionChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If data is provided directly, use it
    if (data && data.length > 0) {
      const transformedData = data.map((item) => {
        const department = item.department;
        const count = item.count || 0;
        const departmentStyle = getDepartmentStyle(department);

        return {
          name: department,
          shortName: getShortName(department),
          value: count,
          color: departmentStyle.primary,
        };
      });

      setChartData(transformedData);
      setLoading(false);
      return;
    }

    // Otherwise fetch data from API as before
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data from the existing stats API
        const response = await fetch("/api/departments/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch department data");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "API returned an error");
        }

        const { departmentStats } = result.data;

        // Transform API data to chart format with colors based on dataKey
        const transformedData = departmentStats.map(
          (item: {
            Department_Name: string;
            current_faculty_count: number;
            Total_Students: number;
          }) => {
            const department = item.Department_Name;
            // Choose count based on dataKey (faculty or students)
            const count =
              dataKey === "faculty"
                ? item.current_faculty_count
                : item.Total_Students;

            const departmentStyle = getDepartmentStyle(department);
            const color = departmentStyle.primary;

            return {
              name: department,
              shortName: getShortName(department),
              value: count,
              color: color,
            };
          }
        );

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching department data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataKey]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: CustomLabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom formatter for the legend that uses shortened names
  // Using a permissive type that works with recharts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegendText = (value: unknown, entry: any): React.ReactNode => {
    if (entry && entry.payload && entry.payload.shortName) {
      return <span>{entry.payload.shortName}</span>;
    }
    return <span>{String(value)}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        Loading department data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  }

  if (chartData.length === 0) {
    return <div className="p-4 text-center">No department data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={90}
          dataKey="value"
          nameKey="shortName"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} ${dataKey}`, null]}
          labelFormatter={(name) => {
            // Use the full name in tooltip
            const entry = chartData.find((item) => item.shortName === name);
            return entry ? entry.name : name;
          }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          formatter={renderLegendText}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
