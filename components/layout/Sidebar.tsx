// components/layout/Sidebar.tsx - 🚀 42 CATEGORIES • PNG FROM /public/categories/ • MORE BUTTON
import React,{useMemo} from 'react';
import Link from 'next/link';
import {categories} from '@/lib/config';
import {getText,LangCode} from '@/lib/language';
import {Grid3X3, Search} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Category Item (Memoized) — ✅ PNG from /public/categories/
// ═══════════════════════════════════════════════════════════
const CategoryItem=React.memo(({cat,lang,country}:{cat:any;lang:string;country:string})=>{
  const displayName=useMemo(()=>{
    const key=`name${lang.charAt(0).toUpperCase()+lang.slice(1)}` as keyof typeof cat;
    return (cat as any)[key]||cat.name;
  },[cat,lang]);
  
  const [imgError,setImgError]=React.useState(false);
  // ✅ PNG from /public/categories/{slug}.png
  const imgSrc=imgError?'/categories/default.png':`/categories/${cat.slug}.png`;

  return(
    <Link 
      href={`/${country}/${lang}/category/${cat.slug}`} 
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 no-underline transition-all active:scale-[0.98] group"
      style={{transform:'translateZ(0)'}}
    >
      <img 
        src={imgSrc} 
        alt={displayName} 
        className="w-6 h-6 object-cover rounded flex-shrink-0 group-hover:scale-110 transition-transform" 
        loading="lazy" 
        decoding="async"
        onError={()=>setImgError(true)}
      />
      <span className="truncate">{displayName}</span>
    </Link>
  );
});
CategoryItem.displayName='CategoryItem';

// ═══════════════════════════════════════════════════════════
// Sidebar (Memoized) — 12 Main + More Button
// ═══════════════════════════════════════════════════════════
const Sidebar=React.memo(({country,lang}:{country:string;lang:string})=>{
  const t=useMemo(()=>(key:string)=>getText(lang as LangCode,key),[lang]);
  const memoizedCategories=useMemo(()=>categories,[]);
  
  // ১২টা Main categories (first 12)
  const mainCategories=useMemo(()=>memoizedCategories.slice(0,12),[memoizedCategories]);
  // বাকি Other categories
  const otherCount=useMemo(()=>Math.max(0,memoizedCategories.length-12),[memoizedCategories]);

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
      
      {/* ১২ Main Categories — ✅ PNG from /public/categories/ */}
      <div className="py-1 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
        {mainCategories.map(cat=>(
          <CategoryItem key={cat.slug} cat={cat} lang={lang} country={country}/>
        ))}
      </div>
      
      {/* ✅ More Categories Button — Clear & Visible */}
      {otherCount > 0 && (
        <div className="px-3 py-2.5 border-t bg-gradient-to-r from-orange-50 to-amber-50">
          <Link 
            href={`/${country}/${lang}/categories`}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 no-underline bg-white/60 hover:bg-white rounded-lg py-2 px-3 transition-all active:scale-[0.98] border border-orange-200 hover:border-orange-300"
          >
            <Search size={14} />
            {lang === 'bn' ? 'আরও ক্যাটাগরি' : lang === 'ar' ? 'المزيد من الفئات' : lang === 'hi' ? 'अधिक श्रेणियां' : 'More Categories'}
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">+{otherCount}</span>
          </Link>
        </div>
      )}
    </div>
  );
});

Sidebar.displayName='Sidebar';

export default Sidebar;