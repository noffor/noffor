// components/profile/BioGrid.tsx - 🚀 FINAL FIX • NO DUPLICATE KEYS
"use client";
import React,{useMemo} from 'react';
import {
  Briefcase,Award,Languages,Shield,Home,Utensils,MapPin,CreditCard,Clock,Phone,Mail,User,
  CheckCircle,Star,Globe,Heart,Users,Flag,Ruler,Scale,Wrench,FileText,Calendar
} from 'lucide-react';
import { translateNumber, translatePhone, getCurrencySymbol } from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা লেবেল
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{
    experience:'Experience',license:'License',languages:'Languages',
    visaStatus:'Visa Status',sponsorship:'Sponsorship',accommodation:'Accommodation',
    food:'Food',city:'City',area:'Area',salary:'Salary',status:'Status',
    online:'Online',offline:'Offline',yes:'Yes',no:'No',age:'Age',
    phone:'Phone',email:'Email',rating:'Rating',verified:'Verified',
    completedJobs:'Completed Jobs',responseTime:'Response Time',
    transport:'Transport',insurance:'Insurance',
    gender:'Gender',nationality:'Nationality',religion:'Religion',
    maritalStatus:'Marital Status',height:'Height',weight:'Weight',
    salaryType:'Salary Type',skills:'Skills',passportStatus:'Passport Status',
    availableFrom:'Available From',workingHours:'Working Hours',daysOff:'Days Off',
  },
  bn:{
    experience:'অভিজ্ঞতা',license:'লাইসেন্স',languages:'ভাষা',
    visaStatus:'ভিসার অবস্থা',sponsorship:'স্পনসরশিপ',accommodation:'আবাসন',
    food:'খাবার',city:'শহর',area:'এলাকা',salary:'বেতন',status:'অবস্থা',
    online:'অনলাইন',offline:'অফলাইন',yes:'হ্যাঁ',no:'না',age:'বয়স',
    phone:'ফোন',email:'ইমেইল',rating:'রেটিং',verified:'ভেরিফাইড',
    completedJobs:'সম্পন্ন কাজ',responseTime:'সাড়ার সময়',
    transport:'পরিবহন',insurance:'বীমা',
    gender:'লিঙ্গ',nationality:'জাতীয়তা',religion:'ধর্ম',
    maritalStatus:'বৈবাহিক অবস্থা',height:'উচ্চতা',weight:'ওজন',
    salaryType:'বেতনের ধরন',skills:'দক্ষতা',passportStatus:'পাসপোর্ট',
    availableFrom:'পাওয়া যাবে',workingHours:'কাজের সময়',daysOff:'ছুটি',
  },
  ar:{
    experience:'خبرة',license:'رخصة',languages:'لغات',
    visaStatus:'حالة التأشيرة',sponsorship:'الكفالة',accommodation:'سكن',
    food:'طعام',city:'مدينة',area:'منطقة',salary:'راتب',status:'حالة',
    online:'متصل',offline:'غير متصل',yes:'نعم',no:'لا',age:'عمر',
    phone:'هاتف',email:'بريد',rating:'تقييم',verified:'موثق',
    completedJobs:'وظائف مكتملة',responseTime:'وقت الاستجابة',
    transport:'نقل',insurance:'تأمين',
    gender:'الجنس',nationality:'الجنسية',religion:'الدين',
    maritalStatus:'الحالة الاجتماعية',height:'الطول',weight:'الوزن',
    salaryType:'نوع الراتب',skills:'مهارات',passportStatus:'حالة الجواز',
    availableFrom:'متاح من',workingHours:'ساعات العمل',daysOff:'أيام العطلة',
  },
  hi:{
    experience:'अनुभव',license:'लाइसेंस',languages:'भाषाएं',
    visaStatus:'वीज़ा स्थिति',sponsorship:'प्रायोजन',accommodation:'आवास',
    food:'भोजन',city:'शहर',area:'क्षेत्र',salary:'वेतन',status:'स्थिति',
    online:'ऑनलाइन',offline:'ऑफलाइन',yes:'हाँ',no:'नहीं',age:'आयु',
    phone:'फोन',email:'ईमेल',rating:'रेटिंग',verified:'सत्यापित',
    completedJobs:'पूर्ण कार्य',responseTime:'प्रतिक्रिया समय',
    transport:'परिवहन',insurance:'बीमा',
    gender:'लिंग',nationality:'राष्ट्रीयता',religion:'धर्म',
    maritalStatus:'वैवाहिक स्थिति',height:'ऊंचाई',weight:'वजन',
    salaryType:'वेतन प्रकार',skills:'कौशल',passportStatus:'पासपोर्ट',
    availableFrom:'उपलब्ध',workingHours:'काम के घंटे',daysOff:'छुट्टी',
  },
};

