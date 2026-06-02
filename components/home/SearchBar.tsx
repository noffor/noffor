// components/home/SearchBar.tsx - Simple Search • ১ বিলিয়ন ইউজার • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Search} from 'lucide-react';
import {getText,LangCode} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{searchPlaceholder:'Search workers...',navSearch:'Search'},
  bn:{searchPlaceholder:'শ্রমিক খুঁজুন...',navSearch:'সার্চ'},
  ar:{searchPlaceholder:'ابحث عن عمال...',navSearch:'بحث'},
  hi:{searchPlaceholder:'श्रमिक खोजें...',navSearch:'खोज'},
};

interface Props{country:string;lang:string}

// ═══════════════════════════════════════════════════════════
// SearchBar (Simple • 1B Ready)
// ═══════════════════════════════════════════════════════════
const SearchBar=React.memo(({country,lang}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const router=useRouter();
  const[query,setQuery]=useState('');

  const handleSearch=useCallback(()=>{
    if(!query.trim())return;
    startTransition(()=>router.push(`/${country}/${lang}/search?q=${encodeURIComponent(query.trim())}`));
  },[query,country,lang,router]);

  const handleKeyDown=useCallback((e:React.KeyboardEvent)=>{
    if(e.key==='Enter')handleSearch();
  },[handleSearch]);

  return(
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 py-2.5 border border-transparent focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 focus-within:bg-white transition-all">
        <Search size={16} className="text-gray-400 flex-shrink-0"/>
        <input 
          type="text" 
          value={query} 
          onChange={e=>setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tr.searchPlaceholder} 
          className="flex-1 bg-transparent outline-none px-2 text-sm" 
        />
      </div>
      <button 
        onClick={handleSearch} 
        disabled={!query.trim()}
        className="px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-all active:scale-95"
      >
        {tr.navSearch}
      </button>
    </div>
  );
});

SearchBar.displayName='SearchBar';

export default SearchBar;