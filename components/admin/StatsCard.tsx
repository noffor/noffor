import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  color?: string;
  bgColor?: string;
}

export default function StatsCard({ icon: Icon, label, value, change = 0, color = 'text-blue-400', bgColor = 'bg-blue-500/10' }: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        {change !== 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}