// components/rating/RatingModal.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফুল ফিচার
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {Star,X,Send,Loader2,Smile,Frown,Meh,ThumbsUp} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{rateExperience:'Rate Your Experience',review:'Write a review...',submit:'Submit Rating',thanks:'Thank you for your feedback!',terrible:'Terrible',bad:'Bad',okay:'Okay',good:'Good',excellent:'Excellent',submitting:'Submitting...',error:'Failed to submit',required:'Please select a rating'},
  bn:{rateExperience:'আপনার অভিজ্ঞতা রেট করুন',review:'রিভিউ লিখুন...',submit:'রেটিং জমা দিন',thanks:'আপনার মতামতের জন্য ধন্যবাদ!',terrible:'খারাপ',bad:'ভালো না',okay:'ঠিক আছে',good:'ভালো',excellent:'চমৎকার',submitting:'জমা হচ্ছে...',error:'জমা দিতে ব্যর্থ',required:'একটি রেটিং নির্বাচন করুন'},
  ar:{rateExperience:'قيم تجربتك',review:'اكتب مراجعة...',submit:'إرسال التقييم',thanks:'شكراً على ملاحظاتك!',terrible:'سيء',bad:'غير جيد',okay:'مقبول',good:'جيد',excellent:'ممتاز',submitting:'جاري...',error:'فشل الإرسال',required:'يرجى اختيار تقييم'},
  hi:{rateExperience:'अपना अनुभव रेट करें',review:'समीक्षा लिखें...',submit:'रेटिंग जमा करें',thanks:'आपकी प्रतिक्रिया के लिए धन्यवाद!',terrible:'खराब',bad:'अच्छा नहीं',okay:'ठीक है',good:'अच्छा',excellent:'उत्कृष्ट',submitting:'जमा हो रहा...',error:'जमा करने में विफल',required:'कृपया रेटिंग चुनें'},
};

// ═══════════════════════════════════════════════════════════
// Rating Labels
// ═══════════════════════════════════════════════════════════
const RATING_LABELS=['terrible','bad','okay','good','excellent'];
const RATING_ICONS=[Frown,Meh,Meh,Smile,ThumbsUp];
const RATING_COLORS=['text-red-400','text-orange-400','text-yellow-400','text-lime-400','text-green-400'];

// ═══════════════════════════════════════════════════════════
// Star Button (Memoized)
// ═══════════════════════════════════════════════════════════
const StarButton=React.memo(({star,rating,hoverRating,onClick,onHover,onLeave}:{
  star:number;rating:number;hoverRating:number;
  onClick:()=>void;onHover:()=>void;onLeave:()=>void;
})=>{
  const isActive=(hoverRating||rating)>=star;
  return(
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="p-1 transition-transform hover:scale-125 active:scale-90 focus:scale-110"
      aria-label={`${star} star${star>1?'s':''}`}
    >
      <Star
        size={36}
        className={`transition-all duration-200 ${
          isActive?'fill-yellow-400 text-yellow-400 drop-shadow-lg':'text-gray-300 hover:text-yellow-300'
        }`}
      />
    </button>
  );
});
StarButton.displayName='StarButton';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{
  bookingId:string;
  fromUserId:string;
  toUserId:string;
  lang:string;
  onClose:()=>void;
  onRated:()=>void;
}

// ═══════════════════════════════════════════════════════════
// RatingModal (Memoized)
// ═══════════════════════════════════════════════════════════
const RatingModal=React.memo(({bookingId,fromUserId,toUserId,lang,onClose,onRated}:Props)=>{
  const[rating,setRating]=useState(0);
  const[hoverRating,setHoverRating]=useState(0);
  const[review,setReview]=useState('');
  const[submitting,setSubmitting]=useState(false);
  const[error,setError]=useState('');
  const[submitted,setSubmitted]=useState(false);

  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // Rating label
  const currentLabel=useMemo(()=>{
    const idx=(hoverRating||rating)-1;
    if(idx<0)return'';
    return tr[RATING_LABELS[idx]]||'';
  },[hoverRating,rating,tr]);

  const IconComponent=useMemo(()=>{
    const idx=(hoverRating||rating)-1;
    if(idx<0)return null;
    return RATING_ICONS[idx]||null;
  },[hoverRating,rating]);

  const submitRating=useCallback(async()=>{
    if(rating===0){
      startTransition(()=>setError(tr.required));
      return;
    }
    
    startTransition(()=>{setSubmitting(true);setError('')});

    try{
      const{error:e}=await supabase.from('booking_ratings').insert({
        booking_id:bookingId,
        rating,
        review:review.trim(),
        from_user_id:fromUserId,
        to_user_id:toUserId,
      });

      if(e)throw e;

      startTransition(()=>setSubmitted(true));
      onRated();
      
      // Auto close after 2s
      setTimeout(()=>onClose(),2000);
    }catch(err:any){
      startTransition(()=>setError(err.message||tr.error));
    }
    
    startTransition(()=>setSubmitting(false));
  },[rating,review,bookingId,fromUserId,toUserId,tr,onRated,onClose]);

  // Star handlers
  const handleStarClick=useCallback((star:number)=>startTransition(()=>setRating(star)),[]);
  const handleStarHover=useCallback((star:number)=>setHoverRating(star),[]);
  const handleStarLeave=useCallback(()=>setHoverRating(0),[]);

  // Submitted state
  if(submitted)return(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center animate-scale-in" onClick={e=>e.stopPropagation()}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ThumbsUp size={32} className="text-green-500"/>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">⭐ {tr.thanks}</h3>
        <p className="text-sm text-gray-500">{lang==='bn'?'আপনার রেটিং সফলভাবে জমা হয়েছে':'Your rating has been submitted successfully'}</p>
      </div>
    </div>
  );

  return(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-sm animate-slide-up max-h-[90vh] overflow-y-auto overscroll-contain"
        onClick={e=>e.stopPropagation()}
        style={{transform:'translateZ(0)'}}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Star size={20} className="text-yellow-500 fill-yellow-500"/>
            {tr.rateExperience}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
            <X size={20} className="text-gray-400"/>
          </button>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-2">
          {[1,2,3,4,5].map(star=>(
            <StarButton
              key={star}
              star={star}
              rating={rating}
              hoverRating={hoverRating}
              onClick={()=>handleStarClick(star)}
              onHover={()=>handleStarHover(star)}
              onLeave={handleStarLeave}
            />
          ))}
        </div>

        {/* Rating Label */}
        {currentLabel&&(
          <div className={`text-center mb-3 flex items-center justify-center gap-1.5 ${RATING_COLORS[(hoverRating||rating)-1]||'text-gray-400'}`}>
            {IconComponent&&<IconComponent size={18}/>}
            <span className="text-sm font-semibold">{currentLabel}</span>
          </div>
        )}

        {/* Review Textarea */}
        <textarea
          value={review}
          onChange={e=>startTransition(()=>setReview(e.target.value))}
          placeholder={tr.review}
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none transition-all"
        />
        
        {/* Character count */}
        <p className="text-[10px] text-gray-400 text-right mb-2">{review.length}/500</p>

        {/* Error */}
        {error&&(
          <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
            ⚠️ {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          onClick={submitRating}
          disabled={rating===0||submitting}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm"
          style={{transform:'translateZ(0)'}}
        >
          {submitting?<Loader2 size={16} className="animate-spin"/>:<Send size={16}/>}
          {submitting?tr.submitting:tr.submit}
        </button>
      </div>
    </div>
  );
});

RatingModal.displayName='RatingModal';

export default RatingModal;