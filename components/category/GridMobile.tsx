// components/category/GridMobile.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import ProfileCard from './ProfileCard';
import {Loader2,RefreshCw} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{loading:'Loading...',loadMore:'Load More',remaining:'remaining',noMore:'No more profiles',error:'Failed to load'},
  bn:{loading:'লোড হচ্ছে...',loadMore:'আরও দেখুন',remaining:'বাকি',noMore:'আর কোনো প্রোফাইল নেই',error:'লোড ব্যর্থ'},
  ar:{loading:'جاري التحميل...',loadMore:'تحميل المزيد',remaining:'متبقي',noMore:'لا مزيد',error:'فشل التحميل'},
  hi:{loading:'लोड हो रहा...',loadMore:'और लोड करें',remaining:'शेष',noMore:'कोई और नहीं',error:'लोड विफल'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const ITEMS_PER_PAGE=5;

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{profiles:any[];country:string;lang:string;totalCount:number;categoryName:string}

// ═══════════════════════════════════════════════════════════
// GridMobile (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const GridMobile=React.memo(({profiles,country,lang,totalCount,categoryName}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[items,setItems]=useState(profiles);
  const[page,setPage]=useState(1);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState(false);
  const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);
  const hasMore=items.length<totalCount;
  const remaining=totalCount-items.length;

  const loadMore=useCallback(async()=>{
    startTransition(()=>{setLoading(true);setError(false)});
    try{
      const from=page*ITEMS_PER_PAGE;
      const to=from+ITEMS_PER_PAGE-1;
      const{data,error:e}=await supabase.from('profiles').select('*').eq('category',categoryName).eq('country',country).range(from,to);
      if(e)throw e;
      if(data)startTransition(()=>{setItems(p=>[...p,...data]);setPage(p=>p+1)});
    }catch{startTransition(()=>setError(true))}
    startTransition(()=>setLoading(false));
  },[page,country,categoryName]);

  return(
    <div style={{contain:'layout style paint'}}>
      <div className="grid grid-cols-2 gap-2">
        {items.map(p=><ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang}/>)}
      </div>

      {hasMore&&!error&&(
        <div className="text-center mt-4">
          <button onClick={loadMore} disabled={loading}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-2 mx-auto">
            {loading?<Loader2 size={14} className="animate-spin"/>:null}
            {loading?tr.loading:`${tr.loadMore} (${remaining} ${tr.remaining})`}
          </button>
        </div>
      )}

      {error&&(
        <div className="text-center mt-4">
          <button onClick={loadMore} className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all active:scale-[0.98] flex items-center gap-2 mx-auto">
            <RefreshCw size={14}/>{tr.error}
          </button>
        </div>
      )}

      {!hasMore&&items.length>0&&(
        <p className="text-center text-xs text-gray-400 mt-4">{tr.noMore}</p>
      )}
    </div>
  );
});

GridMobile.displayName='GridMobile';

export default GridMobile;