// app/[country]/[lang]/category/[slug]/page.tsx
// 🚀 SUPER SONIC • 42 CATEGORIES • PNG BANNER • MIDDLE EAST FILTERS • 4 LANGUAGES • TYPE FIXED
"use client";
import React,{useEffect,useState,useRef,useCallback,useMemo,startTransition} from 'react';
import {useParams,useSearchParams} from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import ProfileCard from '@/components/category/ProfileCard';
import {supabase} from '@/lib/supabase';
import {Loader2,AlertCircle,RefreshCw,Package,Image as ImageIcon,Filter,ChevronDown,X,SlidersHorizontal,ArrowUpDown} from 'lucide-react';
import {translateCategory} from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{
    workersFound:'workers found',loading:'Loading...',
    allLoaded:'All workers loaded',error:'Failed to load',
    retry:'Retry',noWorkers:'No workers in this category',
    mainCategories:'Main Categories',otherCategories:'Other Categories',
    all:'All',availableNow:'Available Now',online:'Online Now',
    verified:'Verified',withVisa:'Has Visa',needVisa:'Needs Visa',
    withAccommodation:'Wants Housing',localHire:'Local Hire Only',
    moreFilters:'More Filters',clearAll:'Clear All',
    visaStatus:'Visa Status',hasVisa:'Has Visa',noVisa:'Needs Visa',
    accommodation:'Housing',provided:'Provided',notProvided:'Not Provided',
    gender:'Gender',male:'Male',female:'Female',any:'Any',
    language:'Language',english:'English',arabic:'Arabic',hindi:'Hindi',bengali:'Bengali',
    license:'License',hasLicense:'Has License',noLicense:'No License',
    tools:'Tools',hasTools:'Has Own Tools',
    sortBy:'Sort',newest:'Newest',ratingHigh:'Highest Rated',
    experience:'Most Experienced',salaryLow:'Lowest Salary',
    salaryHigh:'Highest Salary',
    liveIn:'Live-in',liveOut:'Live-out',
    infantCare:'Infant Care',specialNeeds:'Special Needs',
    arabicCuisine:'Arabic Cuisine',indianCuisine:'Indian Cuisine',continental:'Continental',
    heavyLicense:'Heavy License',lightLicense:'Light License',knowsRoutes:'Knows Routes',
    commercialExp:'Commercial Exp',splitAC:'Split AC Expert',centralAC:'Central AC Expert',
    officeCleaning:'Office Cleaning',homeCleaning:'Home Cleaning',
    computerSkills:'Computer Skills',accounting:'Accounting',
    registeredNurse:'Registered Nurse',homeCare:'Home Care',
    hair:'Hair Styling',makeup:'Makeup',nails:'Nails',
  },
  bn:{
    workersFound:'জন শ্রমিক',loading:'লোড হচ্ছে...',
    allLoaded:'সব শ্রমিক লোড হয়েছে',error:'লোড ব্যর্থ',
    retry:'আবার চেষ্টা',noWorkers:'এই ক্যাটাগরিতে কোনো শ্রমিক নেই',
    mainCategories:'প্রধান ক্যাটাগরি',otherCategories:'অন্যান্য ক্যাটাগরি',
    all:'সব',availableNow:'এখনই প্রস্তুত',online:'এখন অনলাইন',
    verified:'ভেরিফাইড',withVisa:'ভিসা আছে',needVisa:'ভিসা লাগবে',
    withAccommodation:'থাকা চায়',localHire:'লোকাল নিয়োগ',
    moreFilters:'আরও ফিল্টার',clearAll:'সব মুছুন',
    visaStatus:'ভিসার অবস্থা',hasVisa:'ভিসা আছে',noVisa:'ভিসা লাগবে',
    accommodation:'থাকা',provided:'দেওয়া হবে',notProvided:'দেওয়া হবে না',
    gender:'লিঙ্গ',male:'পুরুষ',female:'মহিলা',any:'যেকোনো',
    language:'ভাষা',english:'ইংরেজি',arabic:'আরবি',hindi:'হিন্দি',bengali:'বাংলা',
    license:'লাইসেন্স',hasLicense:'লাইসেন্স আছে',noLicense:'লাইসেন্স নেই',
    tools:'টুলস',hasTools:'নিজস্ব টুলস আছে',
    sortBy:'সাজান',newest:'নতুন',ratingHigh:'সেরা রেটিং',
    experience:'অভিজ্ঞ',salaryLow:'কম বেতন',salaryHigh:'বেশি বেতন',
    liveIn:'লিভ-ইন',liveOut:'লিভ-আউট',
    infantCare:'শিশু যত্ন',specialNeeds:'বিশেষ চাহিদা',
    arabicCuisine:'আরবি রান্না',indianCuisine:'ভারতীয় রান্না',continental:'কন্টিনেন্টাল',
    heavyLicense:'ভারী লাইসেন্স',lightLicense:'হালকা লাইসেন্স',knowsRoutes:'রুট জানে',
    commercialExp:'কমার্শিয়াল',splitAC:'স্প্লিট এসি',centralAC:'সেন্ট্রাল এসি',
    officeCleaning:'অফিস ক্লিনিং',homeCleaning:'বাসা ক্লিনিং',
    computerSkills:'কম্পিউটার স্কিল',accounting:'হিসাব',
    registeredNurse:'রেজিস্টার্ড নার্স',homeCare:'হোম কেয়ার',
    hair:'চুলের স্টাইল',makeup:'মেকআপ',nails:'নখ',
  },
  ar:{
    workersFound:'عامل',loading:'جاري...',
    allLoaded:'تم تحميل الكل',error:'فشل التحميل',
    retry:'إعادة',noWorkers:'لا يوجد عمال',
    mainCategories:'الفئات الرئيسية',otherCategories:'فئات أخرى',
    all:'الكل',availableNow:'متاح الآن',online:'متصل الآن',
    verified:'موثق',withVisa:'لديه تأشيرة',needVisa:'يحتاج تأشيرة',
    withAccommodation:'يريد سكن',localHire:'توظيف محلي',
    moreFilters:'المزيد',clearAll:'مسح الكل',
    visaStatus:'حالة التأشيرة',hasVisa:'لديه تأشيرة',noVisa:'يحتاج تأشيرة',
    accommodation:'السكن',provided:'متوفر',notProvided:'غير متوفر',
    gender:'الجنس',male:'ذكر',female:'أنثى',any:'الكل',
    language:'اللغة',english:'إنجليزي',arabic:'عربي',hindi:'هندي',bengali:'بنغالي',
    license:'رخصة',hasLicense:'لديه رخصة',noLicense:'لا رخصة',
    tools:'أدوات',hasTools:'لديه أدوات',
    sortBy:'ترتيب',newest:'الأحدث',ratingHigh:'الأعلى تقييماً',
    experience:'الأكثر خبرة',salaryLow:'الأقل راتباً',salaryHigh:'الأعلى راتباً',
    liveIn:'مقيمة',liveOut:'غير مقيمة',
    infantCare:'رعاية الرضع',specialNeeds:'احتياجات خاصة',
    arabicCuisine:'مطبخ عربي',indianCuisine:'مطبخ هندي',continental:'كونتيننتال',
    heavyLicense:'رخصة ثقيلة',lightLicense:'رخصة خفيفة',knowsRoutes:'يعرف الطرق',
    commercialExp:'تجاري',splitAC:'مكيف سبليت',centralAC:'مكيف مركزي',
    officeCleaning:'تنظيف مكاتب',homeCleaning:'تنظيف منازل',
    computerSkills:'مهارات الكمبيوتر',accounting:'محاسبة',
    registeredNurse:'ممرض مسجل',homeCare:'رعاية منزلية',
    hair:'تصفيف شعر',makeup:'مكياج',nails:'أظافر',
  },
  hi:{
    workersFound:'श्रमिक',loading:'लोड...',
    allLoaded:'सभी लोड हो गए',error:'लोड विफल',
    retry:'पुनः प्रयास',noWorkers:'कोई श्रमिक नहीं',
    mainCategories:'मुख्य श्रेणियां',otherCategories:'अन्य श्रेणियां',
    all:'सब',availableNow:'अभी उपलब्ध',online:'अभी ऑनलाइन',
    verified:'सत्यापित',withVisa:'वीजा है',needVisa:'वीजा चाहिए',
    withAccommodation:'रहना चाहिए',localHire:'स्थानीय नियुक्ति',
    moreFilters:'और फिल्टर',clearAll:'सब साफ करें',
    visaStatus:'वीजा स्थिति',hasVisa:'वीजा है',noVisa:'वीजा चाहिए',
    accommodation:'आवास',provided:'उपलब्ध',notProvided:'उपलब्ध नहीं',
    gender:'लिंग',male:'पुरुष',female:'महिला',any:'कोई भी',
    language:'भाषा',english:'अंग्रेजी',arabic:'अरबी',hindi:'हिंदी',bengali:'बंगाली',
    license:'लाइसेंस',hasLicense:'लाइसेंस है',noLicense:'लाइसेंस नहीं',
    tools:'उपकरण',hasTools:'खुद के उपकरण',
    sortBy:'क्रम',newest:'नया',ratingHigh:'सर्वोच्च रेटिंग',
    experience:'अनुभवी',salaryLow:'कम वेतन',salaryHigh:'अधिक वेतन',
    liveIn:'लिव-इन',liveOut:'लिव-आउट',
    infantCare:'शिशु देखभाल',specialNeeds:'विशेष जरूरत',
    arabicCuisine:'अरबी खाना',indianCuisine:'भारतीय खाना',continental:'कॉन्टिनेंटल',
    heavyLicense:'भारी लाइसेंस',lightLicense:'हल्का लाइसेंस',knowsRoutes:'रास्ता जानता',
    commercialExp:'कमर्शियल',splitAC:'स्प्लिट AC',centralAC:'सेंट्रल AC',
    officeCleaning:'ऑफिस की सफाई',homeCleaning:'घर की सफाई',
    computerSkills:'कंप्यूटर स्किल',accounting:'लेखा',
    registeredNurse:'पंजीकृत नर्स',homeCare:'होम केयर',
    hair:'हेयर स्टाइलिंग',makeup:'मेकअप',nails:'नाखून',
  },
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG={ITEMS_PER_PAGE:6,CACHE_TTL:30000,RETRY_MAX:2};