// ═══════════════════════════════════════════════════════════
// VALUE_MAP — FUNCTION APPROACH (NO DUPLICATE KEYS)
// ═══════════════════════════════════════════════════════════
function getTranslatedValue(key:string, lang:string):string{
  const map:Record<string,Record<string,string>>={
    // Cities
    Doha:{en:'Doha',bn:'দোহা',ar:'الدوحة',hi:'दोहा'},
    'Al Rayyan':{en:'Al Rayyan',bn:'আল রাইয়ান',ar:'الريان',hi:'अल रय्यान'},
    'Al Wakrah':{en:'Al Wakrah',bn:'আল ওয়াকরাহ',ar:'الوكرة',hi:'अल वकरा'},
    'Al Khor':{en:'Al Khor',bn:'আল খোর',ar:'الخور',hi:'अल खोर'},
    Lusail:{en:'Lusail',bn:'লুসাইল',ar:'لوسيل',hi:'लुसैल'},
    Mesaieed:{en:'Mesaieed',bn:'মেসাইদ',ar:'مسيعيد',hi:'मेसाईद'},
    'Umm Salal':{en:'Umm Salal',bn:'উম্ম সালাল',ar:'أم صلال',hi:'उम्म सलाल'},
    'Al Daayen':{en:'Al Daayen',bn:'আল দায়েন',ar:'الضعاين',hi:'अल दायेन'},
    Riyadh:{en:'Riyadh',bn:'রিয়াদ',ar:'الرياض',hi:'रियाद'},
    Jeddah:{en:'Jeddah',bn:'জেদ্দা',ar:'جدة',hi:'जेद्दा'},
    Mecca:{en:'Mecca',bn:'মক্কা',ar:'مكة',hi:'मक्का'},
    Medina:{en:'Medina',bn:'মদিনা',ar:'المدينة',hi:'मदीना'},
    Dammam:{en:'Dammam',bn:'দাম্মাম',ar:'الدمام',hi:'दम्माम'},
    Khobar:{en:'Khobar',bn:'খোবার',ar:'الخبر',hi:'खोबर'},
    Taif:{en:'Taif',bn:'তায়েফ',ar:'الطائف',hi:'ताइफ'},
    Tabuk:{en:'Tabuk',bn:'তাবুক',ar:'تبوك',hi:'ताबुक'},
    Dubai:{en:'Dubai',bn:'দুবাই',ar:'دبي',hi:'दुबई'},
    'Abu Dhabi':{en:'Abu Dhabi',bn:'আবুধাবি',ar:'أبوظبي',hi:'अबू धाबी'},
    Sharjah:{en:'Sharjah',bn:'শারজাহ',ar:'الشارقة',hi:'शारजाह'},
    Ajman:{en:'Ajman',bn:'আজমান',ar:'عجمان',hi:'अजमान'},
    'Ras Al Khaimah':{en:'Ras Al Khaimah',bn:'রাস আল খাইমাহ',ar:'رأس الخيمة',hi:'रास अल खैमाह'},
    Fujairah:{en:'Fujairah',bn:'ফুজাইরাহ',ar:'الفجيرة',hi:'फुजैराह'},
    'Kuwait City':{en:'Kuwait City',bn:'কুয়েত সিটি',ar:'مدينة الكويت',hi:'कुवैत सिटी'},
    Hawalli:{en:'Hawalli',bn:'হাওয়াল্লি',ar:'حولي',hi:'हवाल्ली'},
    Salmiya:{en:'Salmiya',bn:'সালমিয়া',ar:'السالمية',hi:'सलमिया'},
    Fahaheel:{en:'Fahaheel',bn:'ফাহাহিল',ar:'الفحيحيل',hi:'फहाहील'},
    Jahra:{en:'Jahra',bn:'জাহরা',ar:'الجهراء',hi:'जहरा'},
    Manama:{en:'Manama',bn:'মানামা',ar:'المنامة',hi:'मनामा'},
    Riffa:{en:'Riffa',bn:'রিফা',ar:'الرفاع',hi:'रिफ्फा'},
    Muharraq:{en:'Muharraq',bn:'মুহাররাক',ar:'المحرق',hi:'मुहर्रक'},
    'Hamad Town':{en:'Hamad Town',bn:'হামাদ টাউন',ar:'مدينة حمد',hi:'हमद टाउन'},
    Muscat:{en:'Muscat',bn:'মাস্কাট',ar:'مسقط',hi:'मस्कट'},
    Salalah:{en:'Salalah',bn:'সালালাহ',ar:'صلالة',hi:'सलालाह'},
    Sohar:{en:'Sohar',bn:'সোহার',ar:'صحار',hi:'सोहार'},
    Nizwa:{en:'Nizwa',bn:'নিজওয়া',ar:'نزوى',hi:'निज़वा'},
    Sur:{en:'Sur',bn:'সুর',ar:'صور',hi:'सूर'},
    Buraimi:{en:'Buraimi',bn:'বুরাইমি',ar:'البريمي',hi:'बुरैमी'},
    // Areas
    'West Bay':{en:'West Bay',bn:'ওয়েস্ট বে',ar:'الخليج الغربي',hi:'वेस्ट बे'},
    'Al Sadd':{en:'Al Sadd',bn:'আল সাদ',ar:'السد',hi:'अल सद्द'},
    'Bin Mahmoud':{en:'Bin Mahmoud',bn:'বিন মাহমুদ',ar:'بن محمود',hi:'बिन महमूद'},
    'Old Airport':{en:'Old Airport',bn:'ওল্ড এয়ারপোর্ট',ar:'المطار القديم',hi:'ओल्ड एयरपोर्ट'},
    'Industrial Area':{en:'Industrial Area',bn:'ইন্ডাস্ট্রিয়াল এরিয়া',ar:'المنطقة الصناعية',hi:'इंडस्ट्रियल एरिया'},
    Najma:{en:'Najma',bn:'নাজমা',ar:'نجمة',hi:'नजमा'},
    'Al Gharafa':{en:'Al Gharafa',bn:'আল ঘারাফা',ar:'الغرافة',hi:'अल घराफा'},
    Muaither:{en:'Muaither',bn:'মুয়াইথির',ar:'معيذر',hi:'मुआइथिर'},
    'Al Wukair':{en:'Al Wukair',bn:'আল উকাইর',ar:'الوكير',hi:'अल वुकैर'},
    'The Pearl':{en:'The Pearl',bn:'দ্য পার্ল',ar:'اللؤلؤة',hi:'द पर्ल'},
    // Languages
    Bengali:{en:'Bengali',bn:'বাংলা',ar:'البنغالية',hi:'बंगाली'},
    English:{en:'English',bn:'ইংরেজি',ar:'الإنجليزية',hi:'अंग्रेजी'},
    Arabic:{en:'Arabic',bn:'আরবি',ar:'العربية',hi:'अरबी'},
    Hindi:{en:'Hindi',bn:'হিন্দি',ar:'الهندية',hi:'हिन्दी'},
    Urdu:{en:'Urdu',bn:'উর্দু',ar:'الأردية',hi:'उर्दू'},
    Malayalam:{en:'Malayalam',bn:'মালায়ালাম',ar:'المالايالامية',hi:'मलयालम'},
    Tamil:{en:'Tamil',bn:'তামিল',ar:'التاميلية',hi:'तमिल'},
    Nepali:{en:'Nepali',bn:'নেপালি',ar:'النيبالية',hi:'नेपाली'},
    Tagalog:{en:'Tagalog',bn:'তাগালগ',ar:'التاغالوغية',hi:'तागालोग'},
    Sinhala:{en:'Sinhala',bn:'সিংহলি',ar:'السنهالية',hi:'सिंहली'},
    // Visa
    Transferable:{en:'Transferable',bn:'স্থানান্তরযোগ্য',ar:'قابل للتحويل',hi:'हस्तांतरणीय'},
    'Company Visa':{en:'Company Visa',bn:'কোম্পানি ভিসা',ar:'تأشيرة شركة',hi:'कंपनी वीज़ा'},
    'Freelance Visa':{en:'Freelance Visa',bn:'ফ্রিল্যান্স ভিসা',ar:'فيزا العمل الحر',hi:'फ्रीलांस वीज़ा'},
    'Family Sponsorship':{en:'Family Sponsorship',bn:'পারিবারিক স্পনসরশিপ',ar:'كفالة عائلية',hi:'पारिवारिक प्रायोजन'},
    'Visit Visa':{en:'Visit Visa',bn:'ভিজিট ভিসা',ar:'فيزا زيارة',hi:'विज़िट वीज़ा'},
    'Own Visa':{en:'Own Visa',bn:'নিজ ভিসা',ar:'تأشيرة خاصة',hi:'खुद का वीज़ा'},
    'Employment Visa':{en:'Employment Visa',bn:'এমপ্লয়মেন্ট ভিসা',ar:'فيزا عمل',hi:'रोजगार वीज़ा'},
    'Student Visa':{en:'Student Visa',bn:'স্টুডেন্ট ভিসা',ar:'فيزا طالب',hi:'छात्र वीज़ा'},
    // Sponsorship
    'Self Sponsorship':{en:'Self Sponsorship',bn:'স্ব স্পনসরশিপ',ar:'كفالة ذاتية',hi:'स्व प्रायोजन'},
    'Father Sponsorship':{en:'Father Sponsorship',bn:'পিতার স্পনসরশিপ',ar:'كفالة الأب',hi:'पिता प्रायोजन'},
    'Mother Sponsorship':{en:'Mother Sponsorship',bn:'মাতার স্পনসরশিপ',ar:'كفالة الأم',hi:'माता प्रायोजन'},
    'Husband Sponsorship':{en:'Husband Sponsorship',bn:'স্বামীর স্পনসরশিপ',ar:'كفالة الزوج',hi:'पति प्रायोजन'},
    'Company Sponsorship':{en:'Company Sponsorship',bn:'কোম্পানি স্পনসরশিপ',ar:'كفالة شركة',hi:'कंपनी प्रायोजन'},
    // Accommodation
    'Provided by Company':{en:'Provided by Company',bn:'কোম্পানি প্রদত্ত',ar:'مقدم من الشركة',hi:'कंपनी द्वारा'},
    Shared:{en:'Shared',bn:'শেয়ার্ড',ar:'مشترك',hi:'साझा'},
    'Own Accommodation':{en:'Own Accommodation',bn:'নিজস্ব আবাসন',ar:'سكن خاص',hi:'अपना आवास'},
    'Own Arrangement':{en:'Own Arrangement',bn:'নিজ ব্যবস্থা',ar:'ترتيب ذاتي',hi:'अपनी व्यवस्था'},
    'Live-in':{en:'Live-in',bn:'লিভ-ইন',ar:'مقيم',hi:'लिव-इन'},
    'Not Required':{en:'Not Required',bn:'প্রয়োজন নেই',ar:'غير مطلوب',hi:'आवश्यक नहीं'},
    // Passport
    Ready:{en:'Ready',bn:'প্রস্তুত',ar:'جاهز',hi:'तैयार'},
    Expired:{en:'Expired',bn:'মেয়াদোত্তীর্ণ',ar:'منتهي',hi:'समाप्त'},
    Processing:{en:'Processing',bn:'প্রক্রিয়াধীন',ar:'قيد المعالجة',hi:'प्रक्रिया में'},
    'Not Available':{en:'Not Available',bn:'উপলব্ধ নয়',ar:'غير متوفر',hi:'उपलब्ध नहीं'},
    // Salary Type
    Monthly:{en:'Monthly',bn:'মাসিক',ar:'شهري',hi:'मासिक'},
    Hourly:{en:'Hourly',bn:'ঘন্টা প্রতি',ar:'بالساعة',hi:'प्रति घंटा'},
    Daily:{en:'Daily',bn:'দৈনিক',ar:'يومي',hi:'दैनिक'},
    Weekly:{en:'Weekly',bn:'সাপ্তাহিক',ar:'أسبوعي',hi:'साप्ताहिक'},
    // Working Hours
    '8 Hours':{en:'8 Hours',bn:'৮ ঘন্টা',ar:'٨ ساعات',hi:'8 घंटे'},
    '10 Hours':{en:'10 Hours',bn:'১০ ঘন্টা',ar:'١٠ ساعات',hi:'10 घंटे'},
    '12 Hours':{en:'12 Hours',bn:'১২ ঘন্টা',ar:'١٢ ساعة',hi:'12 घंटे'},
    Flexible:{en:'Flexible',bn:'ফ্লেক্সিবল',ar:'مرن',hi:'लचीला'},
    // Days Off
    Friday:{en:'Friday',bn:'শুক্রবার',ar:'الجمعة',hi:'शुक्रवार'},
    'Weekly 1 day':{en:'Weekly 1 day',bn:'সাপ্তাহিক ১ দিন',ar:'يوم أسبوعياً',hi:'साप्ताहिक 1 दिन'},
    'Weekly 2 days':{en:'Weekly 2 days',bn:'সাপ্তাহিক ২ দিন',ar:'يومان أسبوعياً',hi:'साप्ताहिक 2 दिन'},
    'As per law':{en:'As per law',bn:'আইন অনুযায়ী',ar:'حسب القانون',hi:'कानून अनुसार'},
    // Religion
    Muslim:{en:'Muslim',bn:'মুসলিম',ar:'مسلم',hi:'मुस्लिम'},
    Hindu:{en:'Hindu',bn:'হিন্দু',ar:'هندوسي',hi:'हिन्दू'},
    Christian:{en:'Christian',bn:'খ্রিস্টান',ar:'مسيحي',hi:'ईसाई'},
    Buddhist:{en:'Buddhist',bn:'বৌদ্ধ',ar:'بوذي',hi:'बौद्ध'},
    Any:{en:'Any',bn:'যেকোনো',ar:'الكل',hi:'कोई भी'},
    // Marital
    Single:{en:'Single',bn:'অবিবাহিত',ar:'أعزب',hi:'अविवाहित'},
    Married:{en:'Married',bn:'বিবাহিত',ar:'متزوج',hi:'विवाहित'},
    Divorced:{en:'Divorced',bn:'তালাকপ্রাপ্ত',ar:'مطلق',hi:'तलाकशुदा'},
    // Nationality
    Bangladeshi:{en:'Bangladeshi',bn:'বাংলাদেশী',ar:'بنجلاديشي',hi:'बांग्लादेशी'},
    Indian:{en:'Indian',bn:'ভারতীয়',ar:'هندي',hi:'भारतीय'},
    Pakistani:{en:'Pakistani',bn:'পাকিস্তানি',ar:'باكستاني',hi:'पाकिस्तानी'},
    'Sri Lankan':{en:'Sri Lankan',bn:'শ্রীলঙ্কান',ar:'سريلانكي',hi:'श्रीलंकाई'},
    Filipino:{en:'Filipino',bn:'ফিলিপিনো',ar:'فلبيني',hi:'फिलिपिनो'},
    Egyptian:{en:'Egyptian',bn:'মিশরীয়',ar:'مصري',hi:'मिस्री'},
    // Gender
    Male:{en:'Male',bn:'পুরুষ',ar:'ذكر',hi:'पुरुष'},
    Female:{en:'Female',bn:'মহিলা',ar:'أنثى',hi:'महिला'},
    // License
    Light:{en:'Light',bn:'হালকা',ar:'خفيف',hi:'हल्का'},
    Heavy:{en:'Heavy',bn:'ভারী',ar:'ثقيل',hi:'भारी'},
    Motorcycle:{en:'Motorcycle',bn:'মোটরসাইকেল',ar:'دراجة نارية',hi:'मोटरसाइकिल'},
    Car:{en:'Car',bn:'গাড়ি',ar:'سيارة',hi:'कार'},
    Bus:{en:'Bus',bn:'বাস',ar:'حافلة',hi:'बस'},
    Truck:{en:'Truck',bn:'ট্রাক',ar:'شاحنة',hi:'ट्रक'},
    // General
    Have:{en:'Have',bn:'আছে',ar:'لديه',hi:'है'},
    Available:{en:'Available',bn:'উপলব্ধ',ar:'متاح',hi:'उपलब्ध'},
    Yes:{en:'Yes',bn:'হ্যাঁ',ar:'نعم',hi:'हाँ'},
    No:{en:'No',bn:'না',ar:'لا',hi:'नहीं'},
  };
  return map[key]?.[lang]||key;
}

