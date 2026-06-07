// components/category/ProfileCard.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
// ✅ Photo Filter Fixed • WebP Optimized
import React,{useState,useMemo,startTransition} from 'react';
import {Star,MapPin,Briefcase,Award,Wifi} from 'lucide-react';
import {translateName,translateCategory,translateNumber,getCurrencySymbol} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{online:'Online',offline:'Offline',featured:'Featured',new:'New',nego:'Negotiable',verified:'Verified'},
  bn:{online:'অনলাইন',offline:'অফলাইন',featured:'ফিচার্ড',new:'নতুন',nego:'আলোচনা সাপেক্ষ',verified:'ভেরিফাইড'},
  ar:{online:'متصل',offline:'غير متصل',featured:'مميز',new:'جديد',nego:'قابل للتفاوض',verified:'موثق'},
  hi:{online:'ऑनलाइन',offline:'ऑफलाइन',featured:'फीचर्ड',new:'नया',nego:'बातचीत योग्य',verified:'सत्यापित'},
};

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ with Bad URL Filter
// ═══════════════════════════════════════════════════════════
const getWebP=(url:string):string=>{
  // ✅ Null, empty, bad URLs filter
  if(!url || url==='/avatar.png' || url==='/default-avatar.png' || url==='')return '';
  if(url.includes('supabase.co/storage'))return`${url}?width=400&quality=80&format=webp`;
  return url;
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{profile:any;href:string;lang?:string}

// ═══════════════════════════════════════════════════════════
// ProfileCard (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const ProfileCard=React.memo(({profile,href,lang='en'}:Props)=>{
  const[imgLoaded,setImgLoaded]=useState(false);
  const[imgError,setImgError]=useState(false);
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // ট্রান্সলেটেড ভ্যালু
  const displayName=useMemo(()=>translateName(profile.name,lang),[profile.name,lang]);
  const displayCategory=useMemo(()=>translateCategory(profile.category,lang),[profile.category,lang]);
  const displaySalary=useMemo(()=>{
    if(!profile.expected_salary)return tr.nego;
    const amount=String(profile.expected_salary).replace(/[^0-9.]/g,'');
    return amount?`${translateNumber(amount,lang)} ${getCurrencySymbol(lang)}`:tr.nego;
  },[profile.expected_salary,lang,tr]);
  const displayRating=useMemo(()=>profile.rating?translateNumber(profile.rating,lang):tr.new,[profile.rating,lang,tr]);
  
  // ✅ Fixed: Smart image source with fallback
  const imageSrc=useMemo(()=>{
    if(imgError)return'/default-avatar.png';
    const webpUrl=getWebP(profile.photo_url);
    return webpUrl || '/default-avatar.png'; // getWebP returns '' for bad URLs
  },[profile.photo_url,imgError]);

  return(
    <a href={href} className="bg-white rounded-xl border overflow-hidden no-underline hover:shadow-lg transition-all active:scale-[0.98] block group" style={{transform:'translateZ(0)'}}>
      {/* Image */}
      <div className="relative h-40 bg-gray-200 overflow-hidden">
        {!imgLoaded&&!imgError&&<div className="absolute inset-0 bg-gray-200 animate-pulse"/>}
        <img 
          src={imageSrc} 
          alt={displayName} 
          className={`w-full h-40 object-cover transition-opacity duration-300 ${imgLoaded?'opacity-100':'opacity-0'}`} 
          loading="lazy" 
          decoding="async" 
          onLoad={()=>startTransition(()=>setImgLoaded(true))} 
          onError={()=>startTransition(()=>setImgError(true))}
        />
        {/* Badges */}
        {profile.is_online&&<span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Wifi size={10}/>{tr.online}</span>}
        {profile.is_featured&&<span className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full">⭐ {tr.featured}</span>}
        {profile.is_verified&&<Award size={14} className="absolute bottom-2 right-2 text-blue-500 bg-white rounded-full p-0.5"/>}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-orange-600 transition-colors">{displayName}</h4>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Briefcase size={10}/>{displayCategory}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-0.5"><Star size={14} className="text-yellow-500" fill="#EAB308"/><span className="text-xs font-semibold">{displayRating}</span></div>
          {profile.city&&<span className="text-[10px] text-gray-400 flex items-center gap-0.5"><MapPin size={10}/>{profile.city}</span>}
        </div>
        <p className="text-sm font-bold text-orange-600 mt-1.5">💰 {displaySalary}</p>
      </div>
    </a>
  );
});

ProfileCard.displayName='ProfileCard';

export default ProfileCard;