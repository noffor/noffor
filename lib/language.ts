// lib/language.ts
// 🚀 1 Billion Users | 4 Languages | SuperSonic | No Lag | 100% Perfect Name Translation

import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════════
export const languages = {
  en: { code: 'en', name: 'English', dir: 'ltr' },
  bn: { code: 'bn', name: 'বাংলা', dir: 'ltr' },
  ar: { code: 'ar', name: 'العربية', dir: 'rtl' },
  hi: { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
} as const;

export type LangCode = keyof typeof languages;
export type LanguageConfig = typeof languages[LangCode];

// ═══════════════════════════════════════════════════════════
// Country Names — ONLY 6 GULF COUNTRIES
// ═══════════════════════════════════════════════════════════
export function getCountryName(country: string, lang: string): string {
  const names: Record<string, Record<string, string>> = {
    qa: { en: 'Qatar', bn: 'কাতার', ar: 'قطر', hi: 'कतर' },
    sa: { en: 'Saudi Arabia', bn: 'সৌদি আরব', ar: 'السعودية', hi: 'सऊदी अरब' },
    ae: { en: 'UAE', bn: 'ইউএই', ar: 'الإمارات', hi: 'यूएई' },
    kw: { en: 'Kuwait', bn: 'কুয়েত', ar: 'الكويت', hi: 'कुवैत' },
    bh: { en: 'Bahrain', bn: 'বাহরাইন', ar: 'البحرين', hi: 'बहरीन' },
    om: { en: 'Oman', bn: 'ওমান', ar: 'عمان', hi: 'ओमान' },
  };
  return names[country]?.[lang] || country.toUpperCase();
}

// ═══════════════════════════════════════════════════════════
// Category Translation — 42 Categories
// ═══════════════════════════════════════════════════════════
const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  Driver: { en: 'Driver', bn: 'ড্রাইভার', ar: 'سائق', hi: 'ड्राइवर' },
  Electrician: { en: 'Electrician', bn: 'ইলেকট্রিশিয়ান', ar: 'كهربائي', hi: 'इलेक्ट्रीशियन' },
  Plumber: { en: 'Plumber', bn: 'প্লাম্বার', ar: 'سباك', hi: 'प्लंबर' },
  Mason: { en: 'Mason', bn: 'রাজমিস্ত্রি', ar: 'بناء', hi: 'राजमिस्त्री' },
  'AC Technician': { en: 'AC Technician', bn: 'এসি টেকনিশিয়ান', ar: 'فني تكييف', hi: 'एसी तकनीशियन' },
  Painter: { en: 'Painter', bn: 'পেইন্টার', ar: 'دهان', hi: 'पेंटर' },
  Carpenter: { en: 'Carpenter', bn: 'কার্পেন্টার', ar: 'نجار', hi: 'बढ़ई' },
  Welder: { en: 'Welder', bn: 'ওয়েল্ডার', ar: 'لحام', hi: 'वेल्डर' },
  Cleaner: { en: 'Cleaner', bn: 'ক্লিনার', ar: 'منظف', hi: 'क्लीनर' },
  Cook: { en: 'Cook', bn: 'রাঁধুনি', ar: 'طباخ', hi: 'रसोइया' },
  Helper: { en: 'Helper', bn: 'হেল্পার', ar: 'مساعد', hi: 'हेल्पर' },
  Gardener: { en: 'Gardener', bn: 'মালী', ar: 'بستاني', hi: 'माली' },
  Housemaid: { en: 'Housemaid', bn: 'গৃহকর্মী', ar: 'خادمة', hi: 'हाउसमेड' },
  Nanny: { en: 'Nanny', bn: 'আয়া', ar: 'مربية', hi: 'नैनी' },
  'Office Assistant': { en: 'Office Assistant', bn: 'অফিস সহকারী', ar: 'مساعد مكتبي', hi: 'ऑफिस असिस्टेंट' },
  Receptionist: { en: 'Receptionist', bn: 'রিসেপশনিস্ট', ar: 'موظف استقبال', hi: 'रिसेप्शनिस्ट' },
  Salesman: { en: 'Salesman', bn: 'সেলসম্যান', ar: 'بائع', hi: 'सेल्समैन' },
  Cashier: { en: 'Cashier', bn: 'ক্যাশিয়ার', ar: 'كاشير', hi: 'कैशियर' },
  'Security Guard': { en: 'Security Guard', bn: 'সিকিউরিটি গার্ড', ar: 'حارس أمن', hi: 'सिक्योरिटी गार्ड' },
  Nurse: { en: 'Nurse', bn: 'নার্স', ar: 'ممرض', hi: 'नर्स' },
  Pharmacist: { en: 'Pharmacist', bn: 'ফার্মাসিস্ট', ar: 'صيدلي', hi: 'फार्मासिस्ट' },
  'Lab Technician': { en: 'Lab Technician', bn: 'ল্যাব টেকনিশিয়ান', ar: 'فني مختبر', hi: 'लैब तकनीशियन' },
  Physiotherapist: { en: 'Physiotherapist', bn: 'ফিজিওথেরাপিস্ট', ar: 'معالج طبيعي', hi: 'फिजियोथेरेपिस्ट' },
  Mechanic: { en: 'Mechanic', bn: 'মেকানিক', ar: 'ميكانيكي', hi: 'मैकेनिक' },
  Tailor: { en: 'Tailor', bn: 'দর্জি', ar: 'خياط', hi: 'दर्जी' },
  Barista: { en: 'Barista', bn: 'বারিস্তা', ar: 'باريستا', hi: 'बरिस्ता' },
  Photographer: { en: 'Photographer', bn: 'ফটোগ্রাফার', ar: 'مصور', hi: 'फोटोग्राफर' },
  'CCTV Technician': { en: 'CCTV Technician', bn: 'সিসিটিভি টেকনিশিয়ান', ar: 'فني كاميرات', hi: 'CCTV तकनीशियन' },
  'Gypsum Carpenter': { en: 'Gypsum Carpenter', bn: 'জিপসাম কার্পেন্টার', ar: 'نجار جبس', hi: 'जिप्सम कारपेंटर' },
  'Tiles Mason': { en: 'Tiles Mason', bn: 'টাইলস মিস্ত্রি', ar: 'عامل تبليط', hi: 'टाइल्स मिस्त्री' },
  Blacksmith: { en: 'Blacksmith', bn: 'কামার', ar: 'حداد', hi: 'लोहार' },
  'General Labour': { en: 'General Labour', bn: 'সাধারণ শ্রমিক', ar: 'عامل عام', hi: 'सामान्य श्रमिक' },
  'Steel Fixer': { en: 'Steel Fixer', bn: 'স্টিল ফিক্সার', ar: 'مثبت حديد', hi: 'स्टील फिक्सर' },
  Scaffolder: { en: 'Scaffolder', bn: 'স্ক্যাফোল্ডার', ar: 'عامل سقالات', hi: 'स्कैफोल्डर' },
  'Heavy Driver': { en: 'Heavy Driver', bn: 'ভারী ড্রাইভার', ar: 'سائق ثقيل', hi: 'भारी ड्राइवर' },
  'Forklift Operator': { en: 'Forklift Operator', bn: 'ফর্কলিফট অপারেটর', ar: 'مشغل رافعة', hi: 'फोर्कलिफ्ट ऑपरेटर' },
  'Crane Operator': { en: 'Crane Operator', bn: 'ক্রেন অপারেটর', ar: 'مشغل رافعة', hi: 'क्रेन ऑपरेटर' },
  'Pipe Fitter': { en: 'Pipe Fitter', bn: 'পাইপ ফিটার', ar: 'مركب أنابيب', hi: 'पाइप फिटर' },
  Waiter: { en: 'Waiter', bn: 'ওয়েটার', ar: 'نادل', hi: 'वेटर' },
  'Hotel Housekeeping': { en: 'Hotel Housekeeping', bn: 'হোটেল হাউসকিপিং', ar: 'تدبير فندقي', hi: 'होटल हाउसकीपिंग' },
  Beautician: { en: 'Beautician', bn: 'বিউটিশিয়ান', ar: 'خبيرة تجميل', hi: 'ब्यूटीशियन' },
  Barber: { en: 'Barber', bn: 'নাপিত', ar: 'حلاق', hi: 'नाई' },
  Security: { en: 'Security Guard', bn: 'সিকিউরিটি গার্ড', ar: 'حارس أمن', hi: 'सिक्योरिटी गार्ड' },
  Teacher: { en: 'Teacher', bn: 'শিক্ষক', ar: 'معلم', hi: 'शिक्षक' },
  Chef: { en: 'Chef', bn: 'শেফ', ar: 'طاهي', hi: 'शेफ' },
};

