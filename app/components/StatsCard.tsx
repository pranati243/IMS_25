import { ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { classNames } from "@/app/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  changeText?: string;
  trend?: "up" | "down" | "neutral";
  bgColor?: string;
  textColor?: string;
};

export default function StatsCard({
  title,
  value,
  icon,
  change,
  changeText,
  trend = "neutral",
  bgColor = "bg-white",
  textColor = "text-gray-900",
}: StatsCardProps) {
  return (
    <div
      className={classNames(
        bgColor,
        "relative overflow-hidden rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg"
      )}
    >
      <dt>
        <div className="absolute rounded-md p-3 bg-indigo-500/10">{icon}</div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">
          {title}
        </p>
      </dt>
      <dd className="ml-16 flex items-baseline justify-between pt-1">
        <p className={classNames(textColor, "text-2xl font-semibold")}>
          {value}
        </p>

        {change !== undefined && trend !== "neutral" && (
          <div className="flex flex-col items-end">
            <p
              className={classNames(
                trend === "up" ? "text-green-600" : "text-red-600",
                "flex items-center text-xs"
              )}
            >
              {trend === "up" ? (
                <ArrowUpIcon
                  className="h-3 w-3 flex-shrink-0 self-center text-green-600"
                  aria-hidden="true"
                />
              ) : (
                <ArrowDownIcon
                  className="h-3 w-3 flex-shrink-0 self-center text-red-600"
                  aria-hidden="true"
                />
              )}
              <span className="ml-1">{Math.abs(change)}%</span>
            </p>

            {changeText && (
              <p className="text-xs text-gray-500">{changeText}</p>
            )}
          </div>
        )}
      </dd>
    </div>
  );
}
