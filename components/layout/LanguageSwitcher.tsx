// components/layout/LanguageSwitcher.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {Languages,Globe} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষার নাম ও ফ্ল্যাগ (Module-level static)
// ═══════════════════════════════════════════════════════════
const LANGUAGES=[
  {code:'en',name:'English',flag:'🇬🇧',nativeName:'English',dir:'ltr'},
  {code:'ar',name:'العربية',flag:'🇸🇦',nativeName:'العربية',dir:'rtl'},
  {code:'bn',name:'বাংলা',flag:'🇧🇩',nativeName:'বাংলা',dir:'ltr'},
  {code:'hi',name:'हिन्दी',flag:'🇮🇳',nativeName:'हिन्दी',dir:'ltr'},
];

// ═══════════════════════════════════════════════════════════
// Language Item (Memoized)
// ═══════════════════════════════════════════════════════════
const LangItem=React.memo(({lang,isActive,country}:{
  lang:typeof LANGUAGES[0];isActive:boolean;country:string;
})=>(
  <a 
    href={`/${country}/${lang.code}`} 
    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all active:scale-95 flex items-center gap-1.5 ${
      isActive?'bg-white text-orange-600 shadow-sm ring-1 ring-orange-200':'text-gray-500 hover:text-gray-700 hover:bg-white/50'
    }`}
    style={{transform:'translateZ(0)'}}
    title={lang.name}
  >
    <span className="text-sm">{lang.flag}</span>
    <span className="hidden sm:inline">{lang.nativeName}</span>
    <span className="sm:hidden">{lang.code.toUpperCase()}</span>
  </a>
));
LangItem.displayName='LangItem';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{country:string;current:string}

// ═══════════════════════════════════════════════════════════
// LanguageSwitcher (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const LanguageSwitcher=React.memo(({country,current}:Props)=>{
  const langList=useMemo(()=>LANGUAGES,[]);

  return(
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1" style={{contain:'layout style paint'}}>
      <Globe size={14} className="text-gray-400 ml-1 hidden sm:block"/>
      {langList.map(l=>(
        <LangItem key={l.code} lang={l} isActive={current===l.code} country={country}/>
      ))}
    </div>
  );
});

LanguageSwitcher.displayName='LanguageSwitcher';

export default LanguageSwitcher;