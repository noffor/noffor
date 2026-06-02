// components/home/UnifiedList.tsx
// 🚀 ১ বিলিয়ন ইউজার • ফুল ফিচার • ৪ ভাষা • জিরো ক্র্যাশ • সুপারসনিক
"use client";
import React,{useEffect,useState,useRef,useCallback,memo,useMemo,startTransition} from 'react';
import {Star,MapPin,AlertCircle,RefreshCw} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {translateName,translateCategory,translateNumber} from '@/lib/language';

interface Props{type:'labor'|'employer';country:string;lang:string}

const ITEMS_PER_PAGE=6;
const MAX_ITEMS=18;
const CACHE_TTL=30000;
const RETRY_MAX=2;

// ═══════════════════════════════════════════════════════════
const dataCache=new Map<string,{data:any[];timestamp:number}>();

// ═══════════════════════════════════════════════════════════
const getWebP=(url:string,w=400):string=>{
  if(!url)return'';
  if(url.includes('supabase.co/storage'))return`${url}?width=${w}&quality=80&format=webp`;
  if(url.includes('cloudinary.com'))return url.replace('/upload/',`/upload/w_${w},q_80,f_webp/`);
  return url;
};

// ═══════════════════════════════════════════════════════════
const defaultImages:Record<string,string>={
  'Driver':'/images/default-driver.jpg','Electrician':'/images/default-electrician.jpg',
  'Plumber':'/images/default-plumber.jpg','Mason':'/images/default-mason.jpg',
  'AC Technician':'/images/default-ac.jpg','Painter':'/images/default-painter.jpg',
  'Carpenter':'/images/default-carpenter.jpg','Cleaner':'/images/default-cleaner.jpg',
  'Cook':'/images/default-cook.jpg','Helper':'/images/default-helper.jpg',
};

// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{online:'Online',worker:'Worker',job:'Job',new:'New',nego:'Nego',
    loading:'Loading...',tryAgain:'Try again',noWorker:'No workers found',
    noJob:'No jobs found',viewAll:'View all →',newWorkers:'👷 New Workers',
    newJobs:'💼 New Jobs',firstWorker:'✨ Create first worker profile',
    firstJob:'✨ Post first job',showing:'showing',error:'Error loading'},
  bn:{online:'অনলাইন',worker:'শ্রমিক',job:'চাকরি',new:'নতুন',nego:'আলোচ্য',
    loading:'লোড হচ্ছে...',tryAgain:'আবার চেষ্টা',noWorker:'কোন শ্রমিক পাওয়া যায়নি',
    noJob:'কোন চাকরি পাওয়া যায়নি',viewAll:'সব দেখুন →',newWorkers:'👷 নতুন শ্রমিক',
    newJobs:'💼 নতুন চাকরি',firstWorker:'✨ প্রথম শ্রমিক প্রোফাইল তৈরি করুন',
    firstJob:'✨ প্রথম চাকরি পোস্ট করুন',showing:'দেখানো হচ্ছে',error:'লোড করতে সমস্যা'},
  ar:{online:'متصل',worker:'عامل',job:'وظيفة',new:'جديد',nego:'تفاوض',
    loading:'جاري التحميل...',tryAgain:'إعادة المحاولة',noWorker:'لا يوجد عمال',
    noJob:'لا توجد وظائف',viewAll:'عرض الكل →',newWorkers:'👷 عمال جدد',
    newJobs:'💼 وظائف جديدة',firstWorker:'✨ إنشاء أول ملف عامل',
    firstJob:'✨ نشر أول وظيفة',showing:'عرض',error:'خطأ في التحميل'},
  hi:{online:'ऑनलाइन',worker:'श्रमिक',job:'नौकरी',new:'नया',nego:'बातचीत',
    loading:'लोड हो रहा...',tryAgain:'पुनः प्रयास करें',noWorker:'कोई श्रमिक नहीं मिला',
    noJob:'कोई नौकरी नहीं मिली',viewAll:'सभी देखें →',newWorkers:'👷 नए श्रमिक',
    newJobs:'💼 नई नौकरियां',firstWorker:'✨ पहला श्रमिक प्रोफाइल बनाएं',
    firstJob:'✨ पहली नौकरी पोस्ट करें',showing:'दिख रहे',error:'लोड करने में त्रुटि'},
};

