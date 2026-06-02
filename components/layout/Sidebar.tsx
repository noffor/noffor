// components/layout/Sidebar.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import Link from 'next/link';
import {categories} from '@/lib/config';
import {getText,LangCode} from '@/lib/language';
import {Grid3X3} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষায় ক্যাটাগরি নাম (Module-level static)
// ═══════════════════════════════════════════════════════════
const CATEGORY_NAMES:Record<string,Record<string,string>>={
  driver:{en:'Driver',ar:'سائق',bn:'ড্রাইভার',hi:'ड्राइवर'},
  electrician:{en:'Electrician',ar:'كهربائي',bn:'ইলেকট্রিশিয়ান',hi:'इलेक्ट्रीशियन'},
  plumber:{en:'Plumber',ar:'سباك',bn:'প্লাম্বার',hi:'प्लंबर'},
  mason:{en:'Mason',ar:'بناء',bn:'রাজমিস্ত্রি',hi:'राजमिस्त्री'},
  'ac-technician':{en:'AC Technician',ar:'فني تكييف',bn:'এসি টেকনিশিয়ান',hi:'एसी तकनीशियन'},
  painter:{en:'Painter',ar:'دهان',bn:'পেইন্টার',hi:'पेंटर'},
  carpenter:{en:'Carpenter',ar:'نجار',bn:'কার্পেন্টার',hi:'बढ़ई'},
  welder:{en:'Welder',ar:'لحام',bn:'ওয়েল্ডার',hi:'वेल्डर'},
  cleaner:{en:'Cleaner',ar:'منظف',bn:'ক্লিনার',hi:'क्लीनर'},
  cook:{en:'Cook',ar:'طباخ',bn:'রাঁধুনি',hi:'रसोइया'},
  helper:{en:'Helper',ar:'مساعد',bn:'হেল্পার',hi:'हेल्पर'},
  gardener:{en:'Gardener',ar:'بستاني',bn:'মালী',hi:'मालী'},
};

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ অপ্টিমাইজার
// ═══════════════════════════════════════════════════════════
const getWebP=(url:string):string=>{
  if(!url)return'';
  if(url.includes('supabase.co/storage'))return`${url}?width=40&quality=80&format=webp`;
  return url;
};

// ═══════════════════════════════════════════════════════════
// Category Item (Memoized)
// ═══════════════════════════════════════════════════════════
const CategoryItem=React.memo(({cat,lang,rest}:{cat:any;lang:string;rest:string})=>{
  const displayName=useMemo(()=>CATEGORY_NAMES[cat.slug]?.[lang]||cat.name,[cat.slug,lang,cat.name]);
  const iconSrc=useMemo(()=>getWebP(cat.icon),[cat.icon]);

  return(
    <Link 
      href={`${rest}/category/${cat.slug}`} 
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 no-underline transition-all active:scale-[0.98] group"
      style={{transform:'translateZ(0)'}}
    >
      <img 
        src={iconSrc} 
        alt={displayName} 
        className="w-5 h-5 object-contain flex-shrink-0 group-hover:scale-110 transition-transform" 
        loading="lazy" 
        decoding="async"
        onError={(e)=>{(e.target as HTMLImageElement).src='/icons/default.webp'}}
      />
      <span className="truncate">{displayName}</span>
    </Link>
  );
});
CategoryItem.displayName='CategoryItem';

// ═══════════════════════════════════════════════════════════
// Sidebar (Memoized)
// ═══════════════════════════════════════════════════════════
const Sidebar=React.memo(({country,lang}:{country:string;lang:string})=>{
  const t=useMemo(()=>(key:string)=>getText(lang as LangCode,key),[lang]);
  const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);
  const memoizedCategories=useMemo(()=>categories,[]);

  return(
    <div 
      className="bg-white rounded-xl border shadow-sm overflow-hidden sticky top-20"
      style={{contain:'layout style paint',transform:'translateZ(0)'}}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b bg-gradient-to-r from-orange-50 to-white flex items-center gap-2">
        <Grid3X3 size={16} className="text-orange-500"/>
        <h3 className="text-sm font-bold text-gray-700">{t('categories')}</h3>
        <span className="text-xs text-gray-400 ml-auto">{memoizedCategories.length}</span>
      </div>
      
      {/* Category List */}
      <div className="py-1 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
        {memoizedCategories.map(cat=>(
          <CategoryItem key={cat.slug} cat={cat} lang={lang} rest={rest}/>
        ))}
      </div>
      
      {/* Footer */}
      <div className="px-3 py-2 border-t bg-gray-50">
        <Link 
          href={`${rest}/categories`} 
          className="text-xs text-orange-600 hover:text-orange-700 font-medium no-underline flex items-center justify-center gap-1"
        >
          
        </Link>
      </div>
    </div>
  );
});

Sidebar.displayName='Sidebar';

export default Sidebar;