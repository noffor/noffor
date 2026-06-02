// app/[country]/[lang]/search/page.tsx - ১ বিলিয়ন ইউজার সুপারসনিক • লাইভ সার্চ • অটো সাজেস্ট • ফুল ফিচার
"use client";
import React,{useState,useEffect,useCallback,useMemo,useRef,startTransition} from 'react';
import {useParams,useSearchParams,useRouter} from 'next/navigation';
import {supabase} from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import SearchResult from '@/components/search/SearchResult';
import ImageSearch from '@/components/search/ImageSearch';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import {Search,Camera,X,Loader2,ArrowLeft,Phone,User,MapPin,Clock,TrendingUp,History,Star,Briefcase} from 'lucide-react';
import {getText,LangCode} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={
  DEBOUNCE_MS:300,
  MAX_SUGGESTIONS:8,
  MAX_RECENT:8,
  CACHE_TTL:60000,
  MIN_QUERY_LENGTH:1,
};

// ═══════════════════════════════════════════════════════════
// ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{
    searchPlaceholder:'Search by name, phone, or category...',
    navSearch:'Search',back:'Back',noResults:'No results found',
    searching:'Searching...',tryDifferent:'Try different keywords',
    recent:'Recent',clear:'Clear',suggestions:'Suggestions',
    noSuggestions:'Start typing to search',phone:'Phone',
    name:'Name',category:'Category',workers:'workers',
    found:'found',searchHistory:'Search History',
    popularSearches:'Popular Searches',viewAll:'View All',
    hire:'Hire',online:'Online',rating:'Rating',
  },
  bn:{
    searchPlaceholder:'নাম, ফোন বা ক্যাটাগরি দিয়ে খুঁজুন...',
    navSearch:'সার্চ',back:'পিছনে',noResults:'কোনো ফলাফল নেই',
    searching:'খুঁজছে...',tryDifferent:'ভিন্ন শব্দ ব্যবহার করুন',
    recent:'সাম্প্রতিক',clear:'মুছুন',suggestions:'সাজেশন',
    noSuggestions:'সার্চ করতে টাইপ করুন',phone:'ফোন',
    name:'নাম',category:'ক্যাটাগরি',workers:'শ্রমিক',
    found:'পাওয়া গেছে',searchHistory:'সার্চ হিস্টোরি',
    popularSearches:'জনপ্রিয় সার্চ',viewAll:'সব দেখুন',
    hire:'নিয়োগ',online:'অনলাইন',rating:'রেটিং',
  },
  ar:{
    searchPlaceholder:'ابحث بالاسم أو الهاتف أو الفئة...',
    navSearch:'بحث',back:'رجوع',noResults:'لا توجد نتائج',
    searching:'جاري البحث...',tryDifferent:'جرب كلمات مختلفة',
    recent:'الأخيرة',clear:'مسح',suggestions:'اقتراحات',
    noSuggestions:'ابدأ الكتابة للبحث',phone:'هاتف',
    name:'اسم',category:'فئة',workers:'عمال',
    found:'تم العثور',searchHistory:'سجل البحث',
    popularSearches:'بحث شائع',viewAll:'عرض الكل',
    hire:'توظيف',online:'متصل',rating:'تقييم',
  },
  hi:{
    searchPlaceholder:'नाम, फोन या श्रेणी से खोजें...',
    navSearch:'खोज',back:'वापस',noResults:'कोई परिणाम नहीं',
    searching:'खोज रहा...',tryDifferent:'अलग शब्द आज़माएं',
    recent:'हाल',clear:'साफ़',suggestions:'सुझाव',
    noSuggestions:'खोजने के लिए टाइप करें',phone:'फ़ोन',
    name:'नाम',category:'श्रेणी',workers:'श्रमिक',
    found:'मिले',searchHistory:'खोज इतिहास',
    popularSearches:'लोकप्रिय खोज',viewAll:'सभी देखें',
    hire:'किराया',online:'ऑनलाइन',rating:'रेटिंग',
  },
};

