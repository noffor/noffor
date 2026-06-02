// components/profile/OnlineToggle.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {getText,LangCode} from '@/lib/language';
import {Wifi,WifiOff,Loader2,AlertCircle} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{online:'Online',offline:'Offline',goOnline:'Go Online',goOffline:'Go Offline',error:'Failed to update',retry:'Retry',updating:'Updating...'},
  bn:{online:'অনলাইন',offline:'অফলাইন',goOnline:'অনলাইন হোন',goOffline:'অফলাইন হোন',error:'আপডেট ব্যর্থ',retry:'আবার চেষ্টা',updating:'আপডেট হচ্ছে...'},
  ar:{online:'متصل',offline:'غير متصل',goOnline:'اتصل',goOffline:'غير متصل',error:'فشل التحديث',retry:'إعادة',updating:'جاري التحديث...'},
  hi:{online:'ऑनलाइन',offline:'ऑफलाइन',goOnline:'ऑनलाइन हों',goOffline:'ऑफलाइन हों',error:'अपडेट विफल',retry:'पुनः प्रयास',updating:'अपडेट हो रहा...'},
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{
  profileId:string;
  initial:boolean;
  lang?:string;
  onToggle?:(online:boolean)=>void;
}

// ═══════════════════════════════════════════════════════════
// OnlineToggle (Memoized • Optimistic • 1B Ready)
// ═══════════════════════════════════════════════════════════
const OnlineToggle=React.memo(({profileId,initial,lang='en',onToggle}:Props)=>{
  const[online,setOnline]=useState(initial);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState(false);
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  const toggle=useCallback(async()=>{
    if(loading)return;
    
    const next=!online;
    
    // Optimistic update
    startTransition(()=>{setOnline(next);setError(false);setLoading(true)});
    
    try{
      const{error:e}=await supabase
        .from('profiles')
        .update({is_online:next,last_online:new Date().toISOString()})
        .eq('id',profileId);

      if(e)throw e;
      
      // Update localStorage if own profile
      try{
        const stored=localStorage.getItem('noffor_worker_online');
        if(stored!==null)localStorage.setItem('noffor_worker_online',JSON.stringify(next));
      }catch{}
      
      onToggle?.(next);
      startTransition(()=>setLoading(false));
    }catch{
      // Revert on error
      startTransition(()=>{setOnline(!next);setError(true);setLoading(false)});
    }
  },[online,loading,profileId,onToggle]);

  const handleRetry=useCallback(()=>{
    setError(false);
    toggle();
  },[toggle]);

  // Error state
  if(error)return(
    <button onClick={handleRetry} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors active:scale-95">
      <AlertCircle size={14}/>
      <span>{tr.retry}</span>
    </button>
  );

  return(
    <button 
      onClick={toggle} 
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
        online
          ?'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
          :'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
      } ${loading?'opacity-70 cursor-wait':''}`}
      style={{transform:'translateZ(0)'}}
      title={online?tr.goOffline:tr.goOnline}
    >
      {loading?(
        <Loader2 size={14} className="animate-spin"/>
      ):(
        <>
          <span className={`w-2.5 h-2.5 rounded-full ${online?'bg-green-500 animate-pulse':'bg-red-500'}`}/>
          {online?<Wifi size={14}/>:<WifiOff size={14}/>}
        </>
      )}
      <span>{loading?tr.updating:online?tr.online:tr.offline}</span>
    </button>
  );
});

OnlineToggle.displayName='OnlineToggle';

export default OnlineToggle;