// components/banner/BannerManager.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {Upload,X,Loader2,CheckCircle,AlertCircle,ImageOff} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{add:'Add',remove:'Remove',available:'Available',occupied:'Occupied',uploading:'Uploading...',error:'Failed to upload',success:'Uploaded!',maxSize:'Max 5MB',supported:'JPG, PNG, WebP'},
  bn:{add:'যোগ করুন',remove:'সরান',available:'খালি',occupied:'দখলকৃত',uploading:'আপলোড হচ্ছে...',error:'আপলোড ব্যর্থ',success:'আপলোড সফল!',maxSize:'সর্বোচ্চ ৫MB',supported:'JPG, PNG, WebP'},
  ar:{add:'إضافة',remove:'إزالة',available:'متاح',occupied:'مشغول',uploading:'جاري الرفع...',error:'فشل الرفع',success:'تم الرفع!',maxSize:'الحد ٥ ميجا',supported:'JPG, PNG, WebP'},
  hi:{add:'जोड़ें',remove:'हटाएं',available:'उपलब्ध',occupied:'भरा हुआ',uploading:'अपलोड हो रहा...',error:'अपलोड विफल',success:'अपलोड सफल!',maxSize:'अधिकतम ५MB',supported:'JPG, PNG, WebP'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={MAX_SIZE_MB:5,MAX_SIZE_BYTES:5*1024*1024,ACCEPT:'image/jpeg,image/png,image/webp'};

// ═══════════════════════════════════════════════════════════
// Banner Slot (Memoized)
// ═══════════════════════════════════════════════════════════
const BannerSlot=React.memo(({banner,lang,onUpload,onRemove}:{
  banner:any;lang:string;onUpload:(slot:number,file:File)=>void;onRemove:(slot:number)=>void;
})=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[uploading,setUploading]=useState(false);
  const[error,setError]=useState('');
  const[imgError,setImgError]=useState(false);

  const handleFile=useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file)return;

    // Validate size
    if(file.size>CONFIG.MAX_SIZE_BYTES){setError(tr.maxSize);return}
    
    // Validate type
    if(!file.type.match(/^image\/(jpeg|png|webp)$/)){setError(tr.supported);return}

    setError('');
    startTransition(()=>setUploading(true));
    onUpload(banner.slot,file);
    // Simulate upload
    setTimeout(()=>startTransition(()=>setUploading(false)),1000);
  },[banner.slot,onUpload,tr]);

  return(
    <div className={`rounded-xl p-2.5 text-center border-2 transition-all ${
      banner.isActive?'bg-green-50 border-green-200':'bg-gray-50 border-gray-200 hover:border-orange-200'
    }`} style={{transform:'translateZ(0)'}}>
      <p className="text-base font-bold text-gray-700 mb-1">#{banner.slot}</p>

      {banner.isActive?(
        <>
          {/* Active Banner */}
          {imgError?(
            <div className="w-full h-12 rounded bg-gray-100 flex items-center justify-center"><ImageOff size={16} className="text-gray-400"/></div>
          ):(
            <img src={banner.imageUrl} alt="" className="w-full h-12 object-cover rounded" loading="lazy" onError={()=>setImgError(true)}/>
          )}
          <p className="text-[9px] text-green-600 truncate mt-1 font-medium">{banner.userId||'User'}</p>
          <button onClick={()=>onRemove(banner.slot)} className="mt-1.5 text-[10px] text-red-500 hover:text-red-700 font-medium transition-colors active:scale-90">
            <X size={10} className="inline mr-0.5"/>{tr.remove}
          </button>
        </>
      ):(
        /* Empty Slot */
        <label className="flex flex-col items-center gap-1 mt-2 cursor-pointer group">
          {uploading?(
            <Loader2 size={18} className="animate-spin text-orange-500"/>
          ):error?(
            <AlertCircle size={18} className="text-red-400"/>
          ):(
            <Upload size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors"/>
          )}
          <span className={`text-[10px] font-medium ${error?'text-red-500':uploading?'text-orange-500':'text-orange-600 group-hover:text-orange-700'}`}>
            {uploading?tr.uploading:error||tr.add}
          </span>
          <input type="file" accept={CONFIG.ACCEPT} onChange={handleFile} className="hidden"/>
        </label>
      )}

      {/* Status */}
      {!banner.isActive&&!uploading&&!error&&(
        <p className="text-[9px] text-gray-400 mt-1">{tr.available}</p>
      )}
      {banner.isActive&&(
        <p className="text-[9px] text-green-500 mt-1 flex items-center justify-center gap-0.5"><CheckCircle size={9}/>{tr.occupied}</p>
      )}
    </div>
  );
});
BannerSlot.displayName='BannerSlot';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{banners:any[];lang?:string;onUpload?:(slot:number,file:File)=>void;onRemove?:(slot:number)=>void}

// ═══════════════════════════════════════════════════════════
// BannerManager (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const BannerManager=React.memo(({banners,lang='en',onUpload,onRemove}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[slots]=useState(banners);

  const handleUpload=useCallback((slot:number,file:File)=>{onUpload?.(slot,file)},[onUpload]);
  const handleRemove=useCallback((slot:number)=>{onRemove?.(slot)},[onRemove]);

  return(
    <div className="grid grid-cols-4 lg:grid-cols-10 gap-2" style={{contain:'layout style paint'}}>
      {slots.map(b=>(
        <BannerSlot key={b.slot} banner={b} lang={lang} onUpload={handleUpload} onRemove={handleRemove}/>
      ))}
    </div>
  );
});

BannerManager.displayName='BannerManager';

export default BannerManager;