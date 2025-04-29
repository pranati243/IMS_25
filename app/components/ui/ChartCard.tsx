"use client";

import { ReactNode } from "react";
import { classNames } from "@/app/lib/utils";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  useGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
};

export default function ChartCard({
  title,
  subtitle,
  children,
  footer,
  className = "",
  headerClassName = "",
  useGradient = false,
  gradientFrom = "from-indigo-600",
  gradientTo = "to-purple-600",
}: ChartCardProps) {
  const headerClasses = useGradient
    ? classNames(
        "px-4 py-5 sm:px-6 text-white bg-gradient-to-r",
        gradientFrom,
        gradientTo,
        headerClassName
      )
    : classNames(
        "px-4 py-5 sm:px-6 border-b border-gray-200 bg-white",
        headerClassName
      );

  return (
    <div
      className={classNames(
        "overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className={headerClasses}>
        <h3
          className={classNames(
            "text-lg font-medium leading-6",
            useGradient ? "text-white" : "text-gray-900"
          )}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={classNames(
              "mt-1 max-w-2xl text-sm",
              useGradient ? "text-white/80" : "text-gray-500"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="bg-white p-3 sm:p-6">{children}</div>

      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
