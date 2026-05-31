"use client";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/config';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Plus, MapPin, Clock, DollarSign, Users, Send, Briefcase, X, Filter, Zap, Building, MessageCircle, Utensils, Phone, CheckCircle, Award, TrendingDown } from 'lucide-react';

// ============ CACHE CONFIG ============
const CACHE_TIME = 30000;
let jobsCache: { data: any[]; timestamp: number; country: string } = { data: [], timestamp: 0, country: '' };

// ============ MEMOIZED CATEGORIES ============
const CATEGORY_LIST = [
  { key: 'all', icon: Filter, name: 'All' },
  { key: 'Driver', icon: Users, name: 'Driver' },
  { key: 'Electrician', icon: Zap, name: 'Electrician' },
  { key: 'Plumber', icon: Users, name: 'Plumber' },
  { key: 'Mason', icon: Building, name: 'Mason' },
  { key: 'AC Technician', icon: Users, name: 'AC Technician' },
  { key: 'Painter', icon: Users, name: 'Painter' },
  { key: 'Carpenter', icon: Users, name: 'Carpenter' },
];

// ============ TRANSLATIONS ============
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    live_bidding: "Live Bidding", post_job: "Post Job", active_jobs: "Active", total_posted: "Total", today_new: "Today",
    all: "All", driver: "Driver", electric: "Electrician", plumber: "Plumber", mason: "Mason",
    ac_tech: "AC Tech", painter: "Painter", carpenter: "Carpenter",
    no_active_jobs: "No active jobs", post_first_job: "Post First Job",
    bid_now: "Bid Now", workers: "workers", bids: "Bids", any_location: "Any", qar: "QAR", whatsapp: "WhatsApp",
    post_a_job: "Post a Job", job_title: "Job Title *", select_category: "Select Category *",
    min_budget: "Min (QAR)", max_budget: "Max (QAR)", location_area: "Location / Area",
    workers_needed: "Workers", company_name: "Company", contact_phone: "Phone *",
    job_description: "Description...", duty_time: "Duty Time", meal_provided: "Meal Provided",
    place_your_bid: "Place Your Bid", your_price: "Your Price (QAR) *", why_you: "Why you?",
    submit_bid: "Submit Bid", open: "OPEN", required: "Title, Category & Phone required",
    bid_amount: "Enter bid amount", posted: "Job Posted!", bid_success: "Bid Placed Successfully!",
    lowest: "Lowest Bid", close: "Close", no_bids_yet: "No bids yet", be_first: "Be the first to bid!",
    posting: "Posting...", submitting: "Submitting...", employer: "Employer", login_required: "Enter phone number to bid",
    phone_label: "Your Phone Number", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ Your bid has been placed", lowest_bid: "🔥 Lowest Bid", call: "Call", 
    bid_history: "Bid History", total_bids: "Total Bids", contact_employer: "Contact Employer",
    bid_amount_label: "Your Bid Amount", your_message: "Your Message (Optional)",
  },
  bn: {
    live_bidding: "লাইভ বিডিং", post_job: "জব পোস্ট", active_jobs: "সক্রিয়", total_posted: "মোট", today_new: "আজ",
    all: "সব", driver: "ড্রাইভার", electric: "ইলেকট্রিশিয়ান", plumber: "প্লাম্বার", mason: "মিস্ত্রি",
    ac_tech: "এসি টেক", painter: "পেইন্টার", carpenter: "কার্পেন্টার",
    no_active_jobs: "কোনো জব নেই", post_first_job: "প্রথম জব পোস্ট",
    bid_now: "বিড করুন", workers: "শ্রমিক", bids: "বিড", any_location: "যে কোনো", qar: "রিয়াল", whatsapp: "হোয়াটসঅ্যাপ",
    post_a_job: "জব পোস্ট", job_title: "শিরোনাম *", select_category: "ক্যাটাগরি *",
    min_budget: "ন্যূনতম", max_budget: "সর্বোচ্চ", location_area: "অবস্থান",
    workers_needed: "শ্রমিক", company_name: "কোম্পানি", contact_phone: "ফোন *",
    job_description: "বিবরণ...", duty_time: "ডিউটি সময়", meal_provided: "খাবার দেয়া হবে",
    place_your_bid: "বিড দিন", your_price: "আপনার মূল্য *", why_you: "আপনি কেন?",
    submit_bid: "জমা দিন", open: "খোলা", required: "শিরোনাম, ক্যাটাগরি ও ফোন আবশ্যক",
    bid_amount: "বিড মূল্য দিন", posted: "জব পোস্ট হয়েছে!", bid_success: "আপনার বিড সফলভাবে প্লেস হয়েছে!",
    lowest: "সর্বনিম্ন বিড", close: "বন্ধ", no_bids_yet: "কোনো বিড নেই", be_first: "প্রথম বিড করুন!",
    posting: "পোস্ট হচ্ছে...", submitting: "জমা হচ্ছে...", employer: "নিয়োগকর্তা", login_required: "বিড করতে ফোন নম্বর দিন",
    phone_label: "আপনার ফোন নম্বর", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ আপনার বিড প্লেস হয়েছে", lowest_bid: "🔥 সর্বনিম্ন বিড", call: "কল করুন",
    bid_history: "বিড ইতিহাস", total_bids: "মোট বিড", contact_employer: "নিয়োগকর্তার সাথে যোগাযোগ",
    bid_amount_label: "আপনার বিডের মূল্য", your_message: "আপনার বার্তা (ঐচ্ছিক)",
  },
  ar: {
    live_bidding: "المزايدة", post_job: "نشر", active_jobs: "نشط", total_posted: "المجموع", today_new: "اليوم",
    all: "الكل", driver: "سائق", electric: "كهربائي", plumber: "سباك", mason: "بناء",
    ac_tech: "تكييف", painter: "دهان", carpenter: "نجار",
    no_active_jobs: "لا وظائف", post_first_job: "انشر الأول",
    bid_now: "زايد", workers: "عمال", bids: "عروض", any_location: "أي", qar: "ر.ق", whatsapp: "واتساب",
    post_a_job: "نشر وظيفة", job_title: "المسمى *", select_category: "الفئة *",
    min_budget: "الحد الأدنى", max_budget: "الأقصى", location_area: "الموقع",
    workers_needed: "عمال", company_name: "شركة", contact_phone: "هاتف *",
    job_description: "وصف...", duty_time: "الدوام", meal_provided: "وجبات",
    place_your_bid: "زايد", your_price: "سعرك *", why_you: "لماذا أنت؟",
    submit_bid: "إرسال", open: "مفتوح", required: "المسمى والفئة والهاتف مطلوب",
    bid_amount: "أدخل المبلغ", posted: "تم النشر!", bid_success: "تم تقديم عرضك بنجاح!",
    lowest: "أقل عرض", close: "إغلاق", no_bids_yet: "لا عروض", be_first: "كن الأول!",
    posting: "جاري النشر...", submitting: "جاري الإرسال...", employer: "صاحب العمل", login_required: "أدخل رقم الهاتف للمزايدة",
    phone_label: "رقم هاتفك", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ تم تقديم عرضك", lowest_bid: "🔥 أقل عرض", call: "اتصل",
    bid_history: "تاريخ العروض", total_bids: "إجمالي العروض", contact_employer: "اتصال بصاحب العمل",
    bid_amount_label: "مبلغ عرضك", your_message: "رسالتك (اختياري)",
  },
  hi: {
    live_bidding: "लाइव बिडिंग", post_job: "जॉब पोस्ट", active_jobs: "सक्रिय", total_posted: "कुल", today_new: "आज",
    all: "सभी", driver: "ड्राइवर", electric: "इलेक्ट्रीशियन", plumber: "प्लंबर", mason: "मिस्त्री",
    ac_tech: "एसी टेक", painter: "पेंटर", carpenter: "कारपेंटर",
    no_active_jobs: "कोई जॉब नहीं", post_first_job: "पहली जॉब",
    bid_now: "बिड करें", workers: "श्रमिक", bids: "बिड", any_location: "कोई", qar: "रियाल", whatsapp: "व्हाट्सएप",
    post_a_job: "जॉब पोस्ट", job_title: "शीर्षक *", select_category: "श्रेणी *",
    min_budget: "न्यूनतम", max_budget: "अधिकतम", location_area: "स्थान",
    workers_needed: "श्रमिक", company_name: "कंपनी", contact_phone: "फ़ोन *",
    job_description: "विवरण...", duty_time: "ड्यूटी", meal_provided: "भोजन",
    place_your_bid: "बिड दें", your_price: "कीमत *", why_you: "आप क्यों?",
    submit_bid: "जमा करें", open: "खुला", required: "शीर्षक, श्रेणी और फ़ोन ज़रूरी",
    bid_amount: "राशि डालें", posted: "पोस्ट हो गया!", bid_success: "आपकी बिड सफलतापूर्वक लग गई!",
    lowest: "सबसे कम बिड", close: "बंद", no_bids_yet: "कोई बिड नहीं", be_first: "पहली बिड करें!",
    posting: "पोस्ट हो रहा...", submitting: "जमा हो रहा...", employer: "नियोक्ता", login_required: "बिड करने के लिए फ़ोन नंबर दें",
    phone_label: "आपका फ़ोन नंबर", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ आपकी बिड लग गई", lowest_bid: "🔥 सबसे कम बिड", call: "कॉल करें",
    bid_history: "बिड इतिहास", total_bids: "कुल बिड", contact_employer: "नियोक्ता से संपर्क करें",
    bid_amount_label: "आपकी बिड राशि", your_message: "आपका संदेश (वैकल्पिक)",
  },
};

