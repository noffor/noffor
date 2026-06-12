// app/[country]/[lang]/create/page.tsx
// 🚀 SUPER SONIC • MIDDLE EAST READY • 42 CATEGORIES • 7 STEPS WORKER • EMPLOYER
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { 
  User, Building, Camera, Upload, X, Check, Briefcase, ChevronLeft, ChevronRight, 
  Image as ImageIcon, Loader2, Globe, MapPin, Phone, Mail, Calendar, Clock, 
  Users, DollarSign, Home, Heart, Filter, Plus, Minus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪২ ক্যাটাগরি
// ═══════════════════════════════════════════════════════════
const MAIN_CATEGORIES = [
  'Driver','Electrician','Plumber','Mason','AC Technician',
  'Painter','Carpenter','Welder','Cleaner','Cook','Helper','Gardener',
];
const OTHER_CATEGORIES = [
  'Housemaid','Nanny','Office Assistant','Receptionist','Salesman','Cashier',
  'Security Guard','Nurse','Pharmacist','Lab Technician','Physiotherapist',
  'Mechanic','Tailor','Barista','Photographer','CCTV Technician',
  'Gypsum Carpenter','Tiles Mason','Blacksmith','General Labour',
  'Steel Fixer','Scaffolder','Heavy Driver','Forklift Operator',
  'Crane Operator','Pipe Fitter','Waiter','Hotel Housekeeping','Beautician','Barber',
];

// ═══════════════════════════════════════════════════════════
// ৬ দেশের শহর
// ═══════════════════════════════════════════════════════════
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  qa: ['Doha','Al Rayyan','Al Wakrah','Al Khor','Lusail','Mesaieed','Umm Salal','Al Daayen'],
  sa: ['Riyadh','Jeddah','Mecca','Medina','Dammam','Khobar','Taif','Tabuk'],
  ae: ['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain'],
  kw: ['Kuwait City','Hawalli','Salmiya','Fahaheel','Jahra','Mangaf'],
  om: ['Muscat','Salalah','Sohar','Nizwa','Sur','Buraimi'],
  bh: ['Manama','Riffa','Muharraq','Hamad Town','Isa Town','Sitra'],
};

