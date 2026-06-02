// components/home/FeaturedList.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফুল ফিচার
"use client";
import React,{useEffect,useState,useRef,useCallback,memo,useMemo,startTransition} from 'react';
import {Star,Briefcase,MapPin,AlertCircle,RefreshCw} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {getText,LangCode,translateName,translateCategory,translateNumber} from '@/lib/language';

const ITEMS_PER_PAGE=5;
const CACHE_TTL=30000;
const RETRY_MAX=2;

// গ্লোবাল ক্যাশে
const dataCache=new Map<string,{data:any[];timestamp:number}>();

// WebP ইমেজ
const getWebP=(url:string,w=400):string=>{
  if(!url)return'';
  if(url.includes('supabase.co/storage'))return`${url}?width=${w}&quality=80&format=webp`;
  if(url.includes('cloudinary.com'))return url.replace('/upload/',`/upload/w_${w},q_80,f_webp/`);
  return url;
};

// ৪ ভাষা
const T:Record<string,Record<string,string>>={
  en:{online:'Online',worker:'Worker',job:'Job',new:'New',nego:'Nego',
    loading:'Loading...',tryAgain:'Try again',noResults:'No results found',
    viewAll:'View all →',featured:'👷 Featured Workers',latestJobs:'💼 Latest Jobs',
    createProfile:'Create Profile',postJob:'Post a Job',error:'Error loading'},
  bn:{online:'অনলাইন',worker:'শ্রমিক',job:'চাকরি',new:'নতুন',nego:'আলোচ্য',
    loading:'লোড হচ্ছে...',tryAgain:'আবার চেষ্টা',noResults:'কোনো ফলাফল নেই',
    viewAll:'সব দেখুন →',featured:'👷 ফিচার্ড কর্মী',latestJobs:'💼 সর্বশেষ চাকরি',
    createProfile:'প্রোফাইল তৈরি',postJob:'জব পোস্ট',error:'লোড করতে সমস্যা'},
  ar:{online:'متصل',worker:'عامل',job:'وظيفة',new:'جديد',nego:'تفاوض',
    loading:'جاري...',tryAgain:'إعادة',noResults:'لا توجد نتائج',
    viewAll:'عرض الكل →',featured:'👷 عمال مميزون',latestJobs:'💼 أحدث الوظائف',
    createProfile:'إنشاء ملف',postJob:'نشر وظيفة',error:'خطأ في التحميل'},
  hi:{online:'ऑनलाइन',worker:'श्रमिक',job:'नौकरी',new:'नया',nego:'बातचीत',
    loading:'लोड...',tryAgain:'पुनः प्रयास',noResults:'कोई परिणाम नहीं',
    viewAll:'सभी देखें →',featured:'👷 फीचर्ड श्रमिक',latestJobs:'💼 नवीनतम नौकरियां',
    createProfile:'प्रोफाइल बनाएं',postJob:'जॉब पोस्ट',error:'लोड त्रुटि'},
};

