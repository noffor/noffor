// components/layout/CountrySelector.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {countries} from '@/lib/countries';
import {Globe,ChevronDown} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষায় দেশের নাম
// ═══════════════════════════════════════════════════════════
const COUNTRY_NAMES:Record<string,Record<string,string>>={
  qa:{en:'Qatar',bn:'কাতার',ar:'قطر',hi:'कतर'},
  sa:{en:'Saudi',bn:'সৌদি',ar:'السعودية',hi:'सऊदी'},
  ae:{en:'UAE',bn:'UAE',ar:'الإمارات',hi:'UAE'},
  kw:{en:'Kuwait',bn:'কুয়েত',ar:'الكويت',hi:'कुवैत'},
  bh:{en:'Bahrain',bn:'বাহরাইন',ar:'البحرين',hi:'बहरीन'},
  om:{en:'Oman',bn:'ওমান',ar:'عمان',hi:'ओमान'},
};

// ═══════════════════════════════════════════════════════════
// Country Flag Emoji
// ═══════════════════════════════════════════════════════════
const FLAGS:Record<string,string>={qa:'🇶🇦',sa:'🇸🇦',ae:'🇦🇪',kw:'🇰🇼',bh:'🇧🇭',om:'🇴🇲'};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{current:string;lang:string}

// ═══════════════════════════════════════════════════════════
// Country Item (Memoized)
// ═══════════════════════════════════════════════════════════
const CountryItem=React.memo(({code,isActive,lang,href}:{
  code:string;isActive:boolean;lang:string;href:string;
})=>{
  const name=COUNTRY_NAMES[code]?.[lang]||code.toUpperCase();
  const flag=FLAGS[code]||'';

  return(
    <a 
      href={href} 
      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all active:scale-95 flex items-center gap-1.5 ${
        isActive?'bg-white text-orange-600 shadow-sm ring-1 ring-orange-200':'text-gray-500 hover:text-gray-700 hover:bg-white/50'
      }`}
      style={{transform:'translateZ(0)'}}
      title={countries[code]?.name||code}
    >
      <span className="text-sm">{flag}</span>
      <span className="hidden sm:inline">{name}</span>
      <span className="sm:hidden">{code.toUpperCase()}</span>
    </a>
  );
});
CountryItem.displayName='CountryItem';

// ═══════════════════════════════════════════════════════════
// CountrySelector (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const CountrySelector=React.memo(({current,lang}:Props)=>{
  const countryList=useMemo(()=>Object.values(countries),[]);

  return(
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1" style={{contain:'layout style paint'}}>
      <Globe size={14} className="text-gray-400 ml-1 hidden sm:block"/>
      {countryList.map(c=>(
        <CountryItem 
          key={c.code} 
          code={c.code} 
          isActive={current===c.code} 
          lang={lang} 
          href={`/${c.code}/${lang}`} 
        />
      ))}
    </div>
  );
});

CountrySelector.displayName='CountrySelector';

export default CountrySelector;