// components/home/CategoryBanner.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
// ✅ is_public filter added
"use client";
import React,{useEffect,useState,useCallback,useMemo,useRef,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {ChevronLeft,ChevronRight,Loader2,AlertCircle,ImageOff} from 'lucide-react';
import {translateCategory,translateName,translateNumber,getCurrencySymbol} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={BATCH_SIZE:20,CACHE_TTL:60000,AUTO_PLAY_MS:5000,RETRY_MAX:2};

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ
// ═══════════════════════════════════════════════════════════
const getWebP=(url:string,w=800):string=>{
  if(!url)return'/banners/default.jpg';
  if(url.includes('supabase.co/storage'))return`${url}?width=${w}&quality=85&format=webp`;
  return url;
};

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{noResults:'No workers found',createProfile:'Create Profile',online:'Online',loading:'Loading...',error:'Failed to load',retry:'Retry'},
  bn:{noResults:'কোনো শ্রমিক নেই',createProfile:'প্রোফাইল তৈরি',online:'অনলাইন',loading:'লোড হচ্ছে...',error:'লোড ব্যর্থ',retry:'আবার চেষ্টা'},
  ar:{noResults:'لا يوجد عمال',createProfile:'إنشاء ملف',online:'متصل',loading:'جاري...',error:'فشل التحميل',retry:'إعادة'},
  hi:{noResults:'कोई श्रमिक नहीं',createProfile:'प्रोफाइल बनाएं',online:'ऑनलाइन',loading:'लोड...',error:'लोड विफल',retry:'पुनः प्रयास'},
};

// ═══════════════════════════════════════════════════════════
// গ্লোবাল ক্যাশে
// ═══════════════════════════════════════════════════════════
const dataCache=new Map<string,{data:any[];timestamp:number}>();

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{slug:string;lang?:string;country?:string}