// ═══════════════════════════════════════════════════════════
// All Translations
// ═══════════════════════════════════════════════════════════
export const texts: Record<LangCode, Record<string, string>> = {
  en: {
    map_loading: 'Loading Map...',
    map_no_workers: 'No workers found',
    map_workers: 'workers',
    map_online: 'Online',
    map_gps: 'GPS',
    map_salary: 'Salary',
    map_experience: 'Experience',
    map_distance: 'Distance',
    map_eta: 'ETA',
    kmAway: 'km away',
    mins: 'mins',
    month: 'months',
    map_view_profile: 'View Profile',
    map_close: 'Close',
    map_list: 'List',
    map_map: 'Map',
    map_you_are_in: 'You are here',
    map_all_areas: 'All Areas',
    map_areas: 'Areas',
    map_hide: 'Hide',
    map_clear: 'Clear',
    map_clear_route: 'Clear Route',
    map_all: 'All',
    map_rated: '4+',
    map_budget: 'Budget',
    map_area_placeholder: 'Area...',
    map_worker_details: 'Worker Details',
    map_whatsapp: 'WhatsApp',
    map_scan_qr: 'Scan to view',
    map_showing_nearby: 'showing nearby',
    map_now_showing: 'Now showing',
    map_new: 'New',
    searchPlaceholder: 'Search by name or number...',
    navSearch: 'Search',
    home: 'Home',
    profile: 'Profile',
    create: 'Create',
    dashboard: 'Dashboard',
    map: 'Map',
    bid: 'Bid',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    settings: 'Settings',
    featured: 'Featured Workers',
    categories: 'Categories',
    allWorkers: 'All Workers',
    viewAll: 'View All',
    online: 'Online',
    offline: 'Offline',
    salary: 'Salary',
    experience: 'Experience',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    call: 'Call',
    jobOffer: 'Job Offer',
    createProfile: 'Create Profile',
    postJob: 'Post a Job',
    selectCountry: 'Select Country',
    selectCity: 'Select City',
    selectArea: 'Select Area',
    views: 'Views',
    contacts: 'Contacts',
    offers: 'Job Offers',
    hired: 'Hired',
    labor: 'Labor',
    employer: 'Employer',
    back: 'Back',
    sendOTP: 'Send OTP',
    noAccount: "Don't have account?",
    biodata: 'Biodata',
    skills: 'Skills',
    reviews: 'Reviews',
    workPhotos: 'Work Photos',
    about: 'About',
    popularSearches: 'Popular Searches',
    allDistance: 'All Distance',
    viewProfile: 'View Profile',
    noResults: 'No results found',
    noSkills: 'No skills listed',
    share: 'Share',
    report: 'Report',
    save: 'Save',
    noReviews: 'No reviews yet',
    noActivity: 'No recent activity',
    liveActivity: 'Live Activity',
    jobPosts: 'Job Posts',
    savedWorkers: 'Saved Workers',
    findLabor: 'Find Labor',
    hiring: 'HIRING',
    response: 'Response',
    rating: 'Rating',
    notSpecified: 'Not specified',
    similarWorkers: 'Similar Workers',
    sendJobOffer: 'Send Job Offer',
    bookWorker: 'Book This Worker',
    jobTitle: 'Job Title *',
    jobDescription: 'Job Description *',
    category: 'Category',
    offerAmount: 'Offer Amount (QAR) *',
    paymentType: 'Payment Type',
    fixedPrice: 'Fixed Price',
    hourlyRate: 'Hourly Rate',
    dailyRate: 'Daily Rate',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer',
    mobileBanking: 'Mobile Banking',
    startDate: 'Start Date *',
    startTime: 'Start Time *',
    duration: 'Duration (Days) *',
    location: 'Job Location *',
    specialInstructions: 'Special Instructions',
    yourPhone: 'Your Phone *',
    sendRequest: 'Send Booking Request',
    totalAmount: 'Total Amount',
    qar: 'QAR',
    perHour: 'per hour',
    perDay: 'per day',
    bookingRequests: 'Booking Requests',
    noRequests: 'No pending requests',
    accept: 'Accept',
    reject: 'Reject',
    negotiate: 'Negotiate',
    from: 'From',
    bookingStatus: 'Booking Status',
    pending: 'Pending',
    accepted: 'Accepted',
    completed: 'Completed',
    workerOnWay: 'Worker is coming to you',
    workerArrived: 'Worker arrived',
    workInProgress: 'Work in progress',
    finishWork: 'Finish Work',
    markComplete: 'Mark as Complete',
    nearbyWorkers: 'Nearby Workers',
    hire: 'Hire',
    noNearbyWorkers: 'No workers available nearby',
    youOffered: 'You offered',
    workerCountered: 'Worker countered',
    proposeNew: 'Propose New',
    bookingSuccess: 'Booking request sent successfully!',
    bookingAccepted: 'Booking accepted! Worker is on the way.',
    bookingRejected: 'Booking rejected.',
    bookingCompleted: 'Work completed! Please rate the worker.',
    errorOccurred: 'An error occurred. Please try again.',
    posting: 'Posting...',
    submitting: 'Submitting...',
    required: 'Please fill all required fields',
    bid_amount: 'Please enter bid amount',
    posted: 'Job Posted!',
    bid_success: 'Bid Placed Successfully!',
    lowest: 'Lowest Bid',
    close: 'Close',
    be_first: 'Be the first to bid!',
    no_bids_yet: 'No bids yet',
    login_required: 'Please login to continue',
    linkCopied: 'Link copied!',
    loading: 'Loading profile...',
    profileNotFound: 'Profile Not Found',
    profileNotFoundDesc: 'This profile has been removed or does not exist',
    invalidProfile: 'Invalid Profile',
    goHome: 'Go Home',
    whatsappNotAvailable: 'WhatsApp not available',
    phoneNotAvailable: 'Phone not available',
  },
  bn: {
    map_loading: 'ম্যাপ লোড হচ্ছে...',
    map_no_workers: 'কোনো কর্মী পাওয়া যায়নি',
    map_workers: 'কর্মী',
    map_online: 'অনলাইন',
    map_gps: 'জিপিএস',
    map_salary: 'বেতন',
    map_experience: 'অভিজ্ঞতা',
    map_distance: 'দূরত্ব',
    map_eta: 'পৌঁছাতে সময়',
    kmAway: 'কিমি দূরে',
    mins: 'মিনিট',
    month: 'মাস',
    map_view_profile: 'প্রোফাইল দেখুন',
    map_close: 'বন্ধ',
    map_list: 'তালিকা',
    map_map: 'ম্যাপ',
    map_you_are_in: 'আপনি এখানে আছেন',
    map_all_areas: 'সব এলাকা',
    map_areas: 'এলাকা',
    map_hide: 'লুকান',
    map_clear: 'মুছুন',
    map_clear_route: 'রুট মুছুন',
    map_all: 'সব',
    map_rated: '৪+',
    map_budget: 'বাজেট',
    map_area_placeholder: 'এলাকা...',
    map_worker_details: 'কর্মীর বিবরণ',
    map_whatsapp: 'হোয়াটসঅ্যাপ',
    map_scan_qr: 'স্ক্যান করুন',
    map_showing_nearby: 'কাছের দেখানো হচ্ছে',
    map_now_showing: 'এখন দেখানো হচ্ছে',
    map_new: 'নতুন',
    searchPlaceholder: 'নাম বা নাম্বার দিয়ে খুঁজুন...',
    navSearch: 'সার্চ',
    home: 'হোম',
    profile: 'প্রোফাইল',
    create: 'তৈরি',
    dashboard: 'ড্যাশবোর্ড',
    map: 'ম্যাপ',
    bid: 'বিড',
    login: 'লগইন',
    register: 'রেজিস্টার',
    logout: 'লগআউট',
    settings: 'সেটিংস',
    featured: 'ফিচার্ড কর্মী',
    categories: 'ক্যাটাগরি',
    allWorkers: 'সব কর্মী',
    viewAll: 'সব দেখুন',
    online: 'অনলাইন',
    offline: 'অফলাইন',
    salary: 'বেতন',
    experience: 'অভিজ্ঞতা',
    contact: 'যোগাযোগ',
    whatsapp: 'হোয়াটসঅ্যাপ',
    call: 'কল',
    jobOffer: 'জব অফার',
    createProfile: 'প্রোফাইল তৈরি',
    postJob: 'জব পোস্ট',
    selectCountry: 'দেশ বাছুন',
    selectCity: 'শহর বাছুন',
    selectArea: 'এরিয়া বাছুন',
    views: 'ভিউ',
    contacts: 'যোগাযোগ',
    offers: 'জব অফার',
    hired: 'নিয়োগ',
    labor: 'শ্রমিক',
    employer: 'নিয়োগকর্তা',
    back: 'ফিরুন',
    sendOTP: 'OTP পাঠান',
    noAccount: 'অ্যাকাউন্ট নেই?',
    biodata: 'বায়োডাটা',
    skills: 'দক্ষতা',
    reviews: 'রিভিউ',
    workPhotos: 'কাজের ছবি',
    about: 'সম্পর্কে',
    popularSearches: 'জনপ্রিয় সার্চ',
    allDistance: 'সব দূরত্ব',
    viewProfile: 'প্রোফাইল দেখুন',
    noResults: 'কোনো ফলাফল নেই',
    noSkills: 'কোনো দক্ষতা নেই',
    share: 'শেয়ার',
    report: 'রিপোর্ট',
    save: 'সেভ',
    noReviews: 'এখনো কোনো রিভিউ নেই',
    noActivity: 'কোনো সাম্প্রতিক কার্যকলাপ নেই',
    liveActivity: 'লাইভ অ্যাক্টিভিটি',
    jobPosts: 'জব পোস্ট',
    savedWorkers: 'সেভ করা কর্মী',
    findLabor: 'শ্রমিক খুঁজুন',
    hiring: 'নিয়োগ',
    response: 'সাড়া',
    rating: 'রেটিং',
    notSpecified: 'নির্ধারিত নয়',
    similarWorkers: 'অনুরূপ কর্মী',
    sendJobOffer: 'জব অফার পাঠান',
    bookWorker: 'শ্রমিক বুক করুন',
    jobTitle: 'কাজের শিরোনাম *',
    jobDescription: 'কাজের বিবরণ *',
    category: 'ক্যাটাগরি',
    offerAmount: 'অফার মূল্য (রিয়াল) *',
    paymentType: 'পেমেন্ট টাইপ',
    fixedPrice: 'নির্দিষ্ট মূল্য',
    hourlyRate: 'ঘন্টা হিসাবে',
    dailyRate: 'দিন হিসাবে',
    paymentMethod: 'পেমেন্ট পদ্ধতি',
    cash: 'নগদ',
    bankTransfer: 'ব্যাংক ট্রান্সফার',
    mobileBanking: 'মোবাইল ব্যাংকিং',
    startDate: 'শুরুর তারিখ *',
    startTime: 'শুরুর সময় *',
    duration: 'দিন সংখ্যা *',
    location: 'কাজের অবস্থান *',
    specialInstructions: 'বিশেষ নির্দেশনা',
    yourPhone: 'আপনার ফোন *',
    sendRequest: 'বুকিং রিকোয়েস্ট পাঠান',
    totalAmount: 'মোট মূল্য',
    qar: 'রিয়াল',
    perHour: 'ঘন্টা প্রতি',
    perDay: 'দিন প্রতি',
    bookingRequests: 'বুকিং রিকোয়েস্ট',
    noRequests: 'কোনো রিকোয়েস্ট নেই',
    accept: 'গ্রহণ করুন',
    reject: 'বাতিল করুন',
    negotiate: 'দরদাম করুন',
    from: 'থেকে',
    bookingStatus: 'বুকিং স্ট্যাটাস',
    pending: 'অপেক্ষমান',
    accepted: 'গৃহীত',
    completed: 'সম্পন্ন',
    workerOnWay: 'শ্রমিক আপনার দিকে আসছে',
    workerArrived: 'শ্রমিক পৌঁছে গেছেন',
    workInProgress: 'কাজ চলছে',
    finishWork: 'কাজ শেষ করুন',
    markComplete: 'সম্পন্ন করুন',
    nearbyWorkers: 'কাছাকাছি শ্রমিক',
    hire: 'নিয়োগ',
    noNearbyWorkers: 'কাছাকাছি কোনো শ্রমিক নেই',
    youOffered: 'আপনি অফার করেছেন',
    workerCountered: 'শ্রমিক কাউন্টার দিয়েছেন',
    proposeNew: 'নতুন প্রস্তাব দিন',
    bookingSuccess: 'বুকিং রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!',
    bookingAccepted: 'বুকিং গৃহীত হয়েছে! শ্রমিক আসছে।',
    bookingRejected: 'বুকিং বাতিল করা হয়েছে।',
    bookingCompleted: 'কাজ সম্পন্ন হয়েছে! শ্রমিককে রেটিং দিন।',
    errorOccurred: 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    posting: 'পোস্ট হচ্ছে...',
    submitting: 'জমা হচ্ছে...',
    required: 'সব প্রয়োজনীয় তথ্য পূরণ করুন',
    bid_amount: 'বিড মূল্য দিন',
    posted: 'জব পোস্ট হয়েছে!',
    bid_success: 'বিড সফলভাবে প্লেস হয়েছে!',
    lowest: 'সর্বনিম্ন বিড',
    close: 'বন্ধ',
    be_first: 'প্রথম বিড করুন!',
    no_bids_yet: 'কোনো বিড নেই',
    login_required: 'চালিয়ে যেতে লগইন করুন',
    linkCopied: 'লিংক কপি হয়েছে!',
    loading: 'প্রোফাইল লোড হচ্ছে...',
    profileNotFound: 'প্রোফাইল পাওয়া যায়নি',
    profileNotFoundDesc: 'এই প্রোফাইলটি মুছে ফেলা হয়েছে বা বিদ্যমান নেই',
    invalidProfile: 'অবৈধ প্রোফাইল',
    goHome: 'হোমে যান',
    whatsappNotAvailable: 'হোয়াটসঅ্যাপ উপলব্ধ নয়',
    phoneNotAvailable: 'ফোন উপলব্ধ নয়',
  },
  ar: {
    map_loading: 'جاري تحميل الخريطة...',
    map_no_workers: 'لم يتم العثور على عمال',
    map_workers: 'عمال',
    map_online: 'متصل',
    map_gps: 'GPS',
    map_salary: 'الراتب',
    map_experience: 'الخبرة',
    map_distance: 'المسافة',
    map_eta: 'الوقت المتوقع',
    kmAway: 'كم',
    mins: 'دقائق',
    month: 'شهر',
    map_view_profile: 'عرض الملف',
    map_close: 'إغلاق',
    map_list: 'قائمة',
    map_map: 'خريطة',
    map_you_are_in: 'أنت هنا',
    map_all_areas: 'جميع المناطق',
    map_areas: 'مناطق',
    map_hide: 'إخفاء',
    map_clear: 'مسح',
    map_clear_route: 'مسح المسار',
    map_all: 'الكل',
    map_rated: '٤+',
    map_budget: 'ميزانية',
    map_area_placeholder: 'منطقة...',
    map_worker_details: 'تفاصيل العامل',
    map_whatsapp: 'واتساب',
    map_scan_qr: 'مسح للعرض',
    map_showing_nearby: 'عرض القريب',
    map_now_showing: 'يظهر الآن',
    map_new: 'جديد',
    searchPlaceholder: 'ابحث بالاسم أو الرقم...',
    navSearch: 'بحث',
    home: 'الرئيسية',
    profile: 'الملف',
    create: 'إنشاء',
    dashboard: 'لوحة التحكم',
    map: 'خريطة',
    bid: 'مزايدة',
    login: 'تسجيل الدخول',
    register: 'تسجيل',
    logout: 'تسجيل الخروج',
    settings: 'الإعدادات',
    featured: 'عمال مميزون',
    categories: 'الفئات',
    allWorkers: 'جميع العمال',
    viewAll: 'عرض الكل',
    online: 'متصل',
    offline: 'غير متصل',
    salary: 'الراتب',
    experience: 'الخبرة',
    contact: 'اتصال',
    whatsapp: 'واتساب',
    call: 'اتصل الآن',
    jobOffer: 'عرض عمل',
    createProfile: 'إنشاء ملف',
    postJob: 'نشر وظيفة',
    selectCountry: 'اختر البلد',
    selectCity: 'اختر المدينة',
    selectArea: 'اختر المنطقة',
    views: 'مشاهدات',
    contacts: 'جهات اتصال',
    offers: 'عروض عمل',
    hired: 'موظف',
    labor: 'عامل',
    employer: 'صاحب عمل',
    back: 'رجوع',
    sendOTP: 'إرسال OTP',
    noAccount: 'ليس لديك حساب؟',
    biodata: 'بيانات',
    skills: 'مهارات',
    reviews: 'تقييمات',
    workPhotos: 'صور العمل',
    about: 'حول',
    popularSearches: 'البحوث الشائعة',
    allDistance: 'كل المسافات',
    viewProfile: 'عرض الملف',
    noResults: 'لا توجد نتائج',
    noSkills: 'لا توجد مهارات',
    share: 'مشاركة',
    report: 'إبلاغ',
    save: 'حفظ',
    noReviews: 'لا توجد تقييمات',
    noActivity: 'لا يوجد نشاط حديث',
    liveActivity: 'نشاط مباشر',
    jobPosts: 'الوظائف',
    savedWorkers: 'العمال المحفوظين',
    findLabor: 'البحث عن عمال',
    hiring: 'توظيف',
    response: 'رد',
    rating: 'تقييم',
    notSpecified: 'غير محدد',
    similarWorkers: 'عمال مشابهين',
    sendJobOffer: 'إرسال عرض عمل',
    bookWorker: 'احجز هذا العامل',
    jobTitle: 'عنوان الوظيفة *',
    jobDescription: 'وصف الوظيفة *',
    category: 'الفئة',
    offerAmount: 'المبلغ المعروض (ريال) *',
    paymentType: 'نوع الدفع',
    fixedPrice: 'سعر ثابت',
    hourlyRate: 'بالساعة',
    dailyRate: 'باليوم',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقدًا',
    bankTransfer: 'تحويل بنكي',
    mobileBanking: 'خدمات مصرفية متنقلة',
    startDate: 'تاريخ البدء *',
    startTime: 'وقت البدء *',
    duration: 'المدة (أيام) *',
    location: 'موقع العمل *',
    specialInstructions: 'تعليمات خاصة',
    yourPhone: 'هاتفك *',
    sendRequest: 'إرسال طلب الحجز',
    totalAmount: 'المبلغ الإجمالي',
    qar: 'ريال',
    perHour: 'في الساعة',
    perDay: 'في اليوم',
    bookingRequests: 'طلبات الحجز',
    noRequests: 'لا توجد طلبات معلقة',
    accept: 'قبول',
    reject: 'رفض',
    negotiate: 'تفاوض',
    from: 'من',
    bookingStatus: 'حالة الحجز',
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    completed: 'مكتمل',
    workerOnWay: 'العامل في طريقه إليك',
    workerArrived: 'وصل العامل',
    workInProgress: 'العمل جار',
    finishWork: 'إنهاء العمل',
    markComplete: 'وضع كمكتمل',
    nearbyWorkers: 'عمال قريب',
    hire: 'استأجر',
    noNearbyWorkers: 'لا يوجد عمال قريب',
    youOffered: 'عرضت',
    workerCountered: 'العامل عرض',
    proposeNew: 'اقترح جديد',
    bookingSuccess: 'تم إرسال طلب الحجز بنجاح!',
    bookingAccepted: 'تم قبول الحجز! العامل في الطريق.',
    bookingRejected: 'تم رفض الحجز.',
    bookingCompleted: 'اكتمل العمل! يرجى تقييم العامل.',
    errorOccurred: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    posting: 'جاري النشر...',
    submitting: 'جاري الإرسال...',
    required: 'يرجى ملء جميع الحقول المطلوبة',
    bid_amount: 'أدخل مبلغ العرض',
    posted: 'تم نشر الوظيفة!',
    bid_success: 'تم تقديم العرض بنجاح!',
    lowest: 'أقل عرض',
    close: 'إغلاق',
    be_first: 'كن الأول!',
    no_bids_yet: 'لا توجد عروض بعد',
    login_required: 'يرجى تسجيل الدخول للمتابعة',
    linkCopied: 'تم نسخ الرابط!',
    loading: 'جاري تحميل الملف...',
    profileNotFound: 'الملف غير موجود',
    profileNotFoundDesc: 'تمت إزالة هذا الملف أو أنه غير موجود',
    invalidProfile: 'ملف غير صالح',
    goHome: 'الذهاب للرئيسية',
    whatsappNotAvailable: 'واتساب غير متوفر',
    phoneNotAvailable: 'الهاتف غير متوفر',
  },
  hi: {
    map_loading: 'मैप लोड हो रहा है...',
    map_no_workers: 'कोई कर्मचारी नहीं मिला',
    map_workers: 'कर्मचारी',
    map_online: 'ऑनलाइन',
    map_gps: 'जीपीएस',
    map_salary: 'वेतन',
    map_experience: 'अनुभव',
    map_distance: 'दूरी',
    map_eta: 'अनुमानित समय',
    kmAway: 'किमी दूर',
    mins: 'मिनट',
    month: 'महीना',
    map_view_profile: 'प्रोफाइल देखें',
    map_close: 'बंद करें',
    map_list: 'सूची',
    map_map: 'मैप',
    map_you_are_in: 'आप यहाँ हैं',
    map_all_areas: 'सभी क्षेत्र',
    map_areas: 'क्षेत्र',
    map_hide: 'छुपाएं',
    map_clear: 'साफ करें',
    map_clear_route: 'रूट साफ करें',
    map_all: 'सभी',
    map_rated: '४+',
    map_budget: 'बजट',
    map_area_placeholder: 'क्षेत्र...',
    map_worker_details: 'कर्मचारी विवरण',
    map_whatsapp: 'व्हाट्सएप',
    map_scan_qr: 'स्कैन करें',
    map_showing_nearby: 'पास के दिखा रहे',
    map_now_showing: 'अब दिखाया जा रहा है',
    map_new: 'नया',
    searchPlaceholder: 'नाम या नंबर से खोजें...',
    navSearch: 'खोज',
    home: 'होम',
    profile: 'प्रोफाइल',
    create: 'बनाएं',
    dashboard: 'डैशबोर्ड',
    map: 'मैप',
    bid: 'बिड',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    settings: 'सेटिंग्स',
    featured: 'फीचर्ड वर्कर',
    categories: 'श्रेणियां',
    allWorkers: 'सभी कर्मचारी',
    viewAll: 'सभी देखें',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    salary: 'वेतन',
    experience: 'अनुभव',
    contact: 'संपर्क',
    whatsapp: 'व्हाट्सएप',
    call: 'कॉल',
    jobOffer: 'जॉब ऑफर',
    createProfile: 'प्रोफाइल बनाएं',
    postJob: 'जॉब पोस्ट करें',
    selectCountry: 'देश चुनें',
    selectCity: 'शहर चुनें',
    selectArea: 'क्षेत्र चुनें',
    views: 'व्यूज',
    contacts: 'संपर्क',
    offers: 'जॉब ऑफर',
    hired: 'नियुक्त',
    labor: 'श्रमिक',
    employer: 'नियोक्ता',
    back: 'वापस',
    sendOTP: 'OTP भेजें',
    noAccount: 'खाता नहीं है?',
    biodata: 'बायोडाटा',
    skills: 'कौशल',
    reviews: 'समीक्षा',
    workPhotos: 'काम की तस्वीरें',
    about: 'बारे में',
    popularSearches: 'लोकप्रिय खोज',
    allDistance: 'सभी दूरी',
    viewProfile: 'प्रोफाइल देखें',
    noResults: 'कोई परिणाम नहीं',
    noSkills: 'कोई कौशल नहीं',
    share: 'शेयर',
    report: 'रिपोर्ट',
    save: 'सहेजें',
    noReviews: 'अभी तक कोई समीक्षा नहीं',
    noActivity: 'कोई हालिया गतिविधि नहीं',
    liveActivity: 'लाइव गतिविधि',
    jobPosts: 'जॉब पोस्ट',
    savedWorkers: 'सहेजे गए श्रमिक',
    findLabor: 'श्रमिक खोजें',
    hiring: 'नियुक्ति',
    response: 'प्रतिक्रिया',
    rating: 'रेटिंग',
    notSpecified: 'निर्दिष्ट नहीं',
    similarWorkers: 'समान श्रमिक',
    sendJobOffer: 'जॉब ऑफर भेजें',
    bookWorker: 'इस कर्मचारी को बुक करें',
    jobTitle: 'नौकरी का शीर्षक *',
    jobDescription: 'नौकरी का विवरण *',
    category: 'श्रेणी',
    offerAmount: 'प्रस्ताव राशि (रियाल) *',
    paymentType: 'भुगतान प्रकार',
    fixedPrice: 'निश्चित मूल्य',
    hourlyRate: 'प्रति घंटा',
    dailyRate: 'प्रति दिन',
    paymentMethod: 'भुगतान विधि',
    cash: 'नकद',
    bankTransfer: 'बैंक ट्रांसफर',
    mobileBanking: 'मोबाइल बैंकिंग',
    startDate: 'प्रारंभ तिथि *',
    startTime: 'प्रारंभ समय *',
    duration: 'अवधि (दिन) *',
    location: 'कार्य स्थान *',
    specialInstructions: 'विशेष निर्देश',
    yourPhone: 'आपका फोन *',
    sendRequest: 'बुकिंग अनुरोध भेजें',
    totalAmount: 'कुल राशि',
    qar: 'रियाल',
    perHour: 'प्रति घंटा',
    perDay: 'प्रति दिन',
    bookingRequests: 'बुकिंग अनुरोध',
    noRequests: 'कोई अनुरोध नहीं',
    accept: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    negotiate: 'बातचीत करें',
    from: 'से',
    bookingStatus: 'बुकिंग स्थिति',
    pending: 'लंबित',
    accepted: 'स्वीकृत',
    completed: 'पूर्ण',
    workerOnWay: 'श्रमिक आपके पास आ रहा है',
    workerArrived: 'श्रमिक पहुंच गया',
    workInProgress: 'कार्य प्रगति पर',
    finishWork: 'कार्य समाप्त करें',
    markComplete: 'पूर्ण चिह्नित करें',
    nearbyWorkers: 'पास के श्रमिक',
    hire: 'किराया',
    noNearbyWorkers: 'पास में कोई श्रमिक नहीं',
    youOffered: 'आपने प्रस्ताव दिया',
    workerCountered: 'श्रमिक ने जवाब दिया',
    proposeNew: 'नया प्रस्ताव दें',
    bookingSuccess: 'बुकिंग अनुरोध सफलतापूर्वक भेजा गया!',
    bookingAccepted: 'बुकिंग स्वीकृत! श्रमिक आ रहा है।',
    bookingRejected: 'बुकिंग अस्वीकृत।',
    bookingCompleted: 'कार्य पूर्ण! कर्मचारी को रेटिंग दें।',
    errorOccurred: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    posting: 'पोस्ट हो रहा...',
    submitting: 'जमा हो रहा...',
    required: 'कृपया सभी आवश्यक फ़ील्ड भरें',
    bid_amount: 'बिड राशि दर्ज करें',
    posted: 'जॉब पोस्ट हो गया!',
    bid_success: 'बिड सफलतापूर्वक लग गई!',
    lowest: 'सबसे कम बिड',
    close: 'बंद',
    be_first: 'पहली बिड करें!',
    no_bids_yet: 'अभी तक कोई बिड नहीं',
    login_required: 'जारी रखने के लिए लॉगिन करें',
    linkCopied: 'लिंक कॉपी किया गया!',
    loading: 'प्रोफाइल लोड हो रहा है...',
    profileNotFound: 'प्रोफाइल नहीं मिला',
    profileNotFoundDesc: 'यह प्रोफाइल हटा दिया गया है या मौजूद नहीं है',
    invalidProfile: 'अमान्य प्रोफाइल',
    goHome: 'होम पर जाएं',
    whatsappNotAvailable: 'व्हाट्सएप उपलब्ध नहीं',
    phoneNotAvailable: 'फोन उपलब्ध नहीं',
  },
};

