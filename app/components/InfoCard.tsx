import { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function InfoCard({
  title,
  children,
  actions,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}: InfoCardProps) {
  return (
    <div
      className={`bg-white overflow-hidden rounded-lg shadow-md ${className}`}
    >
      <div
        className={`px-4 py-5 sm:px-6 flex justify-between items-center ${headerClassName}`}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
