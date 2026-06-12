// components/map/MapFilters.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফুল ফিচার
"use client";
import React,{useCallback,useMemo,startTransition} from 'react';
import {useRouter} from 'next/navigation';
import {getText,LangCode} from '@/lib/language';
import {Filter,MapPin,Ruler} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষায় ক্যাটাগরি — 42 Categories (12 Main + 30 Other)
// ═══════════════════════════════════════════════════════════
const CATEGORIES:Record<string,Record<string,string>>={
  // ✅ 12 Main Categories
  Driver:{en:'Driver',ar:'سائق',bn:'ড্রাইভার',hi:'ड्राइवर'},
  Electrician:{en:'Electrician',ar:'كهربائي',bn:'ইলেকট্রিশিয়ান',hi:'इलेक्ट्रीशियन'},
  Plumber:{en:'Plumber',ar:'سباك',bn:'প্লাম্বার',hi:'प्लंबर'},
  Mason:{en:'Mason',ar:'بناء',bn:'রাজমিস্ত্রি',hi:'राजमिस्त्री'},
  'AC Technician':{en:'AC Technician',ar:'فني تكييف',bn:'এসি টেকনিশিয়ান',hi:'एसी तकनीशियन'},
  Painter:{en:'Painter',ar:'دهان',bn:'পেইন্টার',hi:'पेंटर'},
  Carpenter:{en:'Carpenter',ar:'نجار',bn:'কার্পেন্টার',hi:'बढ़ई'},
  Welder:{en:'Welder',ar:'لحام',bn:'ওয়েল্ডার',hi:'वेल्डर'},
  Cleaner:{en:'Cleaner',ar:'منظف',bn:'ক্লিনার',hi:'क्लीनर'},
  Cook:{en:'Cook',ar:'طباخ',bn:'রাঁধুনি',hi:'रसोइया'},
  Helper:{en:'Helper',ar:'مساعد',bn:'হেল্পার',hi:'हेल्पर'},
  Gardener:{en:'Gardener',ar:'بستاني',bn:'মালী',hi:'माली'},
  
  // ✅ 30 Other Categories
  Housemaid:{en:'Housemaid',ar:'خادمة',bn:'গৃহকর্মী',hi:'हाउसमेड'},
  Nanny:{en:'Nanny',ar:'مربية',bn:'আয়া',hi:'नैनी'},
  'Office Assistant':{en:'Office Assistant',ar:'مساعد مكتبي',bn:'অফিস সহকারী',hi:'ऑफिस असिस्टेंट'},
  Receptionist:{en:'Receptionist',ar:'موظف استقبال',bn:'রিসেপশনিস্ট',hi:'रिसेप्शनिस्ट'},
  Salesman:{en:'Salesman',ar:'بائع',bn:'সেলসম্যান',hi:'सेल्समैन'},
  Cashier:{en:'Cashier',ar:'كاشير',bn:'ক্যাশিয়ার',hi:'कैशियर'},
  'Security Guard':{en:'Security Guard',ar:'حارس أمن',bn:'সিকিউরিটি গার্ড',hi:'सिक्योरिटी गार्ड'},
  Nurse:{en:'Nurse',ar:'ممرض',bn:'নার্স',hi:'नर्स'},
  Pharmacist:{en:'Pharmacist',ar:'صيدلي',bn:'ফার্মাসিস্ট',hi:'फार्मासिस्ट'},
  'Lab Technician':{en:'Lab Technician',ar:'فني مختبر',bn:'ল্যাব টেকনিশিয়ান',hi:'लैब तकनीशियन'},
  Physiotherapist:{en:'Physiotherapist',ar:'معالج طبيعي',bn:'ফিজিওথেরাপিস্ট',hi:'फिजियोथेरेपिस्ट'},
  Mechanic:{en:'Mechanic',ar:'ميكانيكي',bn:'মেকানিক',hi:'मैकेनिक'},
  Tailor:{en:'Tailor',ar:'خياط',bn:'দর্জি',hi:'दर्जी'},
  Barista:{en:'Barista',ar:'باريستا',bn:'বারিস্তা',hi:'बरिस्ता'},
  Photographer:{en:'Photographer',ar:'مصور',bn:'ফটোগ্রাফার',hi:'फोटोग्राफर'},
  'CCTV Technician':{en:'CCTV Technician',ar:'فني كاميرات',bn:'সিসিটিভি টেকনিশিয়ান',hi:'CCTV तकनीशियन'},
  'Gypsum Carpenter':{en:'Gypsum Carpenter',ar:'نجار جبس',bn:'জিপসাম কার্পেন্টার',hi:'जिप्सम कारपेंटर'},
  'Tiles Mason':{en:'Tiles Mason',ar:'عامل تبليط',bn:'টাইলস মিস্ত্রি',hi:'टाइल्स मिस्त्री'},
  Blacksmith:{en:'Blacksmith',ar:'حداد',bn:'কামার',hi:'लोहार'},
  'General Labour':{en:'General Labour',ar:'عامل عام',bn:'সাধারণ শ্রমিক',hi:'सामान्य श्रमिक'},
  'Steel Fixer':{en:'Steel Fixer',ar:'مثبت حديد',bn:'স্টিল ফিক্সার',hi:'स्टील फिक्सर'},
  Scaffolder:{en:'Scaffolder',ar:'عامل سقالات',bn:'স্ক্যাফোল্ডার',hi:'स्कैफोल्डर'},
  'Heavy Driver':{en:'Heavy Driver',ar:'سائق ثقيل',bn:'ভারী ড্রাইভার',hi:'भारी ड्राइवर'},
  'Forklift Operator':{en:'Forklift Operator',ar:'مشغل رافعة',bn:'ফর্কলিফট অপারেটর',hi:'फोर्कलिफ्ट ऑपरेटर'},
  'Crane Operator':{en:'Crane Operator',ar:'مشغل رافعة',bn:'ক্রেন অপারেটর',hi:'क्रेन ऑपरेटर'},
  'Pipe Fitter':{en:'Pipe Fitter',ar:'مركب أنابيب',bn:'পাইপ ফিটার',hi:'पाइप फिटर'},
  Waiter:{en:'Waiter',ar:'نادل',bn:'ওয়েটার',hi:'वेटर'},
  'Hotel Housekeeping':{en:'Hotel Housekeeping',ar:'تدبير فندقي',bn:'হোটেল হাউসকিপিং',hi:'होटल हाउसकीपिंग'},
  Beautician:{en:'Beautician',ar:'خبيرة تجميل',bn:'বিউটিশিয়ান',hi:'ब्यूटीशियन'},
  Barber:{en:'Barber',ar:'حلاق',bn:'নাপিত',hi:'नाई'},
};

