// components/map/MarkerPopup.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {Star,MessageCircle,Phone,User,MapPin,Award} from 'lucide-react';
import {getText,LangCode,translateName,translateCategory,translateNumber,getCurrencySymbol} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{viewProfile:'View Profile',new:'New',online:'Online',offline:'Offline',verified:'Verified',contact:'Contact'},
  bn:{viewProfile:'প্রোফাইল দেখুন',new:'নতুন',online:'অনলাইন',offline:'অফলাইন',verified:'যাচাইকৃত',contact:'যোগাযোগ'},
  ar:{viewProfile:'عرض الملف',new:'جديد',online:'متصل',offline:'غير متصل',verified:'موثق',contact:'اتصال'},
  hi:{viewProfile:'प्रोफाइल देखें',new:'नया',online:'ऑनलाइन',offline:'ऑफलाइन',verified:'सत्यापित',contact:'संपर्क'},
};

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ
// ═══════════════════════════════════════════════════════════
const getWebP=(url:string):string=>{
  if(!url)return'/default-avatar.png';
  if(url.includes('supabase.co/storage'))return`${url}?width=80&quality=80&format=webp`;
  return url;
};

interface Props{
  labor:any;
  href:string;
  lang?:string;
}

// ═══════════════════════════════════════════════════════════
// MarkerPopup (Memoized)
// ═══════════════════════════════════════════════════════════
const MarkerPopup=React.memo(({labor,href,lang='en'}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const t=useMemo(()=>(key:string)=>getText(lang as LangCode,key),[lang]);

  // ট্রান্সলেটেড ভ্যালু
  const displayName=useMemo(()=>translateName(labor.name,lang),[labor.name,lang]);
  const displayCategory=useMemo(()=>translateCategory(labor.category,lang),[labor.category,lang]);
  const displaySalary=useMemo(()=>{
    const salary=String(labor.expected_salary||'').replace('QAR','').trim();
    return salary?`${translateNumber(salary,lang)} ${getCurrencySymbol(lang)}`:tr.new;
  },[labor.expected_salary,lang,tr]);
  const displayRating=useMemo(()=>labor.rating?translateNumber(labor.rating,lang):tr.new,[labor.rating,lang,tr]);
  const imageSrc=useMemo(()=>getWebP(labor.photo_url),[labor.photo_url]);

  return(
    <div className="min-w-[200px] max-w-[250px]" style={{transform:'translateZ(0)'}}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-shrink-0">
          <img 
            src={imageSrc} 
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
            loading="lazy" 
            decoding="async"
            onError={(e)=>{(e.target as HTMLImageElement).src='/default-avatar.png'}}
          />
          {labor.is_online&&(
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title={tr.online}/>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate flex items-center gap-1">
            {displayName}
            {labor.is_verified&&<Award size={12} className="text-blue-500 flex-shrink-0"/>}
          </p>
          <p className="text-xs text-gray-500 truncate">{displayCategory}</p>
        </div>
      </div>

      {/* Rating + Location */}
      <div className="flex items-center gap-3 mb-2 text-xs">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-500" fill="#EAB308"/>
          <span className="font-medium">{displayRating}</span>
        </div>
        {labor.city&&(
          <span className="text-gray-400 flex items-center gap-0.5 truncate">
            <MapPin size={10}/>{labor.city}
          </span>
        )}
      </div>

      {/* Salary */}
      <p className="text-sm font-bold text-orange-600 mb-2">💰 {displaySalary}</p>

      {/* Action Buttons */}
      <div className="flex gap-1.5">
        {labor.phone&&(
          <>
            <a 
              href={`https://wa.me/${labor.phone.replace(/[^0-9]/g,'')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium no-underline text-center flex items-center justify-center gap-1 transition-colors active:scale-95"
              title="WhatsApp"
            >
              <MessageCircle size={12}/> WhatsApp
            </a>
            <a 
              href={`tel:${labor.phone}`} 
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium no-underline text-center flex items-center justify-center gap-1 transition-colors active:scale-95"
              title="Call"
            >
              <Phone size={12}/> Call
            </a>
          </>
        )}
        <a 
          href={href} 
          className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium no-underline text-center flex items-center justify-center gap-1 transition-colors active:scale-95"
        >
          <User size={12}/> {tr.viewProfile}
        </a>
      </div>
    </div>
  );
});

MarkerPopup.displayName='MarkerPopup';

export default MarkerPopup;