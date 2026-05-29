export default function DashboardStats({ stats }: { stats: { label: string; value: number | string; icon: any; color: string }[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
            </div>
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
              <s.icon size={20} className="text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}