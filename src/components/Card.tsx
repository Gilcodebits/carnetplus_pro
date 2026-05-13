import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
  animated?: boolean;
  delay?: number;
  noPadding?: boolean;
  id?: string;
}

export function Card({ children, className = "", onClick, hover = false, style, animated = false, delay = 0, noPadding = false, id }: CardProps) {
  const delayClass = delay ? `delay-${delay}` : "";
  return (
    <div
      id={id}
      onClick={onClick}
      style={style}
      className={`${className.includes('bg-') ? '' : 'bg-white'} rounded-2xl border border-slate-200 shadow-sm ${noPadding ? '' : 'p-6'} ${hover ? "hover:shadow-md hover:border-slate-300 cursor-pointer transition-all" : ""} ${animated ? `animate-fadeInUp ${delayClass}` : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const colorClasses = {
  blue: { bg: "bg-blue-50/50", icon: "bg-blue-600", text: "text-blue-700", border: "border-blue-200" },
  green: { bg: "bg-green-50/50", icon: "bg-green-600", text: "text-green-700", border: "border-green-200" },
  purple: { bg: "bg-purple-50/50", icon: "bg-purple-600", text: "text-purple-700", border: "border-purple-200" },
  orange: { bg: "bg-orange-50/50", icon: "bg-orange-600", text: "text-orange-700", border: "border-orange-200" },
  violet: { bg: "bg-blue-50/50", icon: "bg-blue-600", text: "text-blue-700", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50/50", icon: "bg-emerald-600", text: "text-emerald-700", border: "border-emerald-200" },
  teal: { bg: "bg-teal-50/50", icon: "bg-teal-600", text: "text-teal-700", border: "border-teal-200" },
  rose: { bg: "bg-rose-50/50", icon: "bg-rose-600", text: "text-rose-700", border: "border-rose-200" },
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
      className={`${c.bg} border-2 ${c.border} rounded-2xl p-4 md:p-6 ${onClick ? "hover:shadow-md cursor-pointer transition-all" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] truncate">{title}</p>
          <p className="text-xl md:text-3xl font-black text-slate-900 mt-1 md:mt-2 tracking-tighter">{value}</p>
          {trend && <p className="text-[8px] md:text-[9px] text-emerald-600 mt-2 font-black uppercase tracking-widest truncate">{trend}</p>}
        </div>
        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl ${c.icon} flex items-center justify-center text-white shadow-lg shadow-slate-200/50 flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