// ═══════════════════════════════════════════════════════════
// ৪২টি SLUG → CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════
const SLUG_TO_CATEGORY:Record<string,string>={
  'driver':'Driver','electrician':'Electrician','plumber':'Plumber',
  'mason':'Mason','ac-technician':'AC Technician','painter':'Painter',
  'carpenter':'Carpenter','welder':'Welder','cleaner':'Cleaner',
  'cook':'Cook','helper':'Helper','gardener':'Gardener',
  'housemaid':'Housemaid','nanny':'Nanny','office-assistant':'Office Assistant',
  'receptionist':'Receptionist','salesman':'Salesman','cashier':'Cashier',
  'security-guard':'Security Guard','nurse':'Nurse','pharmacist':'Pharmacist',
  'lab-technician':'Lab Technician','physiotherapist':'Physiotherapist',
  'mechanic':'Mechanic','tailor':'Tailor','barista':'Barista',
  'photographer':'Photographer','cctv-technician':'CCTV Technician',
  'gypsum-carpenter':'Gypsum Carpenter','tiles-mason':'Tiles Mason',
  'blacksmith':'Blacksmith','general-labour':'General Labour',
  'steel-fixer':'Steel Fixer','scaffolder':'Scaffolder',
  'heavy-driver':'Heavy Driver','forklift-operator':'Forklift Operator',
  'crane-operator':'Crane Operator','pipe-fitter':'Pipe Fitter',
  'waiter':'Waiter','hotel-housekeeping':'Hotel Housekeeping',
  'beautician':'Beautician','barber':'Barber',
};

