// components/category/CategoryFilters.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo,useCallback,startTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Filter,Sparkles,Star,Zap} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ফিল্টার (Module-level static)
// ═══════════════════════════════════════════════════════════
const FILTERS=[
  {key:'all',en:'All',ar:'الكل',bn:'সব',hi:'सब',icon:Filter},
  {key:'new',en:'New',ar:'جديد',bn:'নতুন',hi:'नया',icon:Sparkles},
  {key:'experienced',en:'Experienced',ar:'خبير',bn:'অভিজ্ঞ',hi:'अनुभवी',icon:Zap},
  {key:'featured',en:'Featured',ar:'مميز',bn:'ফিচার্ড',hi:'फीचर्ड',icon:Star},
];

// ═══════════════════════════════════════════════════════════
// Filter Button (Memoized)
// ═══════════════════════════════════════════════════════════
const FilterButton=React.memo(({filter,isActive,lang,onClick}:{
  filter:typeof FILTERS[0];isActive:boolean;lang:string;onClick:()=>void;
})=>{
  const label=(filter as any)[lang]||filter.en;
  const Icon=filter.icon;
  return(
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
      isActive?'bg-orange-600 text-white shadow-md shadow-orange-200':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
    }`} style={{transform:'translateZ(0)'}}>
      <Icon size={14}/>{label}
    </button>
  );
});
FilterButton.displayName='FilterButton';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{country:string;lang:string;slug:string;active:string}

// ═══════════════════════════════════════════════════════════
// CategoryFilters (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const CategoryFilters=React.memo(({country,lang,slug,active}:Props)=>{
  const router=useRouter();
  const filters=useMemo(()=>FILTERS,[]);

  const handleFilter=useCallback((key:string)=>{
    startTransition(()=>router.push(`/${country}/${lang}/category/${slug}?filter=${key}`));
  },[country,lang,slug,router]);

  return(
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide" style={{contain:'layout style paint'}}>
      {filters.map(f=>(
        <FilterButton key={f.key} filter={f} isActive={active===f.key} lang={lang} onClick={()=>handleFilter(f.key)}/>
      ))}
    </div>
  );
});

CategoryFilters.displayName='CategoryFilters';

export default CategoryFilters;