// ═══════════════════════════════════════════════════════════
// DROPDOWNS — 4 Languages
// ═══════════════════════════════════════════════════════════
const DROPDOWNS: Record<string, Record<string, string[]>> = {
  experience: {
    en: ['0-1 year','1-3 years','3-5 years','5-7 years','7-10 years','10+ years'],
    bn: ['০-১ বছর','১-৩ বছর','৩-৫ বছর','৫-৭ বছর','৭-১০ বছর','১০+ বছর'],
    ar: ['٠-١ سنة','١-٣ سنوات','٣-٥ سنوات','٥-٧ سنوات','٧-١٠ سنوات','أكثر من ١٠ سنوات'],
    hi: ['0-1 वर्ष','1-3 वर्ष','3-5 वर्ष','5-7 वर्ष','7-10 वर्ष','10+ वर्ष'],
  },
  visaStatus: {
    en: ['Transferable','Company Visa','Freelance Visa','Family Sponsorship','Visit Visa','Own Visa'],
    bn: ['ট্রান্সফারেবল','কোম্পানি ভিসা','ফ্রিল্যান্স ভিসা','পারিবারিক স্পন্সরশিপ','ভিজিট ভিসা','নিজ ভিসা'],
    ar: ['قابل للتحويل','تأشيرة شركة','تأشيرة حرة','كفالة عائلية','تأشيرة زيارة','تأشيرة خاصة'],
    hi: ['ट्रांसफरेबल','कंपनी वीज़ा','फ्रीलांस वीज़ा','पारिवारिक','विज़िट वीज़ा','खुद का वीज़ा'],
  },
  accommodation: {
    en: ['Provided by Company','Own Arrangement','Shared','Live-in','Not Required'],
    bn: ['কোম্পানি প্রদত্ত','নিজ ব্যবস্থা','শেয়ার্ড','লিভ-ইন','প্রয়োজন নেই'],
    ar: ['توفره الشركة','ترتيب خاص','مشترك','مقيم','غير مطلوب'],
    hi: ['कंपनी द्वारा','स्वयं','साझा','लिव-इन','आवश्यक नहीं'],
  },
  food: {
    en: ['Provided by Company','Own Arrangement','Not Required'],
    bn: ['কোম্পানি প্রদত্ত','নিজ ব্যবস্থা','প্রয়োজন নেই'],
    ar: ['توفره الشركة','ترتيب خاص','غير مطلوب'],
    hi: ['कंपनी द्वारा','स्वयं','आवश्यक नहीं'],
  },
  jobTypes: {
    en: ['Full-time','Part-time','Contract','Temporary','Freelance'],
    bn: ['ফুল-টাইম','পার্ট-টাইম','কন্ট্রাক্ট','অস্থায়ী','ফ্রিল্যান্স'],
    ar: ['دوام كامل','دوام جزئي','عقد','مؤقت','عمل حر'],
    hi: ['फुल-टाइम','पार्ट-टाइम','कॉन्ट्रैक्ट','अस्थायी','फ्रीलांस'],
  },
  urgency: {
    en: ['Immediate','Within 3 days','Within a week','Flexible'],
    bn: ['তাৎক্ষণিক','৩ দিনের মধ্যে','এক সপ্তাহের মধ্যে','ফ্লেক্সিবল'],
    ar: ['فوري','خلال ٣ أيام','خلال أسبوع','مرن'],
    hi: ['तत्काल','3 दिन में','एक सप्ताह में','लचीला'],
  },
  workingHours: {
    en: ['8 Hours','10 Hours','12 Hours','Flexible'],
    bn: ['৮ ঘন্টা','১০ ঘন্টা','১২ ঘন্টা','ফ্লেক্সিবল'],
    ar: ['٨ ساعات','١٠ ساعات','١٢ ساعة','مرن'],
    hi: ['8 घंटे','10 घंटे','12 घंटे','लचीला'],
  },
  daysOff: {
    en: ['Friday','Weekly 1 day','Weekly 2 days','Monthly','As per law'],
    bn: ['শুক্রবার','সাপ্তাহিক ১ দিন','সাপ্তাহিক ২ দিন','মাসিক','আইন অনুযায়ী'],
    ar: ['الجمعة','يوم أسبوعياً','يومان أسبوعياً','شهري','حسب القانون'],
    hi: ['शुक्रवार','साप्ताहिक 1 दिन','साप्ताहिक 2 दिन','मासिक','कानून अनुसार'],
  },
  contractDuration: {
    en: ['1 Year','2 Years','Unlimited','Project Based'],
    bn: ['১ বছর','২ বছর','আনলিমিটেড','প্রজেক্ট ভিত্তিক'],
    ar: ['سنة','سنتان','غير محدود','حسب المشروع'],
    hi: ['1 वर्ष','2 वर्ष','असीमित','प्रोजेक्ट'],
  },
  gender: {
    en: ['Male','Female','Any'],
    bn: ['পুরুষ','মহিলা','যেকোনো'],
    ar: ['ذكر','أنثى','الكل'],
    hi: ['पुरुष','महिला','कोई भी'],
  },
  nationality: {
    en: ['Bangladeshi','Indian','Pakistani','Nepali','Sri Lankan','Filipino','Egyptian','Any'],
    bn: ['বাংলাদেশী','ভারতীয়','পাকিস্তানি','নেপালি','শ্রীলঙ্কান','ফিলিপিনো','মিশরীয়','যেকোনো'],
    ar: ['بنجلاديشي','هندي','باكستاني','نيبالي','سريلانكي','فلبيني','مصري','الكل'],
    hi: ['बांग्लादेशी','भारतीय','पाकिस्तानी','नेपाली','श्रीलंकाई','फिलिपिनो','मिस्री','कोई भी'],
  },
  religion: {
    en: ['Muslim','Hindu','Christian','Buddhist','Any'],
    bn: ['মুসলিম','হিন্দু','খ্রিস্টান','বৌদ্ধ','যেকোনো'],
    ar: ['مسلم','هندوسي','مسيحي','بوذي','الكل'],
    hi: ['मुस्लिम','हिन्दू','ईसाई','बौद्ध','कोई भी'],
  },
  maritalStatus: {
    en: ['Single','Married','Divorced','Any'],
    bn: ['অবিবাহিত','বিবাহিত','তালাকপ্রাপ্ত','যেকোনো'],
    ar: ['أعزب','متزوج','مطلق','الكل'],
    hi: ['अविवाहित','विवाहित','तलाकशुदा','कोई भी'],
  },
  salaryType: {
    en: ['Monthly','Hourly','Daily','Weekly'],
    bn: ['মাসিক','ঘন্টা প্রতি','দৈনিক','সাপ্তাহিক'],
    ar: ['شهري','بالساعة','يومي','أسبوعي'],
    hi: ['मासिक','प्रति घंटा','दैनिक','साप्ताहिक'],
  },
  passportStatus: {
    en: ['Ready','Expired','Processing','Not Available'],
    bn: ['প্রস্তুত','মেয়াদোত্তীর্ণ','প্রক্রিয়াধীন','উপলব্ধ নয়'],
    ar: ['جاهز','منتهي','قيد المعالجة','غير متوفر'],
    hi: ['तैयार','समाप्त','प्रक्रिया में','उपलब्ध नहीं'],
  },
  languages: {
    en: ['English','Arabic','Bengali','Hindi','Urdu','Tamil','Malayalam','Nepali','Tagalog'],
    bn: ['ইংরেজি','আরবি','বাংলা','হিন্দি','উর্দু','তামিল','মালায়ালাম','নেপালি','তাগালগ'],
    ar: ['إنجليزي','عربي','بنغالي','هندي','أردو','تاميل','مالايالام','نيبالي','تاغالوغ'],
    hi: ['अंग्रेजी','अरबी','बंगाली','हिंदी','उर्दू','तमिल','मलयालम','नेपाली','तागालोग'],
  },
  skills: {
    en: ['Cooking','Driving','Cleaning','Childcare','Elderly Care','Gardening','Painting','Plumbing','Electrical','Carpentry'],
    bn: ['রান্না','ড্রাইভিং','পরিচ্ছন্নতা','শিশু যত্ন','বয়স্ক যত্ন','বাগান','পেইন্টিং','প্লাম্বিং','ইলেকট্রিক','কার্পেনট্রি'],
    ar: ['طبخ','قيادة','تنظيف','رعاية الأطفال','رعاية المسنين','بستنة','دهان','سباكة','كهرباء','نجارة'],
    hi: ['खाना बनाना','ड्राइविंग','सफाई','बच्चों की देखभाल','बुजुर्गों की देखभाल','बागवानी','पेंटिंग','प्लंबिंग','इलेक्ट्रिकल','कारपेंट्री'],
  },
  benefits: {
    en: ['Accommodation','Food','Transport','Medical','Ticket','SIM Card'],
    bn: ['থাকা','খাবার','পরিবহন','চিকিৎসা','টিকেট','সিম কার্ড'],
    ar: ['سكن','طعام','نقل','طبي','تذكرة','شريحة'],
    hi: ['रहना','खाना','परिवहन','चिकित्सा','टिकट','सिम कार्ड'],
  },
};

function getDropdown(key: string, lang: string): string[] {
  return DROPDOWNS[key]?.[lang] || DROPDOWNS[key]?.en || [];
}

// ═══════════════════════════════════════════════════════════
// WebP Compressor
// ═══════════════════════════════════════════════════════════
async function compressImage(file: File): Promise<Blob> {
  return new Promise(resolve => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > 600) { h = (h * 600) / w; w = 600; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => resolve(b!), 'image/webp', 0.6);
    };
  });
}