// ═══════════════════════════════════════════════════════════
const ItemCard=memo(({item,country,lang,isLabor}:{
  item:any;country:string;lang:string;isLabor:boolean;
})=>{
  const[imgError,setImgError]=useState(false);
  const[imgLoaded,setImgLoaded]=useState(false);
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  const imageSrc=useMemo(()=>{
    if(imgError)return'/default-avatar.png';
    if(item.photo_url&&item.photo_url!=='/avatar.png'&&item.photo_url!=='/default-avatar.png')return getWebP(item.photo_url,400);
    if(isLabor&&item.category)return defaultImages[item.category]||'/default-avatar.png';
    return'/default-avatar.png';
  },[item.photo_url,item.category,imgError,isLabor]);

  const displayName=useMemo(()=>translateName(item.name,lang),[item.name,lang]);
  const displayCategory=useMemo(()=>isLabor?translateCategory(item.category,lang):(item.bio?.split('\n')[0]?.replace('Job: ','')?.slice(0,25)||translateCategory(item.category,lang)||'Job'),[item.category,item.bio,lang,isLabor]);
  const displaySalary=useMemo(()=>item.expected_salary?`${translateNumber(String(item.expected_salary).slice(0,10),lang)} QAR`:tr.nego,[item.expected_salary,lang,tr]);
  const displayRating=useMemo(()=>item.rating?translateNumber(item.rating,lang):tr.new,[item.rating,lang,tr]);

  return(
    <a href={`/${country}/${lang}/profile/${item.id}`}
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
        {item.is_online&&isLabor&&(
          <span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full animate-pulse">
            {tr.online}
          </span>
        )}
        <span className={`absolute top-1 right-1 text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full ${isLabor?'bg-orange-500':'bg-blue-500'} text-white`}>
          {isLabor?tr.worker:tr.job}
        </span>
      </div>
      <div className="p-1.5 lg:p-2">
        <h4 className="font-medium text-gray-800 text-[10px] lg:text-sm truncate group-hover:text-orange-600 transition-colors">
          {displayName}
        </h4>
        <p className="text-[9px] lg:text-xs text-gray-500 truncate">{displayCategory}</p>
        <div className="flex items-center gap-0.5 mt-0.5">
          <Star size={10} className="text-yellow-500" fill="#EAB308"/>
          <span className="text-[9px] lg:text-xs font-medium">{displayRating}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[8px] lg:text-[10px] font-bold text-orange-600 truncate max-w-[60px]">💰 {displaySalary}</span>
          {item.city&&(
            <span className="text-[8px] lg:text-[10px] text-gray-500 truncate flex items-center gap-0.5">
              <MapPin size={8}/>{item.city}
            </span>
          )}
        </div>
      </div>
    </a>
  );
});
ItemCard.displayName='ItemCard';