// ═══════════════════════════════════════════════════════════
// ডেবাউন্স ইউটিলিটি
// ═══════════════════════════════════════════════════════════
function debounce<T extends(...args:any[])=>any>(fn:T,ms:number){
  let timer:ReturnType<typeof setTimeout>;
  return(...args:Parameters<T>)=>{clearTimeout(timer as NodeJS.Timeout);timer=setTimeout(()=>fn(...args),ms)};
}

// ═══════════════════════════════════════════════════════════
// গ্লোবাল ক্যাশে
// ═══════════════════════════════════════════════════════════
const suggestionCache=new Map<string,{data:any[];timestamp:number}>();

// ═══════════════════════════════════════════════════════════
// পপুলার সার্চ (স্ট্যাটিক)
// ═══════════════════════════════════════════════════════════
const POPULAR_SEARCHES=[
  {en:'Driver',bn:'ড্রাইভার',ar:'سائق',hi:'ड्राइवर'},
  {en:'Electrician',bn:'ইলেকট্রিশিয়ান',ar:'كهربائي',hi:'इलेक्ट्रीशियन'},
  {en:'Plumber',bn:'প্লাম্বার',ar:'سباك',hi:'प्लंबर'},
  {en:'Cleaner',bn:'ক্লিনার',ar:'منظف',hi:'क्लीनर'},
  {en:'Cook',bn:'রাঁধুনি',ar:'طباخ',hi:'रसोइया'},
  {en:'Painter',bn:'পেইন্টার',ar:'دهان',hi:'पेंटर'},
];