// ═══════════════════════════════════════════════════════════
const formTexts: Record<string, any> = {
  en: { 
    title: 'Create Profile', whatCreate: 'What do you want to create?',
    workerProfile: 'Worker Profile', workerDesc: 'Create your worker profile',
    postJob: 'Post Job', postJobDesc: 'Post as employer',
    back: 'Back', next: 'Next', submit: 'Submit',
    success: 'Success!', redirecting: 'Redirecting...',
    phone: 'Phone *', category: 'Category *',
    selectCategory: 'Select Category', otherCategories: 'Other Categories',
    selectSpecial: 'Select Special Category',
    gender: 'Gender', nationality: 'Nationality',
    multiLangTitle: '🌍 Your Names in Different Languages',
    multiLangDesc: 'Add your name in multiple languages',
    englishName: 'Name in English *',
    nameInBengali: 'Name in Bengali',
    nameInArabic: 'Name in Arabic',
    nameInHindi: 'Name in Hindi',
    photo: 'Profile Photo', age: 'Age',
    religion: 'Religion', maritalStatus: 'Marital Status',
    height: 'Height (cm)', weight: 'Weight (kg)',
    experience: 'Experience', salaryType: 'Salary Type',
    salary: 'Salary', skills: 'Skills (select multiple)',
    languages: 'Languages (select multiple)',
    visaStatus: 'Visa Status', passportStatus: 'Passport Status',
    availableFrom: 'Available From', city: 'City', area: 'Area',
    accommodation: 'Accommodation', food: 'Food',
    workingHours: 'Working Hours', daysOff: 'Days Off',
    bio: 'Bio', workPhotos: 'Work Photos (max 6)',
    employerTitle: 'Post a Job',
    jobTitle: 'Job Title *', jobLocationType: 'Location Type',
    office: '🏢 Office / Company', home: '🏠 Home / Villa', both: '🏢🏠 Both',
    homeAddress: 'Home / Villa Address',
    officeAddress: 'Office / Company Address',
    jobSalary: 'Salary (QAR)', jobType: 'Job Type',
    workersNeeded: 'Workers Needed', urgency: 'Urgency',
    ageRequirement: 'Age Requirement', minAge: 'Min Age', maxAge: 'Max Age',
    genderPreference: 'Gender Preference',
    nationalityPreference: 'Nationality Preference',
    experienceRequired: 'Experience Required',
    benefits: 'Benefits (select)',
    contractDuration: 'Contract Duration',
    jobWorkingHours: 'Working Hours',
    jobDaysOff: 'Days Off',
    companyName: 'Company Name *', companyPhone: 'Phone *',
    jobDesc: 'Description',
    jobImage: 'Job Image', uploadImage: 'Upload',
    autoImage: 'Auto from category',
    posting: 'Posting...', postingJob: 'Post Job',
  },
  bn: { 
    title: 'প্রোফাইল তৈরি', whatCreate: 'কী তৈরি করতে চান?',
    workerProfile: 'শ্রমিক প্রোফাইল', workerDesc: 'আপনার প্রোফাইল তৈরি করুন',
    postJob: 'জব পোস্ট', postJobDesc: 'নিয়োগকর্তা হিসেবে পোস্ট করুন',
    back: 'পিছনে', next: 'পরবর্তী', submit: 'জমা দিন',
    success: 'সফল!', redirecting: 'রিডাইরেক্ট...',
    phone: 'ফোন *', category: 'ক্যাটাগরি *',
    selectCategory: 'ক্যাটাগরি নির্বাচন', otherCategories: 'অন্যান্য ক্যাটাগরি',
    selectSpecial: 'বিশেষ ক্যাটাগরি নির্বাচন',
    gender: 'লিঙ্গ', nationality: 'জাতীয়তা',
    multiLangTitle: '🌍 বিভিন্ন ভাষায় আপনার নাম',
    multiLangDesc: 'একাধিক ভাষায় আপনার নাম যোগ করুন',
    englishName: 'ইংরেজিতে নাম *',
    nameInBengali: 'বাংলায় নাম',
    nameInArabic: 'আরবিতে নাম',
    nameInHindi: 'হিন্দিতে নাম',
    photo: 'প্রোফাইল ছবি', age: 'বয়স',
    religion: 'ধর্ম', maritalStatus: 'বৈবাহিক অবস্থা',
    height: 'উচ্চতা (সেমি)', weight: 'ওজন (কেজি)',
    experience: 'অভিজ্ঞতা', salaryType: 'বেতনের ধরন',
    salary: 'বেতন', skills: 'দক্ষতা (একাধিক)',
    languages: 'ভাষা (একাধিক)',
    visaStatus: 'ভিসার অবস্থা', passportStatus: 'পাসপোর্টের অবস্থা',
    availableFrom: 'কখন থেকে পাওয়া যাবে', city: 'শহর', area: 'এলাকা',
    accommodation: 'থাকা', food: 'খাবার',
    workingHours: 'কাজের সময়', daysOff: 'ছুটি',
    bio: 'বায়ো', workPhotos: 'কাজের ছবি (সর্বোচ্চ ৬)',
    employerTitle: 'জব পোস্ট করুন',
    jobTitle: 'জবের শিরোনাম *', jobLocationType: 'কাজের স্থান',
    office: '🏢 অফিস / কোম্পানি', home: '🏠 বাসা / ভিলা', both: '🏢🏠 উভয়',
    homeAddress: 'বাসার ঠিকানা',
    officeAddress: 'অফিসের ঠিকানা',
    jobSalary: 'বেতন (রিয়াল)', jobType: 'জবের ধরন',
    workersNeeded: 'শ্রমিক প্রয়োজন', urgency: 'জরুরীতা',
    ageRequirement: 'বয়সের প্রয়োজনীয়তা', minAge: 'সর্বনিম্ন', maxAge: 'সর্বোচ্চ',
    genderPreference: 'লিঙ্গ পছন্দ',
    nationalityPreference: 'জাতীয়তা পছন্দ',
    experienceRequired: 'অভিজ্ঞতা প্রয়োজন',
    benefits: 'সুবিধা (নির্বাচন)',
    contractDuration: 'চুক্তির মেয়াদ',
    jobWorkingHours: 'কাজের সময়',
    jobDaysOff: 'ছুটি',
    companyName: 'কোম্পানির নাম *', companyPhone: 'ফোন *',
    jobDesc: 'বিবরণ',
    jobImage: 'জবের ছবি', uploadImage: 'আপলোড',
    autoImage: 'ক্যাটাগরি থেকে',
    posting: 'পোস্ট হচ্ছে...', postingJob: 'জব পোস্ট',
  },
  ar: { 
    title: 'إنشاء ملف', whatCreate: 'ماذا تريد إنشاء؟',
    workerProfile: 'ملف عامل', workerDesc: 'أنشئ ملفك الشخصي',
    postJob: 'نشر وظيفة', postJobDesc: 'انشر كصاحب عمل',
    back: 'رجوع', next: 'التالي', submit: 'إرسال',
    success: 'نجاح!', redirecting: 'جاري التحويل...',
    phone: 'الهاتف *', category: 'الفئة *',
    selectCategory: 'اختر الفئة', otherCategories: 'فئات أخرى',
    selectSpecial: 'اختر فئة خاصة',
    gender: 'الجنس', nationality: 'الجنسية',
    multiLangTitle: '🌍 اسمك بلغات مختلفة',
    multiLangDesc: 'أضف اسمك بعدة لغات',
    englishName: 'الاسم بالإنجليزية *',
    nameInBengali: 'الاسم بالبنغالية',
    nameInArabic: 'الاسم بالعربية',
    nameInHindi: 'الاسم بالهندية',
    photo: 'الصورة', age: 'العمر',
    religion: 'الدين', maritalStatus: 'الحالة الاجتماعية',
    height: 'الطول (سم)', weight: 'الوزن (كجم)',
    experience: 'الخبرة', salaryType: 'نوع الراتب',
    salary: 'الراتب', skills: 'المهارات (متعدد)',
    languages: 'اللغات (متعدد)',
    visaStatus: 'حالة التأشيرة', passportStatus: 'حالة الجواز',
    availableFrom: 'متاح من', city: 'المدينة', area: 'المنطقة',
    accommodation: 'السكن', food: 'الطعام',
    workingHours: 'ساعات العمل', daysOff: 'أيام العطلة',
    bio: 'نبذة', workPhotos: 'صور العمل (٦ كحد أقصى)',
    employerTitle: 'نشر وظيفة',
    jobTitle: 'عنوان الوظيفة *', jobLocationType: 'مكان العمل',
    office: '🏢 مكتب / شركة', home: '🏠 منزل / فيلا', both: '🏢🏠 كلاهما',
    homeAddress: 'عنوان المنزل',
    officeAddress: 'عنوان المكتب',
    jobSalary: 'الراتب (ريال)', jobType: 'نوع الوظيفة',
    workersNeeded: 'عدد العمال', urgency: 'الإلحاح',
    ageRequirement: 'متطلبات العمر', minAge: 'الحد الأدنى', maxAge: 'الأقصى',
    genderPreference: 'تفضيل الجنس',
    nationalityPreference: 'تفضيل الجنسية',
    experienceRequired: 'الخبرة المطلوبة',
    benefits: 'المزايا (اختر)',
    contractDuration: 'مدة العقد',
    jobWorkingHours: 'ساعات العمل',
    jobDaysOff: 'أيام العطلة',
    companyName: 'اسم الشركة *', companyPhone: 'الهاتف *',
    jobDesc: 'الوصف',
    jobImage: 'صورة الوظيفة', uploadImage: 'تحميل',
    autoImage: 'تلقائي من الفئة',
    posting: 'جاري النشر...', postingJob: 'نشر',
  },
  hi: { 
    title: 'प्रोफाइल बनाएं', whatCreate: 'क्या बनाना चाहते हैं?',
    workerProfile: 'श्रमिक प्रोफाइल', workerDesc: 'अपनी प्रोफाइल बनाएं',
    postJob: 'नौकरी पोस्ट', postJobDesc: 'नियोक्ता के रूप में पोस्ट करें',
    back: 'पीछे', next: 'अगला', submit: 'जमा करें',
    success: 'सफल!', redirecting: 'रीडायरेक्ट...',
    phone: 'फोन *', category: 'श्रेणी *',
    selectCategory: 'श्रेणी चुनें', otherCategories: 'अन्य श्रेणियां',
    selectSpecial: 'विशेष श्रेणी चुनें',
    gender: 'लिंग', nationality: 'राष्ट्रीयता',
    multiLangTitle: '🌍 विभिन्न भाषाओं में आपका नाम',
    multiLangDesc: 'कई भाषाओं में अपना नाम जोड़ें',
    englishName: 'अंग्रेजी में नाम *',
    nameInBengali: 'बंगाली में नाम',
    nameInArabic: 'अरबी में नाम',
    nameInHindi: 'हिंदी में नाम',
    photo: 'फोटो', age: 'उम्र',
    religion: 'धर्म', maritalStatus: 'वैवाहिक स्थिति',
    height: 'ऊंचाई (सेमी)', weight: 'वजन (किलो)',
    experience: 'अनुभव', salaryType: 'वेतन प्रकार',
    salary: 'वेतन', skills: 'कौशल (एकाधिक)',
    languages: 'भाषाएं (एकाधिक)',
    visaStatus: 'वीज़ा स्थिति', passportStatus: 'पासपोर्ट स्थिति',
    availableFrom: 'कब से उपलब्ध', city: 'शहर', area: 'क्षेत्र',
    accommodation: 'आवास', food: 'भोजन',
    workingHours: 'काम के घंटे', daysOff: 'छुट्टी',
    bio: 'बायो', workPhotos: 'काम की तस्वीरें (अधिकतम 6)',
    employerTitle: 'नौकरी पोस्ट करें',
    jobTitle: 'नौकरी का शीर्षक *', jobLocationType: 'काम की जगह',
    office: '🏢 ऑफिस / कंपनी', home: '🏠 घर / विला', both: '🏢🏠 दोनों',
    homeAddress: 'घर का पता',
    officeAddress: 'ऑफिस का पता',
    jobSalary: 'वेतन (रियाल)', jobType: 'नौकरी का प्रकार',
    workersNeeded: 'श्रमिकों की जरूरत', urgency: 'तात्कालिकता',
    ageRequirement: 'आयु आवश्यकता', minAge: 'न्यूनतम', maxAge: 'अधिकतम',
    genderPreference: 'लिंग प्राथमिकता',
    nationalityPreference: 'राष्ट्रीयता प्राथमिकता',
    experienceRequired: 'अनुभव आवश्यक',
    benefits: 'सुविधाएं (चुनें)',
    contractDuration: 'अनुबंध अवधि',
    jobWorkingHours: 'काम के घंटे',
    jobDaysOff: 'छुट्टी',
    companyName: 'कंपनी का नाम *', companyPhone: 'फोन *',
    jobDesc: 'विवरण',
    jobImage: 'नौकरी की छवि', uploadImage: 'अपलोड',
    autoImage: 'श्रेणी से ऑटो',
    posting: 'पोस्ट हो रहा...', postingJob: 'पोस्ट करें',
  },
};