// ═══════════════════════════════════════════════════════════
// BioItem
// ═══════════════════════════════════════════════════════════
const BioItem=React.memo(({icon:Icon,label,value}:{icon:any;label:string;value:string})=>(
  <div className="bg-gray-50 rounded-xl p-2.5 text-center hover:shadow-md transition-all hover:bg-gray-100 active:scale-[0.98] group" style={{transform:'translateZ(0)'}}>
    <Icon size={14} className="mx-auto mb-1 text-gray-400 group-hover:text-orange-500 transition-colors"/>
    <p className="text-[9px] text-gray-400 mb-0.5 select-none">{label}</p>
    <p className="text-[10px] font-semibold text-gray-700 truncate select-none">{value}</p>
  </div>
));
BioItem.displayName='BioItem';

// ═══════════════════════════════════════════════════════════
// BioGrid
// ═══════════════════════════════════════════════════════════
interface Props{profile:any;lang:string}

const BioGrid=React.memo(({profile,lang}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const currency=useMemo(()=>getCurrencySymbol(lang),[lang]);

  const translateValue=useMemo(()=>(value:any,key?:string):string=>{
    if(value===null||value===undefined||value==='')return'—';
    if(value===true)return tr.yes;
    if(value===false)return tr.no;
    const strValue=String(value);
    
    if(key==='phone')return translatePhone(strValue,lang);
    
    if(key==='salary'||key==='expected_salary'){
      const amount=strValue.replace(/[^0-9.]/g,'');
      return amount?`${translateNumber(amount,lang)} ${currency}`:'—';
    }
    
    if(key==='rating'){
      const num=parseFloat(strValue);
      return isNaN(num)?strValue:`${translateNumber(num,lang)} ★`;
    }
    
    if(key==='age'||key==='experience'||key==='height'||key==='weight'||key==='completedJobs'||key==='responseTime'){
      const num=parseInt(strValue);
      return isNaN(num)?strValue:translateNumber(num,lang);
    }
    
    if(Array.isArray(value))return value.map((v:any)=>getTranslatedValue(String(v),lang)).join(', ');
    
    return getTranslatedValue(strValue,lang);
  },[lang,tr,currency]);

  const gridItems=useMemo(()=>{
    const items=[
      {icon:User,key:'age',value:profile.age},
      {icon:Users,key:'gender',value:profile.gender},
      {icon:Flag,key:'nationality',value:profile.nationality},
      {icon:Heart,key:'religion',value:profile.religion},
      {icon:User,key:'maritalStatus',value:profile.marital_status},
      {icon:Ruler,key:'height',value:profile.height?`${profile.height} cm`:null},
      {icon:Scale,key:'weight',value:profile.weight?`${profile.weight} kg`:null},
      {icon:Briefcase,key:'experience',value:profile.experience},
      {icon:CreditCard,key:'salaryType',value:profile.salary_type},
      {icon:CreditCard,key:'salary',value:profile.expected_salary},
      {icon:Wrench,key:'skills',value:profile.skills},
      {icon:Languages,key:'languages',value:profile.languages},
      {icon:Shield,key:'visaStatus',value:profile.visa_status},
      {icon:Shield,key:'sponsorship',value:profile.sponsorship},
      {icon:FileText,key:'passportStatus',value:profile.passport_status},
      {icon:Calendar,key:'availableFrom',value:profile.available_from},
      {icon:MapPin,key:'city',value:profile.city},
      {icon:MapPin,key:'area',value:profile.area},
      {icon:Home,key:'accommodation',value:profile.accommodation},
      {icon:Utensils,key:'food',value:profile.food},
      {icon:Clock,key:'workingHours',value:profile.working_hours},
      {icon:Calendar,key:'daysOff',value:profile.days_off},
      {icon:Award,key:'license',value:profile.license},
      {icon:Clock,key:'status',value:profile.is_online?tr.online:tr.offline},
      {icon:Phone,key:'phone',value:profile.phone},
      {icon:Mail,key:'email',value:profile.email},
      {icon:CheckCircle,key:'verified',value:profile.is_verified},
      {icon:Star,key:'rating',value:profile.rating?`${profile.rating} ★`:null},
      {icon:Briefcase,key:'completedJobs',value:profile.completed_jobs},
      {icon:Clock,key:'responseTime',value:profile.response_time},
      {icon:Globe,key:'transport',value:profile.transport},
      {icon:Heart,key:'insurance',value:profile.insurance},
    ];
    return items.filter(item=>item.value!==null&&item.value!==undefined&&item.value!=='');
  },[profile,tr]);

  if(gridItems.length===0)return null;

  return(
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" style={{contain:'layout style paint',transform:'translateZ(0)'}}>
      {gridItems.map((item,idx)=>(
        <BioItem key={idx} icon={item.icon} label={tr[item.key]||item.key} value={translateValue(item.value,item.key)}/>
      ))}
    </div>
  );
});

BioGrid.displayName='BioGrid';
export default BioGrid;