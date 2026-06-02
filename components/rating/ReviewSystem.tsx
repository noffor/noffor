// components/rating/ReviewSystem.tsx - TypeScript Error ফিক্সড
"use client";
import React,{useState,useEffect,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {Star,MessageSquare,ThumbsUp,Flag,Loader2,AlertCircle} from 'lucide-react';

const T:Record<string,Record<string,string>>={
  en:{title:'Reviews',noReviews:'No reviews yet',beFirst:'Be the first to review',writeReview:'Write a Review',submit:'Submit',cancel:'Cancel',rating:'Rating',comment:'Comment',helpful:'Helpful',report:'Report',verified:'Verified Hire',yourReview:'Your Review',edit:'Edit',delete:'Delete'},
  bn:{title:'রিভিউ',noReviews:'কোনো রিভিউ নেই',beFirst:'প্রথম রিভিউ দিন',writeReview:'রিভিউ লিখুন',submit:'জমা দিন',cancel:'বাতিল',rating:'রেটিং',comment:'মন্তব্য',helpful:'সহায়ক',report:'রিপোর্ট',verified:'ভেরিফাইড হায়ার',yourReview:'আপনার রিভিউ',edit:'এডিট',delete:'মুছুন'},
  ar:{title:'تقييمات',noReviews:'لا توجد تقييمات',beFirst:'كن أول من يقيم',writeReview:'كتابة تقييم',submit:'إرسال',cancel:'إلغاء',rating:'تقييم',comment:'تعليق',helpful:'مفيد',report:'إبلاغ',verified:'توظيف موثق',yourReview:'تقييمك',edit:'تعديل',delete:'حذف'},
  hi:{title:'समीक्षाएं',noReviews:'कोई समीक्षा नहीं',beFirst:'पहली समीक्षा करें',writeReview:'समीक्षा लिखें',submit:'जमा करें',cancel:'रद्द',rating:'रेटिंग',comment:'टिप्पणी',helpful:'सहायक',report:'रिपोर्ट',verified:'सत्यापित',yourReview:'आपकी समीक्षा',edit:'संपादित',delete:'हटाएं'},
};

const StarRating=React.memo(({rating,onRate,interactive=true}:{rating:number;onRate?:(r:number)=>void;interactive?:boolean})=>(
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(star=>(
      <button key={star} onClick={()=>interactive&&onRate?.(star)} disabled={!interactive}
        className={`transition-all ${interactive?'hover:scale-125 active:scale-90 cursor-pointer':'cursor-default'}`}>
        <Star size={20} className={star<=rating?'text-yellow-500 fill-yellow-500':'text-gray-300'}/>
      </button>
    ))}
  </div>
));
StarRating.displayName='StarRating';

