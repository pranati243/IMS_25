"use client";

import { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function ChartCard({
  title,
  subtitle,
  children,
  footer,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`bg-white overflow-hidden rounded-lg shadow-md ${className}`}
    >
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      <div className="p-3 sm:p-6">{children}</div>

      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