// ═══════════════════════════════════════════════════════════
// PNG IMAGE PATH
// ═══════════════════════════════════════════════════════════
const getCategoryImage=(slug:string):string=>{
  const mainSlugs=['driver','electrician','plumber','mason','ac-technician','painter','carpenter','welder','cleaner','cook','helper','gardener'];
  return mainSlugs.includes(slug)?`/categories/${slug}.png`:'/categories/default.png';
};
const MAIN_SLUGS=['driver','electrician','plumber','mason','ac-technician','painter','carpenter','welder','cleaner','cook','helper','gardener'];

// ═══════════════════════════════════════════════════════════
// ✅ CATEGORY-WISE FILTER CONFIG — TYPE FIXED
// ═══════════════════════════════════════════════════════════
interface FilterConfig {
  visa: boolean;
  accommodation: boolean;
  gender: boolean;
  language: boolean;
  license: boolean;
  tools: boolean;
  extras?: { key: string; label: string }[];
}

const CATEGORY_FILTER_CONFIG: Record<string, FilterConfig> = {
  'Housemaid':{visa:true,accommodation:true,gender:true,language:true,license:false,tools:false,extras:[{key:'live_in',label:'liveIn'},{key:'live_out',label:'liveOut'}]},
  'Nanny':{visa:true,accommodation:true,gender:true,language:true,license:false,tools:false,extras:[{key:'infant_care',label:'infantCare'},{key:'special_needs',label:'specialNeeds'}]},
  'Cook':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:false,extras:[{key:'arabic_cuisine',label:'arabicCuisine'},{key:'indian_cuisine',label:'indianCuisine'},{key:'continental',label:'continental'}]},
  'Driver':{visa:true,accommodation:true,gender:false,language:true,license:true,tools:false,extras:[{key:'heavy_license',label:'heavyLicense'},{key:'light_license',label:'lightLicense'},{key:'knows_routes',label:'knowsRoutes'}]},
  'Heavy Driver':{visa:true,accommodation:true,gender:false,language:false,license:true,tools:false},
  'Electrician':{visa:false,accommodation:false,gender:false,language:false,license:false,tools:true,extras:[{key:'has_tools',label:'hasTools'},{key:'commercial',label:'commercialExp'}]},
  'Plumber':{visa:false,accommodation:false,gender:false,language:false,license:false,tools:true},
  'Mason':{visa:false,accommodation:true,gender:false,language:false,license:false,tools:true},
  'AC Technician':{visa:false,accommodation:false,gender:false,language:false,license:false,tools:true,extras:[{key:'split_ac',label:'splitAC'},{key:'central_ac',label:'centralAC'}]},
  'Painter':{visa:false,accommodation:false,gender:false,language:false,license:false,tools:true},
  'Carpenter':{visa:false,accommodation:false,gender:false,language:false,license:false,tools:true},
  'Welder':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:false},
  'Cleaner':{visa:true,accommodation:true,gender:true,language:false,license:false,tools:false,extras:[{key:'office_cleaning',label:'officeCleaning'},{key:'home_cleaning',label:'homeCleaning'}]},
  'Helper':{visa:true,accommodation:true,gender:true,language:false,license:false,tools:false},
  'Gardener':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:false},
  'Office Assistant':{visa:true,accommodation:false,gender:true,language:true,license:false,tools:false,extras:[{key:'computer_skills',label:'computerSkills'},{key:'accounting',label:'accounting'}]},
  'Receptionist':{visa:true,accommodation:false,gender:true,language:true,license:false,tools:false},
  'Salesman':{visa:true,accommodation:false,gender:true,language:true,license:true,tools:false},
  'Security Guard':{visa:true,accommodation:true,gender:true,language:false,license:false,tools:false},
  'Nurse':{visa:true,accommodation:true,gender:true,language:true,license:true,tools:false,extras:[{key:'registered',label:'registeredNurse'},{key:'home_care',label:'homeCare'}]},
  'Pharmacist':{visa:true,accommodation:false,gender:false,language:true,license:true,tools:false},
  'Waiter':{visa:true,accommodation:true,gender:true,language:true,license:false,tools:false},
  'Barista':{visa:true,accommodation:false,gender:false,language:true,license:false,tools:false},
  'Beautician':{visa:true,accommodation:false,gender:true,language:false,license:false,tools:false,extras:[{key:'hair',label:'hair'},{key:'makeup',label:'makeup'},{key:'nails',label:'nails'}]},
  'Barber':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:false},
  'Steel Fixer':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:false},
  'Scaffolder':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:false},
  'Tailor':{visa:true,accommodation:false,gender:false,language:false,license:false,tools:false},
  'Mechanic':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:true},
  'Photographer':{visa:true,accommodation:false,gender:false,language:false,license:false,tools:false},
  'CCTV Technician':{visa:true,accommodation:false,gender:false,language:false,license:false,tools:true},
  'Gypsum Carpenter':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:true},
  'Tiles Mason':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:true},
  'Blacksmith':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:true},
  'General Labour':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:false},
  'Forklift Operator':{visa:true,accommodation:true,gender:false,language:false,license:true,tools:false},
  'Crane Operator':{visa:true,accommodation:true,gender:false,language:false,license:true,tools:false},
  'Pipe Fitter':{visa:true,accommodation:true,gender:false,language:false,license:false,tools:true},
  'Hotel Housekeeping':{visa:true,accommodation:true,gender:true,language:false,license:false,tools:false},
  'Lab Technician':{visa:true,accommodation:false,gender:false,language:true,license:false,tools:false},
  'Physiotherapist':{visa:true,accommodation:false,gender:true,language:true,license:true,tools:false},
  'Cashier':{visa:true,accommodation:false,gender:true,language:true,license:false,tools:false},
};