// ═══════════════════════════════════════════════════════════
// CategoryBanner (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const CategoryBanner=React.memo(({slug,lang='en',country='qa'}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const categoryName=useMemo(()=>translateCategory(slug,lang),[slug,lang]);
  const[banners,setBanners]=useState<any[]>([]);
  const[current,setCurrent]=useState(0);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(false);
  const[stats,setStats]=useState({total:0,online:0});
  const[imgError,setImgError]=useState<Record<number,boolean>>({});
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const aliveRef=useRef(true);
  const retryRef=useRef(0);

  // Load banners (cache-first)
  const loadBanners=useCallback(async(isRetry=false)=>{
    if(!aliveRef.current)return;
    const cacheKey=`cb:${country}:${slug}`;

    if(!isRetry){
      const cached=dataCache.get(cacheKey);
      if(cached&&Date.now()-cached.timestamp<CONFIG.CACHE_TTL){startTransition(()=>{setBanners(cached.data);setLoading(false)});return}
    }

    if(!isRetry)startTransition(()=>setLoading(true));
    try{
      // ✅ Banners query with is_public filter
      const{data,error:e}=await supabase
        .from('profiles')
        .select('*')
        .eq('role','labor')
        .eq('category',slug)
        .eq('country',country)
        .eq('is_public',true)  // ✅ ONLY PUBLIC
        .order('created_at',{ascending:false})
        .limit(CONFIG.BATCH_SIZE);
      
      if(e)throw e;
      if(!aliveRef.current)return;

      const result=data||[];
      dataCache.set(cacheKey,{data:result,timestamp:Date.now()});

      // ✅ Stats query with is_public filter
      const{count:total}=await supabase
        .from('profiles')
        .select('*',{count:'exact',head:true})
        .eq('role','labor')
        .eq('category',slug)
        .eq('country',country)
        .eq('is_public',true);  // ✅ ONLY PUBLIC

      const{count:online}=await supabase
        .from('profiles')
        .select('*',{count:'exact',head:true})
        .eq('role','labor')
        .eq('category',slug)
        .eq('country',country)
        .eq('is_online',true)
        .eq('is_public',true);  // ✅ ONLY PUBLIC

      startTransition(()=>{setBanners(result);setStats({total:total||0,online:online||0});setLoading(false);setError(false)});
      retryRef.current=0;
    }catch{
      if(retryRef.current<CONFIG.RETRY_MAX){retryRef.current++;loadBanners(true);return}
      if(aliveRef.current)startTransition(()=>{setError(true);setLoading(false)});
    }
  },[country,slug]);

  // Realtime
  useEffect(()=>{
    aliveRef.current=true;loadBanners();
    const channel=supabase
      .channel(`cb:${slug}:${Date.now()}`)
      .on('postgres_changes',{
        event:'INSERT',
        schema:'public',
        table:'profiles',
        filter:`country=eq.${country}`
      },(payload:any)=>{
        // ✅ Only add if public
        if(payload.new.role==='labor' && 
           payload.new.category===slug && 
           payload.new.is_public===true &&  // ✅ ONLY PUBLIC
           aliveRef.current){
          startTransition(()=>{
            setBanners(prev=>[payload.new,...prev].slice(0,CONFIG.BATCH_SIZE));
            setStats(prev=>({
              total:prev.total+1,
              online:payload.new.is_online?prev.online+1:prev.online
            }));
          });
        }
      }).subscribe();
    return()=>{aliveRef.current=false;supabase.removeChannel(channel)};
  },[country,slug,loadBanners]);

  // Auto play
  useEffect(()=>{
    if(banners.length<=1)return;
    intervalRef.current=setInterval(()=>startTransition(()=>setCurrent(p=>(p+1)%banners.length)),CONFIG.AUTO_PLAY_MS);
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current)};
  },[banners.length]);

  // Retry handler
  const handleRetry=useCallback(()=>{retryRef.current=0;loadBanners(true)},[loadBanners]);

  // Loading
  if(loading)return(
    <div className="relative w-full h-40 lg:h-56 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse mb-4 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-white/50"/>
    </div>
  );

  // Error
  if(error)return(
    <div className="relative w-full h-40 lg:h-56 rounded-xl overflow-hidden bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mb-4">
      <div className="text-center text-white">
        <AlertCircle size={32} className="mx-auto mb-2"/>
        <p className="text-sm">{tr.error}</p>
        <button onClick={handleRetry} className="mt-2 px-4 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition">{tr.retry}</button>
      </div>
    </div>
  );

  // Empty
  if(banners.length===0)return(
    <div className="relative w-full h-40 lg:h-56 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
      <div className="text-center text-white px-4">
        <p className="text-xl lg:text-3xl font-bold">{categoryName}</p>
        <p className="text-sm opacity-80 mt-2">{tr.noResults}</p>
        <a href={`/${country}/${lang}/create`} className="inline-block mt-3 px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition active:scale-95">{tr.createProfile}</a>
      </div>
    </div>
  );

  const banner=banners[current];
  const displayName=translateName(banner.name,lang);
  const displaySalary=banner.expected_salary?`${translateNumber(String(banner.expected_salary).replace(/[^0-9]/g,''),lang)} ${getCurrencySymbol(lang)}`:'';

  return(
    <div className="relative w-full h-40 lg:h-56 rounded-xl overflow-hidden group mb-4" style={{transform:'translateZ(0)'}}>
      {/* Image */}
      {imgError[current]?(
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center"><ImageOff size={40} className="text-white/50"/></div>
      ):(
        <img src={getWebP(banner.photo_url)} alt={displayName} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={()=>startTransition(()=>setImgError(p=>({...p,[current]:true})))}/>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>

      {/* Arrows */}
      {banners.length>1&&(<>
        <button onClick={()=>startTransition(()=>setCurrent(p=>(p-1+banners.length)%banners.length))} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"><ChevronLeft size={20}/></button>
        <button onClick={()=>startTransition(()=>setCurrent(p=>(p+1)%banners.length))} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"><ChevronRight size={20}/></button>
      </>)}

      {/* Content */}
      <a href={`/${country}/${lang}/profile/${banner.id}`} className="absolute bottom-4 left-4 right-4 text-white no-underline block">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500">{categoryName}</span>
          {banner.is_online&&<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>}
        </div>
        <h2 className="text-base lg:text-2xl font-bold truncate drop-shadow-lg">{displayName}</h2>
        <p className="text-xs lg:text-sm opacity-90 mt-1 truncate">{banner.experience||''}{displaySalary?` • ${displaySalary}`:''}</p>
      </a>

      {/* Stats */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">{stats.total} {categoryName}</span>
        <span className="bg-green-500/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">{stats.online} {tr.online}</span>
      </div>

      {/* Counter + Dots */}
      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">{current+1}/{banners.length}</div>
      {banners.length>1&&(<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">{banners.map((_,i)=><button key={i} onClick={()=>startTransition(()=>setCurrent(i))} className={`h-1.5 rounded-full transition-all ${i===current?'bg-white w-5':'bg-white/50 w-1.5 hover:bg-white/70'}`}/>)}</div>)}
    </div>
  );
});

CategoryBanner.displayName='CategoryBanner';

export default CategoryBanner;