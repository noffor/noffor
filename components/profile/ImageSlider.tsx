// components/profile/ImageSlider.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ফুল ফিচার
"use client";
import React,{useState,useEffect,useCallback,useMemo,useRef,startTransition} from 'react';
import {ChevronLeft,ChevronRight,ImageOff,Expand,ZoomIn} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ অপ্টিমাইজার
// ═══════════════════════════════════════════════════════════
const getWebP=(url:string,w=800):string=>{
  if(!url)return'';
  if(url.includes('supabase.co/storage'))return`${url}?width=${w}&quality=85&format=webp`;
  if(url.includes('cloudinary.com'))return url.replace('/upload/',`/upload/w_${w},q_85,f_webp/`);
  return url;
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{
  images:string[];
  autoPlay?:boolean;
  showThumbnails?:boolean;
  height?:string;
}

// ═══════════════════════════════════════════════════════════
// ImageSlider (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const ImageSlider=React.memo(({images,autoPlay=true,showThumbnails=true,height='h-64 lg:h-96'}:Props)=>{
  const valid=useMemo(()=>images.filter(Boolean),[images]);
  const[current,setCurrent]=useState(0);
  const[loaded,setLoaded]=useState<Record<number,boolean>>({});
  const[fullscreen,setFullscreen]=useState(false);
  const touchStartX=useRef(0);
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null);

  // Optimized images
  const optimizedImages=useMemo(()=>valid.map(img=>getWebP(img,800)),[valid]);
  const thumbnailImages=useMemo(()=>valid.map(img=>getWebP(img,200)),[valid]);

  // Auto play
  useEffect(()=>{
    if(!autoPlay||valid.length<=1)return;
    intervalRef.current=setInterval(()=>{
      startTransition(()=>setCurrent(p=>(p+1)%valid.length));
    },5000);
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current)};
  },[valid.length,autoPlay]);

  // Pause on hover
  const handleMouseEnter=useCallback(()=>{
    if(intervalRef.current)clearInterval(intervalRef.current);
  },[]);
  const handleMouseLeave=useCallback(()=>{
    if(!autoPlay||valid.length<=1)return;
    intervalRef.current=setInterval(()=>{
      startTransition(()=>setCurrent(p=>(p+1)%valid.length));
    },5000);
  },[valid.length,autoPlay]);

  // Navigation
  const goTo=useCallback((index:number)=>startTransition(()=>setCurrent(index)),[]);
  const goNext=useCallback(()=>startTransition(()=>setCurrent(p=>(p+1)%valid.length)),[valid.length]);
  const goPrev=useCallback(()=>startTransition(()=>setCurrent(p=>(p-1+valid.length)%valid.length)),[valid.length]);

  // Touch swipe
  const handleTouchStart=useCallback((e:React.TouchEvent)=>{touchStartX.current=e.touches[0].clientX},[]);
  const handleTouchEnd=useCallback((e:React.TouchEvent)=>{
    const diff=touchStartX.current-e.changedTouches[0].clientX;
    if(Math.abs(diff)>50)diff>0?goNext():goPrev();
  },[goNext,goPrev]);

  // Keyboard
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.key==='ArrowLeft')goPrev();
      if(e.key==='ArrowRight')goNext();
      if(e.key==='Escape')setFullscreen(false);
    };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[goNext,goPrev]);

  // Image load tracking
  const handleImageLoad=useCallback((index:number)=>{
    startTransition(()=>setLoaded(p=>({...p,[index]:true})));
  },[]);

  // Empty state
  if(!valid.length)return(
    <div className={`w-full ${height} bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2`}>
      <ImageOff size={40}/>
      <p className="text-sm">No Images Available</p>
    </div>
  );

  const sliderContent=(
    <div 
      className={`relative w-full ${height} rounded-xl overflow-hidden group bg-gray-900`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{transform:'translateZ(0)'}}
    >
      {/* Main Image */}
      <img
        src={optimizedImages[current]}
        alt={`Image ${current+1}`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded[current]?'opacity-100':'opacity-0'}`}
        loading={current===0?'eager':'lazy'}
        decoding="async"
        onLoad={()=>handleImageLoad(current)}
        onError={(e)=>{(e.target as HTMLImageElement).src='/default-avatar.png'}}
      />

      {/* Loading placeholder */}
      {!loaded[current]&&(
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"/>
        </div>
      )}

      {/* Navigation Arrows */}
      {valid.length>1&&(
        <>
          <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90 backdrop-blur-sm" aria-label="Previous image">
            <ChevronLeft size={20}/>
          </button>
          <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90 backdrop-blur-sm" aria-label="Next image">
            <ChevronRight size={20}/>
          </button>
        </>
      )}

      {/* Fullscreen button */}
      <button onClick={()=>setFullscreen(true)} className="absolute top-2 right-2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90 backdrop-blur-sm">
        <Expand size={14}/>
      </button>

      {/* Counter */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
        {current+1}/{valid.length}
      </div>

      {/* Dots */}
      {valid.length>1&&(
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {valid.map((_,i)=>(
            <button key={i} onClick={()=>goTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i===current?'bg-white w-6':'bg-white/50 w-2 hover:bg-white/70'}`} aria-label={`Go to image ${i+1}`}/>
          ))}
        </div>
      )}
    </div>
  );

  return(
    <div style={{contain:'layout style paint'}}>
      {/* Main Slider */}
      {sliderContent}

      {/* Thumbnails */}
      {showThumbnails&&valid.length>1&&(
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
          {valid.slice(0,6).map((_,i)=>(
            <button
              key={i}
              onClick={()=>goTo(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                i===current?'border-orange-500 ring-2 ring-orange-200':'border-transparent hover:border-gray-300'
              }`}
              style={{transform:'translateZ(0)'}}
            >
              <img
                src={thumbnailImages[i]}
                alt={`Thumbnail ${i+1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreen&&(
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={()=>setFullscreen(false)}>
          <button onClick={()=>setFullscreen(false)} className="absolute top-4 right-4 text-white text-2xl hover:scale-110 transition z-10">✕</button>
          <button onClick={goPrev} className="absolute left-4 text-white hover:scale-110 transition z-10"><ChevronLeft size={40}/></button>
          <img src={optimizedImages[current]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={e=>e.stopPropagation()}/>
          <button onClick={goNext} className="absolute right-4 text-white hover:scale-110 transition z-10"><ChevronRight size={40}/></button>
          <div className="absolute bottom-4 text-white text-sm">{current+1}/{valid.length}</div>
        </div>
      )}
    </div>
  );
});

ImageSlider.displayName='ImageSlider';

export default ImageSlider;