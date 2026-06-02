// components/profile/ReviewSection.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফুল ফিচার
"use client";
import React,{useState,useEffect,useRef,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {Star,Loader2,MessageSquare,AlertCircle,RefreshCw,ThumbsUp} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{reviews:'Reviews',noReviews:'No reviews yet',loadMore:'Load more',endOfReviews:'~ end of reviews ~',loading:'Loading reviews...',error:'Failed to load',retry:'Retry',helpful:'Helpful',report:'Report',verified:'Verified Review'},
  bn:{reviews:'রিভিউ',noReviews:'কোনো রিভিউ নেই',loadMore:'আরও দেখুন',endOfReviews:'~ আর কোনো রিভিউ নেই ~',loading:'রিভিউ লোড হচ্ছে...',error:'লোড করতে ব্যর্থ',retry:'আবার চেষ্টা',helpful:'সহায়ক',report:'রিপোর্ট',verified:'ভেরিফাইড রিভিউ'},
  ar:{reviews:'التقييمات',noReviews:'لا توجد تقييمات',loadMore:'تحميل المزيد',endOfReviews:'~ نهاية التقييمات ~',loading:'جاري تحميل التقييمات...',error:'فشل التحميل',retry:'إعادة',helpful:'مفيد',report:'إبلاغ',verified:'تقييم موثق'},
  hi:{reviews:'समीक्षाएं',noReviews:'कोई समीक्षा नहीं',loadMore:'और लोड करें',endOfReviews:'~ समीक्षाओं का अंत ~',loading:'समीक्षाएं लोड हो रही...',error:'लोड विफल',retry:'पुनः प्रयास',helpful:'सहायक',report:'रिपोर्ट',verified:'सत्यापित समीक्षा'},
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={REVIEWS_PER_PAGE:10,CACHE_TTL:30000,RETRY_MAX:2};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Review{
  id:string;reviewer_name:string;reviewer_photo:string;
  rating:number;comment:string;created_at:string;is_verified?:boolean;
  helpful_count?:number;
}
interface Props{profileId:string;lang:string}

// ═══════════════════════════════════════════════════════════
// Review Card (Memoized)
// ═══════════════════════════════════════════════════════════
const ReviewCard=React.memo(({review,tr,isLast,lastRef}:{
  review:Review;tr:Record<string,string>;isLast:boolean;lastRef?:(el:HTMLDivElement|null)=>void;
})=>{
  const dateStr=useMemo(()=>{
    try{return new Date(review.created_at).toLocaleDateString()}catch{return''}
  },[review.created_at]);

  return(
    <div ref={isLast?lastRef:null} className="border-b border-gray-100 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <img
          src={review.reviewer_photo||'/default-avatar.png'}
          alt={review.reviewer_name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-gray-100"
          loading="lazy"
          decoding="async"
          onError={(e)=>{(e.target as HTMLImageElement).src='/default-avatar.png'}}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-gray-800 truncate">
              {review.reviewer_name}
              {review.is_verified&&<span className="ml-1 text-blue-500 text-xs" title={tr.verified}>✓</span>}
            </p>
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{dateStr}</span>
          </div>
          
          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-0.5">
            {[...Array(5)].map((_,i)=>(
              <Star key={i} size={12} className={i<review.rating?'text-yellow-500 fill-yellow-500':'text-gray-300'}/>
            ))}
          </div>
          
          {/* Comment */}
          {review.comment&&<p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>}
          
          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {review.helpful_count!==undefined&&(
              <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                <ThumbsUp size={12}/>{review.helpful_count||0} {tr.helpful}
              </button>
            )}
            <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">{tr.report}</button>
          </div>
        </div>
      </div>
    </div>
  );
});
ReviewCard.displayName='ReviewCard';

// ═══════════════════════════════════════════════════════════
// Skeleton Loader (Memoized)
// ═══════════════════════════════════════════════════════════
const SkeletonReview=React.memo(()=>(
  <div className="border-b border-gray-100 pb-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full"/>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"/>
        <div className="flex gap-1">
          {[...Array(5)].map((_,i)=><div key={i} className="w-3 h-3 bg-gray-200 rounded"/>)}
        </div>
        <div className="h-3 bg-gray-100 rounded w-2/3"/>
      </div>
    </div>
  </div>
));
SkeletonReview.displayName='SkeletonReview';

// ═══════════════════════════════════════════════════════════
// ReviewSection (Memoized • Infinite Scroll • 4 Lang)
// ═══════════════════════════════════════════════════════════
const ReviewSection=React.memo(({profileId,lang}:Props)=>{
  const[reviews,setReviews]=useState<Review[]>([]);
  const[loading,setLoading]=useState(true);
  const[page,setPage]=useState(1);
  const[hasMore,setHasMore]=useState(true);
  const[loadingMore,setLoadingMore]=useState(false);
  const[error,setError]=useState(false);
  const observerRef=useRef<IntersectionObserver|null>(null);
  const lastReviewRef=useRef<HTMLDivElement|null>(null);
  const aliveRef=useRef(true);
  const retryRef=useRef(0);
  const cacheRef=useRef<Map<string,{data:Review[];timestamp:number}>>(new Map());

  const tr=useMemo(()=>T[lang]||T.en,[lang]);

  // Load reviews (cache-first)
  const loadReviews=useCallback(async(reset:boolean=false)=>{
    if(!aliveRef.current)return;
    const cacheKey=`rv:${profileId}:${reset?1:page}`;

    // Cache check
    if(!reset){
      const cached=cacheRef.current.get(cacheKey);
      if(cached&&Date.now()-cached.timestamp<CONFIG.CACHE_TTL){
        startTransition(()=>{
          setReviews(prev=>[...prev,...cached.data]);
          setPage(p=>p+1);
          setHasMore(cached.data.length===CONFIG.REVIEWS_PER_PAGE);
        });
        return;
      }
    }

    if(reset)startTransition(()=>{setLoading(true);setError(false)});
    else startTransition(()=>setLoadingMore(true));

    try{
      const currentPage=reset?1:page;
      const from=(currentPage-1)*CONFIG.REVIEWS_PER_PAGE;
      const to=from+CONFIG.REVIEWS_PER_PAGE-1;

      const{data,error:e}=await supabase
        .from('reviews')
        .select('*')
        .eq('profile_id',profileId)
        .order('created_at',{ascending:false})
        .range(from,to);

      if(e)throw e;
      if(!aliveRef.current)return;

      const result=data||[];
      
      // Cache
      cacheRef.current.set(cacheKey,{data:result,timestamp:Date.now()});

      startTransition(()=>{
        if(reset){setReviews(result);setPage(2)}else{setReviews(prev=>[...prev,...result]);setPage(p=>p+1)}
        setHasMore(result.length===CONFIG.REVIEWS_PER_PAGE);
        setLoading(false);setLoadingMore(false);
      });
      retryRef.current=0;
    }catch{
      if(retryRef.current<CONFIG.RETRY_MAX){retryRef.current++;return loadReviews(reset)}
      if(aliveRef.current)startTransition(()=>{setError(true);setLoading(false);setLoadingMore(false)});
    }
  },[profileId,page]);

  // Initial load
  useEffect(()=>{
    aliveRef.current=true;
    loadReviews(true);
    return()=>{aliveRef.current=false};
  },[profileId]);

  // Infinite scroll
  useEffect(()=>{
    if(!hasMore||loadingMore)return;
    if(observerRef.current)observerRef.current.disconnect();

    observerRef.current=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&hasMore&&!loadingMore&&!loading){
        loadReviews(false);
      }
    },{threshold:0.5});

    if(lastReviewRef.current)observerRef.current.observe(lastReviewRef.current);
    return()=>observerRef.current?.disconnect();
  },[hasMore,loadingMore,loading,loadReviews]);

  // Retry
  const handleRetry=useCallback(()=>{retryRef.current=0;loadReviews(true)},[loadReviews]);

  // Loading
  if(loading)return(
    <div className="space-y-4">
      {[...Array(3)].map((_,i)=><SkeletonReview key={i}/>)}
    </div>
  );

  // Error
  if(error)return(
    <div className="text-center py-8">
      <AlertCircle size={32} className="text-red-400 mx-auto mb-3"/>
      <p className="text-sm text-red-500 mb-3">{tr.error}</p>
      <button onClick={handleRetry} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all inline-flex items-center gap-2">
        <RefreshCw size={14}/>{tr.retry}
      </button>
    </div>
  );

  // Empty
  if(!reviews.length)return(
    <div className="text-center py-8">
      <MessageSquare size={32} className="text-gray-200 mx-auto mb-2"/>
      <p className="text-gray-400 text-sm">{tr.noReviews}</p>
    </div>
  );

  // Render
  return(
    <div className="space-y-1" style={{contain:'layout style paint'}}>
      {reviews.map((review,index)=>(
        <ReviewCard
          key={review.id}
          review={review}
          tr={tr}
          isLast={index===reviews.length-1}
          lastRef={index===reviews.length-1?(el)=>{lastReviewRef.current=el}:undefined}
        />
      ))}
      
      {loadingMore&&<SkeletonReview/>}
      
      {!hasMore&&reviews.length>0&&(
        <p className="text-center text-xs text-gray-300 pt-2">{tr.endOfReviews}</p>
      )}
    </div>
  );
});

ReviewSection.displayName='ReviewSection';

export default ReviewSection;