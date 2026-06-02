// components/search/SearchSuggestions.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {getText,LangCode,translateCategory} from '@/lib/language';
import {TrendingUp,Search,Flame} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{popularSearches:'Popular Searches',trending:'Trending Now',recentSearches:'Recent Searches',noRecent:'No recent searches',clear:'Clear All'},
  bn:{popularSearches:'জনপ্রিয় সার্চ',trending:'ট্রেন্ডিং',recentSearches:'সাম্প্রতিক সার্চ',noRecent:'কোনো সাম্প্রতিক সার্চ নেই',clear:'সব মুছুন'},
  ar:{popularSearches:'بحث شائع',trending:'رائج الآن',recentSearches:'عمليات بحث',noRecent:'لا توجد عمليات بحث',clear:'مسح الكل'},
  hi:{popularSearches:'लोकप्रिय खोज',trending:'ट्रेंडिंग',recentSearches:'हाल की खोज',noRecent:'कोई हालिया खोज नहीं',clear:'सब साफ़ करें'},
};

// ═══════════════════════════════════════════════════════════
// Popular Suggestions (১২ ক্যাটাগরি)
// ═══════════════════════════════════════════════════════════
const POPULAR_SUGGESTIONS=[
  'Driver','Electrician','Plumber','Mason','AC Technician',
  'Painter','Carpenter','Welder','Cleaner','Cook','Helper','Gardener',
];

// ═══════════════════════════════════════════════════════════
// Suggestion Tag (Memoized)
// ═══════════════════════════════════════════════════════════
const SuggestionTag=React.memo(({suggestion,lang,country}:{
  suggestion:string;lang:string;country:string;
})=>{
  const displayName=useMemo(()=>translateCategory(suggestion,lang),[suggestion,lang]);
  
  return(
    <a 
      href={`/${country}/${lang}/search?q=${encodeURIComponent(suggestion)}`}
      className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs no-underline hover:bg-orange-50 hover:text-orange-600 border border-gray-100 hover:border-orange-200 transition-all active:scale-95 flex items-center gap-1.5"
      style={{transform:'translateZ(0)'}}
    >
      <Search size={10} className="text-gray-400"/>
      {displayName}
    </a>
  );
});
SuggestionTag.displayName='SuggestionTag';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{
  country:string;
  lang:string;
  recentSearches?:string[];
  onClearRecent?:()=>void;
}

// ═══════════════════════════════════════════════════════════
// SearchSuggestions (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const SearchSuggestions=React.memo(({country,lang,recentSearches,onClearRecent}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const t=useMemo(()=>(key:string)=>getText(lang as LangCode,key),[lang]);
  const suggestions=useMemo(()=>POPULAR_SUGGESTIONS,[]);

  return(
    <div className="space-y-4" style={{contain:'layout style paint'}}>
      {/* Recent Searches */}
      {recentSearches&&recentSearches.length>0&&(
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Flame size={12} className="text-orange-500"/>
              {tr.recentSearches}
            </p>
            {onClearRecent&&(
              <button onClick={onClearRecent} className="text-[10px] text-red-500 hover:text-red-700 transition-colors">
                {tr.clear}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s,i)=>(
              <SuggestionTag key={`recent-${i}`} suggestion={s} lang={lang} country={country}/>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
          <TrendingUp size={12} className="text-orange-500"/>
          {tr.popularSearches}
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s=>(
            <SuggestionTag key={s} suggestion={s} lang={lang} country={country}/>
          ))}
        </div>
      </div>
    </div>
  );
});

SearchSuggestions.displayName='SearchSuggestions';

export default SearchSuggestions;