// ═══════════════════════════════════════════════════════════
// ৪ ভাষায় ডিসট্যান্স অপশন
// ═══════════════════════════════════════════════════════════
const DISTANCE_OPTIONS=[
  {value:'all',en:'All Distance',bn:'সব দূরত্ব',ar:'كل المسافات',hi:'सभी दूरी'},
  {value:'5',en:'5 km',bn:'৫ কিমি',ar:'٥ كم',hi:'५ किमी'},
  {value:'10',en:'10 km',bn:'১০ কিমি',ar:'١٠ كم',hi:'१० किमी'},
  {value:'20',en:'20 km',bn:'২০ কিমি',ar:'٢٠ كم',hi:'२० किमी'},
  {value:'50',en:'50 km',bn:'৫০ কিমি',ar:'٥٠ كم',hi:'५० किमी'},
];

interface Props{
  country:string;
  lang:string;
  category:string;
  distance:string;
}

// ═══════════════════════════════════════════════════════════
// MapFilters (Memoized + GPU + 4 Lang)
// ═══════════════════════════════════════════════════════════
const MapFilters=React.memo(({country,lang,category,distance}:Props)=>{
  const router=useRouter();
  const t=useCallback((key:string)=>getText(lang as LangCode,key),[lang]);

  // Memoized category options
  const categoryOptions=useMemo(()=>
    Object.entries(CATEGORIES).map(([key,val])=>(
      <option key={key} value={key}>{val[lang]||val.en}</option>
    )),
  [lang]);

  // Memoized distance options
  const distanceOptions=useMemo(()=>
    DISTANCE_OPTIONS.map(opt=>(
      <option key={opt.value} value={opt.value}>{(opt as any)[lang]||opt.en}</option>
    )),
  [lang]);

  // Optimistic URL update
  const handleCategoryChange=useCallback((e:React.ChangeEvent<HTMLSelectElement>)=>{
    const newCat=e.target.value;
    startTransition(()=>{
      router.push(`/${country}/${lang}/map?cat=${newCat}&dist=${distance}`,{scroll:false});
    });
  },[country,lang,distance,router]);

  const handleDistanceChange=useCallback((e:React.ChangeEvent<HTMLSelectElement>)=>{
    const newDist=e.target.value;
    startTransition(()=>{
      router.push(`/${country}/${lang}/map?cat=${category}&dist=${newDist}`,{scroll:false});
    });
  },[country,lang,category,router]);

  return(
    <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide" style={{contain:'layout style paint',transform:'translateZ(0)'}}>
      {/* Category Filter */}
      <div className="relative flex-shrink-0">
        <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300"
        >
          <option value="all">{t('categories')||'All Categories'}</option>
          {categoryOptions}
        </select>
      </div>
      
      {/* Distance Filter */}
      <div className="relative flex-shrink-0">
        <Ruler size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        <select
          value={distance}
          onChange={handleDistanceChange}
          className="pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300"
        >
          {distanceOptions}
        </select>
      </div>
      
      {/* Active Filters Badge */}
      {(category!=='all'||distance!=='all')&&(
        <button
          onClick={()=>router.push(`/${country}/${lang}/map`,{scroll:false})}
          className="flex-shrink-0 px-3 py-2 bg-orange-50 text-orange-600 rounded-xl text-xs font-medium hover:bg-orange-100 active:scale-95 transition-all"
        >
          ✕ {lang==='bn'?'ফিল্টার রিসেট':lang==='ar'?'إعادة تعيين':'Reset Filters'}
        </button>
      )}
    </div>
  );
});

MapFilters.displayName='MapFilters';

export default MapFilters;