// ItemCard (Memoized)
const ItemCard=memo(({item,lang,rest,isJob}:{item:any;lang:string;rest:string;isJob:boolean})=>{
  const[imgError,setImgError]=useState(false);
  const[imgLoaded,setImgLoaded]=useState(false);
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  const imageSrc=useMemo(()=>{
    if(imgError)return'/default-avatar.png';
    if(item.photo_url&&item.photo_url!=='/avatar.png'&&item.photo_url!=='/default-avatar.png')return getWebP(item.photo_url,400);
    return'/default-avatar.png';
  },[item.photo_url,imgError]);

  const displayName=useMemo(()=>translateName(item.name,lang)||(isJob?'Company':tr.worker),[item.name,lang,isJob,tr]);
  const displayCategory=useMemo(()=>isJob?(item.bio?.split('\n')[0]?.replace('Job: ','')?.slice(0,25)||translateCategory(item.category,lang)):translateCategory(item.category,lang),[item.bio,item.category,lang,isJob]);
  const displaySalary=useMemo(()=>item.expected_salary?`${translateNumber(String(item.expected_salary).slice(0,10),lang)} QAR`:tr.nego,[item.expected_salary,lang,tr]);
  const displayRating=useMemo(()=>item.rating?translateNumber(item.rating,lang):tr.new,[item.rating,lang,tr]);

  return(
    <a href={`${rest}/profile/${item.id}`}
      className="bg-white rounded-xl border overflow-hidden no-underline hover:shadow-lg transition-all active:scale-[0.98] group will-change-transform"
      style={{transform:'translateZ(0)',backfaceVisibility:'hidden'}}>
      <div className="relative">
        <div className="w-full h-24 lg:h-40 bg-gray-200 relative overflow-hidden">
          {!imgLoaded&&!imgError&&<div className="absolute inset-0 bg-gray-200 animate-pulse"/>}
          <img src={imageSrc} alt={displayName}
            className={`w-full h-24 lg:h-40 object-cover transition-opacity duration-300 ${imgLoaded?'opacity-100':'opacity-0'}`}
            loading="lazy" decoding="async"
            onLoad={()=>startTransition(()=>setImgLoaded(true))}
            onError={()=>startTransition(()=>setImgError(true))}/>
        </div>
        {isJob?(
          <span className="absolute top-1 left-1 bg-blue-500 text-white text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full">{tr.job}</span>
        ):(
          item.is_online&&<span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full animate-pulse">{tr.online}</span>
        )}
      </div>
      <div className="p-1.5 lg:p-2">
        <h4 className="font-medium text-gray-800 text-[10px] lg:text-sm truncate group-hover:text-orange-600 transition-colors">{displayName}</h4>
        <p className="text-[9px] lg:text-xs text-gray-500 truncate">{displayCategory}</p>
        {!isJob&&(
          <div className="flex items-center gap-0.5 mt-0.5">
            <Star size={10} className="text-yellow-500" fill="#EAB308"/>
            <span className="text-[9px] lg:text-xs font-medium">{displayRating}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[8px] lg:text-[10px] font-bold text-orange-600 truncate max-w-[60px]">💰 {displaySalary}</span>
          {item.city&&<span className="text-[8px] lg:text-[10px] text-gray-500 truncate flex items-center gap-0.5"><MapPin size={8}/>{item.city}</span>}
        </div>
      </div>
    </a>
  );
});
ItemCard.displayName='ItemCard';

// Main FeaturedList
export default function FeaturedList({country,lang,type='labor'}:{country:string;lang:string;type?:string}){
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);
  const isJob=type==='employer';
  const title=isJob?tr.latestJobs:tr.featured;

  const[profiles,setProfiles]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[loadingMore,setLoadingMore]=useState(false);
  const[page,setPage]=useState(0);
  const[hasMore,setHasMore]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const loaderRef=useRef<HTMLDivElement>(null);
  const observerRef=useRef<IntersectionObserver|null>(null);
  const abortRef=useRef<AbortController|null>(null);
  const aliveRef=useRef(true);
  const retryRef=useRef(0);

  // Cache-first loader
  const loadProfiles=useCallback(async(pageNum:number,append:boolean)=>{
    if(!country||!aliveRef.current)return[];
    const cacheKey=`fl:${type}:${country}:${lang}:${pageNum}`;

    if(!append){
      const cached=dataCache.get(cacheKey);
      if(cached&&Date.now()-cached.timestamp<CACHE_TTL)return cached.data;
    }

    if(abortRef.current)abortRef.current.abort();
    const controller=new AbortController();
    abortRef.current=controller;

    const from=pageNum*ITEMS_PER_PAGE;
    const to=from+ITEMS_PER_PAGE-1;

    try{
      const{data,count,error:e}=await supabase
        .from('profiles')
        .select('*',{count:'exact'})
        .eq('role',type)
        .eq('country',country)
        .order('created_at',{ascending:false})
        .range(from,to)
        .abortSignal(controller.signal);

      if(!aliveRef.current||controller.signal.aborted)return[];
      if(e)throw e;

      const total=count||0;
      setHasMore(from+ITEMS_PER_PAGE<total);
      
      const result=data||[];
      if(!append)dataCache.set(cacheKey,{data:result,timestamp:Date.now()});
      retryRef.current=0;
      return result;
    }catch(err:any){
      if(err.name==='AbortError')return[];
      if(retryRef.current<RETRY_MAX){retryRef.current++;return loadProfiles(pageNum,append)}
      if(aliveRef.current)startTransition(()=>setError(err.message));
      return[];
    }
  },[country,lang,type]);

  // Initial Load
  useEffect(()=>{
    aliveRef.current=true;
    const init=async()=>{
      startTransition(()=>{setLoading(true);setError(null)});
      const data=await loadProfiles(0,false);
      if(aliveRef.current)startTransition(()=>{setProfiles(data);setPage(0);setLoading(false)});
    };
    init();
    return()=>{aliveRef.current=false;if(abortRef.current)abortRef.current.abort()};
  },[loadProfiles]);

  // Realtime
  useEffect(()=>{
    const channel=supabase
      .channel(`fl:${type}:${country}:${Date.now()}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'profiles',filter:`country=eq.${country}`},async(payload:any)=>{
        if(payload.new.role===type&&aliveRef.current){
          startTransition(()=>setProfiles(prev=>[payload.new,...prev]));
        }
      })
      .subscribe();

    return()=>{supabase.removeChannel(channel)};
  },[country,type]);

  // Infinite Scroll
  useEffect(()=>{
    if(observerRef.current)observerRef.current.disconnect();
    let tid:ReturnType<typeof setTimeout>;
    observerRef.current=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&hasMore&&!loadingMore&&!loading){
        clearTimeout(tid);
        tid=setTimeout(()=>{
          startTransition(()=>setLoadingMore(true));
          const nextPage=page+1;
          loadProfiles(nextPage,true).then(newData=>{
            if(aliveRef.current)startTransition(()=>{setProfiles(p=>[...p,...newData]);setPage(nextPage);setLoadingMore(false)});
          });
        },300);
      }
    },{threshold:0.1,rootMargin:'200px'});
    if(loaderRef.current)observerRef.current.observe(loaderRef.current);
    return()=>{observerRef.current?.disconnect();clearTimeout(tid)};
  },[hasMore,loadingMore,loading,page,loadProfiles]);

  // Skeletons
  const skeletons=useMemo(()=>Array.from({length:5}).map((_,i)=>(
    <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
      <div className="w-full h-24 lg:h-40 bg-gray-200"/>
      <div className="p-2 space-y-1.5"><div className="h-4 bg-gray-200 rounded w-3/4"/><div className="h-3 bg-gray-200 rounded w-1/2"/></div>
    </div>
  )),[]);

  // Error
  if(error)return(
    <div className="bg-white rounded-xl p-6 text-center border">
      <AlertCircle size={32} className="text-red-400 mx-auto mb-3"/>
      <p className="text-red-500 text-sm mb-3">{tr.error}</p>
      <button onClick={()=>{retryRef.current=0;setError(null);setLoading(true);loadProfiles(0,false).then(d=>{setProfiles(d);setLoading(false)})}} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all inline-flex items-center gap-2">
        <RefreshCw size={14}/>{tr.tryAgain}
      </button>
    </div>
  );

  // Loading
  if(loading)return(
    <div>
      <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-2 px-1">{title}</h2>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">{skeletons}</div>
    </div>
  );

  // Empty
  if(!profiles.length)return(
    <div>
      <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-2 px-1">{title}</h2>
      <div className="text-center py-8 bg-white rounded-xl border">
        <p className="text-gray-500 text-sm mb-3">{tr.noResults}</p>
        <a href={`${rest}/create`} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all inline-block no-underline">{isJob?tr.postJob:tr.createProfile}</a>
      </div>
    </div>
  );

  // Render
  return(
    <div style={{contain:'layout style paint'}}>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg select-none">{title}</h2>
        <a href={`${rest}/search?type=${type}`} className="text-xs lg:text-sm text-orange-600 no-underline hover:underline font-medium">{tr.viewAll}</a>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
        {profiles.map(item=>(
          <ItemCard key={item.id} item={item} lang={lang} rest={rest} isJob={isJob}/>
        ))}
      </div>
      {hasMore&&(
        <div ref={loaderRef} className="py-4 text-center">
          {loadingMore&&(
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"/>
              <span className="text-xs text-gray-500">{tr.loading}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}