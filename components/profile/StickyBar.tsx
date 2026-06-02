// components/profile/StickyBar.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useMemo} from 'react';
import {MessageCircle,Phone,Briefcase} from 'lucide-react';
import {getText,LangCode} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{whatsapp:'WhatsApp',call:'Call',jobOffer:'Job Offer'},
  bn:{whatsapp:'হোয়াটসঅ্যাপ',call:'কল',jobOffer:'জব অফার'},
  ar:{whatsapp:'واتساب',call:'اتصال',jobOffer:'عرض عمل'},
  hi:{whatsapp:'व्हाट्सएप',call:'कॉल',jobOffer:'जॉब ऑफर'},
};

// ═══════════════════════════════════════════════════════════
// Button Component (Memoized)
// ═══════════════════════════════════════════════════════════
const ActionButton=React.memo(({href,onClick,color,icon:Icon,label,target}:{
  href?:string;onClick?:()=>void;color:string;icon:any;label:string;target?:string;
})=>{
  const className=`flex-1 ${color} text-white py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-1.5 no-underline hover:shadow-lg active:scale-[0.97] transition-all`;

  if(href){
    return(
      <a href={href} target={target} rel={target==='_blank'?'noopener noreferrer':undefined} className={className} style={{transform:'translateZ(0)'}}>
        <Icon size={16}/>{label}
      </a>
    );
  }

  return(
    <button onClick={onClick} className={className} style={{transform:'translateZ(0)'}}>
      <Icon size={16}/>{label}
    </button>
  );
});
ActionButton.displayName='ActionButton';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{
  phone:string;
  lang?:string;
  onJobOffer?:()=>void;
}

// ═══════════════════════════════════════════════════════════
// StickyBar (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const StickyBar=React.memo(({phone,lang='en',onJobOffer}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // Phone check
  if(!phone||phone==='undefined'||phone==='null')return null;

  // Clean phone number
  const cleanPhone=phone.replace(/[^0-9+]/g,'');

  return(
    <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-gray-100 shadow-2xl z-50"
      style={{paddingBottom:'env(safe-area-inset-bottom,0px)',transform:'translateZ(0)'}}>
      <div className="flex gap-2 p-2 max-w-lg mx-auto">
        <ActionButton
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          color="bg-green-600 hover:bg-green-700"
          icon={MessageCircle}
          label={tr.whatsapp}
        />
        <ActionButton
          href={`tel:${cleanPhone}`}
          color="bg-blue-600 hover:bg-blue-700"
          icon={Phone}
          label={tr.call}
        />
        <ActionButton
          onClick={onJobOffer}
          color="bg-orange-600 hover:bg-orange-700"
          icon={Briefcase}
          label={tr.jobOffer}
        />
      </div>
    </div>
  );
});

StickyBar.displayName='StickyBar';

export default StickyBar;