// ═══════════════════════════════════════════════════════════
export default function CreatePage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const currentLang = (params as any).lang || 'en';
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/${country}/${currentLang}/login?redirect=/${country}/${currentLang}/create`);
    }
  }, [authLoading, isAuthenticated, country, currentLang, router]);

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-orange-500" /></div>;
  if (!isAuthenticated) return null;

  return <CreatePageContent country={country} currentLang={currentLang} />;
}

// ═══════════════════════════════════════════════════════════
function CreatePageContent({ country, currentLang }: { country: string; currentLang: string }) {
  const router = useRouter();
  const ft = formTexts[currentLang] || formTexts.en;
  const cityList = CITIES_BY_COUNTRY[country] || CITIES_BY_COUNTRY.qa;
  
  const [mode, setMode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Worker States
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPrev, setPhotoPrev] = useState('');
  const [age, setAge] = useState('');
  const [religion, setReligion] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [experience, setExperience] = useState('');
  const [salaryType, setSalaryType] = useState('Monthly');
  const [salary, setSalary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [visaStatus, setVisaStatus] = useState('');
  const [passportStatus, setPassportStatus] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [food, setFood] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [daysOff, setDaysOff] = useState('');
  const [bio, setBio] = useState('');
  const [workFiles, setWorkFiles] = useState<File[]>([]);
  const [workPreviews, setWorkPreviews] = useState<string[]>([]);

  // Employer States
  const [jobTitle, setJobTitle] = useState('');
  const [jobCat, setJobCat] = useState('');
  const [jobOtherCat, setJobOtherCat] = useState('');
  const [jobLocationType, setJobLocationType] = useState('office');
  const [homeAddress, setHomeAddress] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobType, setJobType] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState('1');
  const [urgency, setUrgency] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [genderPref, setGenderPref] = useState('');
  const [nationalityPref, setNationalityPref] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [contractDuration, setContractDuration] = useState('');
  const [jobWorkingHours, setJobWorkingHours] = useState('');
  const [jobDaysOff, setJobDaysOff] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobCity, setJobCity] = useState('');
  const [jobImageFile, setJobImageFile] = useState<File | null>(null);
  const [jobImagePrev, setJobImagePrev] = useState('');
  const [jobImageUploading, setJobImageUploading] = useState(false);

  const getFinalCategory = () => category === 'other' ? otherCategory : category;
  const getFinalJobCategory = () => jobCat === 'other' ? jobOtherCat : jobCat;

  const toggleSkill = (skill: string) => setSkills(p => p.includes(skill) ? p.filter(s => s !== skill) : [...p, skill]);
  const toggleLanguage = (lang: string) => setLanguages(p => p.includes(lang) ? p.filter(l => l !== lang) : [...p, lang]);
  const toggleBenefit = (benefit: string) => setSelectedBenefits(p => p.includes(benefit) ? p.filter(b => b !== benefit) : [...p, benefit]);

  const handleWorkPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + workFiles.length > 6) { alert('Max 6 photos'); return; }
    setWorkFiles([...workFiles, ...files]);
    setWorkPreviews([...workPreviews, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeWorkPhoto = (i: number) => {
    setWorkFiles(workFiles.filter((_, idx) => idx !== i));
    URL.revokeObjectURL(workPreviews[i]);
    setWorkPreviews(workPreviews.filter((_, idx) => idx !== i));
  };

  const handleJobImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setJobImageUploading(true);
    try {
      const compressed = await compressImage(file);
      const webpFile = new File([compressed], `job_${Date.now()}.webp`, { type: 'image/webp' });
      setJobImagePrev(URL.createObjectURL(webpFile));
      setJobImageFile(webpFile);
    } catch {} finally { setJobImageUploading(false); }
  };

  // ✅ Worker Submit
  const handleLaborSubmit = async () => {
    if (!phone || !nameEn) { setError('Phone & English name required'); return; }
    setLoading(true); setError('');
    try {
      let photoUrl = '/avatar.png';
      if (photoFile) {
        const compressed = await compressImage(photoFile);
        const file = new File([compressed], `${Date.now()}.webp`);
        const { data, error: uploadError } = await supabase.storage.from('profiles').upload(`photos/${Date.now()}.webp`, file);
        if (uploadError) throw uploadError;
        if (data) photoUrl = supabase.storage.from('profiles').getPublicUrl(data.path).data.publicUrl;
      }
      const workUrls = [];
      for (const wf of workFiles) {
        const compressed = await compressImage(wf);
        const file = new File([compressed], `${Date.now()}.webp`);
        const { data, error: uploadError } = await supabase.storage.from('profiles').upload(`works/${Date.now()}.webp`, file);
        if (uploadError) throw uploadError;
        if (data) workUrls.push(supabase.storage.from('profiles').getPublicUrl(data.path).data.publicUrl);
      }
      const finalCategory = getFinalCategory();
      const { error: insertError } = await supabase.from('profiles').insert({
        phone, name: nameEn, name_bn: nameBn || null, name_ar: nameAr || null, name_hi: nameHi || null,
        role: 'labor', category: finalCategory, country, city, area, experience,
        expected_salary: salary ? `${salary} QAR/${salaryType.toLowerCase()}` : null,
        gender, nationality, age: age || null, religion: religion || null,
        marital_status: maritalStatus || null, height: height || null, weight: weight || null,
        skills, languages, visa_status: visaStatus, passport_status: passportStatus || null,
        available_from: availableFrom || null, accommodation, food,
        working_hours: workingHours || null, days_off: daysOff || null,
        salary_type: salaryType, bio, photo_url: photoUrl, photos: workUrls,
        rating: 0, total_reviews: 0, is_online: true, is_verified: true, is_public: true,
        profile_language: currentLang, created_at: new Date().toISOString()
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => router.push(`/${country}/${currentLang}`), 1000);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // ✅ Employer Submit
  const handleEmployerSubmit = async () => {
    if (!companyPhone || !companyName || !jobTitle) { setError('Fill all required fields'); return; }
    setLoading(true); setError('');
    try {
      let jobImageUrl = '';
      if (jobImageFile) {
        const { data, error: uploadError } = await supabase.storage.from('profiles').upload(`job_images/${Date.now()}.webp`, jobImageFile);
        if (!uploadError && data) jobImageUrl = supabase.storage.from('profiles').getPublicUrl(data.path).data.publicUrl;
      }
      const finalCategory = getFinalJobCategory();
      const formattedBio = `Job: ${jobTitle}\nCompany: ${companyName}\nPhone: ${companyPhone}\nLocation: ${jobCity || 'Not specified'}\nType: ${jobType}\nWorkers: ${workersNeeded}\nUrgency: ${urgency}\nBenefits: ${selectedBenefits.join(', ')}\nContract: ${contractDuration}\nHours: ${jobWorkingHours}\nDays Off: ${jobDaysOff}\n\nDescription:\n${jobDesc || 'No description'}`;
      
      const { error: insertError } = await supabase.from('profiles').insert({
        phone: companyPhone, name: companyName, role: 'employer',
        category: finalCategory || 'General', expected_salary: jobSalary ? `${jobSalary} QAR` : null,
        bio: formattedBio, city: jobCity || 'Doha', country,
        rating: 0, total_reviews: 0, is_online: true, is_verified: true, is_public: true,
        profile_language: currentLang, created_at: new Date().toISOString(),
        photo_url: jobImageUrl || '/default-job.jpg',
        job_location_type: jobLocationType,
        home_address: homeAddress || null, office_address: officeAddress || null,
        gender_preference: genderPref || null, nationality_preference: nationalityPref || null,
        age_min: minAge || null, age_max: maxAge || null,
        experience_required: experienceRequired || null,
        benefits: selectedBenefits, contract_duration: contractDuration || null,
        working_hours: jobWorkingHours || null, days_off: jobDaysOff || null,
      });
      if (insertError) throw insertError;
      
      // Also insert into job_posts
      await supabase.from('job_posts').insert({
        title: jobTitle, category: finalCategory,
        budget_min: parseInt(jobSalary) || 0, budget_max: parseInt(jobSalary) || 0,
        location: jobCity || 'Doha', description: jobDesc,
        phone: companyPhone, worker_count: parseInt(workersNeeded) || 1,
        country, employer_phone: companyPhone, employer_name: companyName,
        status: 'open', expires_at: new Date(Date.now() + 7*86400000).toISOString(),
        views: 0, share_count: 0,
        job_location_type: jobLocationType,
        home_address: homeAddress || null, office_address: officeAddress || null,
        city: jobCity, gender_preference: genderPref || null,
      });
      
      setSuccess(true);
      setTimeout(() => router.push(`/${country}/${currentLang}/dashboard/employer`), 1000);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // ═══════════════════════════════════════════════════════
  if (success) return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-8 shadow">
          <div className="w-20 h-20 bg-green-100 rounded-full flex mx-auto mb-4 items-center justify-center"><Check size={40} className="text-green-600" /></div>
          <h2 className="text-2xl font-bold">{ft.success}</h2>
          <p className="text-gray-500 mt-2">{ft.redirecting}</p>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // MODE SELECTION
  // ═══════════════════════════════════════════════════════
  if (!mode) return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-6">{ft.whatCreate}</h1>
        <div className="space-y-4">
          <button onClick={() => setMode('labor')} className="w-full bg-white p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-500 flex items-center gap-4 transition">
            <User size={32} className="text-orange-600" />
            <div className="text-left flex-1"><h2 className="font-bold text-xl">{ft.workerProfile}</h2><p className="text-sm text-gray-500">{ft.workerDesc}</p></div>
            <ChevronRight size={20} />
          </button>
          <button onClick={() => setMode('employer')} className="w-full bg-white p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-500 flex items-center gap-4 transition">
            <Building size={32} className="text-blue-600" />
            <div className="text-left flex-1"><h2 className="font-bold text-xl">{ft.postJob}</h2><p className="text-sm text-gray-500">{ft.postJobDesc}</p></div>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <MobileNav country={country} lang={currentLang} />
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // WORKER FORM — 7 STEPS
  // ═══════════════════════════════════════════════════════
  if (mode === 'labor') return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-4">
        <button onClick={() => setMode('')} className="text-orange-600 mb-4 flex items-center gap-1"><ChevronLeft size={18}/> {ft.back}</button>
        {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        <div className="mb-4"><div className="h-2 bg-gray-200 rounded-full"><div className="h-2 bg-orange-600 rounded-full transition-all" style={{ width: `${(step/7)*100}%` }} /></div><p className="text-xs text-gray-400 text-right mt-1">Step {step}/7</p></div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
          
          {/* STEP 1: Phone + Category + Gender + Nationality */}
          {step === 1 && (<>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={ft.phone} className="w-full p-3 border rounded-xl" type="tel" />
            <select value={category} onChange={e => { setCategory(e.target.value); setOtherCategory(''); }} className="w-full p-3 border rounded-xl bg-white">
              <option value="">{ft.selectCategory}</option>
              {MAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="other">━━ {ft.otherCategories} ━━</option>
            </select>
            {category === 'other' && (
              <select value={otherCategory} onChange={e => setOtherCategory(e.target.value)} className="w-full p-3 border rounded-xl bg-orange-50 border-orange-200">
                <option value="">{ft.selectSpecial}</option>
                {OTHER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.gender}</option>{getDropdown('gender', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={nationality} onChange={e => setNationality(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.nationality}</option>{getDropdown('nationality', currentLang).map(o => <option key={o}>{o}</option>)}</select>
          </>)}
          
          {/* STEP 2: Multi-language Names */}
          {step === 2 && (<>
            <h3 className="font-bold text-lg text-center">{ft.multiLangTitle}</h3>
            <p className="text-xs text-gray-500 text-center">{ft.multiLangDesc}</p>
            <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder={ft.englishName} className="w-full p-3 border-2 border-green-300 rounded-xl bg-green-50" />
            <input value={nameBn} onChange={e => setNameBn(e.target.value)} placeholder={ft.nameInBengali} className="w-full p-3 border rounded-xl" />
            <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder={ft.nameInArabic} className="w-full p-3 border rounded-xl text-right" dir="rtl" />
            <input value={nameHi} onChange={e => setNameHi(e.target.value)} placeholder={ft.nameInHindi} className="w-full p-3 border rounded-xl" />
          </>)}
          
          {/* STEP 3: Photo + Personal Info */}
          {step === 3 && (<>
            <div className="flex justify-center">
              {photoPrev ? (
                <div className="relative"><img src={photoPrev} className="w-28 h-28 rounded-full object-cover border-4 border-orange-300" /><button onClick={() => { setPhotoFile(null); setPhotoPrev(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center"><X size={16}/></button></div>
              ) : (
                <label className="w-28 h-28 bg-gray-100 rounded-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed"><Camera size={28} className="text-gray-500"/><span className="text-xs">{ft.photo}</span><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f) { setPhotoFile(f); setPhotoPrev(URL.createObjectURL(f)); } }} className="hidden"/></label>
              )}
            </div>
            <input value={age} onChange={e => setAge(e.target.value)} placeholder={ft.age} type="number" className="w-full p-3 border rounded-xl" />
            <select value={religion} onChange={e => setReligion(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.religion}</option>{getDropdown('religion', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.maritalStatus}</option>{getDropdown('maritalStatus', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <div className="grid grid-cols-2 gap-2"><input value={height} onChange={e => setHeight(e.target.value)} placeholder={ft.height} type="number" className="p-3 border rounded-xl" /><input value={weight} onChange={e => setWeight(e.target.value)} placeholder={ft.weight} type="number" className="p-3 border rounded-xl" /></div>
          </>)}
          
          {/* STEP 4: Work Details */}
          {step === 4 && (<>
            <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.experience}</option>{getDropdown('experience', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={salaryType} onChange={e => setSalaryType(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.salaryType}</option>{getDropdown('salaryType', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <input value={salary} onChange={e => setSalary(e.target.value)} placeholder={ft.salary} type="number" className="w-full p-3 border rounded-xl" />
            <div><p className="text-xs font-medium text-gray-500 mb-1">{ft.skills}</p><div className="flex flex-wrap gap-1.5">{getDropdown('skills', currentLang).map(s => <button key={s} onClick={() => toggleSkill(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition ${skills.includes(s) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>)}</div></div>
            <div><p className="text-xs font-medium text-gray-500 mb-1">{ft.languages}</p><div className="flex flex-wrap gap-1.5">{getDropdown('languages', currentLang).map(l => <button key={l} onClick={() => toggleLanguage(l)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition ${languages.includes(l) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>)}</div></div>
          </>)}
          
          {/* STEP 5: Visa + Location */}
          {step === 5 && (<>
            <select value={visaStatus} onChange={e => setVisaStatus(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.visaStatus}</option>{getDropdown('visaStatus', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={passportStatus} onChange={e => setPassportStatus(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.passportStatus}</option>{getDropdown('passportStatus', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <input value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} type="date" placeholder={ft.availableFrom} className="w-full p-3 border rounded-xl" />
            <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.city}</option>{cityList.map(c => <option key={c}>{c}</option>)}</select>
            <input value={area} onChange={e => setArea(e.target.value)} placeholder={ft.area} className="w-full p-3 border rounded-xl" />
          </>)}
          
          {/* STEP 6: Accommodation + Work Conditions */}
          {step === 6 && (<>
            <select value={accommodation} onChange={e => setAccommodation(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.accommodation}</option>{getDropdown('accommodation', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={food} onChange={e => setFood(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.food}</option>{getDropdown('food', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={workingHours} onChange={e => setWorkingHours(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.workingHours}</option>{getDropdown('workingHours', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={daysOff} onChange={e => setDaysOff(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.daysOff}</option>{getDropdown('daysOff', currentLang).map(o => <option key={o}>{o}</option>)}</select>
          </>)}
          
          {/* STEP 7: Bio + Work Photos */}
          {step === 7 && (<>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={ft.bio} rows={4} className="w-full p-3 border rounded-xl resize-none" />
            <label className="block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-orange-400"><Upload size={28} className="mx-auto text-gray-400"/><p className="text-sm mt-1">{ft.workPhotos}</p><input type="file" multiple accept="image/*" onChange={handleWorkPhotos} className="hidden"/></label>
            <div className="grid grid-cols-3 gap-2">{workPreviews.map((p, i) => (<div key={i} className="relative"><img src={p} className="h-24 w-full object-cover rounded-lg" /><button onClick={() => removeWorkPhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"><X size={12}/></button></div>))}</div>
          </>)}
        </div>
        
        <div className="flex gap-3 mt-5">
          {step > 1 && <button onClick={() => setStep(step-1)} className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold">{ft.back}</button>}
          {step < 7 ? (
            <button onClick={() => setStep(step+1)} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold">{ft.next} →</button>
          ) : (
            <button onClick={handleLaborSubmit} disabled={loading} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50">{loading ? '...' : ft.submit}</button>
          )}
        </div>
      </div>
      <MobileNav country={country} lang={currentLang} />
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // EMPLOYER FORM
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-4">
        <button onClick={() => setMode('')} className="text-blue-600 mb-4 flex items-center gap-1"><ChevronLeft size={18}/> {ft.back}</button>
        {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase size={24}/> {ft.employerTitle}</h2>
          
          {/* Job Image */}
          {jobImagePrev ? (
            <div className="relative"><img src={jobImagePrev} className="w-full h-32 rounded-xl object-cover border-2 border-blue-300" /><button onClick={() => { setJobImageFile(null); setJobImagePrev(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"><X size={14}/></button></div>
          ) : (
            <label className="w-full h-32 bg-gray-100 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed hover:border-blue-400">
              {jobImageUploading ? <Loader2 size={24} className="animate-spin text-blue-500" /> : <><ImageIcon size={24} className="text-gray-500"/><span className="text-xs mt-1">{ft.uploadImage}</span></>}
              <input type="file" accept="image/*" onChange={handleJobImage} className="hidden" />
            </label>
          )}
          
          <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder={ft.jobTitle} className="w-full p-3 border rounded-xl" />
          
          {/* Category */}
          <select value={jobCat} onChange={e => { setJobCat(e.target.value); setJobOtherCat(''); }} className="w-full p-3 border rounded-xl bg-white">
            <option value="">{ft.selectCategory}</option>
            {MAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="other">━━ {ft.otherCategories} ━━</option>
          </select>
          {jobCat === 'other' && (
            <select value={jobOtherCat} onChange={e => setJobOtherCat(e.target.value)} className="w-full p-3 border rounded-xl bg-orange-50 border-orange-200">
              <option value="">{ft.selectSpecial}</option>
              {OTHER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          
          {/* Location Type */}
          <select value={jobLocationType} onChange={e => setJobLocationType(e.target.value)} className="w-full p-3 border rounded-xl bg-white">
            <option value="office">{ft.office}</option>
            <option value="home">{ft.home}</option>
            <option value="both">{ft.both}</option>
          </select>
          
          <select value={jobCity} onChange={e => setJobCity(e.target.value)} className="w-full p-3 border rounded-xl bg-white"><option value="">{ft.city}</option>{cityList.map(c => <option key={c}>{c}</option>)}</select>
          
          {(jobLocationType === 'home' || jobLocationType === 'both') && <input value={homeAddress} onChange={e => setHomeAddress(e.target.value)} placeholder={ft.homeAddress} className="w-full p-3 border rounded-xl border-orange-200 bg-orange-50" />}
          {(jobLocationType === 'office' || jobLocationType === 'both') && <input value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} placeholder={ft.officeAddress} className="w-full p-3 border rounded-xl border-blue-200 bg-blue-50" />}
          
          <div className="grid grid-cols-2 gap-2">
            <input value={jobSalary} onChange={e => setJobSalary(e.target.value)} placeholder={ft.jobSalary} type="number" className="p-3 border rounded-xl" />
            <select value={jobType} onChange={e => setJobType(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.jobType}</option>{getDropdown('jobTypes', currentLang).map(o => <option key={o}>{o}</option>)}</select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <input value={workersNeeded} onChange={e => setWorkersNeeded(e.target.value)} placeholder={ft.workersNeeded} type="number" className="p-3 border rounded-xl" />
            <select value={urgency} onChange={e => setUrgency(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.urgency}</option>{getDropdown('urgency', currentLang).map(o => <option key={o}>{o}</option>)}</select>
          </div>
          
          {/* Requirements */}
          <div className="grid grid-cols-3 gap-2">
            <input value={minAge} onChange={e => setMinAge(e.target.value)} placeholder={ft.minAge} type="number" className="p-3 border rounded-xl" />
            <input value={maxAge} onChange={e => setMaxAge(e.target.value)} placeholder={ft.maxAge} type="number" className="p-3 border rounded-xl" />
            <select value={experienceRequired} onChange={e => setExperienceRequired(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.experienceRequired}</option>{getDropdown('experience', currentLang).map(o => <option key={o}>{o}</option>)}</select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <select value={genderPref} onChange={e => setGenderPref(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.genderPreference}</option>{getDropdown('gender', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={nationalityPref} onChange={e => setNationalityPref(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.nationalityPreference}</option>{getDropdown('nationality', currentLang).map(o => <option key={o}>{o}</option>)}</select>
          </div>
          
          {/* Benefits */}
          <div><p className="text-xs font-medium text-gray-500 mb-1">{ft.benefits}</p><div className="flex flex-wrap gap-1.5">{getDropdown('benefits', currentLang).map(b => <button key={b} onClick={() => toggleBenefit(b)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition ${selectedBenefits.includes(b) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{b}</button>)}</div></div>
          
          <div className="grid grid-cols-3 gap-2">
            <select value={contractDuration} onChange={e => setContractDuration(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.contractDuration}</option>{getDropdown('contractDuration', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={jobWorkingHours} onChange={e => setJobWorkingHours(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.jobWorkingHours}</option>{getDropdown('workingHours', currentLang).map(o => <option key={o}>{o}</option>)}</select>
            <select value={jobDaysOff} onChange={e => setJobDaysOff(e.target.value)} className="p-3 border rounded-xl bg-white"><option value="">{ft.jobDaysOff}</option>{getDropdown('daysOff', currentLang).map(o => <option key={o}>{o}</option>)}</select>
          </div>
          
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={ft.companyName} className="w-full p-3 border rounded-xl" />
          <input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder={ft.companyPhone} className="w-full p-3 border rounded-xl" type="tel" />
          <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder={ft.jobDesc} rows={4} className="w-full p-3 border rounded-xl resize-none" />
          
          <button onClick={handleEmployerSubmit} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50">
            {loading ? ft.posting : ft.postingJob}
          </button>
        </div>
      </div>
      <MobileNav country={country} lang={currentLang} />
    </div>
  );
}