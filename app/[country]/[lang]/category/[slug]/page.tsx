// app/[country]/[lang]/category/[slug]/page.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useEffect,useState,useRef,useCallback,useMemo,startTransition} from 'react';
import {useParams,useSearchParams} from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import CategoryBanner from '@/components/category/CategoryBanner';
import CategoryFilters from '@/components/category/CategoryFilters';
import ProfileCard from '@/components/category/ProfileCard';
import {supabase} from '@/lib/supabase';
import {Loader2,AlertCircle,RefreshCw,Package} from 'lucide-react';
import {translateCategory} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{workersFound:'workers found',loading:'Loading...',allLoaded:'All workers loaded',error:'Failed to load',retry:'Retry',noWorkers:'No workers in this category'},
  bn:{workersFound:'জন শ্রমিক',loading:'লোড হচ্ছে...',allLoaded:'সব শ্রমিক লোড হয়েছে',error:'লোড ব্যর্থ',retry:'আবার চেষ্টা',noWorkers:'এই ক্যাটাগরিতে কোনো শ্রমিক নেই'},
  ar:{workersFound:'عامل',loading:'جاري...',allLoaded:'تم تحميل الكل',error:'فشل التحميل',retry:'إعادة',noWorkers:'لا يوجد عمال'},
  hi:{workersFound:'श्रमिक',loading:'लोड...',allLoaded:'सभी लोड हो गए',error:'लोड विफल',retry:'पुनः प्रयास',noWorkers:'कोई श्रमिक नहीं'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={ITEMS_PER_PAGE:5,CACHE_TTL:30000,RETRY_MAX:2,REALTIME_DEBOUNCE:500};

// ═══════════════════════════════════════════════════════════
// গ্লোবাল ক্যাশে
// ═══════════════════════════════════════════════════════════
const dataCache=new Map<string,{data:any[];total:number;timestamp:number}>();

export default function CategoryPage(){
  const params=useParams();const searchParams=useSearchParams();
  const country=(params as any).country||'qa';const lang=(params as any).lang||'en';
  const slug=(params as any).slug||'driver';const filter=searchParams.get('filter')||'all';
  const tr=useMemo(()=>T[lang]||T.en,[lang]);const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);
  const categoryName=useMemo(()=>slug,[slug]);

  const[profiles,setProfiles]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);const[loadingMore,setLoadingMore]=useState(false);
  const[page,setPage]=useState(0);const[hasMore,setHasMore]=useState(true);
  const[totalCount,setTotalCount]=useState(0);const[error,setError]=useState(false);
  const loaderRef=useRef<HTMLDivElement>(null);const observerRef=useRef<IntersectionObserver|null>(null);
  const aliveRef=useRef(true);const retryRef=useRef(0);

  // Load profiles (cache-first)
  const loadProfiles=useCallback(async(pageNum:number,append:boolean)=>{
    if(!aliveRef.current)return[];
    const cacheKey=`cat:${country}:${categoryName}:${filter}:${pageNum}`;

    if(!append){const cached=dataCache.get(cacheKey);if(cached&&Date.now()-cached.timestamp<CONFIG.CACHE_TTL){setTotalCount(cached.total);setHasMore(pageNum*CONFIG.ITEMS_PER_PAGE+CONFIG.ITEMS_PER_PAGE<cached.total);return cached.data}}

    try{
      const from=pageNum*CONFIG.ITEMS_PER_PAGE;const to=from+CONFIG.ITEMS_PER_PAGE-1;
      let query=supabase.from('profiles').select('*',{count:'exact'}).eq('category',categoryName).eq('country',country).order('created_at',{ascending:false}).range(from,to);
      if(filter==='featured')query=query.eq('is_featured',true);
      if(filter==='online')query=query.eq('is_online',true);
      const{data,count,error:e}=await query;
      if(e)throw e;if(!aliveRef.current)return[];
      const result=data||[];const total=count||0;
      if(!append)dataCache.set(cacheKey,{data:result,total,timestamp:Date.now()});
      startTransition(()=>{setTotalCount(total);setHasMore(from+CONFIG.ITEMS_PER_PAGE<total)});
      retryRef.current=0;return result;
    }catch{
      if(retryRef.current<CONFIG.RETRY_MAX){retryRef.current++;return loadProfiles(pageNum,append)}
      if(aliveRef.current)startTransition(()=>setError(true));return[];
    }
  },[country,categoryName,filter]);

  // Initial load
  useEffect(()=>{
    aliveRef.current=true;startTransition(()=>setLoading(true));
    loadProfiles(0,false).then(data=>{if(aliveRef.current)startTransition(()=>{setProfiles(data);setPage(0);setLoading(false)})});
    return()=>{aliveRef.current=false};
  },[loadProfiles]);

  // Realtime
  useEffect(()=>{
    const channel=supabase.channel(`cat:${categoryName}:${Date.now()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'profiles',filter:`country=eq.${country}`},(payload:any)=>{
      if(payload.new.role==='labor'&&payload.new.category===categoryName&&aliveRef.current){startTransition(()=>{setProfiles(p=>[payload.new,...p]);setTotalCount(p=>p+1)})}
    }).subscribe();
    return()=>{supabase.removeChannel(channel)};
  },[country,categoryName]);

  // Infinite scroll
  useEffect(()=>{
    if(observerRef.current)observerRef.current.disconnect();
    let tid:ReturnType<typeof setTimeout>;
    observerRef.current=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&hasMore&&!loadingMore&&!loading){clearTimeout(tid);tid=setTimeout(()=>{startTransition(()=>setLoadingMore(true));const np=page+1;loadProfiles(np,true).then(d=>{if(aliveRef.current)startTransition(()=>{setProfiles(p=>[...p,...d]);setPage(np);setLoadingMore(false)})})},300)}
    },{threshold:0.1,rootMargin:'200px'});
    if(loaderRef.current)observerRef.current.observe(loaderRef.current);
    return()=>{observerRef.current?.disconnect();clearTimeout(tid)};
  },[hasMore,loadingMore,loading,page,loadProfiles]);

  // Skeletons
  const skeletons=useMemo(()=>Array.from({length:CONFIG.ITEMS_PER_PAGE}).map((_,i)=>(<div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse"><div className="w-full h-40 bg-gray-200"/><div className="p-2 space-y-1.5"><div className="h-4 bg-gray-200 rounded w-3/4"/><div className="h-3 bg-gray-200 rounded w-1/2"/></div></div>)),[]);

  return(
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang}/>
      <div className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        <CategoryBanner slug={categoryName} lang={lang} country={country}/>
        <CategoryFilters country={country} lang={lang} slug={slug} active={filter}/>

        {/* Count */}
        {!loading&&<p className="text-xs text-gray-500 mb-2">{totalCount} {tr.workersFound}</p>}

        {/* Error */}
        {error&&(
          <div className="text-center py-12">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-2"/><p className="text-sm text-red-500 mb-3">{tr.error}</p>
            <button onClick={()=>{retryRef.current=0;startTransition(()=>setLoading(true));loadProfiles(0,false).then(d=>{setProfiles(d);setLoading(false);setError(false)})}} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center gap-2 mx-auto"><RefreshCw size={14}/>{tr.retry}</button>
          </div>
        )}

        {/* Loading */}
        {loading&&<div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">{skeletons}</div>}

        {/* Empty */}
        {!loading&&!error&&profiles.length===0&&(
          <div className="text-center py-12"><Package size={40} className="text-gray-200 mx-auto mb-2"/><p className="text-gray-500">{tr.noWorkers}</p></div>
        )}

        {/* PC Grid */}
        {!loading&&!error&&profiles.length>0&&(
          <div className="hidden lg:grid grid-cols-5 gap-3">
            {profiles.map(p=><ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang}/>)}
          </div>
        )}

        {/* Mobile Grid */}
        {!loading&&!error&&profiles.length>0&&(
          <div className="grid grid-cols-2 gap-2 lg:hidden">
            {profiles.map(p=><ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang}/>)}
          </div>
        )}

        {/* Infinite Scroll */}
        {hasMore&&!error&&(
          <div ref={loaderRef} className="py-4 text-center">
            {loadingMore&&<div className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin text-orange-500"/><span className="text-xs text-gray-500">{tr.loading}</span></div>}
          </div>
        )}

        {!hasMore&&profiles.length>0&&!loading&&<p className="text-center text-xs text-gray-400 py-4">{tr.allLoaded}</p>}
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}