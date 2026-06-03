// components/profile/BioGrid.tsx - ১ বিলিয়ন ইউজার রেডি • সুপারসনিক • সব ট্রান্সলেশন • ফিক্সড
"use client";
import React,{useMemo} from 'react';
import {Briefcase,Award,Languages,Shield,Home,Utensils,MapPin,CreditCard,Clock,Phone,Mail,User,CheckCircle,Star,Globe,Heart} from 'lucide-react';
import { translateNumber, translatePhone, getCurrencySymbol } from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা লেবেল (Module-level static)
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{experience:'Experience',license:'License',languages:'Languages',visaStatus:'Visa Status',sponsorship:'Sponsorship',accommodation:'Accommodation',food:'Food',city:'City',area:'Area',salary:'Salary',status:'Status',online:'Online',offline:'Offline',yes:'Yes',no:'No',age:'Age',phone:'Phone',email:'Email',rating:'Rating',verified:'Verified',completedJobs:'Completed Jobs',responseTime:'Response Time',transport:'Transport',insurance:'Insurance'},
  bn:{experience:'অভিজ্ঞতা',license:'লাইসেন্স',languages:'ভাষা',visaStatus:'ভিসার অবস্থা',sponsorship:'স্পনসরশিপ',accommodation:'আবাসন',food:'খাবার',city:'শহর',area:'এলাকা',salary:'বেতন',status:'অবস্থা',online:'অনলাইন',offline:'অফলাইন',yes:'হ্যাঁ',no:'না',age:'বয়স',phone:'ফোন',email:'ইমেইল',rating:'রেটিং',verified:'ভেরিফাইড',completedJobs:'সম্পন্ন কাজ',responseTime:'সাড়ার সময়',transport:'পরিবহন',insurance:'বীমা'},
  ar:{experience:'خبرة',license:'رخصة',languages:'لغات',visaStatus:'حالة التأشيرة',sponsorship:'الكفالة',accommodation:'سكن',food:'طعام',city:'مدينة',area:'منطقة',salary:'راتب',status:'حالة',online:'متصل',offline:'غير متصل',yes:'نعم',no:'لا',age:'عمر',phone:'هاتف',email:'بريد',rating:'تقييم',verified:'موثق',completedJobs:'وظائف مكتملة',responseTime:'وقت الاستجابة',transport:'نقل',insurance:'تأمين'},
  hi:{experience:'अनुभव',license:'लाइसेंस',languages:'भाषाएं',visaStatus:'वीज़ा स्थिति',sponsorship:'प्रायोजन',accommodation:'आवास',food:'भोजन',city:'शहर',area:'क्षेत्र',salary:'वेतन',status:'स्थिति',online:'ऑनलाइन',offline:'ऑफलाइन',yes:'हाँ',no:'नहीं',age:'आयु',phone:'फोन',email:'ईमेल',rating:'रेटिंग',verified:'सत्यापित',completedJobs:'पूर्ण कार्य',responseTime:'प्रतिक्रिया समय',transport:'परिवहन',insurance:'बीमा'},
};

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ভ্যালু ট্রান্সলেশন (Module-level static)
// ═══════════════════════════════════════════════════════════
const VALUE_MAP:Record<string,Record<string,string>>={
  'Doha':{en:'Doha',bn:'দোহা',ar:'الدوحة',hi:'दोहा'},
  'Al Rayyan':{en:'Al Rayyan',bn:'আল রাইয়ান',ar:'الريان',hi:'अल रय्यान'},
  'Al Wakrah':{en:'Al Wakrah',bn:'আল ওয়াকরাহ',ar:'الوكرة',hi:'अल वकरा'},
  'Al Khor':{en:'Al Khor',bn:'আল খোর',ar:'الخور',hi:'अल खोर'},
  'Riyadh':{en:'Riyadh',bn:'রিয়াদ',ar:'الرياض',hi:'रियाद'},
  'Jeddah':{en:'Jeddah',bn:'জেদ্দা',ar:'جدة',hi:'जेद्दा'},
  'Mecca':{en:'Mecca',bn:'মক্কা',ar:'مكة',hi:'मक्का'},
  'Medina':{en:'Medina',bn:'মদিনা',ar:'المدينة',hi:'मदीना'},
  'Dubai':{en:'Dubai',bn:'দুবাই',ar:'دبي',hi:'दुबई'},
  'Abu Dhabi':{en:'Abu Dhabi',bn:'আবুধাবি',ar:'أبوظبي',hi:'अबू धाबी'},
  'Sharjah':{en:'Sharjah',bn:'শারজাহ',ar:'الشارقة',hi:'शारजाह'},
  'Ajman':{en:'Ajman',bn:'আজমান',ar:'عجمان',hi:'अजमान'},
  'Kuwait City':{en:'Kuwait City',bn:'কুয়েত সিটি',ar:'مدينة الكويت',hi:'कुवैत सिटी'},
  'Hawalli':{en:'Hawalli',bn:'হাওয়াল্লি',ar:'حولي',hi:'हवाल्ली'},
  'Farwaniya':{en:'Farwaniya',bn:'ফারওয়ানিয়া',ar:'الفروانية',hi:'फरवानिया'},
  'Manama':{en:'Manama',bn:'মানামা',ar:'المنامة',hi:'मनामा'},
  'Riffa':{en:'Riffa',bn:'রিফা',ar:'الرفاع',hi:'रिफ्फा'},
  'Muharraq':{en:'Muharraq',bn:'মুহাররাক',ar:'المحرق',hi:'मुहर्रक'},
  'Muscat':{en:'Muscat',bn:'মাস্কাট',ar:'مسقط',hi:'मस्कट'},
  'Salalah':{en:'Salalah',bn:'সালালাহ',ar:'صلالة',hi:'सलालाह'},
  'Sohar':{en:'Sohar',bn:'সোহার',ar:'صحار',hi:'सोहार'},
  'West Bay':{en:'West Bay',bn:'ওয়েস্ট বে',ar:'الخليج الغربي',hi:'वेस्ट बे'},
  'Al Sadd':{en:'Al Sadd',bn:'আল সাদ',ar:'السد',hi:'अल सद्द'},
  'Bin Mahmoud':{en:'Bin Mahmoud',bn:'বিন মাহমুদ',ar:'بن محمود',hi:'बिन महमूद'},
  'Al Gharrafa':{en:'Al Gharrafa',bn:'আল ঘারাফা',ar:'الغرافة',hi:'अल घराफा'},
  'Muaither':{en:'Muaither',bn:'মুয়াইথির',ar:'معيذر',hi:'मुआइथिर'},
  'Al Wukair':{en:'Al Wukair',bn:'আল উকাইর',ar:'الوكير',hi:'अल वुकैर'},
  'Al Thakhira':{en:'Al Thakhira',bn:'আল থাখিরা',ar:'الذخيرة',hi:'अल थाखिरा'},
  'Al Olaya':{en:'Al Olaya',bn:'আল ওলায়া',ar:'العليا',hi:'अल ओलाया'},
  'Al Malaz':{en:'Al Malaz',bn:'আল মালাজ',ar:'الملز',hi:'अल मलाज़'},
  'Al Hamra':{en:'Al Hamra',bn:'আল হামরা',ar:'الحمراء',hi:'अल हमरा'},
  'Marina':{en:'Marina',bn:'মেরিনা',ar:'المارينا',hi:'मरीना'},
  'JLT':{en:'JLT',bn:'জেএলটি',ar:'جي إل تي',hi:'जेएलटी'},
  'Deira':{en:'Deira',bn:'দেইরা',ar:'ديرة',hi:'देइरा'},
  'Old Airport':{en:'Old Airport',bn:'ওল্ড এয়ারপোর্ট',ar:'المطار القديم',hi:'ओल्ड एयरपोर्ट'},
  'Bengali':{en:'Bengali',bn:'বাংলা',ar:'البنغالية',hi:'बंगाली'},
  'English':{en:'English',bn:'ইংরেজি',ar:'الإنجليزية',hi:'अंग्रेजी'},
  'Arabic':{en:'Arabic',bn:'আরবি',ar:'العربية',hi:'अरबी'},
  'Hindi':{en:'Hindi',bn:'হিন্দি',ar:'الهندية',hi:'हिन्दी'},
  'Urdu':{en:'Urdu',bn:'উর্দু',ar:'الأردية',hi:'उर्दू'},
  'Malayalam':{en:'Malayalam',bn:'মালায়ালাম',ar:'المالايالامية',hi:'मलयालम'},
  'Tamil':{en:'Tamil',bn:'তামিল',ar:'التاميلية',hi:'तमिल'},
  'Tagalog':{en:'Tagalog',bn:'তাগালগ',ar:'التاغالوغية',hi:'तागालोग'},
  'Transferable':{en:'Transferable',bn:'স্থানান্তরযোগ্য',ar:'قابل للتحويل',hi:'हस्तांतरणीय'},
  'Freelance Visa':{en:'Freelance Visa',bn:'ফ্রিল্যান্স ভিসা',ar:'فيزا العمل الحر',hi:'फ्रीलांस वीज़ा'},
  'Family Sponsorship':{en:'Family Sponsorship',bn:'পারিবারিক স্পনসরশিপ',ar:'كفالة عائلية',hi:'पारिवारिक प्रायोजन'},
  'Visit Visa':{en:'Visit Visa',bn:'ভিজিট ভিসা',ar:'فيزا زيارة',hi:'विज़िट वीज़ा'},
  'Employment Visa':{en:'Employment Visa',bn:'এমপ্লয়মেন্ট ভিসা',ar:'فيزا عمل',hi:'रोजगार वीज़ा'},
  'Student Visa':{en:'Student Visa',bn:'স্টুডেন্ট ভিসা',ar:'فيزا طالب',hi:'छात्र वीज़ा'},
  'Self Sponsorship':{en:'Self Sponsorship',bn:'স্ব স্পনসরশিপ',ar:'كفالة ذاتية',hi:'स्व प्रायोजन'},
  'Father Sponsorship':{en:'Father Sponsorship',bn:'পিতার স্পনসরশিপ',ar:'كفالة الأب',hi:'पिता प्रायोजन'},
  'Mother Sponsorship':{en:'Mother Sponsorship',bn:'মাতার স্পনসরশিপ',ar:'كفالة الأم',hi:'माता प्रायोजन'},
  'Husband Sponsorship':{en:'Husband Sponsorship',bn:'স্বামীর স্পনসরশিপ',ar:'كفالة الزوج',hi:'पति प्रायोजन'},
  'Company Sponsorship':{en:'Company Sponsorship',bn:'কোম্পানি স্পনসরশিপ',ar:'كفالة شركة',hi:'कंपनी प्रायोजन'},
  'Provided by Company':{en:'Provided by Company',bn:'কোম্পানি প্রদত্ত',ar:'مقدم من الشركة',hi:'कंपनी द्वारा प्रदत्त'},
  'Shared Accommodation':{en:'Shared Accommodation',bn:'ভাগ করা আবাসন',ar:'سكن مشترك',hi:'साझा आवास'},
  'Own Accommodation':{en:'Own Accommodation',bn:'নিজস্ব আবাসন',ar:'سكن خاص',hi:'अपना आवास'},
  'Not Required':{en:'Not Required',bn:'প্রয়োজন নেই',ar:'غير مطلوب',hi:'आवश्यक नहीं'},
  'Own Arrangement':{en:'Own Arrangement',bn:'নিজস্ব ব্যবস্থা',ar:'ترتيب ذاتي',hi:'अपनी व्यवस्था'},
  'Have':{en:'Have',bn:'আছে',ar:'لديه',hi:'है'},
  'Available':{en:'Available',bn:'উপলব্ধ',ar:'متاح',hi:'उपलब्ध'},
  // ⭐ License values
  'Light':{en:'Light',bn:'হালকা',ar:'خفيف',hi:'हल्का'},
  'Heavy':{en:'Heavy',bn:'ভারী',ar:'ثقيل',hi:'भारी'},
  'Motorcycle':{en:'Motorcycle',bn:'মোটরসাইকেল',ar:'دراجة نارية',hi:'मोटरसाइकिल'},
  'Car':{en:'Car',bn:'গাড়ি',ar:'سيارة',hi:'कार'},
  'Bus':{en:'Bus',bn:'বাস',ar:'حافلة',hi:'बस'},
  'Truck':{en:'Truck',bn:'ট্রাক',ar:'شاحنة',hi:'ट्रक'},
};

