// app/[country]/[lang]/dashboard/employer/page.tsx
// 🚀 SUPER SONIC • EMPLOYER DASHBOARD • 42 CATEGORIES • HOME SERVICE • FULL FIXED
"use client";
import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { 
  BarChart3, Edit, Eye, Heart, Bell, Settings, Star, Phone, Briefcase, 
  Plus, Search, MapPin, Clock, DollarSign, User, Trash2, LogOut, Save, 
  X, Check, Globe, MessageCircle, Award, TrendingUp, Filter, 
  Download, Share2, AlertTriangle, Building2, Mail, ChevronRight,
  Camera, Info, Send, Home, Building, Users, Wrench
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
type TabKey = 'overview' | 'jobs' | 'post' | 'saved' | 'alerts' | 'settings' | 'inbox' | 'analytics';
type JobStatus = 'open' | 'closed' | 'filled' | 'expired';

interface JobPost {
  id: string; title: string; category: string; budget_min: number; budget_max: number;
  location: string; description: string; phone: string; worker_count: number;
  employer_phone: string; employer_name: string; status: JobStatus; country: string;
  created_at: string; expires_at: string; bids: { count: number }[]; views: number;
  job_location_type?: string; home_address?: string; office_address?: string;
  city?: string; area?: string;
}

interface Message {
  id: string; from_id: string; to_id: string; message: string;
  is_read: boolean; created_at: string; sender_name: string; sender_photo: string;
}

interface Bid {
  id: string; job_id: string; worker_id: string; worker_name: string;
  worker_photo: string; worker_rating: number; offered_amount: number;
  message: string; status: 'pending' | 'accepted' | 'rejected'; created_at: string;
}

interface Worker {
  id: string; name: string; category: string; photo_url: string; rating: number;
  expected_salary: number; experience: number; city: string;
  is_verified: boolean; online: boolean;
}

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const LANG: Record<string, Record<string, string>> = {
  en: {
    dashboard:'Dashboard',overview:'Overview',jobs:'My Jobs',post:'Post Job',
    saved:'Saved',alerts:'Alerts',settings:'Settings',inbox:'Inbox',
    analytics:'Analytics',search:'Search Workers',logout:'Logout',
    activeJobs:'Active Jobs',totalBids:'Total Bids',profileViews:'Profile Views',
    totalSpent:'Total Spent',noData:'No data found',posted:'Job posted!',
    delete:'Delete',save:'Save',cancel:'Cancel',edit:'Edit Job',
    close:'Close Job',bids:'Bids',message:'Message',hire:'Hire',
    verified:'Verified',online:'Online',offline:'Offline',employer:'Employer',
    companyName:'Company Name',industry:'Industry',contactPerson:'Contact Person',
    officeAddress:'Office Address',website:'Website',phone:'Phone',email:'Email',
    language:'Language',editProfile:'Edit Profile',saveProfile:'Save Profile',
    profileSaved:'Profile saved!',photoUpdated:'Photo updated!',coverUpdated:'Cover updated!',
    uploadFailed:'Upload failed',jobUpdated:'Job updated!',jobDeleted:'Job deleted',
    jobClosed:'Job closed',jobOpened:'Job opened',messageSent:'Message sent!',
    bidAccepted:'Bid accepted!',linkCopied:'Link copied!',recentJobs:'Recent Jobs',
    jobPerformance:'Job Performance',totalViews:'Total Views',hiredWorkers:'Hired',
    incomingBids:'Incoming Bids',accept:'Accept',view:'View',msg:'Msg',
    dangerZone:'Danger Zone',deleteAccount:'Delete Account',
    deleteAccountConfirm:'Are you sure?',all:'All',open:'Open',filled:'Filled',
    closed:'Closed',newest:'Newest',oldest:'Oldest',budgetHigh:'Budget High',
    budgetLow:'Budget Low',unread:'unread',noMessages:'No messages',
    postJobTitle:'Post a New Job',jobTitle:'Job Title *',category:'Category *',
    budgetMin:'Min Budget',budgetMax:'Max Budget',location:'Location',
    workersNeeded:'Workers Needed',expiresIn:'Expires In',description:'Description',
    postJob:'Post Job',posting:'Posting...',editJobTitle:'Edit Job',
    updateJob:'Update Job',noJobs:'No jobs',noBids:'No bids',
    noSaved:'No saved workers',noAlerts:'No notifications',
    loading:'Loading...',redirecting:'Redirecting...',share:'Share',
    filter:'Filter',sort:'Sort',newJob:'New Job',profile:'Profile',
    searchWorkers:'Search Workers',searchPlaceholder:'Search by name, category...',
    searching:'Searching...',messageTo:'Message to',typeMessage:'Type...',
    send:'Send',sending:'Sending...',viewProfile:'View Profile',
    recentActivity:'Recent Activity',selectCategory:'Select Category *',
    days3:'3 days',days7:'7 days',days14:'14 days',days30:'30 days',
    error:'Error',retry:'Retry',
    // ✅ Home Service
    jobLocationType:'Job Location Type',
    office:'🏢 Office / Company',
    home:'🏠 Home / Villa / Domestic',
    both:'🏢🏠 Both Office & Home',
    homeAddress:'Home / Villa Address',
    officeAddressField:'Office / Company Address',
    city:'City',area:'Area / Neighborhood',
    selectCity:'Select City *',
    benefits:'Benefits',
    accommodation:'Accommodation',
    food:'Food',transport:'Transport',
    medical:'Medical',ticket:'Ticket',simCard:'SIM Card',
  },
  bn: {
    dashboard:'ড্যাশবোর্ড',overview:'ওভারভিউ',jobs:'আমার জব',post:'জব পোস্ট',
    saved:'সেভ',alerts:'এলার্ট',settings:'সেটিংস',inbox:'ইনবক্স',
    analytics:'অ্যানালিটিক্স',search:'শ্রমিক খুঁজুন',logout:'লগআউট',
    activeJobs:'সক্রিয় জব',totalBids:'মোট বিড',profileViews:'প্রোফাইল ভিউ',
    totalSpent:'মোট খরচ',noData:'কোনো ডাটা নেই',posted:'জব পোস্ট হয়েছে!',
    delete:'ডিলিট',save:'সেভ',cancel:'বাতিল',edit:'এডিট',
    close:'ক্লোজ',bids:'বিড',message:'মেসেজ',hire:'হায়ার',
    verified:'ভেরিফাইড',online:'অনলাইন',offline:'অফলাইন',employer:'নিয়োগকর্তা',
    companyName:'কোম্পানি',industry:'শিল্প',contactPerson:'যোগাযোগ',
    officeAddress:'অফিস',website:'ওয়েবসাইট',phone:'ফোন',email:'ইমেইল',
    language:'ভাষা',editProfile:'এডিট',saveProfile:'সেভ',
    profileSaved:'সেভ হয়েছে!',photoUpdated:'ছবি আপডেট!',coverUpdated:'কভার আপডেট!',
    uploadFailed:'আপলোড ব্যর্থ',jobUpdated:'জব আপডেট!',jobDeleted:'জব ডিলিট',
    jobClosed:'জব ক্লোজ',jobOpened:'জব ওপেন',messageSent:'মেসেজ পাঠানো!',
    bidAccepted:'বিড গ্রহণ!',linkCopied:'লিংক কপি!',recentJobs:'সাম্প্রতিক জব',
    jobPerformance:'পারফরম্যান্স',totalViews:'মোট ভিউ',hiredWorkers:'নিয়োগ',
    incomingBids:'আসন্ন বিড',accept:'গ্রহণ',view:'দেখুন',msg:'মেসেজ',
    dangerZone:'বিপদ',deleteAccount:'অ্যাকাউন্ট ডিলিট',
    deleteAccountConfirm:'নিশ্চিত?',all:'সব',open:'খোলা',filled:'পূর্ণ',
    closed:'বন্ধ',newest:'নতুন',oldest:'পুরাতন',budgetHigh:'বেশি বাজেট',
    budgetLow:'কম বাজেট',unread:'অপঠিত',noMessages:'কোনো মেসেজ নেই',
    postJobTitle:'নতুন জব',jobTitle:'জবের শিরোনাম *',category:'ক্যাটাগরি *',
    budgetMin:'ন্যূনতম',budgetMax:'সর্বোচ্চ',location:'অবস্থান',
    workersNeeded:'শ্রমিক',expiresIn:'মেয়াদ',description:'বিবরণ',
    postJob:'পোস্ট',posting:'পোস্ট...',editJobTitle:'এডিট',
    updateJob:'আপডেট',noJobs:'কোনো জব নেই',noBids:'কোনো বিড নেই',
    noSaved:'কোনো সেভ নেই',noAlerts:'কোনো নোটিফিকেশন নেই',
    loading:'লোড...',redirecting:'রিডাইরেক্ট...',share:'শেয়ার',
    filter:'ফিল্টার',sort:'সাজান',newJob:'নতুন',profile:'প্রোফাইল',
    searchWorkers:'শ্রমিক খুঁজুন',searchPlaceholder:'নাম, ক্যাটাগরি...',
    searching:'খোঁজা...',messageTo:'মেসেজ',typeMessage:'লিখুন...',
    send:'পাঠান',sending:'পাঠানো...',viewProfile:'প্রোফাইল',
    recentActivity:'সাম্প্রতিক',selectCategory:'ক্যাটাগরি *',
    days3:'৩ দিন',days7:'৭ দিন',days14:'১৪ দিন',days30:'৩০ দিন',
    error:'ত্রুটি',retry:'পুনরায়',
    jobLocationType:'কাজের স্থান',
    office:'🏢 অফিস / কোম্পানি',
    home:'🏠 বাসা / ভিলা / গৃহকর্ম',
    both:'🏢🏠 অফিস ও বাসা উভয়',
    homeAddress:'বাসা / ভিলার ঠিকানা',
    officeAddressField:'অফিস / কোম্পানির ঠিকানা',
    city:'শহর',area:'এলাকা',
    selectCity:'শহর নির্বাচন *',
    benefits:'সুবিধা',
    accommodation:'থাকা',food:'খাবার',transport:'পরিবহন',
    medical:'চিকিৎসা',ticket:'টিকেট',simCard:'সিম কার্ড',
  },
  ar: {
    dashboard:'لوحة التحكم',overview:'نظرة عامة',jobs:'وظائفي',post:'نشر',
    saved:'محفوظ',alerts:'تنبيهات',settings:'إعدادات',inbox:'وارد',
    analytics:'تحليلات',search:'بحث',logout:'خروج',
    activeJobs:'نشطة',totalBids:'عروض',profileViews:'مشاهدات',
    totalSpent:'المبلغ',noData:'لا بيانات',posted:'تم النشر!',
    delete:'حذف',save:'حفظ',cancel:'إلغاء',edit:'تعديل',
    close:'إغلاق',bids:'عروض',message:'رسالة',hire:'توظيف',
    verified:'موثق',online:'متصل',offline:'غير متصل',employer:'صاحب عمل',
    companyName:'الشركة',industry:'صناعة',contactPerson:'اتصال',
    officeAddress:'عنوان',website:'موقع',phone:'هاتف',email:'بريد',
    language:'لغة',editProfile:'تعديل',saveProfile:'حفظ',
    profileSaved:'تم!',photoUpdated:'تم!',coverUpdated:'تم!',
    uploadFailed:'فشل',jobUpdated:'تم!',jobDeleted:'تم',
    jobClosed:'مغلق',jobOpened:'مفتوح',messageSent:'تم!',
    bidAccepted:'تم!',linkCopied:'تم!',recentJobs:'حديثة',
    jobPerformance:'أداء',totalViews:'مشاهدات',hiredWorkers:'عمال',
    incomingBids:'عروض',accept:'قبول',view:'عرض',msg:'رسالة',
    dangerZone:'خطر',deleteAccount:'حذف',deleteAccountConfirm:'متأكد؟',
    all:'الكل',open:'مفتوح',filled:'مكتمل',closed:'مغلق',
    newest:'الأحدث',oldest:'الأقدم',budgetHigh:'الأعلى',budgetLow:'الأقل',
    unread:'غير مقروء',noMessages:'لا رسائل',
    postJobTitle:'نشر وظيفة',jobTitle:'العنوان *',category:'فئة *',
    budgetMin:'الحد الأدنى',budgetMax:'الأقصى',location:'موقع',
    workersNeeded:'عمال',expiresIn:'ينتهي',description:'وصف',
    postJob:'نشر',posting:'جاري...',editJobTitle:'تعديل',
    updateJob:'تحديث',noJobs:'لا وظائف',noBids:'لا عروض',
    noSaved:'لا محفوظات',noAlerts:'لا تنبيهات',
    loading:'جاري...',redirecting:'تحويل...',share:'مشاركة',
    filter:'تصفية',sort:'ترتيب',newJob:'جديد',profile:'ملف',
    searchWorkers:'بحث',searchPlaceholder:'اسم، فئة...',
    searching:'بحث...',messageTo:'رسالة',typeMessage:'اكتب...',
    send:'إرسال',sending:'جاري...',viewProfile:'ملف',
    recentActivity:'نشاط',selectCategory:'اختر *',
    days3:'٣ أيام',days7:'٧ أيام',days14:'١٤ يوم',days30:'٣٠ يوم',
    error:'خطأ',retry:'إعادة',
    jobLocationType:'مكان العمل',
    office:'🏢 مكتب / شركة',
    home:'🏠 منزل / فيلا',
    both:'🏢🏠 كلاهما',
    homeAddress:'عنوان المنزل',
    officeAddressField:'عنوان المكتب',
    city:'مدينة',area:'منطقة',
    selectCity:'اختر المدينة *',
    benefits:'مزايا',
    accommodation:'سكن',food:'طعام',transport:'نقل',
    medical:'طبي',ticket:'تذكرة',simCard:'شريحة',
  },
  hi: {
    dashboard:'डैशबोर्ड',overview:'अवलोकन',jobs:'जॉब्स',post:'पोस्ट',
    saved:'सहेजा',alerts:'अलर्ट',settings:'सेटिंग्स',inbox:'इनबॉक्स',
    analytics:'एनालिटिक्स',search:'खोजें',logout:'लॉगआउट',
    activeJobs:'सक्रिय',totalBids:'बोलियां',profileViews:'व्यू',
    totalSpent:'खर्च',noData:'कोई डेटा नहीं',posted:'पोस्ट हो गया!',
    delete:'हटाएं',save:'सहेजें',cancel:'रद्द',edit:'एडिट',
    close:'बंद',bids:'बोलियां',message:'संदेश',hire:'किराए',
    verified:'सत्यापित',online:'ऑनलाइन',offline:'ऑफलाइन',employer:'नियोक्ता',
    companyName:'कंपनी',industry:'उद्योग',contactPerson:'संपर्क',
    officeAddress:'कार्यालय',website:'वेबसाइट',phone:'फोन',email:'ईमेल',
    language:'भाषा',editProfile:'एडिट',saveProfile:'सेव',
    profileSaved:'सेव!',photoUpdated:'फोटो!',coverUpdated:'कवर!',
    uploadFailed:'फेल',jobUpdated:'अपडेट!',jobDeleted:'डिलीट',
    jobClosed:'बंद',jobOpened:'खुला',messageSent:'भेजा!',
    bidAccepted:'स्वीकार!',linkCopied:'कॉपी!',recentJobs:'हाल की',
    jobPerformance:'प्रदर्शन',totalViews:'व्यू',hiredWorkers:'कर्मचारी',
    incomingBids:'बोलियां',accept:'स्वीकार',view:'देखें',msg:'संदेश',
    dangerZone:'खतरा',deleteAccount:'हटाएं',deleteAccountConfirm:'सुनिश्चित?',
    all:'सब',open:'खुला',filled:'भरा',closed:'बंद',
    newest:'नया',oldest:'पुराना',budgetHigh:'अधिक',budgetLow:'कम',
    unread:'अपठित',noMessages:'कोई संदेश नहीं',
    postJobTitle:'नई जॉब',jobTitle:'शीर्षक *',category:'श्रेणी *',
    budgetMin:'न्यूनतम',budgetMax:'अधिकतम',location:'स्थान',
    workersNeeded:'श्रमिक',expiresIn:'समाप्ति',description:'विवरण',
    postJob:'पोस्ट',posting:'पोस्टिंग...',editJobTitle:'एडिट',
    updateJob:'अपडेट',noJobs:'कोई जॉब नहीं',noBids:'कोई बोली नहीं',
    noSaved:'कोई सेव नहीं',noAlerts:'कोई अलर्ट नहीं',
    loading:'लोड...',redirecting:'रीडायरेक्ट...',share:'शेयर',
    filter:'फिल्टर',sort:'क्रम',newJob:'नई',profile:'प्रोफाइल',
    searchWorkers:'खोजें',searchPlaceholder:'नाम, श्रेणी...',
    searching:'खोज...',messageTo:'संदेश',typeMessage:'लिखें...',
    send:'भेजें',sending:'भेज...',viewProfile:'प्रोफाइल',
    recentActivity:'गतिविधि',selectCategory:'श्रेणी *',
    days3:'३ दिन',days7:'७ दिन',days14:'१४ दिन',days30:'३० दिन',
    error:'त्रुटि',retry:'पुनः',
    jobLocationType:'काम की जगह',
    office:'🏢 ऑफिस / कंपनी',
    home:'🏠 घर / विला',
    both:'🏢🏠 दोनों',
    homeAddress:'घर का पता',
    officeAddressField:'ऑफिस का पता',
    city:'शहर',area:'इलाका',
    selectCity:'शहर चुनें *',
    benefits:'सुविधाएं',
    accommodation:'रहना',food:'खाना',transport:'परिवहन',
    medical:'चिकित्सा',ticket:'टिकट',simCard:'सिम कार्ड',
  },
};

// ═══════════════════════════════════════════════════════════
// Optimized Image
// ═══════════════════════════════════════════════════════════
const OptimizedImage = memo(({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => { setImgSrc(src); }, [src]);
  return <img src={imgSrc} alt={alt} className={className} loading="lazy" onError={() => setImgSrc('/default-avatar.png')} />;
});
OptimizedImage.displayName = 'OptimizedImage';

// ═══════════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════════
const Toast = memo(({ toast, onClose }: { toast: any; onClose: () => void }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  if (!toast) return null;
  const colors: Record<string, string> = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-full text-sm shadow-lg text-white ${colors[toast.type]}`}>{toast.message}</div>
    </div>
  );
});
Toast.displayName = 'Toast';

// ═══════════════════════════════════════════════════════════
// ৪২ ক্যাটাগরি
// ═══════════════════════════════════════════════════════════
const MAIN_CATEGORIES = [
  'Driver','Electrician','Plumber','Mason','AC Technician',
  'Painter','Carpenter','Welder','Cleaner','Cook','Helper','Gardener',
];

const OTHER_CATEGORIES = [
  'Housemaid','Nanny','Office Assistant','Receptionist','Salesman',
  'Cashier','Security Guard','Nurse','Pharmacist','Lab Technician',
  'Physiotherapist','Mechanic','Tailor','Barista','Photographer',
  'CCTV Technician','Gypsum Carpenter','Tiles Mason','Blacksmith',
  'General Labour','Steel Fixer','Scaffolder','Heavy Driver',
  'Forklift Operator','Crane Operator','Pipe Fitter','Waiter',
  'Hotel Housekeeping','Beautician','Barber',
];

// ═══════════════════════════════════════════════════════════
// Middle East Cities
// ═══════════════════════════════════════════════════════════
const CITIES: Record<string, string[]> = {
  qa: ['Doha','Al Wakrah','Al Rayyan','Al Khor','Lusail','Mesaieed'],
  sa: ['Riyadh','Jeddah','Mecca','Medina','Dammam','Khobar'],
  ae: ['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah'],
  kw: ['Kuwait City','Hawalli','Salmiya','Fahaheel'],
  om: ['Muscat','Salalah','Sohar','Nizwa'],
  bh: ['Manama','Riffa','Muharraq','Hamad Town'],
};

// ═══════════════════════════════════════════════════════════
// MAIN EMPLOYER DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function EmployerDashboard() {
  const params = useParams();
  const country = (params as any)?.country || 'qa';
  const lang = (params as any)?.lang || 'en';
  const router = useRouter();
  
  const t = useCallback((key: string) => LANG[lang]?.[key] || LANG.en[key] || key, [lang]);
  
  // State
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  
  // Post Form State
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    title:'',category:'',selectedOtherCategory:'',budget_min:'',budget_max:'',
    location:'',description:'',phone:'',worker_count:'1',expires_in:'7',
    job_location_type:'office',home_address:'',office_address:'',
    city:'',area:'',
  });
  const [posting, setPosting] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Edit Job
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<'all'|'open'|'closed'|'filled'>('all');
  const [sortBy, setSortBy] = useState<'newest'|'oldest'|'budget_high'|'budget_low'>('newest');
  
  // Message
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Analytics
  const [analytics, setAnalytics] = useState({ totalViews:0,totalBids:0,hiredWorkers:0,totalSpent:0 });
  
  // Profile
  const [photoUploading, setPhotoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const mountedRef = useRef(true);
  const lockRef = useRef(false);
  
  const showToast = useCallback((message:string,type:'success'|'error'|'info')=>{
    setToast({message,type,id:Date.now()});
  },[]);

  // ✅ Load user
  useEffect(()=>{
    mountedRef.current=true;
    const stored=localStorage.getItem('noffor_user');
    if(stored){
      try{
        const u=JSON.parse(stored);
        setUserId(u.id||u.phone||'');
        setPostForm(prev=>({...prev,phone:u.phone||''}));
        setEditForm(u);
      }catch{}
    }else{
      router.push(`/${country}/${lang}/login`);
    }
    return()=>{mountedRef.current=false};
  },[country,lang,router]);

  // ✅ Load all data
  const loadAll=useCallback(async()=>{
    if(!userId||!mountedRef.current)return;
    try{
      const[prof,jobData,savedData,notifData,msgData,bidData]=await Promise.all([
        supabase.from('profiles').select('*').or(`id.eq.${userId},phone.eq.${userId}`).eq('country',country).maybeSingle(),
        supabase.from('job_posts').select('*,bids:job_bids(count)').eq('employer_phone',userId).order('created_at',{ascending:false}),
        supabase.from('saved_profiles').select('*,saved:saved_profile_id(*)').eq('user_id',userId),
        supabase.from('notifications').select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(50),
        supabase.from('messages').select('*').or(`from_id.eq.${userId},to_id.eq.${userId}`).order('created_at',{ascending:false}).limit(100),
        supabase.from('job_bids').select('*').eq('employer_id',userId).order('created_at',{ascending:false})
      ]);
      if(!mountedRef.current)return;
      if(prof.data){setProfile(prof.data);setEditForm(prof.data);}
      setJobs(jobData.data||[]);
      setSavedWorkers(savedData.data||[]);
      setNotifications(notifData.data||[]);
      setMessages(msgData.data||[]);
      setBids(bidData.data||[]);
      const tv=(jobData.data||[]).reduce((s:number,j:any)=>s+(j.views||0),0);
      const tb=(jobData.data||[]).reduce((s:number,j:any)=>s+(j.bids?.[0]?.count||0),0);
      setAnalytics({totalViews:tv,totalBids:tb,hiredWorkers:0,totalSpent:0});
    }catch(err){console.error('Load error:',err);}
    finally{if(mountedRef.current)setLoading(false);}
  },[userId,country]);

  useEffect(()=>{if(!userId){setLoading(false);return;}loadAll();},[userId,loadAll]);

  // ✅ Save Profile
  const saveProfile=async()=>{
    if(!profile?.id||lockRef.current)return;
    lockRef.current=true;setSaving(true);
    try{
      const{error}=await supabase.from('profiles').update({
        company_name:editForm.company_name,industry:editForm.industry,
        contact_person:editForm.contact_person,phone:editForm.phone,
        email:editForm.email,office_address:editForm.office_address,
        website:editForm.website,preferred_language:editForm.preferred_language,
      }).eq('id',profile.id);
      if(error)throw error;
      if(mountedRef.current){setProfile({...profile,...editForm});showToast(t('profileSaved'),'success');}
    }catch(err:any){showToast(t('uploadFailed')+': '+err.message,'error');}
    finally{if(mountedRef.current)setSaving(false);setTimeout(()=>{lockRef.current=false;},500);}
  };

  // ✅ Get final category
  const getFinalCategory=useCallback(()=>{
    if(postForm.category==='other')return postForm.selectedOtherCategory;
    return postForm.category;
  },[postForm.category,postForm.selectedOtherCategory]);

  // ✅ Post Job
  const postJob=async()=>{
    const finalCategory=getFinalCategory();
    if(!postForm.title||!finalCategory||!postForm.city){showToast('Please fill all required fields','error');return;}
    if(lockRef.current)return;
    lockRef.current=true;setPosting(true);
    const expires_at=new Date();
    expires_at.setDate(expires_at.getDate()+parseInt(postForm.expires_in));
    try{
      const{error}=await supabase.from('job_posts').insert({
        title:postForm.title,category:finalCategory,
        budget_min:parseInt(postForm.budget_min)||0,budget_max:parseInt(postForm.budget_max)||0,
        location:postForm.city,description:postForm.description,
        phone:postForm.phone,worker_count:parseInt(postForm.worker_count)||1,
        country,employer_phone:postForm.phone,
        employer_name:profile?.company_name||profile?.name||'Employer',
        status:'open',expires_at:expires_at.toISOString(),views:0,share_count:0,
        job_location_type:postForm.job_location_type,
        home_address:postForm.home_address||null,
        office_address:postForm.office_address||null,
        city:postForm.city,area:postForm.area||null,
      });
      if(error)throw error;
      if(mountedRef.current){
        setShowPostForm(false);
        setPostForm({title:'',category:'',selectedOtherCategory:'',budget_min:'',budget_max:'',location:'',description:'',phone:userId,worker_count:'1',expires_in:'7',job_location_type:'office',home_address:'',office_address:'',city:'',area:''});
        showToast(t('posted'),'success');
        loadAll();
      }
    }catch(err:any){showToast(err.message,'error');}
    finally{if(mountedRef.current)setPosting(false);setTimeout(()=>{lockRef.current=false;},500);}
  };

  // ✅ Edit Job
  const updateJob=async()=>{
    if(!editingJob||lockRef.current)return;
    lockRef.current=true;
    try{
      const{error}=await supabase.from('job_posts').update({
        title:editingJob.title,category:editingJob.category,
        budget_min:editingJob.budget_min,budget_max:editingJob.budget_max,
        location:editingJob.location,description:editingJob.description,
        worker_count:editingJob.worker_count,status:editingJob.status,
        job_location_type:editingJob.job_location_type,
        home_address:editingJob.home_address,
        office_address:editingJob.office_address,
        city:editingJob.city,area:editingJob.area,
      }).eq('id',editingJob.id);
      if(error)throw error;
      if(mountedRef.current){showToast(t('jobUpdated'),'success');setEditingJob(null);loadAll();}
    }catch(err:any){showToast(err.message,'error');}
    finally{setTimeout(()=>{lockRef.current=false;},500);}
  };

  // ✅ Delete Job
  const deleteJob=async(id:string)=>{
    if(!confirm(t('deleteAccountConfirm')))return;
    if(lockRef.current)return;lockRef.current=true;
    try{
      const{error}=await supabase.from('job_posts').delete().eq('id',id);
      if(error)throw error;
      if(mountedRef.current){showToast(t('jobDeleted'),'success');loadAll();}
    }catch(err:any){showToast(err.message,'error');}
    finally{setTimeout(()=>{lockRef.current=false;},500);}
  };

  // ✅ Toggle Job Status
  const toggleJobStatus=async(job:JobPost)=>{
    if(lockRef.current)return;lockRef.current=true;
    const ns=job.status==='open'?'closed':'open';
    try{
      const{error}=await supabase.from('job_posts').update({status:ns}).eq('id',job.id);
      if(error)throw error;
      if(mountedRef.current){showToast(ns==='open'?t('jobOpened'):t('jobClosed'),'success');loadAll();}
    }catch(err:any){showToast(err.message,'error');}
    finally{setTimeout(()=>{lockRef.current=false;},500);}
  };

  // ✅ Search Workers
  const searchWorkers=useCallback(async()=>{
    if(!searchQuery.trim())return;
    setSearching(true);
    const{data}=await supabase.from('profiles').select('*').eq('country',country)
      .eq('role','labor').or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`).limit(50);
    if(mountedRef.current){setSearchResults(data||[]);setSearching(false);}
  },[searchQuery,country]);

  // ✅ Send Message
  const sendMessage=async()=>{
    if(!selectedWorker||!messageText.trim()||lockRef.current)return;
    lockRef.current=true;setSendingMessage(true);
    try{
      const{error}=await supabase.from('messages').insert({
        from_id:userId,to_id:selectedWorker.id,message:messageText,
        is_read:false,created_at:new Date().toISOString(),
        sender_name:profile?.name,sender_photo:profile?.photo_url
      });
      if(error)throw error;
      if(mountedRef.current){showToast(t('messageSent'),'success');setMessageText('');setShowMessageModal(false);loadAll();}
    }catch(err:any){showToast(err.message,'error');}
    finally{if(mountedRef.current)setSendingMessage(false);setTimeout(()=>{lockRef.current=false;},500);}
  };

  // ✅ Accept Bid
  const acceptBid=async(bid:Bid)=>{
    if(lockRef.current)return;lockRef.current=true;
    try{
      const{error}=await supabase.from('job_bids').update({status:'accepted'}).eq('id',bid.id);
      if(error)throw error;
      await supabase.from('job_posts').update({status:'filled'}).eq('id',bid.job_id);
      if(mountedRef.current){showToast(t('bidAccepted'),'success');loadAll();}
    }catch(err:any){showToast(err.message,'error');}
    finally{setTimeout(()=>{lockRef.current=false;},500);}
  };

  // ✅ Share Job
  const shareJob=(job:JobPost)=>{
    const url=`${window.location.origin}/${country}/${lang}/job/${job.id}`;
    navigator.clipboard.writeText(url).then(()=>showToast(t('linkCopied'),'success')).catch(()=>{});
  };

  // ✅ Logout
  const logout=useCallback(()=>{
    localStorage.removeItem('noffor_user');sessionStorage.clear();
    router.push(`/${country}/${lang}/login`);
  },[country,lang,router]);

  // ✅ Filtered Jobs
  const filteredJobs=useMemo(()=>{
    let f=[...jobs];
    if(filterStatus!=='all')f=f.filter(j=>j.status===filterStatus);
    switch(sortBy){
      case'newest':f.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());break;
      case'oldest':f.sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime());break;
      case'budget_high':f.sort((a,b)=>(b.budget_max||0)-(a.budget_max||0));break;
      case'budget_low':f.sort((a,b)=>(a.budget_min||0)-(b.budget_min||0));break;
    }
    return f;
  },[jobs,filterStatus,sortBy]);

  // ✅ Tabs
  const TABS=useMemo(()=>[
    {id:'overview'as TabKey,icon:BarChart3,label:t('overview')},
    {id:'jobs'as TabKey,icon:Briefcase,label:t('jobs')},
    {id:'post'as TabKey,icon:Plus,label:t('post')},
    {id:'saved'as TabKey,icon:Heart,label:t('saved')},
    {id:'inbox'as TabKey,icon:MessageCircle,label:t('inbox')},
    {id:'analytics'as TabKey,icon:TrendingUp,label:t('analytics')},
    {id:'alerts'as TabKey,icon:Bell,label:t('alerts')},
    {id:'settings'as TabKey,icon:Settings,label:t('settings')},
  ],[t]);

  const unreadMessages=messages.filter(m=>!m.is_read&&m.to_id===userId).length;
  const pendingBids=bids.filter(b=>b.status==='pending').length;
  const p=profile||{};
  const cityList=CITIES[country]||CITIES.qa;

  // ✅ Loading
  if(loading){
    return(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang}/>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
      
      <div className="max-w-6xl mx-auto px-3 py-3 lg:py-4">
        
        {/* ✅ Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl overflow-hidden mb-3">
          {p.cover_url&&<img src={p.cover_url} className="absolute inset-0 w-full h-full object-cover opacity-30" alt=""/>}
          <div className="relative p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={p.photo_url||'/default-avatar.png'} className="w-16 h-16 rounded-full border-4 border-white object-cover bg-white" alt="" onError={(e)=>{(e.target as HTMLImageElement).src='/default-avatar.png'}}/>
                <button onClick={()=>photoInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md cursor-pointer">
                  {photoUploading?<div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>:<Camera size={12} className="text-blue-600"/>}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={async(e)=>{
                  const file=e.target.files?.[0];if(!file)return;
                  setPhotoUploading(true);
                  // Simple upload placeholder
                  setPhotoUploading(false);
                }}/>
              </div>
              <div className="flex-1 text-white">
                <h2 className="font-bold text-lg">{p.company_name||p.name||'Employer'}</h2>
                <p className="text-sm opacity-80 flex items-center gap-2">
                  <Globe size={12}/> {country?.toUpperCase()} • {t('employer')}
                  {p.is_verified&&<Award size={14} className="text-yellow-400"/>}
                </p>
                {p.industry&&<p className="text-xs opacity-70">{p.industry}</p>}
              </div>
              <button onClick={()=>setActiveTab('settings')} className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                <Edit size={14} className="inline"/> {t('edit')}
              </button>
            </div>
            <div className="flex gap-4 mt-3 text-white/90 text-xs">
              <div><span className="font-bold">{jobs.length}</span> {t('jobs')}</div>
              <div><span className="font-bold">{pendingBids}</span> {t('bids')}</div>
              <div><span className="font-bold">{unreadMessages}</span> {t('inbox')}</div>
            </div>
          </div>
          <button onClick={()=>coverInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full">
            <Camera size={14} className="text-white"/>
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={async(e)=>{
            const file=e.target.files?.[0];if(!file)return;
            setCoverUploading(true);
            setCoverUploading(false);
          }}/>
        </div>

        {/* ✅ Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {icon:Briefcase,value:jobs.filter(j=>j.status==='open').length,label:t('activeJobs'),color:'text-blue-500'},
            {icon:MessageCircle,value:analytics.totalBids,label:t('totalBids'),color:'text-green-500'},
            {icon:Eye,value:analytics.totalViews,label:t('profileViews'),color:'text-purple-500'},
            {icon:DollarSign,value:`${analytics.totalSpent} QAR`,label:t('totalSpent'),color:'text-orange-500'},
          ].map((s,i)=>(
            <div key={i} className="bg-white rounded-xl p-2 text-center border shadow-sm">
              <s.icon size={16} className={`${s.color} mx-auto`}/>
              <p className="text-xs font-bold mt-0.5">{s.value}</p>
              <p className="text-[8px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ✅ Tabs */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`rounded-xl p-2 text-center cursor-pointer hover:shadow-md border active:scale-95 transition-all relative ${activeTab===tab.id?'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200':'bg-white text-gray-600 border-gray-100 hover:bg-blue-50'}`}>
              <tab.icon size={18} className="mx-auto mb-0.5"/>
              <p className="text-[8px] font-medium truncate">{tab.label}</p>
              {tab.id==='inbox'&&unreadMessages>0&&<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">{unreadMessages}</span>}
            </button>
          ))}
        </div>

        {/* ✅ Tab Content */}
        <div className="space-y-3">
          
          {/* Overview */}
          {activeTab==='overview'&&(
            <>
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <h3 className="font-bold text-sm mb-3">{t('recentActivity')}</h3>
                {notifications.slice(0,5).map(n=>(
                  <div key={n.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg mb-2">
                    {n.type==='bid'&&<Bell size={14} className="text-blue-500"/>}
                    {n.type==='message'&&<MessageCircle size={14} className="text-green-500"/>}
                    <span className="flex-1 text-xs">{n.message||n.title}</span>
                    <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {notifications.length===0&&<p className="text-center text-gray-400 text-sm py-4">{t('noData')}</p>}
              </div>
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <h3 className="font-bold text-sm mb-3">{t('recentJobs')}</h3>
                {jobs.slice(0,3).map(job=>(
                  <div key={job.id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.bids?.[0]?.count||0} {t('bids')} • {job.views||0} {t('profileViews')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${job.status==='open'?'bg-green-100 text-green-700':job.status==='filled'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-500'}`}>{t(job.status)}</span>
                  </div>
                ))}
                {jobs.length===0&&<p className="text-center text-gray-400 text-sm py-4">{t('noJobs')}</p>}
              </div>
            </>
          )}

          {/* Jobs Tab */}
          {activeTab==='jobs'&&(
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4">
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as any)} className="px-3 py-1 border rounded-lg text-sm">
                  <option value="all">{t('all')}</option>
                  <option value="open">{t('open')}</option>
                  <option value="filled">{t('filled')}</option>
                  <option value="closed">{t('closed')}</option>
                </select>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="px-3 py-1 border rounded-lg text-sm">
                  <option value="newest">{t('newest')}</option>
                  <option value="oldest">{t('oldest')}</option>
                  <option value="budget_high">{t('budgetHigh')}</option>
                  <option value="budget_low">{t('budgetLow')}</option>
                </select>
                <button onClick={()=>{setShowPostForm(true);setActiveTab('post');}} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
                  <Plus size={14}/> {t('newJob')}
                </button>
              </div>
              {filteredJobs.length===0?(
                <div className="text-center py-8 text-gray-400">{t('noJobs')}</div>
              ):(
                <div className="grid gap-3">
                  {filteredJobs.map(job=>(
                    <div key={job.id} className="border rounded-xl p-3 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{job.title}</h4>
                          <p className="text-xs text-gray-500">{job.category} • {job.city||job.location}</p>
                          <p className="text-xs font-medium text-blue-600">{job.budget_min}-{job.budget_max} QAR</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${job.status==='open'?'bg-green-100 text-green-700':job.status==='filled'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-500'}`}>{t(job.status)}</span>
                            <span className="text-[10px] text-gray-400">{job.bids?.[0]?.count||0} {t('bids')}</span>
                            <span className="text-[10px] text-gray-400">{job.views||0} views</span>
                            {job.job_location_type==='home'&&<span className="text-[10px] text-orange-500">🏠 Home</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={()=>setEditingJob(job)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={14}/></button>
                          <button onClick={()=>toggleJobStatus(job)} className="p-1 text-gray-500 hover:text-green-600">{job.status==='open'?<X size={14}/>:<Check size={14}/>}</button>
                          <button onClick={()=>shareJob(job)} className="p-1 text-gray-500 hover:text-purple-600"><Share2 size={14}/></button>
                          <button onClick={()=>deleteJob(job.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ Post Tab — WITH HOME SERVICE */}
          {activeTab==='post'&&(
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Plus size={16} className="text-blue-500"/> {t('postJobTitle')}
              </h3>
              <div className="space-y-2">
                
                {/* ✅ Job Location Type — Office / Home / Both */}
                <select value={postForm.job_location_type} onChange={e=>setPostForm({...postForm,job_location_type:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="office">{t('office')}</option>
                  <option value="home">{t('home')}</option>
                  <option value="both">{t('both')}</option>
                </select>
                
                <input value={postForm.title} onChange={e=>setPostForm({...postForm,title:e.target.value})} placeholder={t('jobTitle')} className="w-full px-3 py-2 border rounded-lg text-sm"/>
                
                {/* ✅ Category Dropdown */}
                <select value={postForm.category} onChange={e=>setPostForm({...postForm,category:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="">{t('selectCategory')}</option>
                  <optgroup label="━━ Main Categories ━━">
                    {MAIN_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <option value="other">━━ {t('view')} Other Categories ━━</option>
                </select>
                
                {/* ✅ Other Category Sub-select */}
                {postForm.category==='other'&&(
                  <select value={postForm.selectedOtherCategory} onChange={e=>setPostForm({...postForm,selectedOtherCategory:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50 border-orange-200">
                    <option value="">Select Special Category</option>
                    {OTHER_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                
                {/* ✅ City */}
                <select value={postForm.city} onChange={e=>setPostForm({...postForm,city:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="">{t('selectCity')}</option>
                  {cityList.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                
                <input value={postForm.area} onChange={e=>setPostForm({...postForm,area:e.target.value})} placeholder={t('area')} className="w-full px-3 py-2 border rounded-lg text-sm"/>
                
                <div className="grid grid-cols-2 gap-2">
                  <input value={postForm.budget_min} onChange={e=>setPostForm({...postForm,budget_min:e.target.value})} placeholder={t('budgetMin')} type="number" className="px-3 py-2 border rounded-lg text-sm"/>
                  <input value={postForm.budget_max} onChange={e=>setPostForm({...postForm,budget_max:e.target.value})} placeholder={t('budgetMax')} type="number" className="px-3 py-2 border rounded-lg text-sm"/>
                </div>
                
                {/* ✅ Home Address */}
                {(postForm.job_location_type==='home'||postForm.job_location_type==='both')&&(
                  <input value={postForm.home_address} onChange={e=>setPostForm({...postForm,home_address:e.target.value})} placeholder={t('homeAddress')} className="w-full px-3 py-2 border rounded-lg text-sm border-orange-200 bg-orange-50"/>
                )}
                
                {/* ✅ Office Address */}
                {(postForm.job_location_type==='office'||postForm.job_location_type==='both')&&(
                  <input value={postForm.office_address} onChange={e=>setPostForm({...postForm,office_address:e.target.value})} placeholder={t('officeAddressField')} className="w-full px-3 py-2 border rounded-lg text-sm border-blue-200 bg-blue-50"/>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <input value={postForm.worker_count} onChange={e=>setPostForm({...postForm,worker_count:e.target.value})} placeholder={t('workersNeeded')} type="number" className="px-3 py-2 border rounded-lg text-sm"/>
                  <select value={postForm.expires_in} onChange={e=>setPostForm({...postForm,expires_in:e.target.value})} className="px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="3">{t('days3')}</option>
                    <option value="7">{t('days7')}</option>
                    <option value="14">{t('days14')}</option>
                    <option value="30">{t('days30')}</option>
                  </select>
                </div>
                
                {/* ✅ Benefits */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 mb-1">{t('benefits')}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {['accommodation','food','transport','medical','ticket','simCard'].map(b=>(
                      <label key={b} className="flex items-center gap-1 text-[10px] cursor-pointer">
                        <input type="checkbox" className="w-3 h-3"/> {t(b)}
                      </label>
                    ))}
                  </div>
                </div>
                
                <textarea value={postForm.description} onChange={e=>setPostForm({...postForm,description:e.target.value})} placeholder={t('description')} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm"/>
                
                <button onClick={postJob} disabled={posting} className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                  {posting?<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Send size={16}/>}
                  {posting?t('posting'):t('postJob')}
                </button>
              </div>
            </div>
          )}

          {/* Saved Tab */}
          {activeTab==='saved'&&(
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              {savedWorkers.length===0?(
                <div className="text-center py-8"><Heart size={40} className="text-gray-300 mx-auto mb-2"/><p className="text-gray-500">{t('noSaved')}</p></div>
              ):(
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {savedWorkers.map((s,i)=>(
                    <div key={i} className="text-center p-3 border rounded-xl hover:shadow-md transition cursor-pointer" onClick={()=>router.push(`/${country}/${lang}/profile/${s.saved?.id}`)}>
                      <OptimizedImage src={s.saved?.photo_url||'/default-avatar.png'} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"/>
                      <p className="text-sm font-bold truncate">{s.saved?.name}</p>
                      <p className="text-[10px] text-gray-500">{s.saved?.category}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star size={12} className="text-yellow-500" fill="#EAB308"/>
                        <span className="text-xs">{s.saved?.rating||0}</span>
                      </div>
                      <button className="mt-2 text-xs text-blue-600">{t('viewProfile')}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab==='inbox'&&(
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><MessageCircle size={16} className="text-blue-500"/> {t('inbox')} {unreadMessages>0&&<span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadMessages} {t('unread')}</span>}</h3>
              {messages.length===0?(
                <div className="text-center py-8 text-gray-400">{t('noMessages')}</div>
              ):(
                <div className="space-y-3">
                  {messages.map(msg=>(
                    <div key={msg.id} className={`p-3 rounded-lg ${!msg.is_read&&msg.to_id===userId?'bg-blue-50 border-l-4 border-blue-500':'bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <OptimizedImage src={msg.sender_photo||'/default-avatar.png'} alt="" className="w-8 h-8 rounded-full"/>
                          <div>
                            <p className="text-sm font-bold">{msg.sender_name}</p>
                            <p className="text-xs text-gray-600">{msg.message}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab==='analytics'&&(
            <div className="grid gap-3">
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <h3 className="font-bold text-sm mb-3">{t('jobPerformance')}</h3>
                {[
                  {label:t('totalViews'),value:analytics.totalViews,color:'bg-blue-500',pct:Math.min(100,analytics.totalViews/10)},
                  {label:t('totalBids'),value:analytics.totalBids,color:'bg-green-500',pct:Math.min(100,analytics.totalBids/10)},
                  {label:t('hiredWorkers'),value:analytics.hiredWorkers,color:'bg-purple-500',pct:Math.min(100,analytics.hiredWorkers*10)},
                ].map((item,i)=>(
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1"><span>{item.label}</span><span className="font-bold">{item.value}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className={`${item.color} h-2 rounded-full`} style={{width:`${item.pct}%`}}/></div>
                  </div>
                ))}
              </div>
              {bids.length>0&&(
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                  <h3 className="font-bold text-sm mb-3">{t('incomingBids')}</h3>
                  {bids.filter(b=>b.status==='pending').slice(0,5).map(bid=>(
                    <div key={bid.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <OptimizedImage src={bid.worker_photo||'/default-avatar.png'} alt="" className="w-10 h-10 rounded-full"/>
                        <div>
                          <p className="text-sm font-bold">{bid.worker_name}</p>
                          <p className="text-xs text-gray-500">{bid.offered_amount} QAR</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={()=>acceptBid(bid)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">{t('accept')}</button>
                        <button onClick={()=>{setSelectedWorker({id:bid.worker_id,name:bid.worker_name,photo_url:bid.worker_photo,category:'',rating:bid.worker_rating,expected_salary:0,experience:0,city:'',is_verified:false,online:false});setShowMessageModal(true);}} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">{t('msg')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab==='alerts'&&(
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              {notifications.length===0?(
                <div className="text-center py-8"><Bell size={40} className="text-gray-300 mx-auto mb-2"/><p className="text-gray-500">{t('noAlerts')}</p></div>
              ):(
                <div className="space-y-2">
                  {notifications.map(n=>(
                    <div key={n.id} className={`p-3 rounded-lg ${!n.is_read?'bg-blue-50 border-l-4 border-blue-500':'bg-gray-50'}`}>
                      <p className="text-sm font-bold">{n.title}</p>
                      <p className="text-xs text-gray-600">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ Settings Tab — EMPLOYER SPECIFIC */}
          {activeTab==='settings'&&(
            <div className="space-y-3">
              
              {/* Profile Settings */}
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500"/> {t('editProfile')}
                </h3>
                <div className="space-y-2">
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={editForm.company_name||editForm.name||''} onChange={e=>setEditForm({...editForm,company_name:e.target.value})} placeholder={t('companyName')} className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:border-blue-500 outline-none"/>
                  </div>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <select value={editForm.industry||''} onChange={e=>setEditForm({...editForm,industry:e.target.value})} className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm bg-white">
                      <option value="">{t('industry')}</option>
                      <option value="construction">Construction</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="retail">Retail</option>
                      <option value="transport">Transport</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="technology">Technology</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={editForm.contact_person||''} onChange={e=>setEditForm({...editForm,contact_person:e.target.value})} placeholder={t('contactPerson')} className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm"/>
                  </div>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={editForm.phone||''} onChange={e=>setEditForm({...editForm,phone:e.target.value})} placeholder={t('phone')} className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm"/>
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={editForm.email||''} onChange={e=>setEditForm({...editForm,email:e.target.value})} placeholder={t('email')} type="email" className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm"/>
                  </div>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={editForm.office_address||''} onChange={e=>setEditForm({...editForm,office_address:e.target.value})} placeholder={t('officeAddress')} className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm"/>
                  </div>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={editForm.website||''} onChange={e=>setEditForm({...editForm,website:e.target.value})} placeholder={t('website')} className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm"/>
                  </div>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <select value={editForm.preferred_language||lang} onChange={e=>setEditForm({...editForm,preferred_language:e.target.value})} className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm bg-white">
                      <option value="en">English</option><option value="bn">বাংলা</option>
                      <option value="ar">العربية</option><option value="hi">हिन्दी</option>
                    </select>
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition">
                  <Save size={16}/> {saving?'Saving...':t('save')}
                </button>
              </div>
              
              {/* Search Workers */}
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Search size={16} className="text-blue-500"/> {t('searchWorkers')}</h3>
                <div className="flex gap-2 mb-3">
                  <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyPress={e=>e.key==='Enter'&&searchWorkers()} placeholder={t('searchPlaceholder')} className="flex-1 px-3 py-2 border rounded-lg text-sm"/>
                  <button onClick={searchWorkers} disabled={searching} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">{searching?'...':'Search'}</button>
                </div>
                {searchResults.map(w=>(
                  <div key={w.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <OptimizedImage src={w.photo_url||'/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold flex items-center gap-1 truncate">{w.name} {w.is_verified&&<Award size={12} className="text-yellow-500 shrink-0"/>}</p>
                      <p className="text-xs text-gray-500 truncate">{w.category} • {w.expected_salary} QAR • {w.city}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={()=>router.push(`/${country}/${lang}/profile/${w.id}`)} className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">{t('view')}</button>
                      <button onClick={()=>{setSelectedWorker(w);setShowMessageModal(true);}} className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded"><MessageCircle size={12}/></button>
                    </div>
                  </div>
                ))}
                {searchResults.length===0&&searchQuery&&!searching&&<p className="text-center text-gray-400 text-sm py-4">{t('noData')}</p>}
              </div>
              
              {/* Danger Zone */}
              <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
                <h3 className="font-bold text-sm text-red-600 mb-3 flex items-center gap-2"><AlertTriangle size={16}/> {t('dangerZone')}</h3>
                <button onClick={logout} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                  <LogOut size={16}/> {t('logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Edit Job Modal */}
      {editingJob&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={()=>setEditingJob(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t('editJobTitle')}</h3>
              <button onClick={()=>setEditingJob(null)} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-2">
              <select value={editingJob.job_location_type||'office'} onChange={e=>setEditingJob({...editingJob,job_location_type:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="office">{t('office')}</option>
                <option value="home">{t('home')}</option>
                <option value="both">{t('both')}</option>
              </select>
              <input value={editingJob.title} onChange={e=>setEditingJob({...editingJob,title:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm"/>
              <select value={editingJob.category} onChange={e=>setEditingJob({...editingJob,category:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                {[...MAIN_CATEGORIES,...OTHER_CATEGORIES].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={editingJob.budget_min} onChange={e=>setEditingJob({...editingJob,budget_min:parseInt(e.target.value)||0})} className="px-3 py-2 border rounded-lg text-sm"/>
                <input type="number" value={editingJob.budget_max} onChange={e=>setEditingJob({...editingJob,budget_max:parseInt(e.target.value)||0})} className="px-3 py-2 border rounded-lg text-sm"/>
              </div>
              <textarea value={editingJob.description||''} onChange={e=>setEditingJob({...editingJob,description:e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm"/>
              <div className="flex gap-2 mt-3">
                <button onClick={updateJob} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold">{t('updateJob')}</button>
                <button onClick={()=>setEditingJob(null)} className="flex-1 py-3 bg-gray-200 rounded-xl text-sm">{t('cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Message Modal */}
      {showMessageModal&&selectedWorker&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={()=>setShowMessageModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold mb-3">{t('messageTo')} {selectedWorker.name}</h3>
            <textarea value={messageText} onChange={e=>setMessageText(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm mb-3" placeholder={t('typeMessage')}/>
            <div className="flex gap-2">
              <button onClick={sendMessage} disabled={sendingMessage} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">{sendingMessage?t('sending'):t('send')}</button>
              <button onClick={()=>setShowMessageModal(false)} className="flex-1 py-2 bg-gray-200 rounded-lg text-sm">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
      
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}