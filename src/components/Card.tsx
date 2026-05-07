import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
  animated?: boolean;
  delay?: number;
}

export function Card({ children, className = "", onClick, hover = false, style, animated = false, delay = 0 }: CardProps) {
  const delayClass = delay ? `delay-${delay}` : "";
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 ${hover ? "card-hover cursor-pointer" : ""} ${animated ? `animate-fadeInUp ${delayClass}` : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const colorClasses = {
  blue:   { bg: "bg-gradient-to-br from-blue-50 to-blue-100",   icon: "bg-blue-500",   text: "text-blue-700",   border: "border-blue-200" },
  green:  { bg: "bg-gradient-to-br from-green-50 to-green-100", icon: "bg-green-500",  text: "text-green-700",  border: "border-green-200" },
  purple: { bg: "bg-gradient-to-br from-purple-50 to-purple-100", icon: "bg-purple-500", text: "text-purple-700", border: "border-purple-200" },
  orange: { bg: "bg-gradient-to-br from-orange-50 to-orange-100", icon: "bg-orange-500", text: "text-orange-700", border: "border-orange-200" },
  violet: { bg: "bg-gradient-to-br from-blue-50 to-blue-100", icon: "bg-blue-500", text: "text-blue-700", border: "border-blue-200" },
  emerald: { bg: "bg-gradient-to-br from-emerald-50 to-emerald-100", icon: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200" },
  teal:    { bg: "bg-gradient-to-br from-teal-50 to-teal-100",       icon: "bg-teal-500",    text: "text-teal-700",    border: "border-teal-200" },
  rose:    { bg: "bg-gradient-to-br from-rose-50 to-rose-100",       icon: "bg-rose-500",    text: "text-rose-700",    border: "border-rose-200" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange" | "violet" | "emerald" | "teal" | "rose";
  onClick?: () => void;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, color = "blue", onClick, delay = 0 }: StatCardProps) {
  const c = colorClasses[color];
  const delayClass = delay ? `delay-${delay}` : "";
  return (
    <div
      onClick={onClick}
      className={`${c.bg} border ${c.border} rounded-xl p-5 animate-fadeInUp ${delayClass} ${onClick ? "card-hover cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${c.text} opacity-80`}>{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-2 font-medium">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