// ═══════════════════════════════════════════════════════════
// সাজেশন কার্ড (Memoized)
// ═══════════════════════════════════════════════════════════
const SuggestionCard=React.memo(({profile,lang,country,onClick}:{
  profile:any;lang:string;country:string;onClick:()=>void;
})=>{
  const isPhone=profile._type==='phone';
  return(
    <button onClick={onClick} className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors active:bg-gray-100">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        {profile.photo_url?(
          <img src={profile.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" loading="lazy"/>
        ):(
          isPhone?<Phone size={14} className="text-gray-400"/>:<User size={14} className="text-gray-400"/>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{profile.name}</p>
        <p className="text-xs text-gray-400 truncate">
          {isPhone?profile.phone:profile.category||'Worker'}
          {profile.is_online&&<span className="ml-1.5 inline-flex items-center gap-1 text-green-600"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"/>Online</span>}
        </p>
      </div>
      {profile.rating>0&&(
        <span className="text-xs text-yellow-600 flex items-center gap-0.5 flex-shrink-0"><Star size={10}/>{profile.rating}</span>
      )}
    </button>
  );
});
SuggestionCard.displayName='SuggestionCard';

// ═══════════════════════════════════════════════════════════
// মেইন সার্চ পেজ
// ═══════════════════════════════════════════════════════════
export default function SearchPage(){
  const params=useParams();
  const country=(params as any).country||'qa';
  const lang=(params as any).lang||'en';
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const searchParams=useSearchParams();
  const router=useRouter();
  const q=searchParams.get('q')||'';
  
  const [results,setResults]=useState<any[]>([]);
  const [input,setInput]=useState(q);
  const [mode,setMode]=useState<'text'|'image'>('text');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(false);
  const [suggestions,setSuggestions]=useState<any[]>([]);
  const [loadingSuggestions,setLoadingSuggestions]=useState(false);
  const [showDropdown,setShowDropdown]=useState(false);
  const [recentSearches,setRecentSearches]=useState<string[]>([]);
  const [searchPerformed,setSearchPerformed]=useState(false);
  
  const inputRef=useRef<HTMLInputElement>(null);
  const dropdownRef=useRef<HTMLDivElement>(null);
  const aliveRef=useRef(true);
  const abortRef=useRef<AbortController|null>(null);

  // ✅ Load recent searches
  useEffect(()=>{
    aliveRef.current=true;
    try{const stored=localStorage.getItem('recent_searches_v2');if(stored)setRecentSearches(JSON.parse(stored))}catch{}
    return()=>{aliveRef.current=false;if(abortRef.current)abortRef.current.abort()};
  },[]);

  // ✅ Search on URL change
  useEffect(()=>{
    if(q){setInput(q);performSearch(q);setSearchPerformed(true)}
  },[q]);

  // ✅ Close dropdown on outside click
  useEffect(()=>{
    const handler=(e:MouseEvent)=>{
      if(dropdownRef.current&&!dropdownRef.current.contains(e.target as Node)&&inputRef.current&&!inputRef.current.contains(e.target as Node)){
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown',handler);
    return()=>document.removeEventListener('mousedown',handler);
  },[]);

  const saveRecentSearch=(query:string)=>{
    const updated=[query,...recentSearches.filter(s=>s!==query)].slice(0,CONFIG.MAX_RECENT);
    setRecentSearches(updated);
    try{localStorage.setItem('recent_searches_v2',JSON.stringify(updated))}catch{}
  };

  // ✅ লাইভ সাজেশন ফেচ (ডেবাউন্সড)
  const fetchSuggestions=useCallback(debounce(async(query:string)=>{
    if(!query.trim()||query.length<CONFIG.MIN_QUERY_LENGTH||!aliveRef.current){
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    // Cache check
    const cacheKey=`sug:${country}:${query.toLowerCase()}`;
    const cached=suggestionCache.get(cacheKey);
    if(cached&&Date.now()-cached.timestamp<CONFIG.CACHE_TTL){
      startTransition(()=>setSuggestions(cached.data));
      return;
    }

    if(abortRef.current)abortRef.current.abort();
    const controller=new AbortController();
    abortRef.current=controller;
    setLoadingSuggestions(true);

    try{
      const cleanQuery=query.trim();
      const isPhone=/^[0-9+\-\s()]+$/.test(cleanQuery);
      const isNumber=/^[0-9]+$/.test(cleanQuery);
      
      let phoneResults:any[]=[];
      let nameResults:any[]=[];

      // Phone search
      if(isPhone||isNumber){
        const {data:phoneData}=await supabase
          .from('profiles')
          .select('id,name,phone,photo_url,category,rating,is_online')
          .ilike('phone',`%${cleanQuery.replace(/[\s\-()]/g,'')}%`)
          .eq('country',country)
          .limit(3)
          .abortSignal(controller.signal);
        phoneResults=(phoneData||[]).map((p:any)=>({...p,_type:'phone'}));
      }

      // Name/Category search (if not pure phone number)
      if(!isPhone||cleanQuery.length>=3){
        const {data:nameData}=await supabase
          .from('profiles')
          .select('id,name,phone,photo_url,category,rating,is_online')
          .or(`name.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
          .eq('country',country)
          .limit(5)
          .abortSignal(controller.signal);
        nameResults=(nameData||[]).map((p:any)=>({...p,_type:'name'}));
      }

      const combined=[...phoneResults,...nameResults].slice(0,CONFIG.MAX_SUGGESTIONS);
      
      // Cache
      suggestionCache.set(cacheKey,{data:combined,timestamp:Date.now()});
      
      if(aliveRef.current)startTransition(()=>{setSuggestions(combined);setLoadingSuggestions(false)});
    }catch(err:any){
      if(err.name==='AbortError')return;
      if(aliveRef.current)setLoadingSuggestions(false);
    }
  },CONFIG.DEBOUNCE_MS),[]);

  // ✅ ইনপুট চেঞ্জ = সাজেশন ফেচ
  const handleInputChange=useCallback((value:string)=>{
    setInput(value);
    setShowDropdown(true);
    setSearchPerformed(false);
    fetchSuggestions(value);
  },[fetchSuggestions]);

  const performSearch=useCallback(async(query:string)=>{
    if(!query.trim()||!aliveRef.current)return;
    
    if(abortRef.current)abortRef.current.abort();
    const controller=new AbortController();
    abortRef.current=controller;

    startTransition(()=>{setLoading(true);setError(false);setShowDropdown(false)});
    saveRecentSearch(query.trim());
    setSearchPerformed(true);
    
    try{
      const cleanQuery=query.trim();
      const isPhone=/^[0-9+\-\s()]+$/.test(cleanQuery);
      
      let qr=supabase.from('profiles').select('*').eq('country',country);
      if(isPhone)qr=qr.ilike('phone',`%${cleanQuery.replace(/[\s\-()]/g,'')}%`);
      else qr=qr.or(`name.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`);
      
      const {data,error:e}=await qr.limit(20).abortSignal(controller.signal);
      if(e)throw e;
      if(!aliveRef.current)return;
      
      startTransition(()=>{setResults(data||[]);setLoading(false)});
    }catch(err:any){
      if(err.name==='AbortError')return;
      if(aliveRef.current)startTransition(()=>{setError(true);setLoading(false)});
    }
  },[]);

  const handleSearch=useCallback((query?:string)=>{
    const searchQuery=query||input;
    if(!searchQuery.trim())return;
    router.push(`/${country}/${lang}/search?q=${encodeURIComponent(searchQuery.trim())}`);
  },[input,country,lang,router]);

  const handleKeyDown=useCallback((e:React.KeyboardEvent)=>{
    if(e.key==='Enter'){handleSearch();setShowDropdown(false)}
    if(e.key==='Escape')setShowDropdown(false);
  },[handleSearch]);

  const handleClear=useCallback(()=>{
    setInput('');
    setResults([]);
    setSuggestions([]);
    setSearchPerformed(false);
    inputRef.current?.focus();
  },[]);

  const handleSuggestionClick=useCallback((suggestion:any)=>{
    const query=suggestion._type==='phone'?suggestion.phone:suggestion.name;
    setInput(query);
    setShowDropdown(false);
    handleSearch(query);
  },[handleSearch]);

  const handleRecentClick=useCallback((query:string)=>{
    setInput(query);
    setShowDropdown(false);
    handleSearch(query);
  },[handleSearch]);

  const handlePopularClick=useCallback((term:string)=>{
    setInput(term);
    setShowDropdown(false);
    handleSearch(term);
  },[handleSearch]);

  const clearRecent=useCallback(()=>{
    setRecentSearches([]);
    try{localStorage.removeItem('recent_searches_v2')}catch{}
  },[]);

  const handleFocus=useCallback(()=>{
    if(input||recentSearches.length>0)setShowDropdown(true);
  },[input,recentSearches]);

  // ✅ Popular searches for current language
  const popularSearches=useMemo(()=>
    POPULAR_SEARCHES.map(p=>(p as any)[lang]||p.en),
    [lang]
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{contain:'layout style paint'}}>
      <Header country={country} lang={lang}/>
      <div className="max-w-4xl mx-auto px-3 lg:px-4 py-3">
        
        {/* Search Mode: Text */}
        {mode==='text'&&(
          <div className="relative mb-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-2.5 border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all shadow-sm">
                <Search size={18} className="text-gray-400 flex-shrink-0"/>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e=>handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  placeholder={tr.searchPlaceholder}
                  className="flex-1 bg-transparent outline-none px-2 text-sm"
                  autoFocus
                />
                {input&&(
                  <button onClick={handleClear} className="p-0.5 hover:bg-gray-100 rounded-full"><X size={14} className="text-gray-400"/></button>
                )}
                <button onClick={()=>setMode('image')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Image Search">
                  <Camera size={18} className="text-gray-400"/>
                </button>
              </div>
              <button onClick={()=>handleSearch()} disabled={!input.trim()} className="px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 active:scale-[0.98] transition-all">
                {tr.navSearch}
              </button>
            </div>

            {/* ✅ সাজেশন ড্রপডাউন */}
            {showDropdown&&!searchPerformed&&(
              <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
                
                {/* Loading Suggestions */}
                {loadingSuggestions&&(
                  <div className="px-3 py-4 text-center">
                    <Loader2 size={16} className="animate-spin text-gray-400 mx-auto"/>
                  </div>
                )}

                {/* Live Suggestions */}
                {!loadingSuggestions&&suggestions.length>0&&(
                  <div>
                    <div className="px-3 py-1.5 border-b bg-gray-50">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <TrendingUp size={12}/>{tr.suggestions}
                      </span>
                    </div>
                    {suggestions.map((s,i)=>(
                      <SuggestionCard key={s.id||i} profile={s} lang={lang} country={country} onClick={()=>handleSuggestionClick(s)}/>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {!loadingSuggestions&&suggestions.length===0&&recentSearches.length>0&&!input&&(
                  <div>
                    <div className="flex items-center justify-between px-3 py-1.5 border-b bg-gray-50">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><History size={12}/>{tr.recent}</span>
                      <button onClick={clearRecent} className="text-xs text-red-500 hover:text-red-700">{tr.clear}</button>
                    </div>
                    {recentSearches.map((s,i)=>(
                      <button key={i} onClick={()=>handleRecentClick(s)} className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
                        <Clock size={14} className="text-gray-400 flex-shrink-0"/><span className="truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Searches (when empty) */}
                {!loadingSuggestions&&suggestions.length===0&&recentSearches.length===0&&!input&&(
                  <div>
                    <div className="px-3 py-1.5 border-b bg-gray-50">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><TrendingUp size={12}/>{tr.popularSearches}</span>
                    </div>
                    <div className="p-2 grid grid-cols-2 gap-1">
                      {popularSearches.map((s,i)=>(
                        <button key={i} onClick={()=>handlePopularClick(s)} className="px-3 py-2 text-left text-sm hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2">
                          <Briefcase size={12} className="text-orange-500"/>{s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No suggestions */}
                {!loadingSuggestions&&suggestions.length===0&&input&&input.length>=CONFIG.MIN_QUERY_LENGTH&&(
                  <div className="px-3 py-4 text-center">
                    <p className="text-sm text-gray-400">{tr.noSuggestions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Mode: Image */}
        {mode==='image'&&(
          <div>
            <button onClick={()=>setMode('text')} className="text-sm text-orange-600 mb-3 flex items-center gap-1 hover:text-orange-700 transition-colors">
              <ArrowLeft size={14}/>{tr.back}
            </button>
            <ImageSearch/>
          </div>
        )}

        {/* Loading */}
        {loading&&(
          <div className="text-center py-16">
            <Loader2 size={32} className="animate-spin text-orange-500 mx-auto mb-3"/>
            <p className="text-sm text-gray-400">{tr.searching}</p>
          </div>
        )}

        {/* Error */}
        {error&&!loading&&(
          <div className="text-center py-16 bg-white rounded-xl border">
            <p className="text-red-500 text-sm mb-2">Search failed</p>
            <button onClick={()=>performSearch(q)} className="text-orange-600 text-sm underline">{lang==='bn'?'আবার চেষ্টা':'Try again'}</button>
          </div>
        )}

        {/* No Results */}
        {!loading&&!error&&searchPerformed&&results.length===0&&(
          <div className="text-center py-16 bg-white rounded-xl border">
            <Search size={40} className="text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">{tr.noResults}</p>
            <p className="text-gray-400 text-sm mt-1">{tr.tryDifferent}</p>
          </div>
        )}

        {/* Results */}
        {!loading&&!error&&results.length>0&&(
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-2">{results.length} {tr.workers} {tr.found}</p>
            {results.map(p=>(
              <SearchResult key={p.id} profile={p} href={`/${country}/${lang}/profile/${p.id}`}/>
            ))}
          </div>
        )}

        {/* Suggestions + Popular (when no search performed) */}
        {!searchPerformed&&!loading&&(
          <>
            {recentSearches.length>0&&(
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><History size={14}/>{tr.searchHistory}</h3>
                  <button onClick={clearRecent} className="text-xs text-red-500">{tr.clear}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s,i)=>(
                    <button key={i} onClick={()=>handleRecentClick(s)} className="px-3 py-1.5 bg-white border rounded-full text-xs text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
                      <Clock size={10}/>{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><TrendingUp size={14}/>{tr.popularSearches}</h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((s,i)=>(
                  <button key={i} onClick={()=>handlePopularClick(s)} className="px-3 py-1.5 bg-white border rounded-full text-xs text-gray-600 hover:bg-orange-50 hover:border-orange-200 transition-colors flex items-center gap-1">
                    <Briefcase size={10} className="text-orange-500"/>{s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <SearchSuggestions country={country} lang={lang}/>
            </div>
          </>
        )}
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}