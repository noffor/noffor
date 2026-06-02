// components/search/SearchResult.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useState,useMemo,startTransition} from 'react';
import {Star,MapPin,Phone,Briefcase,Award,CheckCircle,Wifi} from 'lucide-react';
import {translateName,translateCategory,translateNumber,getCurrencySymbol} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{online:'Online',offline:'Offline',new:'New',verified:'Verified',viewProfile:'View Profile',years:'yrs',noSalary:'Negotiable'},
  bn:{online:'অনলাইন',offline:'অফলাইন',new:'নতুন',verified:'ভেরিফাইড',viewProfile:'প্রোফাইল দেখুন',years:'বছর',noSalary:'আলোচনা সাপেক্ষ'},
  ar:{online:'متصل',offline:'غير متصل',new:'جديد',verified:'موثق',viewProfile:'عرض الملف',years:'سنوات',noSalary:'قابل للتفاوض'},
  hi:{online:'ऑनलाइन',offline:'ऑफलाइन',new:'नया',verified:'सत्यापित',viewProfile:'प्रोफाइल देखें',years:'साल',noSalary:'बातचीत योग्य'},
};

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ অপ্টিমাইজার
// ═══════════════════════════════════════════════════════════
const getWebP=(url:string):string=>{
  if(!url)return'/default-avatar.png';
  if(url.includes('supabase.co/storage'))return`${url}?width=100&quality=80&format=webp`;
  return url;
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{profile:any;href:string;lang?:string}

// ═══════════════════════════════════════════════════════════
// SearchResult (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const SearchResult=React.memo(({profile,href,lang='en'}:Props)=>{
  const[imgError,setImgError]=useState(false);
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // ট্রান্সলেটেড ভ্যালু
  const displayName=useMemo(()=>translateName(profile.name,lang),[profile.name,lang]);
  const displayCategory=useMemo(()=>translateCategory(profile.category,lang),[profile.category,lang]);
  const displaySalary=useMemo(()=>{
    if(!profile.expected_salary)return tr.noSalary;
    const amount=String(profile.expected_salary).replace(/[^0-9.]/g,'');
    return amount?`${translateNumber(amount,lang)} ${getCurrencySymbol(lang)}`:tr.noSalary;
  },[profile.expected_salary,lang,tr]);
  const displayRating=useMemo(()=>profile.rating?translateNumber(profile.rating,lang):tr.new,[profile.rating,lang,tr]);
  const displayExperience=useMemo(()=>profile.experience?`${profile.experience} ${tr.years}`:null,[profile.experience,tr]);
  const imageSrc=useMemo(()=>imgError?'/default-avatar.png':getWebP(profile.photo_url),[profile.photo_url,imgError]);

  return(
    <a 
      href={href} 
      className="flex items-center gap-3 p-3 bg-white rounded-xl border no-underline hover:shadow-md hover:border-orange-200 transition-all active:scale-[0.99] group"
      style={{transform:'translateZ(0)'}}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img 
          src={imageSrc} 
          alt={displayName} 
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
          loading="lazy" 
          decoding="async"
          onError={()=>startTransition(()=>setImgError(true))}
        />
        {profile.is_online&&(
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" title={tr.online}/>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-orange-600 transition-colors">
            {displayName}
          </h4>
          {profile.is_verified&&<Award size={12} className="text-blue-500 flex-shrink-0"/>}
        </div>
        
        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
          <Briefcase size={10}/>{displayCategory}
        </p>
        
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Rating */}
          <div className="flex items-center gap-0.5">
            <Star size={12} className="text-yellow-500" fill="#EAB308"/>
            <span className="text-xs font-medium">{displayRating}</span>
          </div>
          
          {/* Experience */}
          {displayExperience&&(
            <span className="text-[10px] text-gray-400">{displayExperience}</span>
          )}
          
          {/* Location */}
          {profile.city&&(
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <MapPin size={10}/>{profile.city}
            </span>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-orange-600">{displaySalary}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          {profile.is_online?(
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
              <Wifi size={10}/>{tr.online}
            </span>
          ):(
            <span className="text-[10px] text-gray-400">{tr.offline}</span>
          )}
        </div>
      </div>
    </a>
  );
});

SearchResult.displayName='SearchResult';

export default SearchResult;