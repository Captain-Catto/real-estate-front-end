import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  href?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  changeType,
  href,
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  const changeColorClasses = {
    increase: "text-green-600 bg-green-100",
    decrease: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  };

  const content = (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && changeType && (
            <div className="flex items-center mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${changeColorClasses[changeType]}`}
              >
                {changeType === "increase"
                  ? "↗"
                  : changeType === "decrease"
                  ? "↘"
                  : "→"}{" "}
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
