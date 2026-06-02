// components/profile/LiveActivity.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • রিয়েলটাইম
"use client";
import React,{useState,useEffect,useCallback,useMemo,useRef,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {getText,LangCode} from '@/lib/language';
import {Clock,Activity,CheckCircle,XCircle,Loader2,AlertCircle} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{noActivity:'No recent activity',loading:'Loading activity...',error:'Failed to load',retry:'Retry',justNow:'Just now',minAgo:'min ago',hrAgo:'hr ago',dayAgo:'day ago',booking:'Booking',job:'Job',profile:'Profile',online:'Online',offline:'Offline'},
  bn:{noActivity:'কোনো সাম্প্রতিক কার্যকলাপ নেই',loading:'কার্যকলাপ লোড হচ্ছে...',error:'লোড করতে ব্যর্থ',retry:'আবার চেষ্টা',justNow:'এখনই',minAgo:'মিনিট আগে',hrAgo:'ঘন্টা আগে',dayAgo:'দিন আগে',booking:'বুকিং',job:'কাজ',profile:'প্রোফাইল',online:'অনলাইন',offline:'অফলাইন'},
  ar:{noActivity:'لا يوجد نشاط حديث',loading:'جاري تحميل النشاط...',error:'فشل التحميل',retry:'إعادة',justNow:'الآن',minAgo:'دقيقة',hrAgo:'ساعة',dayAgo:'يوم',booking:'حجز',job:'وظيفة',profile:'ملف',online:'متصل',offline:'غير متصل'},
  hi:{noActivity:'कोई हालिया गतिविधि नहीं',loading:'गतिविधि लोड हो रही...',error:'लोड विफल',retry:'पुनः प्रयास',justNow:'अभी',minAgo:'मिनट पहले',hrAgo:'घंटा पहले',dayAgo:'दिन पहले',booking:'बुकिंग',job:'काम',profile:'प्रोफाइल',online:'ऑनलाइन',offline:'ऑफलाइन'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={MAX_ITEMS:5,CACHE_TTL:15000,REFRESH_INTERVAL:30000};

// ═══════════════════════════════════════════════════════════
// Activity Icon Mapper
// ═══════════════════════════════════════════════════════════
const getActivityIcon=(type:string)=>{
  const icons:Record<string,any>={
    booking:CheckCircle,completed:CheckCircle,
    rejected:XCircle,profile:Activity,job:Activity,
    online:Activity,offline:Activity,
  };
  return icons[type]||Activity;
};

const getActivityColor=(type:string):string=>{
  const colors:Record<string,string>={
    booking:'bg-blue-500',completed:'bg-green-500',
    rejected:'bg-red-500',profile:'bg-orange-500',
    job:'bg-purple-500',online:'bg-green-500',offline:'bg-gray-500',
  };
  return colors[type]||'bg-gray-500';
};

// ═══════════════════════════════════════════════════════════
// Time Ago Formatter
// ═══════════════════════════════════════════════════════════
const formatTimeAgo=(dateStr:string,tr:Record<string,string>):string=>{
  const now=Date.now();
  const then=new Date(dateStr).getTime();
  const diffMin=Math.floor((now-then)/60000);
  
  if(diffMin<1)return tr.justNow;
  if(diffMin<60)return`${diffMin} ${tr.minAgo}`;
  const diffHr=Math.floor(diffMin/60);
  if(diffHr<24)return`${diffHr} ${tr.hrAgo}`;
  const diffDay=Math.floor(diffHr/24);
  return`${diffDay} ${tr.dayAgo}`;
};

// ═══════════════════════════════════════════════════════════
// Activity Item (Memoized)
// ═══════════════════════════════════════════════════════════
const ActivityItem=React.memo(({activity,tr}:{activity:any;tr:Record<string,string>})=>{
  const Icon=getActivityIcon(activity.type);
  const color=getActivityColor(activity.type);
  const timeAgo=useMemo(()=>formatTimeAgo(activity.created_at,tr),[activity.created_at,tr]);

  return(
    <div className="flex items-start gap-3 group hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${color} animate-pulse`}/>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">{activity.description||activity.title||'Activity'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{timeAgo}</span>
          {activity.type&&(
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${color} text-white`}>
              {tr[activity.type]||activity.type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
ActivityItem.displayName='ActivityItem';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{profileId:string;lang?:string}

// ═══════════════════════════════════════════════════════════
// LiveActivity (Memoized • Realtime • 4 Lang)
// ═══════════════════════════════════════════════════════════
const LiveActivity=React.memo(({profileId,lang='en'}:Props)=>{
  const[activities,setActivities]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(false);
  const aliveRef=useRef(true);
  const channelRef=useRef<any>(null);

  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // Load activities
  const loadActivities=useCallback(async()=>{
    if(!aliveRef.current)return;
    startTransition(()=>{setLoading(true);setError(false)});
    
    try{
      const{data,error:e}=await supabase
        .from('live_activities')
        .select('*')
        .eq('profile_id',profileId)
        .order('created_at',{ascending:false})
        .limit(CONFIG.MAX_ITEMS);

      if(e)throw e;
      if(aliveRef.current)startTransition(()=>{setActivities(data||[]);setLoading(false)});
    }catch{
      if(aliveRef.current)startTransition(()=>{setError(true);setLoading(false)});
    }
  },[profileId]);

  // Realtime subscription
  useEffect(()=>{
    aliveRef.current=true;
    loadActivities();

    // Realtime
    const channel=supabase
      .channel(`la:${profileId}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'live_activities',filter:`profile_id=eq.${profileId}`},(payload:any)=>{
        if(aliveRef.current)startTransition(()=>setActivities(prev=>[payload.new,...prev].slice(0,CONFIG.MAX_ITEMS)));
      })
      .subscribe();

    channelRef.current=channel;

    // Periodic refresh
    const refreshInterval=setInterval(loadActivities,CONFIG.REFRESH_INTERVAL);

    return()=>{
      aliveRef.current=false;
      if(channelRef.current)supabase.removeChannel(channelRef.current);
      clearInterval(refreshInterval);
    };
  },[profileId,loadActivities]);

  // Retry
  const handleRetry=useCallback(()=>loadActivities(),[loadActivities]);

  // Loading
  if(loading)return(
    <div className="flex items-center justify-center py-6 gap-2">
      <Loader2 size={16} className="animate-spin text-gray-400"/>
      <p className="text-sm text-gray-400">{tr.loading}</p>
    </div>
  );

  // Error
  if(error)return(
    <div className="text-center py-4">
      <AlertCircle size={20} className="text-red-400 mx-auto mb-2"/>
      <p className="text-sm text-red-500 mb-2">{tr.error}</p>
      <button onClick={handleRetry} className="text-xs text-orange-600 hover:text-orange-700 underline">
        {tr.retry}
      </button>
    </div>
  );

  // Empty
  if(!activities.length)return(
    <div className="text-center py-4">
      <Activity size={24} className="text-gray-300 mx-auto mb-2"/>
      <p className="text-sm text-gray-400">{tr.noActivity}</p>
    </div>
  );

  // Render
  return(
    <div className="space-y-1" style={{contain:'layout style paint'}}>
      {activities.map((a,i)=>(
        <ActivityItem key={a.id||i} activity={a} tr={tr}/>
      ))}
    </div>
  );
});

LiveActivity.displayName='LiveActivity';

export default LiveActivity;