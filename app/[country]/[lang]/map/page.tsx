// app/[country]/[lang]/map/page.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useEffect,useCallback,useMemo,useRef,startTransition,lazy,Suspense} from 'react';
import {useParams,useSearchParams} from 'next/navigation';
import {supabase} from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import MapFilters from '@/components/map/MapFilters';
import {Loader2,AlertCircle,RefreshCw,MapPin,Users} from 'lucide-react';
import {getText,LangCode} from '@/lib/language';

// Lazy load map
const LaborMap=lazy(()=>import('@/components/map/LaborMap'));

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{map:'Live Map',online:'Online',loading:'Loading map...',error:'Failed to load workers',retry:'Retry',noWorkers:'No online workers',totalWorkers:'workers found',filterWorkers:'Filter workers'},
  bn:{map:'লাইভ ম্যাপ',online:'অনলাইন',loading:'ম্যাপ লোড হচ্ছে...',error:'শ্রমিক লোড ব্যর্থ',retry:'আবার চেষ্টা',noWorkers:'কোনো অনলাইন শ্রমিক নেই',totalWorkers:'জন শ্রমিক',filterWorkers:'শ্রমিক ফিল্টার'},
  ar:{map:'خريطة مباشرة',online:'متصل',loading:'جاري تحميل الخريطة...',error:'فشل تحميل العمال',retry:'إعادة',noWorkers:'لا يوجد عمال',totalWorkers:'عامل',filterWorkers:'تصفية'},
  hi:{map:'लाइव मैप',online:'ऑनलाइन',loading:'मैप लोड हो रहा...',error:'श्रमिक लोड विफल',retry:'पुनः प्रयास',noWorkers:'कोई ऑनलाइन श्रमिक नहीं',totalWorkers:'श्रमिक',filterWorkers:'फ़िल्टर'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={MAX_WORKERS:50,CACHE_TTL:30000,RETRY_MAX:2,REFRESH_INTERVAL:30000};

// ═══════════════════════════════════════════════════════════
// গ্লোবাল ক্যাশে
// ═══════════════════════════════════════════════════════════
const workerCache=new Map<string,{data:any[];timestamp:number}>();

export default function MapPage(){
  const params=useParams();
  const country=(params as any).country||'qa';
  const lang=(params as any).lang||'en';
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const searchParams=useSearchParams();
  const cat=searchParams.get('cat')||'all';
  const dist=searchParams.get('dist')||'all';
  
  const[workers,setWorkers]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(false);
  const aliveRef=useRef(true);
  const retryRef=useRef(0);
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null);

  // Load workers (cache-first)
  const loadWorkers=useCallback(async(isRetry=false)=>{
    if(!aliveRef.current)return;
    const cacheKey=`map:${country}`;

    if(!isRetry){
      const cached=workerCache.get(cacheKey);
      if(cached&&Date.now()-cached.timestamp<CONFIG.CACHE_TTL){startTransition(()=>{setWorkers(cached.data);setLoading(false)});return}
    }

    if(!isRetry)startTransition(()=>setLoading(true));
    try{
      const{data,error:e}=await supabase.from('profiles').select('*').eq('is_online',true).limit(CONFIG.MAX_WORKERS);
      if(e)throw e;
      if(!aliveRef.current)return;
      const result=data||[];
      workerCache.set(cacheKey,{data:result,timestamp:Date.now()});
      startTransition(()=>{setWorkers(result);setLoading(false);setError(false)});
      retryRef.current=0;
    }catch{
      if(retryRef.current<CONFIG.RETRY_MAX){retryRef.current++;loadWorkers(true);return}
      if(aliveRef.current)startTransition(()=>{setError(true);setLoading(false)});
    }
  },[country]);

  // Load + auto refresh
  useEffect(()=>{
    aliveRef.current=true;loadWorkers();
    intervalRef.current=setInterval(loadWorkers,CONFIG.REFRESH_INTERVAL);
    return()=>{aliveRef.current=false;if(intervalRef.current)clearInterval(intervalRef.current)};
  },[loadWorkers]);

  // Retry handler
  const handleRetry=useCallback(()=>{retryRef.current=0;loadWorkers(true)},[loadWorkers]);

  // Filtered workers
  const filteredWorkers=useMemo(()=>{
    let result=workers;
    if(cat!=='all')result=result.filter(w=>w.category===cat);
    return result;
  },[workers,cat]);

  return(
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang}/>
      <div className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin size={18} className="text-orange-500"/>{tr.map}
          </h2>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Users size={14}/>{filteredWorkers.length} {tr.online}
          </span>
        </div>

        {/* Filters */}
        <MapFilters country={country} lang={lang} category={cat} distance={dist}/>

        {/* Loading */}
        {loading&&(
          <div className="w-full h-[500px] lg:h-[600px] rounded-xl border bg-gray-100 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-orange-500"/>
            <p className="text-sm text-gray-500">{tr.loading}</p>
          </div>
        )}

        {/* Error */}
        {error&&!loading&&(
          <div className="w-full h-[500px] lg:h-[600px] rounded-xl border bg-gray-100 flex flex-col items-center justify-center gap-3">
            <AlertCircle size={32} className="text-red-400"/>
            <p className="text-sm text-red-500">{tr.error}</p>
            <button onClick={handleRetry} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center gap-2"><RefreshCw size={14}/>{tr.retry}</button>
          </div>
        )}

        {/* Map */}
        {!loading&&!error&&(
          <Suspense fallback={<div className="w-full h-[500px] lg:h-[600px] rounded-xl border bg-gray-100 animate-pulse"/>}>
            <LaborMap country={country} labors={filteredWorkers} lang={lang}/>
          </Suspense>
        )}

        {/* No Workers */}
        {!loading&&!error&&filteredWorkers.length===0&&(
          <div className="text-center py-12">
            <MapPin size={40} className="text-gray-200 mx-auto mb-2"/>
            <p className="text-gray-500">{tr.noWorkers}</p>
          </div>
        )}
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}