function getTranslations(lang: string) {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

// ============ BID WORKER CARD ============
const BidWorkerCard = ({ bid, isLowest, lang, onContact }: { bid: any; isLowest: boolean; lang: string; onContact: (phone: string) => void }) => {
  const tr = useMemo(() => getTranslations(lang), [lang]);
  
  return (
    <div className={`rounded-xl p-3 transition-all hover:shadow-md ${isLowest ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isLowest ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            <span className="text-xs font-bold">{bid.amount}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">
              {bid.labor_phone || bid.labor_id?.substring(0, 10) || 'Worker'}
            </p>
            <p className="text-xs text-gray-500 truncate">{bid.message || 'No message'}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button 
            onClick={() => onContact(bid.labor_phone || bid.labor_id)}
            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            title={tr.whatsapp}
          >
            <MessageCircle size={14} />
          </button>
          <button 
            onClick={() => onContact(bid.labor_phone || bid.labor_id)}
            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            title={tr.call}
          >
            <Phone size={14} />
          </button>
        </div>
      </div>
      {isLowest && (
        <div className="mt-1">
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Award size={10} /> {tr.lowest}
          </span>
        </div>
      )}
    </div>
  );
};

// ============ JOB CARD COMPONENT ============
const JobCard = ({ job, lang, onBid, onViewBids, userPhone }: { job: any; lang: string; onBid: (job: any) => void; onViewBids: (job: any) => void; userPhone: string | null }) => {
  const tr = useMemo(() => getTranslations(lang), [lang]);
  const hasUserBid = job.user_bid;
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-3 lg:p-4 border-b bg-gradient-to-r from-green-50/50 to-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Briefcase size={16} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm lg:text-base truncate">{job.title}</h3>
              <p className="text-xs text-green-600 font-medium">{job.category}</p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{tr.open}</span>
            {job.worker_count > 1 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                {job.worker_count} {tr.workers}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 lg:p-4">
        <div className="grid grid-cols-2 gap-1.5 lg:gap-2 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1 truncate"><MapPin size={12} className="flex-shrink-0" /> <span className="truncate">{job.location || tr.any_location}</span></div>
          <div className="flex items-center gap-1"><DollarSign size={12} className="flex-shrink-0" /> {job.budget_min || 0}-{job.budget_max || 0} {tr.qar}</div>
          <div className="flex items-center gap-1"><Clock size={12} className="flex-shrink-0" /> {new Date(job.created_at).toLocaleDateString()}</div>
          <div className="flex items-center gap-1"><Users size={12} className="flex-shrink-0" /> {job.bid_count || 0} {tr.bids}</div>
          {job.duty_time && (
            <div className="flex items-center gap-1 col-span-2"><Clock size={12} className="text-green-600 flex-shrink-0" /> <span className="font-medium truncate">{tr.duty_time}: {job.duty_time}</span></div>
          )}
          {job.meal_provided && (
            <div className="flex items-center gap-1 col-span-2"><Utensils size={12} className="text-orange-500 flex-shrink-0" /> <span className="font-medium text-orange-600">{tr.meal_provided}</span></div>
          )}
        </div>

        {job.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{job.description}</p>
        )}

        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50/80 rounded-lg">
          <Building size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{job.employer_name || tr.employer}</span>
          <a href={`https://wa.me/${job.employer_phone}`} target="_blank" rel="noopener noreferrer" 
             className="ml-auto text-xs text-green-600 flex items-center gap-1 hover:text-green-800 flex-shrink-0">
            <MessageCircle size={12} /> {tr.whatsapp}
          </a>
        </div>

        {hasUserBid && (
          <div className="mb-2 p-1.5 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-[10px] text-green-600 flex items-center gap-1">
              <CheckCircle size={10} /> {tr.your_bid_placed}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => onBid(job)} 
            className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-colors">
            {tr.bid_now}
          </button>
          <button onClick={() => onViewBids(job)} 
            className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 active:bg-gray-300 transition-colors">
            <Users size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ SKELETON CARD ============
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
    <div className="flex gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="h-3 bg-gray-100 rounded" />
      <div className="h-3 bg-gray-100 rounded" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-1/2" />
  </div>
);

// ============ MAIN PAGE COMPONENT ============
export default function BidPage() {
  const params = useParams();
  const router = useRouter();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const tr = useMemo(() => getTranslations(lang), [lang]);

  // State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showBidForm, setShowBidForm] = useState<any>(null);
  const [showBids, setShowBids] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, open: 0, todayNew: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [bidList, setBidList] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [workerCount, setWorkerCount] = useState('1');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [dutyTime, setDutyTime] = useState('');
  const [mealProvided, setMealProvided] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMsg, setBidMsg] = useState('');

  // Load user phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('labor_phone');
    setUserPhone(savedPhone);
  }, []);

  // ============ DATA FETCHING ============
  const loadJobs = useCallback(async (force = false) => {
    if (!force && jobsCache.country === country && Date.now() - jobsCache.timestamp < CACHE_TIME) {
      setJobs(jobsCache.data);
      updateStats(jobsCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: jobsData, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('country', country)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id);
        
        // Get bid counts and user bids
        const { data: allBids } = await supabase
          .from('bids')
          .select('job_id, labor_phone')
          .in('job_id', jobIds);

        const countMap: Record<string, number> = {};
        const userBidMap: Record<string, boolean> = {};
        
        allBids?.forEach(b => {
          countMap[b.job_id] = (countMap[b.job_id] || 0) + 1;
          if (userPhone && b.labor_phone === userPhone) {
            userBidMap[b.job_id] = true;
          }
        });

        const enriched = jobsData.map(job => ({ 
          ...job, 
          bid_count: countMap[job.id] || 0,
          user_bid: userBidMap[job.id] || false
        }));
        
        jobsCache = { data: enriched, timestamp: Date.now(), country };
        setJobs(enriched);
        updateStats(enriched);
      } else {
        setJobs([]);
        updateStats([]);
      }
    } catch (err) {
      console.error('Load error:', err);
      setJobs([]);
    }
    setLoading(false);
  }, [country, userPhone]);

  const updateStats = (data: any[]) => {
    const today = new Date().toDateString();
    setStats({
      total: data.length,
      open: data.filter(j => j.status === 'open').length,
      todayNew: data.filter(j => new Date(j.created_at).toDateString() === today).length,
    });
  };

  // ============ LOAD BIDS FOR MODAL ============
  const loadBidsForJob = useCallback(async (jobId: string) => {
    setLoadingBids(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('job_id', jobId)
        .order('amount', { ascending: true });
      
      if (error) throw error;
      setBidList(data || []);
    } catch (err) {
      console.error('Load bids error:', err);
      setBidList([]);
    }
    setLoadingBids(false);
  }, []);

  // ============ REALTIME ============
  useEffect(() => {
    loadJobs(true);
    
    let throttleTimer: NodeJS.Timeout;
    
    const channel = supabase
      .channel('bid-realtime-' + country)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'job_posts', filter: `country=eq.${country}` }, 
        () => {
          clearTimeout(throttleTimer);
          throttleTimer = setTimeout(() => loadJobs(true), 1000);
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bids' }, 
        () => {
          clearTimeout(throttleTimer);
          throttleTimer = setTimeout(() => loadJobs(true), 1000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(throttleTimer);
      supabase.removeChannel(channel);
    };
  }, [country, loadJobs]);

  // ============ POST JOB ============
  const postJob = useCallback(async () => {
    if (!title.trim() || !category || !phone.trim()) {
      alert(tr.required);
      return;
    }
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from('job_posts').insert({
        title: title.trim(),
        category,
        budget_min: parseInt(budgetMin) || 0,
        budget_max: parseInt(budgetMax) || 0,
        location: location.trim(),
        description: desc.trim(),
        country,
        employer_phone: phone.trim(),
        employer_name: company.trim() || 'Employer',
        worker_count: parseInt(workerCount) || 1,
        duty_time: dutyTime.trim() || null,
        meal_provided: mealProvided,
        status: 'open',
        profile_language: lang
      });

      if (error) throw error;

      alert(tr.posted);
      setShowPostForm(false);
      resetForm();
      loadJobs(true);
    } catch (err: any) {
      console.error('Post job error:', err);
      alert(err.message || 'Failed to post job');
    }
    setSubmitting(false);
  }, [title, category, budgetMin, budgetMax, location, desc, country, phone, company, workerCount, dutyTime, mealProvided, submitting, tr, loadJobs, lang]);

  const resetForm = () => {
    setTitle(''); setCategory(''); setBudgetMin(''); setBudgetMax('');
    setLocation(''); setDesc(''); setPhone(''); setCompany(''); setWorkerCount('1');
    setDutyTime(''); setMealProvided(false);
  };

  // ============ PLACE BID ============
  const placeBid = useCallback(async (jobId: string) => {
    if (!bidAmount.trim()) {
      alert(tr.bid_amount);
      return;
    }
    
    let laborPhone = userPhone;
    if (!laborPhone) {
      laborPhone = prompt(tr.phone_label, '+880');
      if (laborPhone && laborPhone.length > 5) {
        localStorage.setItem('labor_phone', laborPhone);
        setUserPhone(laborPhone);
      } else {
        alert(tr.login_required);
        return;
      }
    }
    
    if (submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('bids').insert({
        job_id: jobId,
        labor_id: laborPhone,
        labor_phone: laborPhone,
        amount: parseInt(bidAmount) || 0,
        message: bidMsg.trim() || 'I am interested in this job',
        status: 'pending'
      });

      if (error) throw error;

      setBidSuccess(`Your bid of ${bidAmount} QAR has been placed!`);
      setTimeout(() => setBidSuccess(null), 3000);
      
      alert(tr.bid_success);
      setShowBidForm(null);
      setBidAmount('');
      setBidMsg('');
      loadJobs(true);
    } catch (err: any) {
      console.error('Bid error:', err);
      alert(err.message || 'Failed to place bid');
    }
    setSubmitting(false);
  }, [bidAmount, bidMsg, submitting, tr, loadJobs, userPhone]);

  // ============ CONTACT HANDLER ============
  const handleContact = (phone: string) => {
    if (phone) {
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  // ============ FILTERED JOBS ============
  const filteredJobs = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter(j => j.category === filter);
  }, [jobs, filter]);

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      
      <div className="max-w-5xl mx-auto px-3 lg:px-4 py-3 lg:py-4">
        
        {/* Bid Success Notification */}
        {bidSuccess && (
          <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            {bidSuccess}
          </div>
        )}
        
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-4 lg:p-5 mb-4 text-white shadow-lg shadow-green-500/10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg lg:text-2xl font-bold flex items-center gap-2">
              <Zap size={22} className="text-yellow-300" />
              {tr.live_bidding}
            </h1>
            <button 
              onClick={() => setShowPostForm(true)} 
              className="px-3 lg:px-4 py-2 bg-white text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
            >
              <Plus size={16} /> {tr.post_job}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:gap-3 text-center">
            {[
              { value: stats.open, label: tr.active_jobs },
              { value: stats.total, label: tr.total_posted },
              { value: `+${stats.todayNew}`, label: tr.today_new },
            ].map((stat, i) => (
              <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl p-2 lg:p-3">
                <p className="text-xl lg:text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs opacity-80 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORY_LIST.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`flex-shrink-0 rounded-xl px-3 py-2 text-center text-xs font-medium transition-all duration-200 ${
                filter === cat.key 
                  ? 'bg-green-600 text-white shadow-md scale-105' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50 active:bg-green-100'
              }`}
            >
              <cat.icon size={14} className="mx-auto mb-0.5" />
              {tr[cat.key === 'AC Technician' ? 'ac_tech' : cat.key === 'Electrician' ? 'electric' : cat.name?.toLowerCase() as keyof typeof tr] || cat.name}
            </button>
          ))}
        </div>
        {/* Job Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Briefcase size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">{tr.no_active_jobs}</p>
            <button onClick={() => setShowPostForm(true)} 
              className="mt-4 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-colors">
              {tr.post_first_job}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                lang={lang}
                userPhone={userPhone}
                onBid={setShowBidForm} 
                onViewBids={(job) => {
                  setShowBids(job);
                  loadBidsForJob(job.id);
                }} 
              />
            ))}
          </div>
        )}

        {/* ============ POST JOB MODAL ============ */}
        {showPostForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPostForm(false)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <Briefcase size={20} className="text-green-600" /> {tr.post_a_job}
                </h2>
                <button onClick={() => setShowPostForm(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-2.5">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder={tr.job_title} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                
                <select value={category} onChange={e => setCategory(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white">
                  <option value="">{tr.select_category}</option>
                  {siteConfig.categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
                
                <div className="grid grid-cols-2 gap-2">
                  <input value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder={tr.min_budget} type="number"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  <input value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder={tr.max_budget} type="number"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                </div>
                
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder={tr.location_area}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                
                <div className="grid grid-cols-2 gap-2">
                  <input value={dutyTime} onChange={e => setDutyTime(e.target.value)} placeholder={tr.duty_time}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <input type="checkbox" checked={mealProvided} onChange={e => setMealProvided(e.target.checked)} className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-gray-600 text-xs">{tr.meal_provided}</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input value={workerCount} onChange={e => setWorkerCount(e.target.value)} placeholder={tr.workers_needed} type="number"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  <input value={company} onChange={e => setCompany(e.target.value)} placeholder={tr.company_name}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                </div>
                
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={tr.contact_phone} type="tel"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder={tr.job_description} rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none" />
                
                <button onClick={postJob} disabled={submitting}
                  className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {submitting ? tr.posting : tr.post_job}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ BID MODAL ============ */}
        {showBidForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowBidForm(null)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 lg:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-gray-800">{tr.place_your_bid}</h2>
                <button onClick={() => setShowBidForm(null)} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-100">
                <p className="font-semibold text-sm text-gray-800">{showBidForm.title}</p>
                <p className="text-xs text-gray-500">{showBidForm.category} • {showBidForm.location || tr.any_location}</p>
                <p className="text-xs text-green-600 font-semibold mt-1">{showBidForm.budget_min || 0}-{showBidForm.budget_max || 0} {tr.qar}</p>
                {showBidForm.duty_time && <p className="text-xs text-gray-500 mt-1">🕐 {showBidForm.duty_time}</p>}
                {showBidForm.meal_provided && <p className="text-xs text-orange-600 mt-1">🍽️ {tr.meal_provided}</p>}
              </div>
              
              <label className="text-xs font-medium text-gray-700 mb-1 block">{tr.bid_amount_label}</label>
              <input value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder={tr.your_price} type="number"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
              
              <label className="text-xs font-medium text-gray-700 mb-1 block">{tr.your_message}</label>
              <textarea value={bidMsg} onChange={e => setBidMsg(e.target.value)} placeholder={tr.why_you} rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none" />
              
              <button onClick={() => placeBid(showBidForm.id)} disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all">
                <Send size={16} /> {submitting ? tr.submitting : tr.submit_bid}
              </button>
              
              {!userPhone && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  📱 {tr.login_required}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============ BIDS LIST MODAL - Grid View with Contact ============ */}
        {showBids && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => { setShowBids(null); setBidList([]); }}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 lg:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  {tr.bid_history}
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    {bidList.length} {tr.total_bids}
                  </span>
                </h2>
                <button onClick={() => { setShowBids(null); setBidList([]); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Job Info */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 mb-4 border border-gray-100">
                <p className="font-semibold text-sm text-gray-800">{showBids.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{showBids.category}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{showBids.location || tr.any_location}</span>
                </div>
                <p className="text-xs text-green-600 font-semibold mt-1">
                  {showBids.budget_min || 0} - {showBids.budget_max || 0} {tr.qar}
                </p>
              </div>

              {/* Contact Employer Button */}
              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-2">{tr.contact_employer}</p>
                <div className="flex gap-2">
                  <a href={`https://wa.me/${showBids.employer_phone}`} target="_blank" rel="noopener noreferrer" 
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition">
                    <MessageCircle size={16} /> {tr.whatsapp}
                  </a>
                  <a href={`tel:${showBids.employer_phone}`} 
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition">
                    <Phone size={16} /> {tr.call}
                  </a>
                </div>
              </div>

              {/* Bids List - Grid View */}
              {loadingBids ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bidList.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">{tr.no_bids_yet}</p>
                  <p className="text-gray-300 text-xs mt-1">{tr.be_first}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mb-2 pb-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <TrendingDown size={12} /> {bidList.length} {tr.bids} • {tr.lowest_bid}: {Math.min(...bidList.map(b => b.amount))} {tr.qar}
                    </p>
                  </div>
                  {bidList.map((bid, index) => (
                    <BidWorkerCard 
                      key={bid.id} 
                      bid={bid} 
                      isLowest={index === 0}
                      lang={lang}
                      onContact={handleContact}
                    />
                  ))}
                </div>
      
              )}

              <button 
                onClick={() => { setShowBids(null); setBidList([]); }}
                className="w-full mt-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors sticky bottom-0"
              >
                {tr.close}
              </button>
            </div>
          </div>
        )}

      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}