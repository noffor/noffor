// components/profile/WorkPhotos.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {getText,LangCode} from '@/lib/language';
import {ImageOff,Expand,Loader2,X} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{workPhotos:'Work Photos',noPhotos:'No work photos',viewAll:'View All',close:'Close'},
  bn:{workPhotos:'কাজের ছবি',noPhotos:'কোনো কাজের ছবি নেই',viewAll:'সব দেখুন',close:'বন্ধ'},
  ar:{workPhotos:'صور العمل',noPhotos:'لا توجد صور عمل',viewAll:'عرض الكل',close:'إغلاق'},
  hi:{workPhotos:'काम की तस्वीरें',noPhotos:'कोई काम की तस्वीर नहीं',viewAll:'सभी देखें',close:'बंद करें'},
};

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ অপ্টিমাইজার
// ═══════════════════════════════════════════════════════════
const getWebP=(url:string,w=400):string=>{
  if(!url)return'';
  if(url.includes('supabase.co/storage'))return`${url}?width=${w}&quality=80&format=webp`;
  return url;
};

// ═══════════════════════════════════════════════════════════
// Photo Item (Memoized)
// ═══════════════════════════════════════════════════════════
const PhotoItem=React.memo(({photo,index,lang,onClick}:{
  photo:string;index:number;lang:string;onClick:()=>void;
})=>{
  const[loaded,setLoaded]=useState(false);
  const[error,setError]=useState(false);
  const t=useMemo(()=>(key:string)=>getText(lang as LangCode,key),[lang]);
  const src=useMemo(()=>getWebP(photo,400),[photo]);

  if(error)return(
    <div className="w-full h-24 lg:h-32 bg-gray-100 rounded-lg flex items-center justify-center">
      <ImageOff size={20} className="text-gray-300"/>
    </div>
  );

  return(
    <div className="relative group cursor-pointer" onClick={onClick}>
      {!loaded&&(
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <Loader2 size={16} className="animate-spin text-gray-400"/>
        </div>
      )}
      <img
        src={src}
        alt={`${t('workPhotos')} ${index+1}`}
        className={`w-full h-24 lg:h-32 object-cover rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02] ${loaded?'opacity-100':'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={()=>startTransition(()=>setLoaded(true))}
        onError={()=>startTransition(()=>setError(true))}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
        <Expand size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"/>
      </div>
    </div>
  );
});
PhotoItem.displayName='PhotoItem';

// ═══════════════════════════════════════════════════════════
// Fullscreen Modal (Memoized)
// ═══════════════════════════════════════════════════════════
const FullscreenModal=React.memo(({photo,lang,onClose}:{
  photo:string;lang:string;onClose:()=>void;
})=>{
  const t=useMemo(()=>(key:string)=>getText(lang as LangCode,key),[lang]);
  const src=useMemo(()=>getWebP(photo,1200),[photo]);

  return(
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl hover:scale-110 transition z-10 p-2">
        <X size={28}/>
      </button>
      <button onClick={onClose} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm hover:bg-white/30 transition">
        {T[lang]?.close||'Close'}
      </button>
      <img src={src} alt={t('workPhotos')} className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl" onClick={e=>e.stopPropagation()}/>
    </div>
  );
});
FullscreenModal.displayName='FullscreenModal';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{photos:string[];lang?:string}

// ═══════════════════════════════════════════════════════════
// WorkPhotos (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const WorkPhotos=React.memo(({photos,lang='en'}:Props)=>{
  const[fullscreen,setFullscreen]=useState<number|null>(null);
  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  const handleOpen=useCallback((index:number)=>startTransition(()=>setFullscreen(index)),[]);
  const handleClose=useCallback(()=>startTransition(()=>setFullscreen(null)),[]);

  if(!photos?.length)return(
    <div className="text-center py-6">
      <ImageOff size={28} className="text-gray-200 mx-auto mb-2"/>
      <p className="text-gray-400 text-sm">{tr.noPhotos}</p>
    </div>
  );

  return(
    <div style={{contain:'layout style paint'}}>
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0,6).map((photo,i)=>(
          <PhotoItem key={i} photo={photo} index={i} lang={lang} onClick={()=>handleOpen(i)}/>
        ))}
      </div>

      {/* View All button */}
      {photos.length>6&&(
        <button onClick={()=>handleOpen(0)} className="mt-2 w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 active:scale-[0.98] transition-all">
          {tr.viewAll} ({photos.length})
        </button>
      )}

      {/* Fullscreen Modal */}
      {fullscreen!==null&&photos[fullscreen]&&(
        <FullscreenModal photo={photos[fullscreen]} lang={lang} onClose={handleClose}/>
      )}
    </div>
  );
});

WorkPhotos.displayName='WorkPhotos';

export default WorkPhotos;