const DEFAULT_CONFIG: FilterConfig = {
  visa: false, accommodation: false, gender: false, language: false, license: false, tools: false
};

// ═══════════════════════════════════════════════════════════
// গ্লোবাল ক্যাশে
// ═══════════════════════════════════════════════════════════
const dataCache=new Map<string,{data:any[];total:number;timestamp:number}>();

export default function CategoryPage(){
  const params=useParams();const searchParams=useSearchParams();
  const country=(params as any).country||'qa';const lang=(params as any).lang||'en';
  const slug=(params as any).slug||'driver';const initialFilter=searchParams.get('filter')||'all';
  const initialSort=searchParams.get('sort')||'newest';
  
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const rest=useMemo(()=>`/${country}/${lang}`,[country,lang]);
  
  const categoryName=useMemo(()=>SLUG_TO_CATEGORY[slug]||slug,[slug]);
  const categoryImage=useMemo(()=>getCategoryImage(slug),[slug]);
  const isMainCategory=useMemo(()=>MAIN_SLUGS.includes(slug),[slug]);
  const filterConfig=useMemo(()=>CATEGORY_FILTER_CONFIG[categoryName]||DEFAULT_CONFIG,[categoryName]);

  // State
  const[profiles,setProfiles]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);const[loadingMore,setLoadingMore]=useState(false);
  const[page,setPage]=useState(0);const[hasMore,setHasMore]=useState(true);
  const[totalCount,setTotalCount]=useState(0);const[error,setError]=useState(false);
  const[imgError,setImgError]=useState(false);
  
  // Filter State
  const[selectedFilter,setSelectedFilter]=useState(initialFilter);
  const[selectedSort,setSelectedSort]=useState(initialSort);
  const[selectedVisa,setSelectedVisa]=useState('');
  const[selectedAccommodation,setSelectedAccommodation]=useState('');
  const[selectedGender,setSelectedGender]=useState('');
  const[selectedLanguage,setSelectedLanguage]=useState('');
  const[selectedLicense,setSelectedLicense]=useState('');
  const[selectedTools,setSelectedTools]=useState('');
  const[selectedExtras,setSelectedExtras]=useState<string[]>([]);
  const[showMoreFilters,setShowMoreFilters]=useState(false);
  const[showSortDropdown,setShowSortDropdown]=useState(false);
  
  const loaderRef=useRef<HTMLDivElement>(null);
  const observerRef=useRef<IntersectionObserver|null>(null);
  const aliveRef=useRef(true);const retryRef=useRef(0);
  
  useEffect(()=>{setImgError(false);},[slug]);

  // ✅ Load profiles
  const loadProfiles=useCallback(async(pageNum:number,append:boolean)=>{
    if(!aliveRef.current)return[];
    const cacheKey=`cat:${country}:${categoryName}:${selectedFilter}:${selectedSort}:${selectedVisa}:${selectedAccommodation}:${selectedGender}:${selectedLanguage}:${selectedLicense}:${selectedTools}:${selectedExtras.join(',')}:${pageNum}`;

    if(!append){
      const cached=dataCache.get(cacheKey);
      if(cached&&Date.now()-cached.timestamp<CONFIG.CACHE_TTL){
        startTransition(()=>{setTotalCount(cached.total);setHasMore(pageNum*CONFIG.ITEMS_PER_PAGE+CONFIG.ITEMS_PER_PAGE<cached.total);});
        return cached.data;
      }
    }

    try{
      const from=pageNum*CONFIG.ITEMS_PER_PAGE;const to=from+CONFIG.ITEMS_PER_PAGE-1;
      let query=supabase.from('profiles').select('*',{count:'exact'})
        .eq('category',categoryName).eq('country',country)
        .eq('is_public',true).eq('is_verified',true)
        .not('photo_url','is',null).neq('photo_url','/default-avatar.png')
        .neq('photo_url','/avatar.png').neq('photo_url','')
        .range(from,to);
      
      if(selectedFilter==='online')query=query.eq('is_online',true);
      if(selectedFilter==='verified')query=query.eq('is_verified',true);
      if(selectedFilter==='available')query=query.eq('can_start_immediately',true);
      if(selectedVisa==='has_visa')query=query.eq('visa_status','has_visa');
      if(selectedVisa==='need_visa')query=query.eq('visa_status','need_visa');
      if(selectedAccommodation==='provided')query=query.eq('accommodation_needed',true);
      if(selectedGender)query=query.eq('gender',selectedGender);
      if(selectedLanguage)query=query.contains('languages',[selectedLanguage]);
      if(selectedLicense==='has_license')query=query.eq('has_license',true);
      if(selectedTools==='has_tools')query=query.eq('has_tools',true);
      if(selectedExtras.length>0)query=query.contains('skills',selectedExtras);
      
      switch(selectedSort){
        case 'newest':query=query.order('created_at',{ascending:false});break;
        case 'oldest':query=query.order('created_at',{ascending:true});break;
        case 'rating_high':query=query.order('rating',{ascending:false});break;
        case 'experience':query=query.order('experience',{ascending:false});break;
        case 'salary_low':query=query.order('expected_salary',{ascending:true});break;
        case 'salary_high':query=query.order('expected_salary',{ascending:false});break;
        default:query=query.order('created_at',{ascending:false});
      }
      
      const{data,count,error:e}=await query;
      if(e)throw e;if(!aliveRef.current)return[];
      const result=data||[];const total=count||0;
      if(!append)dataCache.set(cacheKey,{data:result,total,timestamp:Date.now()});
      startTransition(()=>{setTotalCount(total);setHasMore(from+CONFIG.ITEMS_PER_PAGE<total);});
      retryRef.current=0;return result;
    }catch{
      if(retryRef.current<CONFIG.RETRY_MAX){retryRef.current++;return loadProfiles(pageNum,append);}
      if(aliveRef.current)startTransition(()=>setError(true));return[];
    }
  },[country,categoryName,selectedFilter,selectedSort,selectedVisa,selectedAccommodation,selectedGender,selectedLanguage,selectedLicense,selectedTools,selectedExtras]);

  const resetAndLoad=useCallback(()=>{
    startTransition(()=>{setLoading(true);setError(false);setProfiles([]);setPage(0);setHasMore(true);setTotalCount(0);});
    loadProfiles(0,false).then(d=>{if(aliveRef.current)startTransition(()=>{setProfiles(d);setPage(0);setLoading(false);});});
  },[loadProfiles]);

  useEffect(()=>{aliveRef.current=true;resetAndLoad();return()=>{aliveRef.current=false};},[resetAndLoad]);

  // Realtime
  useEffect(()=>{
    const channel=supabase.channel(`cat:${categoryName}:${Date.now()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'profiles',filter:`country=eq.${country}`},(payload:any)=>{
      if(payload.new.role==='labor'&&payload.new.category===categoryName&&payload.new.is_public===true&&payload.new.is_verified===true&&aliveRef.current){
        startTransition(()=>{setProfiles(p=>[payload.new,...p]);setTotalCount(p=>p+1);});
      }
    }).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[country,categoryName]);

  // Infinite scroll
  useEffect(()=>{
    if(observerRef.current)observerRef.current.disconnect();
    let tid:ReturnType<typeof setTimeout>;
    observerRef.current=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&hasMore&&!loadingMore&&!loading){
        clearTimeout(tid);tid=setTimeout(()=>{
          startTransition(()=>setLoadingMore(true));
          const np=page+1;
          loadProfiles(np,true).then(d=>{if(aliveRef.current)startTransition(()=>{setProfiles(p=>[...p,...d]);setPage(np);setLoadingMore(false);});});
        },300);
      }
    },{threshold:0.1,rootMargin:'200px'});
    if(loaderRef.current)observerRef.current.observe(loaderRef.current);
    return()=>{observerRef.current?.disconnect();clearTimeout(tid);};
  },[hasMore,loadingMore,loading,page,loadProfiles]);

  const toggleExtra=(key:string)=>{setSelectedExtras(p=>p.includes(key)?p.filter(k=>k!==key):[...p,key]);};
  const hasAnyFilter=selectedFilter!=='all'||selectedVisa||selectedAccommodation||selectedGender||selectedLanguage||selectedLicense||selectedTools||selectedExtras.length>0;
  const clearAll=()=>{setSelectedFilter('all');setSelectedVisa('');setSelectedAccommodation('');setSelectedGender('');setSelectedLanguage('');setSelectedLicense('');setSelectedTools('');setSelectedExtras([]);};

  const QUICK_FILTERS=useMemo(()=>[{key:'all',label:tr.all},{key:'available',label:tr.availableNow},{key:'online',label:tr.online},{key:'verified',label:tr.verified}],[tr]);
  const MORE_FILTERS=useMemo(()=>[{key:'with_visa',label:tr.withVisa},{key:'need_visa',label:tr.needVisa},{key:'with_accommodation',label:tr.withAccommodation},{key:'local_hire',label:tr.localHire}],[tr]);
  const SORT_OPTIONS=useMemo(()=>[{key:'newest',label:tr.newest},{key:'rating_high',label:tr.ratingHigh},{key:'experience',label:tr.experience},{key:'salary_low',label:tr.salaryLow},{key:'salary_high',label:tr.salaryHigh}],[tr]);

  const skeletons=useMemo(()=>Array.from({length:CONFIG.ITEMS_PER_PAGE}).map((_,i)=>(<div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse"><div className="w-full h-40 bg-gray-200"/><div className="p-2 space-y-1.5"><div className="h-4 bg-gray-200 rounded w-3/4"/><div className="h-3 bg-gray-200 rounded w-1/2"/></div></div>)),[]);

  return(
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang}/>
      <div className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        
        {/* ✅ DYNAMIC BANNER — PNG Image */}
        <div className="relative rounded-xl overflow-hidden mb-3 shadow-lg h-32 lg:h-40">
          {!imgError?(
            <img src={categoryImage} alt={translateCategory(categoryName,lang)} className="w-full h-full object-cover" loading="eager" onError={()=>setImgError(true)}/>
          ):(
            <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center gap-3">
              <ImageIcon size={36} className="text-white/20"/>
              <span className="text-white/40 text-base font-medium">{translateCategory(categoryName,lang)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/50"/>
          <div className="absolute inset-0 p-4 lg:p-5 flex flex-col justify-center">
            <p className="text-white/70 text-[10px] lg:text-xs font-medium mb-1 uppercase tracking-wider">{isMainCategory?tr.mainCategories:tr.otherCategories}</p>
            <h1 className="text-xl lg:text-3xl font-bold text-white drop-shadow-lg">{translateCategory(categoryName,lang)}</h1>
            <p className="text-white/60 text-xs lg:text-sm mt-1">{country?.toUpperCase()}</p>
            {!loading&&(
              <div className="mt-2">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>{totalCount} {tr.workersFound}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ✅ FILTERS + SORT — PC */}
        <div className="hidden lg:block bg-white rounded-xl border shadow-sm mb-3 overflow-hidden">
          <div className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              {QUICK_FILTERS.map(f=>(
                <button key={f.key} onClick={()=>setSelectedFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${selectedFilter===f.key?'bg-orange-600 text-white shadow-md shadow-orange-200':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f.label}</button>
              ))}
              <button onClick={()=>setShowMoreFilters(!showMoreFilters)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1 ${selectedFilter==='with_visa'||selectedFilter==='need_visa'||selectedFilter==='with_accommodation'||selectedFilter==='local_hire'?'bg-orange-600 text-white shadow-md':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Filter size={12}/>{tr.moreFilters}<ChevronDown size={12} className={`transition-transform ${showMoreFilters?'rotate-180':''}`}/>
              </button>
              {hasAnyFilter&&(
                <button onClick={clearAll} className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95 flex items-center gap-1"><X size={12}/>{tr.clearAll}</button>
              )}
              <div className="flex-1"/>
              <div className="relative">
                <button onClick={()=>setShowSortDropdown(!showSortDropdown)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-95 flex items-center gap-1">
                  <ArrowUpDown size={12}/>{tr.sortBy}: {SORT_OPTIONS.find(s=>s.key===selectedSort)?.label||tr.newest}
                </button>
                {showSortDropdown&&(
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border z-30 py-1 min-w-[160px]" onClick={()=>setShowSortDropdown(false)}>
                    {SORT_OPTIONS.map(s=>(
                      <button key={s.key} onClick={()=>setSelectedSort(s.key)} className={`w-full px-4 py-2 text-xs text-left hover:bg-gray-50 transition ${selectedSort===s.key?'text-orange-600 font-bold bg-orange-50':''}`}>{s.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {showMoreFilters&&(
            <div className="border-t bg-gray-50/50 p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 flex-wrap">
                {MORE_FILTERS.map(f=>(
                  <button key={f.key} onClick={()=>setSelectedFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${selectedFilter===f.key?'bg-orange-600 text-white shadow-md':'bg-white text-gray-600 border hover:border-orange-300 hover:text-orange-600'}`}>{f.label}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {filterConfig.visa&&(
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">{tr.visaStatus}</label>
                    <div className="flex gap-1">
                      <button onClick={()=>setSelectedVisa(selectedVisa==='has_visa'?'':'has_visa')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedVisa==='has_visa'?'bg-green-500 text-white':'bg-white border text-gray-600 hover:border-green-300'}`}>✅ {tr.hasVisa}</button>
                      <button onClick={()=>setSelectedVisa(selectedVisa==='need_visa'?'':'need_visa')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedVisa==='need_visa'?'bg-yellow-500 text-white':'bg-white border text-gray-600 hover:border-yellow-300'}`}>🎫 {tr.noVisa}</button>
                    </div>
                  </div>
                )}
                {filterConfig.accommodation&&(
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">{tr.accommodation}</label>
                    <div className="flex gap-1">
                      <button onClick={()=>setSelectedAccommodation(selectedAccommodation==='provided'?'':'provided')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedAccommodation==='provided'?'bg-blue-500 text-white':'bg-white border text-gray-600 hover:border-blue-300'}`}>🏠 {tr.provided}</button>
                      <button onClick={()=>setSelectedAccommodation(selectedAccommodation==='not_provided'?'':'not_provided')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedAccommodation==='not_provided'?'bg-purple-500 text-white':'bg-white border text-gray-600 hover:border-purple-300'}`}>🚫 {tr.notProvided}</button>
                    </div>
                  </div>
                )}
                {filterConfig.gender&&(
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">{tr.gender}</label>
                    <div className="flex gap-1">
                      <button onClick={()=>setSelectedGender(selectedGender==='male'?'':'male')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedGender==='male'?'bg-blue-500 text-white':'bg-white border text-gray-600 hover:border-blue-300'}`}>👨 {tr.male}</button>
                      <button onClick={()=>setSelectedGender(selectedGender==='female'?'':'female')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedGender==='female'?'bg-pink-500 text-white':'bg-white border text-gray-600 hover:border-pink-300'}`}>👩 {tr.female}</button>
                    </div>
                  </div>
                )}
                {filterConfig.language&&(
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">{tr.language}</label>
                    <select value={selectedLanguage} onChange={e=>setSelectedLanguage(e.target.value)} className="w-full py-1.5 px-2 border rounded-lg text-[10px] bg-white">
                      <option value="">{tr.any}</option>
                      <option value="english">{tr.english}</option>
                      <option value="arabic">{tr.arabic}</option>
                      <option value="hindi">{tr.hindi}</option>
                      <option value="bengali">{tr.bengali}</option>
                    </select>
                  </div>
                )}
                {filterConfig.license&&(
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">{tr.license}</label>
                    <div className="flex gap-1">
                      <button onClick={()=>setSelectedLicense(selectedLicense==='has_license'?'':'has_license')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedLicense==='has_license'?'bg-orange-500 text-white':'bg-white border text-gray-600'}`}>✅ {tr.hasLicense}</button>
                    </div>
                  </div>
                )}
                {filterConfig.tools&&(
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">{tr.tools}</label>
                    <div className="flex gap-1">
                      <button onClick={()=>setSelectedTools(selectedTools==='has_tools'?'':'has_tools')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedTools==='has_tools'?'bg-teal-500 text-white':'bg-white border text-gray-600'}`}>🔧 {tr.hasTools}</button>
                    </div>
                  </div>
                )}
                {/* ✅ TYPE FIXED — Optional chain */}
                {filterConfig.extras?.map(ext=>(
                  <div key={ext.key}>
                    <button onClick={()=>toggleExtra(ext.key)} className={`w-full py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedExtras.includes(ext.key)?'bg-orange-500 text-white':'bg-white border text-gray-600 hover:border-orange-300'}`}>
                      {selectedExtras.includes(ext.key)?'✅ ':'➕ '}{tr[ext.label as keyof typeof tr]||ext.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ✅ FILTERS + SORT — Mobile */}
        <div className="lg:hidden bg-white rounded-xl border shadow-sm mb-3 overflow-hidden">
          <div className="p-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {QUICK_FILTERS.map(f=>(
                <button key={f.key} onClick={()=>setSelectedFilter(f.key)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all active:scale-95 ${selectedFilter===f.key?'bg-orange-600 text-white shadow':'bg-gray-100 text-gray-600'}`}>{f.label}</button>
              ))}
              <button onClick={()=>setShowMoreFilters(!showMoreFilters)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 ${selectedFilter==='with_visa'||selectedFilter==='need_visa'||selectedFilter==='with_accommodation'||selectedFilter==='local_hire'?'bg-orange-600 text-white':'bg-gray-100 text-gray-600'}`}>
                <SlidersHorizontal size={10}/>{tr.moreFilters}
              </button>
              <div className="relative">
                <button onClick={()=>setShowSortDropdown(!showSortDropdown)} className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap bg-gray-100 text-gray-600 flex items-center gap-1">
                  <ArrowUpDown size={10}/>{tr.sortBy}
                </button>
                {showSortDropdown&&(
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-xl border z-30 py-1 min-w-[140px]" onClick={()=>setShowSortDropdown(false)}>
                    {SORT_OPTIONS.map(s=>(
                      <button key={s.key} onClick={()=>setSelectedSort(s.key)} className={`w-full px-3 py-2 text-[11px] text-left hover:bg-gray-50 ${selectedSort===s.key?'text-orange-600 font-bold bg-orange-50':''}`}>{s.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {showMoreFilters&&(
            <div className="border-t bg-gray-50/50 p-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
              {hasAnyFilter&&(
                <button onClick={clearAll} className="w-full py-1.5 rounded-lg text-[10px] font-medium bg-red-50 text-red-500 flex items-center justify-center gap-1"><X size={10}/>{tr.clearAll}</button>
              )}
              {filterConfig.visa&&(
                <div className="flex gap-1">
                  <button onClick={()=>setSelectedVisa(selectedVisa==='has_visa'?'':'has_visa')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${selectedVisa==='has_visa'?'bg-green-500 text-white':'bg-white border'}`}>✅ {tr.hasVisa}</button>
                  <button onClick={()=>setSelectedVisa(selectedVisa==='need_visa'?'':'need_visa')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${selectedVisa==='need_visa'?'bg-yellow-500 text-white':'bg-white border'}`}>🎫 {tr.noVisa}</button>
                </div>
              )}
              {filterConfig.accommodation&&(
                <div className="flex gap-1">
                  <button onClick={()=>setSelectedAccommodation(selectedAccommodation==='provided'?'':'provided')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${selectedAccommodation==='provided'?'bg-blue-500 text-white':'bg-white border'}`}>🏠 {tr.provided}</button>
                  <button onClick={()=>setSelectedAccommodation(selectedAccommodation==='not_provided'?'':'not_provided')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${selectedAccommodation==='not_provided'?'bg-purple-500 text-white':'bg-white border'}`}>🚫 {tr.notProvided}</button>
                </div>
              )}
              {filterConfig.gender&&(
                <div className="flex gap-1">
                  <button onClick={()=>setSelectedGender(selectedGender==='male'?'':'male')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${selectedGender==='male'?'bg-blue-500 text-white':'bg-white border'}`}>👨 {tr.male}</button>
                  <button onClick={()=>setSelectedGender(selectedGender==='female'?'':'female')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${selectedGender==='female'?'bg-pink-500 text-white':'bg-white border'}`}>👩 {tr.female}</button>
                </div>
              )}
              {filterConfig.language&&(
                <select value={selectedLanguage} onChange={e=>setSelectedLanguage(e.target.value)} className="w-full py-1.5 px-2 border rounded-lg text-[10px] bg-white">
                  <option value="">{tr.any} {tr.language}</option>
                  <option value="english">{tr.english}</option><option value="arabic">{tr.arabic}</option>
                  <option value="hindi">{tr.hindi}</option><option value="bengali">{tr.bengali}</option>
                </select>
              )}
              {/* ✅ TYPE FIXED — Optional chain */}
              {filterConfig.extras?.map(ext=>(
                <button key={ext.key} onClick={()=>toggleExtra(ext.key)} className={`w-full py-1.5 rounded-lg text-[10px] font-medium ${selectedExtras.includes(ext.key)?'bg-orange-500 text-white':'bg-white border'}`}>
                  {selectedExtras.includes(ext.key)?'✅ ':'➕ '}{tr[ext.label as keyof typeof tr]||ext.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error&&(
          <div className="text-center py-12">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-2"/>
            <p className="text-sm text-red-500 mb-3">{tr.error}</p>
            <button onClick={()=>{retryRef.current=0;resetAndLoad();}} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center gap-2 mx-auto"><RefreshCw size={14}/> {tr.retry}</button>
          </div>
        )}

        {/* Loading */}
        {loading&&<div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3">{skeletons}</div>}

        {/* Empty */}
        {!loading&&!error&&profiles.length===0&&(
          <div className="text-center py-16">
            <img src={categoryImage} alt="" className="w-20 h-20 object-cover rounded-full mx-auto mb-4 opacity-50 grayscale" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
            <Package size={32} className="text-gray-300 mx-auto mb-2"/>
            <p className="text-gray-500 font-medium">{tr.noWorkers}</p>
            <p className="text-xs text-gray-400 mt-1">{translateCategory(categoryName,lang)}</p>
            {hasAnyFilter&&(
              <button onClick={clearAll} className="mt-3 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-xs font-medium hover:bg-orange-200 transition">{tr.clearAll}</button>
            )}
          </div>
        )}

        {/* PC Grid */}
        {!loading&&!error&&profiles.length>0&&(
          <div className="hidden lg:grid grid-cols-6 gap-3">
            {profiles.map(p=><ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang}/>)}
          </div>
        )}

        {/* Mobile Grid */}
        {!loading&&!error&&profiles.length>0&&(
          <div className="grid grid-cols-2 gap-2 lg:hidden">
            {profiles.map(p=><ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang}/>)}
          </div>
        )}

        {/* Infinite Scroll */}
        {hasMore&&!error&&(
          <div ref={loaderRef} className="py-6 text-center">
            {loadingMore&&(
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-orange-500"/>
                <span className="text-xs text-gray-500">{tr.loading}</span>
              </div>
            )}
          </div>
        )}
        {!hasMore&&profiles.length>0&&!loading&&<p className="text-center text-xs text-gray-400 py-6">{tr.allLoaded}</p>}
      </div>
      <MobileNav country={country} lang={lang}/>
    </div>
  );
}