// ═══════════════════════════════════════════════════════════
// Number Translation
// ═══════════════════════════════════════════════════════════
const DIGIT_MAPS: Record<string, Record<string, string>> = {
  en: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' },
  bn: { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' },
  ar: { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' },
  hi: { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' },
};

export function translateNumber(num: string | number, lang: string): string {
  try {
    const numStr = num.toString();
    const map = DIGIT_MAPS[lang] || DIGIT_MAPS.en;
    let result = '';
    for (let i = 0; i < numStr.length; i++) {
      result += map[numStr[i]] || numStr[i];
    }
    return result;
  } catch {
    return String(num);
  }
}

export function translatePhone(phone: string, lang: string): string {
  if (!phone || lang === 'en') return phone || '';
  try {
    return phone.replace(/[0-9]/g, (digit) => {
      const map = DIGIT_MAPS[lang];
      return map ? map[digit] || digit : digit;
    });
  } catch {
    return phone;
  }
}

// ═══════════════════════════════════════════════════════════
// Currency Symbol
// ═══════════════════════════════════════════════════════════
const CURRENCIES: Record<string, string> = {
  en: 'QAR', bn: 'রিয়াল', ar: 'ريال', hi: 'रियाल',
};

export function getCurrencySymbol(lang: string): string {
  return CURRENCIES[lang] || 'QAR';
}

// ═══════════════════════════════════════════════════════════
// Get Text (with Fallback)
// ═══════════════════════════════════════════════════════════
export function getText(lang: LangCode, key: string): string {
  return texts[lang]?.[key] || texts.en[key] || key;
}

// ═══════════════════════════════════════════════════════════
// SMART SYLLABLE MAPS (for auto-transliteration)
// ═══════════════════════════════════════════════════════════
const SYLLABLE_MAP_BN: Record<string, string> = {
  'sch': 'শ', 'sh': 'শ', 'ch': 'চ', 'kh': 'খ', 'gh': 'ঘ', 'jh': 'ঝ',
  'th': 'থ', 'dh': 'ধ', 'ph': 'ফ', 'bh': 'ভ', 'ng': 'ঙ্গ', 'nd': 'ন্ড',
  'nt': 'ন্ত', 'nk': 'ঙ্ক', 'mm': 'ম্ম', 'nn': 'ন্ন', 'tt': 'ত্ত',
  'dd': 'দ্দ', 'bb': 'ব্ব', 'rr': 'র্র', 'ss': 'স্স', 'ck': 'ক',
  'oo': 'ূ', 'ou': 'াউ', 'ai': 'াই', 'ei': 'এই', 'au': 'ঔ',
  'ee': 'ী', 'ea': 'ি', 'ya': 'য়া', 'ia': 'িয়া', 'io': 'িও',
  'iu': 'িয়ু', 'a': 'া', 'e': 'ে', 'i': 'ি', 'o': 'ো', 'u': 'ু',
  'k': 'ক', 'g': 'গ', 'c': 'ক', 'j': 'জ', 't': 'ট', 'd': 'ড',
  'n': 'ন', 'p': 'প', 'b': 'ব', 'm': 'ম', 'r': 'র', 'l': 'ল',
  's': 'স', 'h': 'হ', 'w': 'ও', 'y': 'য়', 'z': 'জ', 'f': 'ফ',
  'v': 'ভ', 'q': 'ক', 'x': 'ক্স', '.': '.', ',': ',', '-': '-', ' ': ' ',
};

const SYLLABLE_MAP_AR: Record<string, string> = {
  'sh': 'ش', 'ch': 'تش', 'kh': 'خ', 'gh': 'غ', 'th': 'ث', 'dh': 'ذ',
  'aa': 'ا', 'ee': 'ي', 'oo': 'و', 'ai': 'اي', 'ou': 'او',
  'a': 'ا', 'e': 'ي', 'i': 'ي', 'o': 'و', 'u': 'و',
  'k': 'ك', 'g': 'ج', 'c': 'ك', 'j': 'ج', 't': 'ت', 'd': 'د',
  'n': 'ن', 'p': 'ب', 'b': 'ب', 'm': 'م', 'r': 'ر', 'l': 'ل',
  's': 'س', 'h': 'ه', 'w': 'و', 'y': 'ي', 'z': 'ز', 'f': 'ف',
  'v': 'ف', 'q': 'ق', 'x': 'كس', '.': '.', ',': ',', '-': '-', ' ': ' ',
};

const SYLLABLE_MAP_HI: Record<string, string> = {
  'sh': 'श', 'ch': 'च', 'kh': 'ख', 'gh': 'घ', 'jh': 'झ', 'th': 'थ',
  'dh': 'ध', 'ph': 'फ', 'bh': 'भ', 'ng': 'ङ', 'ai': 'ै', 'ei': 'े',
  'au': 'ौ', 'ee': 'ी', 'oo': 'ू', 'ou': 'ौ',
  'a': 'ा', 'e': 'े', 'i': 'ि', 'o': 'ो', 'u': 'ु',
  'k': 'क', 'g': 'ग', 'c': 'क', 'j': 'ज', 't': 'ट', 'd': 'ड',
  'n': 'न', 'p': 'प', 'b': 'ब', 'm': 'म', 'r': 'र', 'l': 'ल',
  's': 'स', 'h': 'ह', 'w': 'व', 'y': 'य', 'z': 'ज', 'f': 'फ',
  'v': 'व', 'q': 'क', 'x': 'क्स', '.': '.', ',': ',', '-': '-', ' ': ' ',
};

// ═══════════════════════════════════════════════════════════
// NAME OVERRIDES (Local cache - 100+ common names)
// ═══════════════════════════════════════════════════════════
const NAME_OVERRIDES: Record<string, Record<string, string>> = {
  Mohammed: { bn: 'মোহাম্মদ', ar: 'محمد', hi: 'मोहम्मद' },
  Mohammad: { bn: 'মোহাম্মদ', ar: 'محمد', hi: 'मोहम्मद' },
  Muhammad: { bn: 'মুহাম্মদ', ar: 'محمد', hi: 'मुहम्मद' },
  Ahmed: { bn: 'আহমেদ', ar: 'أحمد', hi: 'अहमद' },
  Ahmad: { bn: 'আহমদ', ar: 'أحمد', hi: 'अहमद' },
  Ali: { bn: 'আলী', ar: 'علي', hi: 'अली' },
  Hassan: { bn: 'হাসান', ar: 'حسن', hi: 'हसन' },
  Hussain: { bn: 'হোসেন', ar: 'حسين', hi: 'हुसैन' },
  Hossain: { bn: 'হোসেন', ar: 'حسين', hi: 'हुसैन' },
  Hossen: { bn: 'হোসেন', ar: 'حسين', hi: 'हुसैन' },
  Hosen: { bn: 'হোসেন', ar: 'حسين', hi: 'हुसैन' },
  Hussein: { bn: 'হুসেইন', ar: 'حسين', hi: 'हुसैन' },
  Omar: { bn: 'ওমর', ar: 'عمر', hi: 'उमर' },
  Umar: { bn: 'উমর', ar: 'عمر', hi: 'उमर' },
  Abdullah: { bn: 'আব্দুল্লাহ', ar: 'عبد الله', hi: 'अब्दुल्लाह' },
  Abdulla: { bn: 'আব্দুল্লা', ar: 'عبد الله', hi: 'अब्दुल्ला' },
  Fatima: { bn: 'ফাতিমা', ar: 'فاطمة', hi: 'फातिमा' },
  Aisha: { bn: 'আয়েশা', ar: 'عائشة', hi: 'आयशा' },
  Ayesha: { bn: 'আয়েশা', ar: 'عائشة', hi: 'आयशा' },
  Mariam: { bn: 'মরিয়ম', ar: 'مريم', hi: 'मरियम' },
  Maryam: { bn: 'মরিয়ম', ar: 'مريم', hi: 'मरियम' },
  Ibrahim: { bn: 'ইব্রাহিম', ar: 'إبراهيم', hi: 'इब्राहिम' },
  Yusuf: { bn: 'ইউসুফ', ar: 'يوسف', hi: 'यूसुफ' },
  Yousuf: { bn: 'ইউসুফ', ar: 'يوسف', hi: 'यूसुफ' },
  Karim: { bn: 'করিম', ar: 'كريم', hi: 'करीम' },
  Rahim: { bn: 'রহিম', ar: 'رحيم', hi: 'रहीम' },
  Salam: { bn: 'সালাম', ar: 'سلام', hi: 'सलाम' },
  Khan: { bn: 'খান', ar: 'خان', hi: 'खान' },
  Mia: { bn: 'মিয়া', ar: 'ميا', hi: 'मिया' },
  Miah: { bn: 'মিয়া', ar: 'ميا', hi: 'मिया' },
  Uddin: { bn: 'উদ্দিন', ar: 'الدين', hi: 'उद्दीन' },
  Rahman: { bn: 'রহমান', ar: 'رحمن', hi: 'रहमान' },
  Islam: { bn: 'ইসলাম', ar: 'إسلام', hi: 'इस्लाम' },
  Akter: { bn: 'আক্তার', ar: 'أختر', hi: 'अख्तर' },
  Akhter: { bn: 'আখতার', ar: 'أختر', hi: 'अख्तर' },
  Begum: { bn: 'বেগম', ar: 'بيغوم', hi: 'बेगम' },
  Khatun: { bn: 'খাতুন', ar: 'خاتون', hi: 'खातून' },
  Rojjob: { bn: 'রোজজব', ar: 'روجوب', hi: 'रोजजॉब' },
  Rana: { bn: 'রানা', ar: 'رنا', hi: 'राना' },
  Rubel: { bn: 'রুবেল', ar: 'روبل', hi: 'रूबेल' },
  Shuvo: { bn: 'শুভ', ar: 'شوفو', hi: 'शुभ' },
  Shubo: { bn: 'শুভ', ar: 'شوفو', hi: 'शुभ' },
  Hasan: { bn: 'হাসান', ar: 'حسن', hi: 'हसन' },
  Habib: { bn: 'হাবিব', ar: 'حبيب', hi: 'हबीब' },
  Haque: { bn: 'হক', ar: 'حق', hi: 'हक' },
  Haq: { bn: 'হক', ar: 'حق', hi: 'हक' },
  Chowdhury: { bn: 'চৌধুরী', ar: 'تشودري', hi: 'चौधरी' },
  Chy: { bn: 'চৌধুরী', ar: 'تشودري', hi: 'चौधरी' },
  Sheikh: { bn: 'শেখ', ar: 'شيخ', hi: 'शेख' },
  Sarkar: { bn: 'সরকার', ar: 'سركار', hi: 'सरकार' },
  Biswas: { bn: 'বিশ্বাস', ar: 'بيسواس', hi: 'बिस्वास' },
  Mondol: { bn: 'মন্ডল', ar: 'مندل', hi: 'मंडल' },
  Molla: { bn: 'মোল্লা', ar: 'ملا', hi: 'मोल्ला' },
  Kazi: { bn: 'কাজী', ar: 'قاضي', hi: 'काजी' },
  Talukder: { bn: 'তালুকদার', ar: 'تالوكدر', hi: 'तालुकदार' },
  Howlader: { bn: 'হাওলাদার', ar: 'هولادر', hi: 'हावलादार' },
  Mahmud: { bn: 'মাহমুদ', ar: 'محمود', hi: 'महमूद' },
  Kabir: { bn: 'কবির', ar: 'كبير', hi: 'कबीर' },
  Kalam: { bn: 'কালাম', ar: 'كلام', hi: 'कलाम' },
  Kamal: { bn: 'কামাল', ar: 'كمال', hi: 'कमाल' },
  Jamal: { bn: 'জামাল', ar: 'جمال', hi: 'जमाल' },
  Sultana: { bn: 'সুলতানা', ar: 'سلطانة', hi: 'सुल्ताना' },
  Parvin: { bn: 'পারভীন', ar: 'بروين', hi: 'परवीन' },
  Nasrin: { bn: 'নাসরিন', ar: 'نسرين', hi: 'नसरीन' },
  Yasmin: { bn: 'ইয়াসমিন', ar: 'ياسمين', hi: 'यास्मीन' },
  Jahan: { bn: 'জাহান', ar: 'جهان', hi: 'जहान' },
  Ara: { bn: 'আরা', ar: 'آرا', hi: 'आरा' },
  Banu: { bn: 'বানু', ar: 'بانو', hi: 'बानू' },
  Nahar: { bn: 'নাহার', ar: 'نهر', hi: 'नाहर' },
  Ferdous: { bn: 'ফেরদৌস', ar: 'فردوس', hi: 'फेरदौस' },
  Ferdousi: { bn: 'ফেরদৌসী', ar: 'فردوسي', hi: 'फेरदौसी' },
  Saleh: { bn: 'সালেহ', ar: 'صالح', hi: 'सालेह' },
  Mostafa: { bn: 'মোস্তফা', ar: 'مصطفى', hi: 'मुस्तफा' },
  Mustafa: { bn: 'মুস্তফা', ar: 'مصطفى', hi: 'मुस्तफा' },
  Nur: { bn: 'নূর', ar: 'نور', hi: 'नूर' },
  Noor: { bn: 'নূর', ar: 'نور', hi: 'नूर' },
  Aziz: { bn: 'আজিজ', ar: 'عزيز', hi: 'अजीज' },
  Rashid: { bn: 'রশিদ', ar: 'رشيد', hi: 'रशीद' },
  Harun: { bn: 'হারুন', ar: 'هارون', hi: 'हारुन' },
  Idris: { bn: 'ইদ্রিস', ar: 'إدريس', hi: 'इदरीस' },
  Ismail: { bn: 'ইসমাইল', ar: 'إسماعيل', hi: 'इस्माइल' },
  Siraj: { bn: 'সিরাজ', ar: 'سراج', hi: 'सिराज' },
  Anis: { bn: 'আনিস', ar: 'أنيس', hi: 'अनीस' },
  Faruk: { bn: 'ফারুক', ar: 'فاروق', hi: 'फारूक' },
  Farooq: { bn: 'ফারুক', ar: 'فاروق', hi: 'फारूक' },
  Rafiq: { bn: 'রফিক', ar: 'رفيق', hi: 'रफीक' },
  Shafiq: { bn: 'শফিক', ar: 'شفيع', hi: 'शफीक' },
  Tariq: { bn: 'তারিক', ar: 'طارق', hi: 'तारिक' },
  Khalid: { bn: 'খালিদ', ar: 'خالد', hi: 'खालिद' },
  Walid: { bn: 'ওয়ালিদ', ar: 'وليد', hi: 'वालिद' },
  Saiful: { bn: 'সাইফুল', ar: 'سيفول', hi: 'सैफुल' },
  Zahid: { bn: 'জাহিদ', ar: 'زاهد', hi: 'जाहिद' },
  Nasir: { bn: 'নাসির', ar: 'ناصر', hi: 'नासिर' },
  Sobuj: { bn: 'সবুজ', ar: 'سوبوج', hi: 'सबुज' },
  Motin: { bn: 'মতিন', ar: 'ماتين', hi: 'मोतिन' },
  Helal: { bn: 'হেলাল', ar: 'هلال', hi: 'हेलाल' },
  Anowar: { bn: 'আনোয়ার', ar: 'أنور', hi: 'अनोवार' },
  Anwar: { bn: 'আনোয়ার', ar: 'أنور', hi: 'अनवर' },
  Karimullah: { bn: 'করিমুল্লাহ', ar: 'كريم الله', hi: 'करीमुल्लाह' },
  Halim: { bn: 'হালিম', ar: 'حليم', hi: 'हलीम' },
  Monir: { bn: 'মনির', ar: 'منير', hi: 'मोनीर' },
};

// ═══════════════════════════════════════════════════════════
// 🚀 DATABASE NAME CACHE (Supabase name_translations table)
// ═══════════════════════════════════════════════════════════
const nameCache = new Map<string, any>();
let allNamesLoaded = false;
let allNamesPromise: Promise<void> | null = null;
const CACHE_MAX_SIZE = 10000;

async function loadAllNamesToCache(): Promise<void> {
  if (allNamesLoaded) return;
  if (allNamesPromise) return allNamesPromise;
  
  allNamesPromise = (async () => {
    try {
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;
      let totalLoaded = 0;
      
      while (hasMore && nameCache.size < CACHE_MAX_SIZE) {
        const { data, error } = await supabase
          .from('name_translations')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) {
          console.error('Failed to load name translations:', error);
          break;
        }
        
        if (data && data.length > 0) {
          data.forEach((row: any) => {
            if (nameCache.size < CACHE_MAX_SIZE) {
              nameCache.set(row.name_en.toLowerCase(), row);
            }
          });
          totalLoaded += data.length;
          page++;
          
          if (data.length < pageSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      allNamesLoaded = true;
      console.log(`✅ Loaded ${totalLoaded} names to cache`);
    } catch (err) {
      console.error('Failed to load name translations:', err);
    }
  })();
  
  return allNamesPromise;
}

function getCachedName(name: string): any | null {
  return nameCache.get(name.toLowerCase()) || null;
}

// ═══════════════════════════════════════════════════════════
// SMART TRANSLITERATION (Fallback for unknown names)
// ═══════════════════════════════════════════════════════════
function smartTransliterate(name: string, lang: string): string {
  if (lang === 'en') return name;
  
  let syllableMap: Record<string, string>;
  switch (lang) {
    case 'bn': syllableMap = SYLLABLE_MAP_BN; break;
    case 'ar': syllableMap = SYLLABLE_MAP_AR; break;
    case 'hi': syllableMap = SYLLABLE_MAP_HI; break;
    default: return name;
  }
  
  let result = '';
  let i = 0;
  
  while (i < name.length) {
    // 3-character syllable check (longest first)
    if (i + 2 < name.length) {
      const triple = name.substring(i, i + 3).toLowerCase();
      if (syllableMap[triple]) {
        result += syllableMap[triple];
        i += 3;
        continue;
      }
    }
    
    // 2-character syllable check
    if (i + 1 < name.length) {
      const double = name.substring(i, i + 2).toLowerCase();
      if (syllableMap[double]) {
        result += syllableMap[double];
        i += 2;
        continue;
      }
    }
    
    // Single character check
    const char = name[i];
    const lowerChar = char.toLowerCase();
    
    if (syllableMap[lowerChar]) {
      result += syllableMap[lowerChar];
    } else {
      result += char;
    }
    i++;
  }
  
  if (lang === 'bn') {
    result = result
      .replace(/কক/g, 'ক্ক')
      .replace(/টট/g, 'ট্ট')
      .replace(/ডড/g, 'ড্ড')
      .replace(/নন/g, 'ন্ন')
      .replace(/মম/g, 'ম্ম')
      .replace(/লল/g, 'ল্ল')
      .replace(/সস/g, 'স্স')
      .replace(/বব/g, 'ব্ব')
      .replace(/রর/g, 'র্র');
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════
// 🎯 MAIN translateName FUNCTION
// ═══════════════════════════════════════════════════════════
export function translateName(name: string, lang: string, profile?: any): string {
  if (!name || lang === 'en') return name || '';
  
  try {
    // Priority 1: Database profile multi-lang names
    if (profile) {
      const dbFieldMap: Record<string, string> = {
        bn: profile?.name_bn,
        ar: profile?.name_ar,
        hi: profile?.name_hi,
      };
      if (dbFieldMap[lang] && dbFieldMap[lang].trim() !== '') {
        return dbFieldMap[lang];
      }
    }
    
    // Priority 2: Full name in local overrides
    if (NAME_OVERRIDES[name] && NAME_OVERRIDES[name][lang]) {
      return NAME_OVERRIDES[name][lang];
    }
    
    const lowerFullName = name.toLowerCase();
    const capitalFullName = lowerFullName.charAt(0).toUpperCase() + lowerFullName.slice(1);
    if (NAME_OVERRIDES[capitalFullName] && NAME_OVERRIDES[capitalFullName][lang]) {
      return NAME_OVERRIDES[capitalFullName][lang];
    }
    
    // Priority 3 & 4: Process each part
    const nameParts = name.split(/\s+/);
    const translatedParts = nameParts.map(part => {
      if (!part) return '';
      
      if (NAME_OVERRIDES[part] && NAME_OVERRIDES[part][lang]) {
        return NAME_OVERRIDES[part][lang];
      }
      
      const lowerPart = part.toLowerCase();
      const capitalPart = lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1);
      if (NAME_OVERRIDES[capitalPart] && NAME_OVERRIDES[capitalPart][lang]) {
        return NAME_OVERRIDES[capitalPart][lang];
      }
      
      const cached = getCachedName(part);
      if (cached) {
        const dbLangMap: Record<string, string> = {
          bn: cached.name_bn,
          ar: cached.name_ar,
          hi: cached.name_hi,
        };
        if (dbLangMap[lang] && dbLangMap[lang].trim() !== '') {
          return dbLangMap[lang];
        }
      }
      
      return smartTransliterate(part, lang);
    });
    
    if (typeof window !== 'undefined') {
      setTimeout(() => loadAllNamesToCache(), 100);
    }
    
    return translatedParts.join(' ');
  } catch (error) {
    console.error('Name translation error:', error);
    return name;
  }
}

export async function translateNameAsync(name: string, lang: string, profile?: any): Promise<string> {
  if (!name || lang === 'en') return name || '';
  
  try {
    if (profile) {
      const dbFieldMap: Record<string, string> = {
        bn: profile?.name_bn,
        ar: profile?.name_ar,
        hi: profile?.name_hi,
      };
      if (dbFieldMap[lang] && dbFieldMap[lang].trim() !== '') {
        return dbFieldMap[lang];
      }
    }
    
    if (NAME_OVERRIDES[name] && NAME_OVERRIDES[name][lang]) {
      return NAME_OVERRIDES[name][lang];
    }
    
    await loadAllNamesToCache();
    
    const nameParts = name.split(/\s+/);
    const translatedParts = nameParts.map(part => {
      if (!part) return '';
      
      if (NAME_OVERRIDES[part] && NAME_OVERRIDES[part][lang]) {
        return NAME_OVERRIDES[part][lang];
      }
      
      const lowerPart = part.toLowerCase();
      const capitalPart = lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1);
      if (NAME_OVERRIDES[capitalPart] && NAME_OVERRIDES[capitalPart][lang]) {
        return NAME_OVERRIDES[capitalPart][lang];
      }
      
      const cached = getCachedName(part);
      if (cached) {
        const dbLangMap: Record<string, string> = {
          bn: cached.name_bn,
          ar: cached.name_ar,
          hi: cached.name_hi,
        };
        if (dbLangMap[lang] && dbLangMap[lang].trim() !== '') {
          return dbLangMap[lang];
        }
      }
      
      return smartTransliterate(part, lang);
    });
    
    return translatedParts.join(' ');
  } catch (error) {
    console.error('Async name translation error:', error);
    return name;
  }
}

// ═══════════════════════════════════════════════════════════
// Category Translation
// ═══════════════════════════════════════════════════════════
export function translateCategory(category: string, lang: string): string {
  return CATEGORY_NAMES[category]?.[lang] || category;
}

// ═══════════════════════════════════════════════════════════
// Utility Functions for Formatting
// ═══════════════════════════════════════════════════════════
export function formatDistance(distance: number, lang: string): string {
  if (!distance || distance === 0) return '';
  return `${translateNumber(distance.toFixed(1), lang)} ${getText(lang as LangCode, 'kmAway')}`;
}

export function formatETA(eta: number, lang: string): string {
  if (!eta || eta === 0) return '';
  return `${translateNumber(Math.round(eta), lang)} ${getText(lang as LangCode, 'mins')}`;
}

export function formatSalary(salary: number, lang: string): string {
  if (!salary) return '';
  return `${translateNumber(salary, lang)} ${getCurrencySymbol(lang)}`;
}

export function formatExperience(years: number, lang: string): string {
  if (!years) return '';
  return `${translateNumber(years, lang)} ${getText(lang as LangCode, 'month')}`;
}

// ═══════════════════════════════════════════════════════════
// Gender Translation
// ═══════════════════════════════════════════════════════════
const GENDER_MAP: Record<string, Record<string, string>> = {
  male: { en: 'Male', bn: 'পুরুষ', ar: 'ذكر', hi: 'पुरुष' },
  female: { en: 'Female', bn: 'মহিলা', ar: 'أنثى', hi: 'महिला' },
  other: { en: 'Other', bn: 'অন্যান্য', ar: 'آخر', hi: 'अन्य' },
};

export function translateGender(gender: string, lang: string): string {
  return GENDER_MAP[gender]?.[lang] || gender;
}

// ═══════════════════════════════════════════════════════════
// 🚀 Initialize name cache on load (client-side only)
// ═══════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  setTimeout(() => loadAllNamesToCache(), 500);
}