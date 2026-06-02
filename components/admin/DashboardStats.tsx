// components/dashboard/DashboardStats.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {TrendingUp,TrendingDown,Minus} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface StatItem{
  label:string;value:number|string;icon:any;color:string;
  change?:number;changeLabel?:string;
}

interface Props{stats:StatItem[];lang?:string}

// ═══════════════════════════════════════════════════════════
// Stat Card (Memoized)
// ═══════════════════════════════════════════════════════════
const StatCard=React.memo(({stat}:{stat:StatItem})=>{
  const isUp=stat.change?stat.change>0:false;
  const isDown=stat.change?stat.change<0:false;
  const ChangeIcon=isUp?TrendingUp:isDown?TrendingDown:Minus;
  const changeColor=isUp?'text-green-500':isDown?'text-red-500':'text-gray-400';

  return(
    <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-all group" style={{transform:'translateZ(0)'}}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          {stat.change!==undefined&&(
            <div className={`flex items-center gap-1 mt-1.5 ${changeColor}`}>
              <ChangeIcon size={12}/>
              <span className="text-xs font-medium">{Math.abs(stat.change)}%</span>
              {stat.changeLabel&&<span className="text-[10px] text-gray-400 ml-1">{stat.changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <stat.icon size={20} className="text-white"/>
        </div>
      </div>
    </div>
  );
});
StatCard.displayName='StatCard';

// ═══════════════════════════════════════════════════════════
// DashboardStats (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const DashboardStats=React.memo(({stats,lang='en'}:Props)=>{
  return(
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4" style={{contain:'layout style paint'}}>
      {stats.map((s,i)=>(
        <StatCard key={i} stat={s}/>
      ))}
    </div>
  );
});

DashboardStats.displayName='DashboardStats';

export default DashboardStats;