// ═══════════════════════════════════════════════════════════
// BioItem (Memoized • GPU • 1B Ready)
// ═══════════════════════════════════════════════════════════
const BioItem=React.memo(({icon:Icon,label,value}:{icon:any;label:string;value:string})=>(
  <div className="bg-gray-50 rounded-xl p-2.5 text-center hover:shadow-md transition-all hover:bg-gray-100 active:scale-[0.98] group will-change-transform" style={{transform:'translateZ(0)',backfaceVisibility:'hidden'}}>
    <Icon size={14} className="mx-auto mb-1 text-gray-400 group-hover:text-orange-500 transition-colors"/>
    <p className="text-[9px] text-gray-400 mb-0.5 select-none">{label}</p>
    <p className="text-[10px] font-semibold text-gray-700 truncate select-none">{value}</p>
  </div>
));
BioItem.displayName='BioItem';

// ═══════════════════════════════════════════════════════════
// BioGrid (Memoized • 1B Ready • 4 Lang • FIXED)
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
    
    // ⭐ Phone - translate digits
    if(key==='phone')return translatePhone(strValue,lang);
    
    // ⭐ Salary - translate number + currency
    if(key==='salary'){
      const amount=strValue.replace(/[^0-9.]/g,'');
      return amount?`${translateNumber(amount,lang)} ${currency}`:'—';
    }
    
    // ⭐ Rating - translate number
    if(key==='rating'){
      const num=parseFloat(strValue);
      return isNaN(num)?strValue:`${translateNumber(num,lang)} ★`;
    }
    
    // ⭐ License - Yes/No check + VALUE_MAP lookup
    if(key==='license'){
      if(strValue.toLowerCase()==='yes')return tr.yes;
      if(strValue.toLowerCase()==='no')return tr.no;
      return VALUE_MAP[strValue]?.[lang]||strValue;
    }
    
    // ⭐ Verified - Yes/No
    if(key==='verified'){
      if(value===true||strValue.toLowerCase()==='yes')return tr.yes;
      if(value===false||strValue.toLowerCase()==='no')return tr.no;
      return VALUE_MAP[strValue]?.[lang]||strValue;
    }
    
    // ⭐ Age, Experience, CompletedJobs, ResponseTime - translate number
    if(key==='age'||key==='experience'||key==='completedJobs'||key==='responseTime'){
      const num=parseInt(strValue);
      return isNaN(num)?strValue:translateNumber(num,lang);
    }
    
    // ⭐ Transport, Insurance - Yes/No + VALUE_MAP
    if(key==='transport'||key==='insurance'){
      if(strValue.toLowerCase()==='yes')return tr.yes;
      if(strValue.toLowerCase()==='no')return tr.no;
      return VALUE_MAP[strValue]?.[lang]||strValue;
    }
    
    // Array values (languages etc)
    if(Array.isArray(value))return value.map((v:any)=>VALUE_MAP[String(v)]?.[lang]||v).join(', ');
    
    // Static VALUE_MAP lookup
    return VALUE_MAP[strValue]?.[lang]||strValue;
  },[lang,tr,currency]);

  const gridItems=useMemo(()=>{
    const items=[
      {icon:User,key:'age',value:profile.age},
      {icon:Briefcase,key:'experience',value:profile.experience},
      {icon:Award,key:'license',value:profile.license},
      {icon:Languages,key:'languages',value:profile.languages},
      {icon:Shield,key:'visaStatus',value:profile.visa_status},
      {icon:Shield,key:'sponsorship',value:profile.sponsorship},
      {icon:Home,key:'accommodation',value:profile.accommodation},
      {icon:Utensils,key:'food',value:profile.food},
      {icon:MapPin,key:'city',value:profile.city},
      {icon:MapPin,key:'area',value:profile.area},
      {icon:CreditCard,key:'salary',value:profile.expected_salary},
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