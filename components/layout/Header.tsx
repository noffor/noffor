// components/layout/Header.tsx - Language + Country Fix + Search Icon
"use client";
import React,{useCallback,useMemo} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {getCountry,getCityName,getAreaName} from '@/lib/countries';
import {getText,LangCode,getCountryName} from '@/lib/language';
import {DollarSign,Search,MapPin,Building2,Globe,Plus} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{map:'Map',bid:'Bid',dashboard:'Dashboard',create:'Create',selectCity:'City',selectArea:'Area'},
  bn:{map:'ম্যাপ',bid:'বিড',dashboard:'ড্যাশ',create:'তৈরি',selectCity:'শহর',selectArea:'এরিয়া'},
  ar:{map:'خريطة',bid:'مزايدة',dashboard:'لوحة',create:'إنشاء',selectCity:'مدينة',selectArea:'منطقة'},
  hi:{map:'मैप',bid:'बिड',dashboard:'डैश',create:'बनाएं',selectCity:'शहर',selectArea:'क्षेत्र'},
};

// ✅ Language labels (সংক্ষিপ্ত)
const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ar', label: 'عربي' },
  { code: 'hi', label: 'हिन्दी' },
];

// ✅ Country list with Arabic names
const COUNTRIES = [
  { code: 'qa', label: '🇶🇦', nameEn: 'Qatar', nameBn: 'কাতার', nameAr: 'قطر', nameHi: 'कतर' },
  { code: 'sa', label: '🇸🇦', nameEn: 'Saudi', nameBn: 'সৌদি', nameAr: 'السعودية', nameHi: 'सऊदी' },
  { code: 'ae', label: '🇦🇪', nameEn: 'UAE', nameBn: 'ইউএই', nameAr: 'الإمارات', nameHi: 'यूएई' },
  { code: 'kw', label: '🇰🇼', nameEn: 'Kuwait', nameBn: 'কুয়েত', nameAr: 'الكويت', nameHi: 'कुवैत' },
  { code: 'bh', label: '🇧🇭', nameEn: 'Bahrain', nameBn: 'বাহরাইন', nameAr: 'البحرين', nameHi: 'बहरीन' },
  { code: 'om', label: '🇴🇲', nameEn: 'Oman', nameBn: 'ওমান', nameAr: 'عمان', nameHi: 'ओमान' },
];

function getCountryDisplayName(code: string, lang: string): string {
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return code.toUpperCase();
  const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof c;
  return (c as any)[key] || c.nameEn;
}

// ═══════════════════════════════════════════════════════════
// SearchBar (PC Only)
// ═══════════════════════════════════════════════════════════
function SearchBar({country,lang}:{country:string;lang:string}){
  const router=useRouter();
  const[query,setQuery]=React.useState('');
  const t=(key:string)=>getText(lang as LangCode,key);

  const handleSearch=()=>{
    if(query.trim())router.push(`/${country}/${lang}/search?q=${encodeURIComponent(query.trim())}`);
  };

  return(
    <div className="flex items-center gap-1">
      <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder={t('search')||'Search...'} className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 w-48"/>
      <button onClick={handleSearch} className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors active:scale-95"><Search size={16}/></button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{country:string;lang:string}

// ═══════════════════════════════════════════════════════════
// Header (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const Header=React.memo(({country,lang}:Props)=>{
  const router=useRouter();
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const c=useMemo(()=>getCountry(country),[country]);
  const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);

  const handleCityChange=useCallback((e:React.ChangeEvent<HTMLSelectElement>)=>{
    if(e.target.value)router.push(`${rest}?city=${e.target.value}`);
  },[rest,router]);

  const handleAreaChange=useCallback((e:React.ChangeEvent<HTMLSelectElement>)=>{
    if(e.target.value)router.push(`${rest}?area=${e.target.value}`);
  },[rest,router]);

  const firstCityAreas=useMemo(()=>c.cities[0]?.areas||[],[c]);

  // ✅ সার্চ আইকন ক্লিক → Search Page
  const goToSearch=useCallback(()=>router.push(`${rest}/search`),[rest,router]);

  return(
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{transform:'translateZ(0)',willChange:'transform'}}>
      {/* PC Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        <Link href={`${rest}`} className="flex items-center gap-3 no-underline group">
          <img src="/logo.svg" alt="Noffor" className="h-10 transition-transform group-hover:scale-105"/>
          <span className="text-xl font-bold text-gray-800">Noffor</span>
        </Link>
        <div className="flex items-center gap-2">
          <SearchBar country={country} lang={lang}/>
          <Link href={`${rest}/map`} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 no-underline transition-colors active:scale-95 flex items-center gap-1"><MapPin size={14}/>{tr.map}</Link>
          <Link href={`${rest}/bid`} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 no-underline transition-colors active:scale-95 flex items-center gap-1"><DollarSign size={14}/>{tr.bid}</Link>
          <Link href={`${rest}/dashboard`} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 no-underline transition-colors active:scale-95">{tr.dashboard}</Link>
          <Link href={`${rest}/create`} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 no-underline transition-colors active:scale-95 flex items-center gap-1"><Plus size={14}/>{tr.create}</Link>
          
          {/* ✅ Language Switcher — সংক্ষিপ্ত লেবেল */}
          <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
            {LANGUAGES.map(l=>(
              <a key={l.code} href={`/${country}/${l.code}`} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all ${lang===l.code?'bg-white text-orange-600 shadow-sm ring-1 ring-orange-200':'text-gray-500 hover:text-gray-700'}`}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Link href={`${rest}`} className="flex-shrink-0"><img src="/logo.svg" alt="Noffor" className="h-7"/></Link>
          
          {/* ✅ Country Select — with translated names */}
          <div className="relative flex-1 min-w-0">
            <select value={country} onChange={e=>window.location.href=`/${e.target.value}/${lang}`} className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 appearance-none cursor-pointer">
              {COUNTRIES.map(c=>(
                <option key={c.code} value={c.code}>{c.label} {getCountryDisplayName(c.code, lang)}</option>
              ))}
            </select>
            <Globe size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          
          <div className="relative flex-1 min-w-0">
            <select onChange={handleCityChange} className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 appearance-none cursor-pointer">
              <option value="">{tr.selectCity}</option>
              {c.cities.map((city,i)=><option key={i} value={city.en}>{getCityName(city,lang)}</option>)}
            </select>
            <Building2 size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          
          <div className="relative flex-1 min-w-0">
            <select onChange={handleAreaChange} className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 appearance-none cursor-pointer">
              <option value="">{tr.selectArea}</option>
              {firstCityAreas.map((area,i)=><option key={i} value={area.en}>{getAreaName(area,lang)}</option>)}
            </select>
            <MapPin size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          
          {/* ✅ Language Select — সংক্ষিপ্ত লেবেল */}
          <select value={lang} onChange={e=>window.location.href=`/${country}/${e.target.value}`} className="px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex-shrink-0 appearance-none cursor-pointer">
            {LANGUAGES.map(l=>(<option key={l.code} value={l.code}>{l.label}</option>))}
          </select>
          
          {/* ✅ সার্চ আইকন - ক্লিক করলে Search Page */}
          <button onClick={goToSearch} className="p-2 bg-gray-100 rounded-lg text-gray-600 flex-shrink-0 active:scale-90 transition-transform">
            <Search size={18}/>
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName='Header';

export default Header;