// components/profile/BioGrid.tsx
"use client";
import { 
  Briefcase, Award, Languages, Shield, Home, Utensils, 
  MapPin, CreditCard, Calendar, Clock, Phone, Mail, User, 
  FileText, CheckCircle, XCircle, Globe, Heart, Star 
} from 'lucide-react';

interface Props {
  profile: any;
  lang: string;
}

export default function BioGrid({ profile, lang }: Props) {
  const t = (key: string) => {
    const texts: any = {
      en: {
        experience: 'Experience', license: 'License', languages: 'Languages',
        visaStatus: 'Visa Status', sponsorship: 'Sponsorship', accommodation: 'Accommodation',
        food: 'Food', city: 'City', area: 'Area', salary: 'Salary',
        status: 'Status', online: 'Online', offline: 'Offline',
        yes: 'Yes', no: 'No', age: 'Age', phone: 'Phone', email: 'Email',
        bio: 'Bio', rating: 'Rating', reviews: 'Reviews', joined: 'Joined',
        lastActive: 'Last Active', completedJobs: 'Completed Jobs', 
        responseRate: 'Response Rate', responseTime: 'Response Time',
        verified: 'Verified', featured: 'Featured', idCard: 'ID Verified',
        backgroundCheck: 'Background Check', insurance: 'Insurance',
        tools: 'Tools', transport: 'Transport', shift: 'Shift Availability'
      },
      bn: {
        experience: 'অভিজ্ঞতা', license: 'লাইসেন্স', languages: 'ভাষা',
        visaStatus: 'ভিসার অবস্থা', sponsorship: 'স্পনসরশিপ', accommodation: 'আবাসন',
        food: 'খাবার', city: 'শহর', area: 'এলাকা', salary: 'বেতন',
        status: 'অবস্থা', online: 'অনলাইন', offline: 'অফলাইন',
        yes: 'হ্যাঁ', no: 'না', age: 'বয়স', phone: 'ফোন', email: 'ইমেইল',
        bio: 'জীবনী', rating: 'রেটিং', reviews: 'রিভিউ', joined: 'যোগদান',
        lastActive: 'সর্বশেষ সক্রিয়', completedJobs: 'সম্পন্ন কাজ',
        responseRate: 'সাড়ার হার', responseTime: 'সাড়ার সময়',
        verified: 'ভেরিফাইড', featured: 'ফিচার্ড', idCard: 'আইডি ভেরিফাইড',
        backgroundCheck: 'পটভূমি যাচাই', insurance: 'বীমা',
        tools: 'সরঞ্জাম', transport: 'পরিবহন', shift: 'শিফটের উপলব্ধতা'
      },
      ar: {
        experience: 'خبرة', license: 'رخصة', languages: 'لغات',
        visaStatus: 'حالة التأشيرة', sponsorship: 'الكفالة', accommodation: 'سكن',
        food: 'طعام', city: 'مدينة', area: 'منطقة', salary: 'راتب',
        status: 'حالة', online: 'متصل', offline: 'غير متصل',
        yes: 'نعم', no: 'لا', age: 'عمر', phone: 'هاتف', email: 'بريد',
        bio: 'سيرة', rating: 'تقييم', reviews: 'تقييمات', joined: 'انضم',
        lastActive: 'آخر نشاط', completedJobs: 'الوظائف المكتملة',
        responseRate: 'معدل الاستجابة', responseTime: 'وقت الاستجابة',
        verified: 'موثق', featured: 'مميز', idCard: 'الهوية موثقة',
        backgroundCheck: 'فحص الخلفية', insurance: 'تأمين',
        tools: 'أدوات', transport: 'وسائل النقل', shift: 'توفر الوردية'
      },
      hi: {
        experience: 'अनुभव', license: 'लाइसेंस', languages: 'भाषाएं',
        visaStatus: 'वीज़ा स्थिति', sponsorship: 'प्रायोजन', accommodation: 'आवास',
        food: 'भोजन', city: 'शहर', area: 'क्षेत्र', salary: 'वेतन',
        status: 'स्थिति', online: 'ऑनलाइन', offline: 'ऑफलाइन',
        yes: 'हाँ', no: 'नहीं', age: 'आयु', phone: 'फोन', email: 'ईमेल',
        bio: 'जीवनी', rating: 'रेटिंग', reviews: 'समीक्षाएं', joined: 'शामिल हुए',
        lastActive: 'अंतिम सक्रिय', completedJobs: 'पूर्ण कार्य',
        responseRate: 'प्रतिक्रिया दर', responseTime: 'प्रतिक्रिया समय',
        verified: 'सत्यापित', featured: 'विशेष', idCard: 'आईडी सत्यापित',
        backgroundCheck: 'पृष्ठभूमि जांच', insurance: 'बीमा',
        tools: 'उपकरण', transport: 'परिवहन', shift: 'शिफ्ट उपलब्धता'
      },
    };
    
    return texts[lang]?.[key] || texts.en[key];
  };

  // কারেন্সি ট্রান্সলেট করার ফাংশন
  const getCurrencySymbol = (lang: string): string => {
    const currencies: Record<string, string> = {
      en: 'QAR',
      bn: 'রিয়াল',
      ar: 'ريال',
      hi: 'रियाल',
    };
    return currencies[lang] || 'QAR';
  };

  // ডাটাবেসের ইংরেজি ডাটাকে ট্রান্সলেট করার ফাংশন
  const translateValue = (value: any, key?: string) => {
    if (!value) return '—';
    if (value === true) return t('yes');
    if (value === false) return t('no');
    
    if (key === 'salary') {
      const amount = value.toString().replace('QAR', '').trim();
      const currencySymbol = getCurrencySymbol(lang);
      return `${amount} ${currencySymbol}`;
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    // ট্রান্সলেশন ম্যাপ (ডুপ্লিকেট প্রপার্টি সরানো হয়েছে)
    const translations: Record<string, Record<string, string>> = {
      en: {
        'Doha': 'Doha', 'Al Rayyan': 'Al Rayyan', 'Al Wakrah': 'Al Wakrah', 
        'Al Khor': 'Al Khor', 'Riyadh': 'Riyadh', 'Jeddah': 'Jeddah',
        'Mecca': 'Mecca', 'Medina': 'Medina', 'Dubai': 'Dubai', 'Abu Dhabi': 'Abu Dhabi',
        'Sharjah': 'Sharjah', 'Ajman': 'Ajman', 'Kuwait City': 'Kuwait City',
        'Hawalli': 'Hawalli', 'Farwaniya': 'Farwaniya', 'Manama': 'Manama',
        'Riffa': 'Riffa', 'Muharraq': 'Muharraq', 'Muscat': 'Muscat',
        'Salalah': 'Salalah', 'Sohar': 'Sohar',
        'West Bay': 'West Bay', 'Al Sadd': 'Al Sadd', 'Bin Mahmoud': 'Bin Mahmoud',
        'Al Gharrafa': 'Al Gharrafa', 'Muaither': 'Muaither', 'Al Wukair': 'Al Wukair',
        'Al Thakhira': 'Al Thakhira', 'Al Olaya': 'Al Olaya', 'Al Malaz': 'Al Malaz',
        'Al Hamra': 'Al Hamra', 'Marina': 'Marina', 'JLT': 'JLT', 'Deira': 'Deira',
        'Bengali': 'Bengali', 'English': 'English', 'Arabic': 'Arabic', 'Hindi': 'Hindi',
        'Urdu': 'Urdu', 'Malayalam': 'Malayalam', 'Tamil': 'Tamil', 'Tagalog': 'Tagalog',
        'Transferable': 'Transferable', 'Freelance Visa': 'Freelance Visa',
        'Family Sponsorship': 'Family Sponsorship', 'Visit Visa': 'Visit Visa',
        'Employment Visa': 'Employment Visa', 'Student Visa': 'Student Visa',
        'Self Sponsorship': 'Self Sponsorship', 'Father Sponsorship': 'Father Sponsorship',
        'Mother Sponsorship': 'Mother Sponsorship', 'Husband Sponsorship': 'Husband Sponsorship',
        'Company Sponsorship': 'Company Sponsorship',
        'Provided by Company': 'Provided by Company', 'Shared Accommodation': 'Shared Accommodation',
        'Own Accommodation': 'Own Accommodation', 'Not Required': 'Not Required',
        'Own Arrangement': 'Own Arrangement', 'Have': 'Have', 'Available': 'Available'
      },
      bn: {
        'Doha': 'দোহা', 'Al Rayyan': 'আল রাইয়ান', 'Al Wakrah': 'আল ওয়াকরাহ',
        'Al Khor': 'আল খোর', 'Riyadh': 'রিয়াদ', 'Jeddah': 'জেদ্দা',
        'Dubai': 'দুবাই', 'Abu Dhabi': 'আবুধাবি', 'Manama': 'মানামা',
        'West Bay': 'ওয়েস্ট বে', 'Al Sadd': 'আল সাদ', 'Bin Mahmoud': 'বিন মাহমুদ',
        'Bengali': 'বাংলা', 'English': 'ইংরেজি', 'Arabic': 'আরবি', 'Hindi': 'হিন্দি',
        'Urdu': 'উর্দু', 'Transferable': 'স্থানান্তরযোগ্য',
        'Self Sponsorship': 'স্ব স্পনসরশিপ', 'Father Sponsorship': 'পিতার স্পনসরশিপ',
        'Provided by Company': 'কোম্পানি প্রদত্ত', 'Shared Accommodation': 'ভাগ করা আবাসন',
        'Own Arrangement': 'নিজস্ব ব্যবস্থা', 'Have': 'আছে'
      },
      ar: {
        'Doha': 'الدوحة', 'Al Rayyan': 'الريان', 'Al Wakrah': 'الوكرة',
        'Al Khor': 'الخور', 'Riyadh': 'الرياض', 'Jeddah': 'جدة',
        'Dubai': 'دبي', 'Abu Dhabi': 'أبوظبي', 'Manama': 'المنامة',
        'West Bay': 'الخليج الغربي', 'Al Sadd': 'السد', 'Bin Mahmoud': 'بن محمود',
        'Bengali': 'البنغالية', 'English': 'الإنجليزية', 'Arabic': 'العربية',
        'Urdu': 'الأردية', 'Transferable': 'قابل للتحويل',
        'Self Sponsorship': 'كفالة ذاتية', 'Father Sponsorship': 'كفالة الأب',
        'Provided by Company': 'سكن مشترك', 'Shared Accommodation': 'سكن مشترك',
        'Own Arrangement': 'ترتيب ذاتي', 'Have': 'لديه'
      },
      hi: {
        'Doha': 'दोहा', 'Al Rayyan': 'अल रय्यान', 'Al Wakrah': 'अल वकरा',
        'Al Khor': 'अल खोर', 'Riyadh': 'रियाद', 'Jeddah': 'जेद्दा',
        'Dubai': 'दुबई', 'Abu Dhabi': 'अबू धाबी', 'Manama': 'मनामा',
        'West Bay': 'वेस्ट बे', 'Al Sadd': 'अल सद्द', 'Bin Mahmoud': 'बिन महमूद',
        'Bengali': 'बंगाली', 'English': 'अंग्रेजी', 'Arabic': 'अरबी',
        'Urdu': 'उर्दू', 'Transferable': 'स्थानांतरण योग्य',
        'Self Sponsorship': 'स्व प्रायोजन', 'Father Sponsorship': 'पिता प्रायोजन',
        'Provided by Company': 'कंपनी द्वारा प्रदत्त', 'Shared Accommodation': 'साझा आवास',
        'Own Arrangement': 'अपनी व्यवस्था', 'Have': 'है'
      },
    };
    
    if (translations[lang]?.[value]) {
      return translations[lang][value];
    }
    
    return value;
  };

  // সব ফিল্ড সহ গ্রিড আইটেম
  const gridItems = [
    { icon: User, key: 'age', value: profile.age },
    { icon: Briefcase, key: 'experience', value: profile.experience },
    { icon: Award, key: 'license', value: profile.license },
    { icon: Languages, key: 'languages', value: profile.languages },
    { icon: Shield, key: 'visaStatus', value: profile.visa_status },
    { icon: Shield, key: 'sponsorship', value: profile.sponsorship },
    { icon: Home, key: 'accommodation', value: profile.accommodation },
    { icon: Utensils, key: 'food', value: profile.food },
    { icon: MapPin, key: 'city', value: profile.city },
    { icon: MapPin, key: 'area', value: profile.area },
    { icon: CreditCard, key: 'salary', value: profile.expected_salary ? profile.expected_salary.toString() : null },
    { icon: Clock, key: 'status', value: profile.is_online ? t('online') : t('offline') },
    { icon: Phone, key: 'phone', value: profile.phone },
    { icon: Mail, key: 'email', value: profile.email },
    { icon: CheckCircle, key: 'verified', value: profile.is_verified },
    { icon: Star, key: 'rating', value: profile.rating ? `${profile.rating} ★` : null },
    { icon: Briefcase, key: 'completedJobs', value: profile.completed_jobs },
    { icon: Clock, key: 'responseTime', value: profile.response_time },
    { icon: Globe, key: 'transport', value: profile.transport },
    { icon: Heart, key: 'insurance', value: profile.insurance },
  ];

  const visibleItems = gridItems.filter(item => item.value);

  return (
    <div className="grid grid-cols-4 gap-2">
      {visibleItems.map((item, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-2 text-center hover:shadow-md transition">
          <item.icon size={14} className="mx-auto mb-1 text-gray-500" />
          <p className="text-[9px] text-gray-500">{t(item.key)}</p>
          <p className="text-[10px] font-medium text-gray-800 truncate">
            {translateValue(item.value, item.key)}
          </p>
        </div>
      ))}
    </div>
  );
}