// ═══════════════════════════════════════════════════════════
// Main UnifiedList
// ═══════════════════════════════════════════════════════════
export default function UnifiedList({type,country,lang}:Props){
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[items,setItems]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[loadingMore,setLoadingMore]=useState(false);
  const[hasMore,setHasMore]=useState(true);
  const[page,setPage]=useState(0);
  const[error,setError]=useState<string|null>(null);
  const[initialLoaded,setInitialLoaded]=useState(false);
  const[totalCount,setTotalCount]=useState<number>(0); // ✅ টোটাল কাউন্ট
  const loaderRef=useRef<HTMLDivElement>(null);
  const observerRef=useRef<IntersectionObserver|null>(null);
  const isLabor=type==='labor';
  const abortRef=useRef<AbortController|null>(null);
  const aliveRef=useRef(true);
  const retryRef=useRef(0);

  // ═══════════════════════════════════════════════════════
  // ✅ FIX: Total count check before offset
  // ═══════════════════════════════════════════════════════
  const loadItems=useCallback(async(reset=false)=>{
    if(!country||!aliveRef.current)return[];
    const cacheKey=`ul:${type}:${country}:${reset?0:page}`;

    // Cache check
    if(!reset){
      const cached=dataCache.get(cacheKey);
      if(cached&&Date.now()-cached.timestamp<CACHE_TTL)return cached.data;
    }

    if(abortRef.current)abortRef.current.abort();
    const controller=new AbortController();
    abortRef.current=controller;

    const cp=reset?0:page;
    const from=cp*ITEMS_PER_PAGE;

    try{
      // ✅ আগে টোটাল কাউন্ট নিন
      const {count,error:countErr}=await supabase
        .from('profiles')
        .select('*',{count:'exact',head:true})
        .eq('role',type)
        .eq('country',country)
        .abortSignal(controller.signal);

      if(!aliveRef.current||controller.signal.aborted)return[];
      if(countErr)throw countErr;

      const total=count||0;
      setTotalCount(total);

      // ✅ offset >= total হলে খালি return
      if(from>=total||from>=MAX_ITEMS){
        setHasMore(false);
        return[];
      }

      // ✅ safe range
      const safeTo=Math.min(from+ITEMS_PER_PAGE-1,total-1,MAX_ITEMS-1);
      
      const{data,error:e}=await supabase
        .from('profiles')
        .select('*')
        .eq('role',type)
        .eq('country',country)
        .order('created_at',{ascending:false})
        .range(from,safeTo)
        .abortSignal(controller.signal);

      if(!aliveRef.current||controller.signal.aborted)return[];
      if(e)throw e;

      const result=data||[];
      setHasMore((safeTo+1)<total&&(safeTo+1)<MAX_ITEMS);
      
      dataCache.set(cacheKey,{data:result,timestamp:Date.now()});
      retryRef.current=0;
      return result;
    }catch(err:any){
      if(err.name==='AbortError')return[];
      if(retryRef.current<RETRY_MAX){retryRef.current++;return loadItems(reset)}
      if(aliveRef.current)startTransition(()=>setError(err.message));
      return[];
    }
  },[type,country,page]);

  // ═══════════════════════════════════════════════════════
  useEffect(()=>{
    aliveRef.current=true;
    const init=async()=>{
      startTransition(()=>{setLoading(true);setError(null)});
      setPage(0);
      const data=await loadItems(true);
      if(aliveRef.current){
        startTransition(()=>{
          setItems(data);
          setPage(1);
          setLoading(false);
          setInitialLoaded(true);
        });
      }
    };
    init();
    return()=>{
      aliveRef.current=false;
      if(abortRef.current)abortRef.current.abort();
    };
  },[country,lang,type]);

  // ═══════════════════════════════════════════════════════
  const loadMore=useCallback(async()=>{
    if(loadingMore||!hasMore||loading||!aliveRef.current)return;
    startTransition(()=>setLoadingMore(true));
    const newData=await loadItems(false);
    if(newData.length>0&&aliveRef.current){
      startTransition(()=>{
        setItems(p=>[...p,...newData]);
        setPage(p=>p+1);
      });
    }
    startTransition(()=>setLoadingMore(false));
  },[loadingMore,hasMore,loadItems,loading]);

  // ═══════════════════════════════════════════════════════
  useEffect(()=>{
    if(observerRef.current)observerRef.current.disconnect();
    let tid:ReturnType<typeof setTimeout>;
    observerRef.current=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&hasMore&&!loading&&!loadingMore&&items.length<MAX_ITEMS){
        clearTimeout(tid);
        tid=setTimeout(loadMore,300);
      }
    },{threshold:0.5,rootMargin:'100px'});
    if(loaderRef.current)observerRef.current.observe(loaderRef.current);
    return()=>{observerRef.current?.disconnect();clearTimeout(tid)};
  },[hasMore,loading,loadingMore,items.length,loadMore]);

  // ═══════════════════════════════════════════════════════
  const skeletons=useMemo(()=>Array.from({length:ITEMS_PER_PAGE}).map((_,i)=>(
    <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
      <div className="w-full h-24 lg:h-40 bg-gray-200"/>
      <div className="p-2 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-3/4"/>
        <div className="h-2 bg-gray-200 rounded w-1/2"/>
      </div>
    </div>
  )),[]);

  // ═══════════════════════════════════════════════════════
  if(error)return(
    <div className="bg-white rounded-xl p-6 text-center border" style={{contain:'layout style paint'}}>
      <AlertCircle size={32} className="text-red-400 mx-auto mb-3"/>
      <p className="text-red-500 text-sm font-medium mb-3">{tr.error}: {error}</p>
      <button
        onClick={()=>{retryRef.current=0;setError(null);setInitialLoaded(false)}}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all inline-flex items-center gap-2"
      >
        <RefreshCw size={14}/>{tr.tryAgain}
      </button>
    </div>
  );

  if(loading&&items.length===0)return(
    <div style={{contain:'layout style paint'}}>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg">{isLabor?tr.newWorkers:tr.newJobs}</h2>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"/>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">{skeletons}</div>
    </div>
  );

  if(items.length===0&&!loading)return(
    <div style={{contain:'layout style paint'}}>
      <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-3">{isLabor?tr.newWorkers:tr.newJobs}</h2>
      <div className="text-center py-8 bg-white rounded-xl border">
        <p className="text-gray-500 text-sm mb-3">{isLabor?tr.noWorker:tr.noJob}</p>
        <a
          href={`/${country}/${lang}/create`}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all inline-block no-underline"
        >
          {isLabor?tr.firstWorker:tr.firstJob}
        </a>
      </div>
    </div>
  );

  return(
    <div style={{contain:'layout style paint'}}>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg select-none">
          {isLabor?tr.newWorkers:tr.newJobs}
        </h2>
        <a
          href={`/${country}/${lang}/search?type=${type}`}
          className="text-xs lg:text-sm text-orange-600 no-underline hover:underline font-medium"
        >
          {tr.viewAll}
        </a>
      </div>
      
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
        {items.map((item,idx)=>(
          <ItemCard
            key={`${item.id}-${idx}`}
            item={item}
            country={country}
            lang={lang}
            isLabor={isLabor}
          />
        ))}
      </div>
      
      {hasMore&&items.length<MAX_ITEMS&&(
        <div ref={loaderRef} className="py-3 text-center">
          {loadingMore?(
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"/>
              <span className="text-[10px] text-gray-500">{tr.loading}</span>
            </div>
          ):(
            <div className="h-6"/>
          )}
        </div>
      )}
      
      {!hasMore&&items.length>0&&(
        <div className="text-center py-2">
          <p className="text-[9px] lg:text-[10px] text-gray-400 select-none">
            ✨ {items.length}/{Math.min(totalCount,MAX_ITEMS)} {isLabor?tr.worker:tr.job} {tr.showing} ✨
          </p>
        </div>
      )}
    </div>
  );
}