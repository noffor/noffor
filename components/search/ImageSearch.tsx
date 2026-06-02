// components/search/ImageSearch.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useRef,useState,useCallback,useMemo,startTransition} from 'react';
import {Camera,ImageIcon,X,Loader2,Search,Upload,AlertCircle} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{title:'Search by Image',camera:'Camera',gallery:'Gallery',upload:'Upload',remove:'Remove',searching:'Searching...',dragDrop:'Drag & drop or click to upload',noImage:'No image selected',error:'Failed to process image',retry:'Try Again',supported:'JPG, PNG, WebP (Max 10MB)'},
  bn:{title:'ছবি দিয়ে খুঁজুন',camera:'ক্যামেরা',gallery:'গ্যালারি',upload:'আপলোড',remove:'রিমুভ',searching:'খুঁজছে...',dragDrop:'টেনে আনুন বা ক্লিক করে আপলোড করুন',noImage:'কোনো ছবি নির্বাচিত হয়নি',error:'ছবি প্রক্রিয়া করতে ব্যর্থ',retry:'আবার চেষ্টা',supported:'JPG, PNG, WebP (সর্বোচ্চ ১০MB)'},
  ar:{title:'البحث بالصورة',camera:'كاميرا',gallery:'معرض',upload:'رفع',remove:'إزالة',searching:'جاري البحث...',dragDrop:'اسحب وأفلت أو انقر للرفع',noImage:'لم يتم اختيار صورة',error:'فشل معالجة الصورة',retry:'حاول مرة أخرى',supported:'JPG, PNG, WebP (حد أقصى ١٠ ميجا)'},
  hi:{title:'छवि से खोजें',camera:'कैमरा',gallery:'गैलरी',upload:'अपलोड',remove:'हटाएं',searching:'खोज रहे...',dragDrop:'खींचें और छोड़ें या अपलोड करें',noImage:'कोई छवि नहीं',error:'छवि प्रोसेस विफल',retry:'पुनः प्रयास',supported:'JPG, PNG, WebP (अधिकतम १०MB)'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={MAX_SIZE_MB:10,MAX_SIZE_BYTES:10*1024*1024,ACCEPT:'image/jpeg,image/png,image/webp'};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{lang?:string;onSearch?:(file:File)=>void}

// ═══════════════════════════════════════════════════════════
// ImageSearch (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const ImageSearch=React.memo(({lang='en',onSearch}:Props)=>{
  const cameraRef=useRef<HTMLInputElement>(null);
  const galleryRef=useRef<HTMLInputElement>(null);
  const[preview,setPreview]=useState('');
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[dragging,setDragging]=useState(false);

  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // Handle file selection
  const processFile=useCallback((file:File)=>{
    // Validate size
    if(file.size>CONFIG.MAX_SIZE_BYTES){
      startTransition(()=>setError(`File too large. Max ${CONFIG.MAX_SIZE_MB}MB`));
      return;
    }

    // Validate type
    if(!file.type.match(/^image\/(jpeg|png|webp)$/)){
      startTransition(()=>setError('Unsupported format. Use JPG, PNG, or WebP'));
      return;
    }

    startTransition(()=>{setError('');setLoading(true)});
    
    const url=URL.createObjectURL(file);
    startTransition(()=>setPreview(url));
    
    // Simulate processing
    setTimeout(()=>{
      startTransition(()=>setLoading(false));
      onSearch?.(file);
    },500);
  },[onSearch]);

  const handleFile=useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(file)processFile(file);
  },[processFile]);

  const handleRemove=useCallback(()=>{
    if(preview)URL.revokeObjectURL(preview);
    startTransition(()=>{setPreview('');setError('')});
  },[preview]);

  // Drag & Drop
  const handleDragOver=useCallback((e:React.DragEvent)=>{
    e.preventDefault();
    setDragging(true);
  },[]);
  const handleDragLeave=useCallback((e:React.DragEvent)=>{
    e.preventDefault();
    setDragging(false);
  },[]);
  const handleDrop=useCallback((e:React.DragEvent)=>{
    e.preventDefault();
    setDragging(false);
    const file=e.dataTransfer.files[0];
    if(file)processFile(file);
  },[processFile]);

  return(
    <div className="text-center space-y-3" style={{contain:'layout style paint'}}>
      {/* Title */}
      <h3 className="font-bold text-sm text-gray-700 flex items-center justify-center gap-2">
        <Search size={16} className="text-orange-500"/>
        {tr.title}
      </h3>

      {/* Preview */}
      {preview?(
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-xl border"
          />
          {loading&&(
            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-white"/>
            </div>
          )}
          <button 
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition active:scale-90"
          >
            <X size={16}/>
          </button>
        </div>
      ):(
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={()=>galleryRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragging?'border-orange-500 bg-orange-50':'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <Upload size={32} className={dragging?'text-orange-500':'text-gray-400'}/>
          <p className="text-sm text-gray-500">{tr.dragDrop}</p>
          <p className="text-xs text-gray-400">{tr.supported}</p>
        </div>
      )}

      {/* Error */}
      {error&&(
        <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
          <AlertCircle size={14}/>
          <span>{error}</span>
          <button onClick={handleRemove} className="text-red-600 underline text-xs">{tr.retry}</button>
        </div>
      )}

      {/* Buttons */}
      {!preview&&(
        <div className="flex gap-2">
          <button 
            onClick={()=>cameraRef.current?.click()} 
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold flex flex-col items-center gap-1 hover:shadow-lg active:scale-[0.98] transition-all"
            style={{transform:'translateZ(0)'}}
          >
            <Camera size={22}/>{tr.camera}
          </button>
          <button 
            onClick={()=>galleryRef.current?.click()} 
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold flex flex-col items-center gap-1 hover:shadow-lg active:scale-[0.98] transition-all"
            style={{transform:'translateZ(0)'}}
          >
            <ImageIcon size={22}/>{tr.gallery}
          </button>
        </div>
      )}

      {/* Hidden inputs */}
      <input 
        type="file" 
        accept={CONFIG.ACCEPT} 
        capture="environment" 
        ref={cameraRef} 
        onChange={handleFile} 
        className="hidden" 
      />
      <input 
        type="file" 
        accept={CONFIG.ACCEPT} 
        ref={galleryRef} 
        onChange={handleFile} 
        className="hidden" 
      />
    </div>
  );
});

ImageSearch.displayName='ImageSearch';

export default ImageSearch;