const ReviewCard=React.memo(({review,lang}:{review:any;lang:string})=>{
  const tr=T[lang]||T.en;
  const[helpful,setHelpful]=useState(review.helpful_count||0);
  const[clicked,setClicked]=useState(false);

  const handleHelpful=useCallback(async()=>{
    if(clicked)return;
    setHelpful((p:number)=>p+1);setClicked(true); // ✅ type added
    await supabase.from('reviews').update({helpful_count:helpful+1}).eq('id',review.id);
  },[clicked,helpful,review.id]);

  return(
    <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <img src={review.reviewer_photo||'/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover"/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-800">{review.reviewer_name}</p>
              <StarRating rating={review.rating} interactive={false}/>
            </div>
            <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
          </div>
          {review.comment&&<p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
          <div className="flex items-center gap-3 mt-2">
            <button onClick={handleHelpful} className={`text-xs flex items-center gap-1 ${clicked?'text-green-600':'text-gray-400 hover:text-green-600'}`}><ThumbsUp size={12}/>{helpful>0&&helpful} {tr.helpful}</button>
            <button className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><Flag size={12}/>{tr.report}</button>
          </div>
        </div>
      </div>
    </div>
  );
});
ReviewCard.displayName='ReviewCard';

interface Props{profileId:string;currentUserId?:string;lang:string;canReview?:boolean;bookingId?:string}

export default function ReviewSystem({profileId,currentUserId,lang,canReview,bookingId}:Props){
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[reviews,setReviews]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(false);
  const[showForm,setShowForm]=useState(false);
  const[rating,setRating]=useState(0);
  const[comment,setComment]=useState('');
  const[submitting,setSubmitting]=useState(false);
  const[averageRating,setAverageRating]=useState(0);
  const[totalReviews,setTotalReviews]=useState(0);

  const loadReviews=useCallback(async()=>{
    startTransition(()=>setLoading(true));
    try{
      const{data,count,error:e}=await supabase.from('reviews').select('*',{count:'exact'}).eq('profile_id',profileId).order('created_at',{ascending:false}).limit(20);
      if(e)throw e;
      const result:any[]=data||[];
      const total:number=count||0;
      const avg:number=total>0?result.reduce((s:number,r:any)=>s+(r.rating||0),0)/total:0; // ✅ types added
      startTransition(()=>{setReviews(result);setTotalReviews(total);setAverageRating(Math.round(avg*10)/10);setLoading(false)});
    }catch{startTransition(()=>{setError(true);setLoading(false)})}
  },[profileId]);

  useEffect(()=>{loadReviews()},[loadReviews]);

  const submitReview=useCallback(async()=>{
    if(!rating||!currentUserId)return;
    startTransition(()=>setSubmitting(true));
    try{
      const{error:e}=await supabase.from('reviews').insert({
        profile_id:profileId,reviewer_id:currentUserId,
        rating,comment:comment.trim(),booking_id:bookingId||null,
        reviewer_name:JSON.parse(localStorage.getItem('noffor_user')||'{}')?.name||'User',
        reviewer_photo:JSON.parse(localStorage.getItem('noffor_user')||'{}')?.photo_url||'',
      });
      if(e)throw e;
      startTransition(()=>{setShowForm(false);setRating(0);setComment('')});
      loadReviews();
      await supabase.rpc('update_profile_rating',{profile_id_param:profileId});
    }catch{startTransition(()=>setSubmitting(false))}
  },[rating,comment,profileId,currentUserId,bookingId,loadReviews]);

  if(loading)return(<div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-orange-500"/></div>);
  if(error)return(<div className="text-center py-8"><AlertCircle size={24} className="text-red-400 mx-auto mb-2"/><button onClick={loadReviews} className="text-sm text-orange-600 underline">{tr.cancel}</button></div>);

  return(
    <div className="space-y-4">
      {totalReviews>0&&(
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{averageRating}</p>
            <StarRating rating={Math.round(averageRating)} interactive={false}/>
            <p className="text-xs text-gray-500 mt-1">{totalReviews} {tr.title}</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5,4,3,2,1].map((s:number)=>{ // ✅ type added
              const count:number=reviews.filter((r:any)=>r.rating===s).length; // ✅ type added
              const pct:number=totalReviews>0?(count/totalReviews)*100:0; // ✅ type added
              return(
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right">{s}</span><Star size={10} className="text-yellow-500 fill-yellow-500"/>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{width:`${pct}%`}}/></div>
                  <span className="w-6 text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {canReview&&!showForm&&(
        <button onClick={()=>setShowForm(true)} className="w-full py-3 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"><MessageSquare size={16}/>{tr.writeReview}</button>
      )}
      {showForm&&(
        <div className="bg-white rounded-xl p-4 border shadow-sm animate-slide-up">
          <h4 className="font-semibold text-gray-800 mb-3">{tr.yourReview}</h4>
          <div className="flex justify-center mb-3"><StarRating rating={rating} onRate={setRating}/></div>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder={tr.comment} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none mb-3"/>
          <div className="flex gap-2">
            <button onClick={submitReview} disabled={!rating||submitting} className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">{submitting?<Loader2 size={14} className="animate-spin"/>:null}{tr.submit}</button>
            <button onClick={()=>setShowForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 active:scale-[0.98] transition-all">{tr.cancel}</button>
          </div>
        </div>
      )}
      {reviews.length===0?(
        <div className="text-center py-8"><MessageSquare size={32} className="text-gray-200 mx-auto mb-2"/><p className="text-gray-400 text-sm">{tr.noReviews}</p>{canReview&&<p className="text-xs text-gray-300 mt-1">{tr.beFirst}</p>}</div>
      ):reviews.map((r:any)=><ReviewCard key={r.id} review={r} lang={lang}/>)}
    </div>
  );
}