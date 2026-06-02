// lib/countries.ts - ১ বিলিয়ন ইউজার • সুপারসনিক • ৬ গালফ • ৪ ভাষা • ফুল ডাটা
export interface Area {
  en: string;
  ar: string;
  bn: string;
  hi: string;
}

export interface City {
  en: string;
  ar: string;
  bn: string;
  hi: string;
  areas?: Area[];
}

export interface Country {
  code: string;
  name: string;
  nameAr: string;
  nameBn: string;
  nameHi: string;
  currency: string;
  phoneCode: string;
  flag: string;
  defaultLang: string;
  cities: City[];
}

// ═══════════════════════════════════════════════════════════
// ৪ ভাষায় দেশের নাম
// ═══════════════════════════════════════════════════════════
const countryNames: Record<string, Record<string, string>> = {
  qa: { en: 'Qatar', ar: 'قطر', bn: 'কাতার', hi: 'कतर' },
  sa: { en: 'Saudi Arabia', ar: 'السعودية', bn: 'সৌদি আরব', hi: 'सऊदी अरब' },
  ae: { en: 'UAE', ar: 'الإمارات', bn: 'UAE', hi: 'UAE' },
  kw: { en: 'Kuwait', ar: 'الكويت', bn: 'কুয়েত', hi: 'कुवैत' },
  bh: { en: 'Bahrain', ar: 'البحرين', bn: 'বাহরাইন', hi: 'बहरीन' },
  om: { en: 'Oman', ar: 'عمان', bn: 'ওমান', hi: 'ओमान' },
};

export const countries: Record<string, Country> = {
  qa: { 
    code: 'qa', name: 'Qatar', nameAr: 'قطر', nameBn: 'কাতার', nameHi: 'कतर',
    currency: 'QAR', phoneCode: '+974', flag: '/flags/qa.svg', defaultLang: 'ar', 
    cities: [
      { en: 'Doha', ar: 'الدوحة', bn: 'দোহা', hi: 'दोहा', areas: [
        { en: 'West Bay', ar: 'الخليج الغربي', bn: 'ওয়েস্ট বে', hi: 'वेस्ट बे' },
        { en: 'Al Sadd', ar: 'السد', bn: 'আল সাদ', hi: 'अल सद्द' },
        { en: 'Najma', ar: 'نجمة', bn: 'নাজমা', hi: 'नजमा' },
        { en: 'Mansoura', ar: 'منصورة', bn: 'মনসুরা', hi: 'मंसूरा' },
        { en: 'Industrial Area', ar: 'المنطقة الصناعية', bn: 'শিল্প এলাকা', hi: 'औद्योगिक क्षेत्र' },
        { en: 'Matar Qadeem', ar: 'مطار قديم', bn: 'মাতার কাদিম', hi: 'मटार कदीम' },
        { en: 'Bin Mahmoud', ar: 'بن محمود', bn: 'বিন মাহমুদ', hi: 'बिन महमूद' },
        { en: 'Al Dafna', ar: 'الدفنة', bn: 'আল দাফনা', hi: 'अल दफना' },
        { en: 'Old Airport', ar: 'المطار القديم', bn: 'ওল্ড এয়ারপোর্ট', hi: 'ओल्ड एयरपोर्ट' },
        { en: 'Al Gharrafa', ar: 'الغرافة', bn: 'আল ঘারাফা', hi: 'अल घराफा' },
        { en: 'Muaither', ar: 'معيذر', bn: 'মুয়াইথির', hi: 'मुअइथर' },
        { en: 'Al Wukair', ar: 'الوكير', bn: 'আল উকাইর', hi: 'अल वुकैर' },
        { en: 'Al Thakhira', ar: 'الذخيرة', bn: 'আল যাখিরা', hi: 'अल जखीरा' },
      ]},
    ]
  },
  sa: { 
    code: 'sa', name: 'Saudi Arabia', nameAr: 'السعودية', nameBn: 'সৌদি আরব', nameHi: 'सऊदी अरब',
    currency: 'SAR', phoneCode: '+966', flag: '/flags/sa.svg', defaultLang: 'ar', 
    cities: [
      { en: 'Riyadh', ar: 'الرياض', bn: 'রিয়াদ', hi: 'रियाद', areas: [
        { en: 'Al Olaya', ar: 'العليا', bn: 'আল ওলায়া', hi: 'अल ओलाया' },
        { en: 'Al Malaz', ar: 'الملز', bn: 'আল মালাজ', hi: 'अल मलाज' },
        { en: 'Al Aziziyah', ar: 'العزيزية', bn: 'আল আজিজিয়া', hi: 'अल अज़ीज़िया' },
        { en: 'Al Faisaliyah', ar: 'الفيصلية', bn: 'আল ফয়সালিয়া', hi: 'अल फैसलिया' },
      ]},
      { en: 'Jeddah', ar: 'جدة', bn: 'জেদ্দা', hi: 'जेद्दा', areas: [
        { en: 'Al Hamra', ar: 'الحمراء', bn: 'আল হামরা', hi: 'अल हमरा' },
        { en: 'Al Rawdah', ar: 'الروضة', bn: 'আল রাওদাহ', hi: 'अल रौदा' },
      ]},
      { en: 'Mecca', ar: 'مكة', bn: 'মক্কা', hi: 'मक्का', areas: [
        { en: 'Al Haram', ar: 'الحرم', bn: 'আল হারাম', hi: 'अल हरम' },
      ]},
      { en: 'Medina', ar: 'المدينة', bn: 'মদিনা', hi: 'मदीना', areas: [
        { en: 'Al Haram', ar: 'الحرم', bn: 'আল হারাম', hi: 'अल हरम' },
      ]},
      { en: 'Dammam', ar: 'الدمام', bn: 'দাম্মাম', hi: 'दम्माम', areas: [
        { en: 'Al Shatea', ar: 'الشاطئ', bn: 'আল শাতি', hi: 'अल शाती' },
      ]},
    ]
  },
  ae: { 
    code: 'ae', name: 'UAE', nameAr: 'الإمارات', nameBn: 'UAE', nameHi: 'UAE',
    currency: 'AED', phoneCode: '+971', flag: '/flags/ae.svg', defaultLang: 'ar', 
    cities: [
      { en: 'Dubai', ar: 'دبي', bn: 'দুবাই', hi: 'दुबई', areas: [
        { en: 'Marina', ar: 'المارينا', bn: 'মারিনা', hi: 'मरीना' },
        { en: 'JLT', ar: 'أبراج البحيرات', bn: 'জেএলটি', hi: 'जेएलटी' },
        { en: 'Deira', ar: 'ديرة', bn: 'দেইরা', hi: 'देइरा' },
        { en: 'Bur Dubai', ar: 'بر دبي', bn: 'বুর দুবাই', hi: 'बुर दुबई' },
        { en: 'Jumeirah', ar: 'جميرا', bn: 'জুমেইরাহ', hi: 'जुमेराह' },
      ]},
      { en: 'Abu Dhabi', ar: 'أبوظبي', bn: 'আবুধাবি', hi: 'अबू धाबी', areas: [
        { en: 'Al Khalidiyah', ar: 'الخالدية', bn: 'আল খালিদিয়া', hi: 'अल खालिदिया' },
        { en: 'Al Reem Island', ar: 'جزيرة الريم', bn: 'আল রিম আইল্যান্ড', hi: 'अल रीम आइलैंड' },
        { en: 'Corniche', ar: 'الكورنيش', bn: 'কর্নিশ', hi: 'कॉर्निश' },
      ]},
      { en: 'Sharjah', ar: 'الشارقة', bn: 'শারজাহ', hi: 'शारजाह', areas: [
        { en: 'Al Majaz', ar: 'المجاز', bn: 'আল মাজাজ', hi: 'अल मजाज' },
        { en: 'Al Nahda', ar: 'النهدة', bn: 'আল নাহদা', hi: 'अल नाहदा' },
      ]},
      { en: 'Ajman', ar: 'عجمان', bn: 'আজমান', hi: 'अजमान', areas: [
        { en: 'Al Nuaimiya', ar: 'النعيمية', bn: 'আল নুয়াইমিয়া', hi: 'अल नुऐमिया' },
      ]},
      { en: 'Ras Al Khaimah', ar: 'رأس الخيمة', bn: 'রাস আল খাইমাহ', hi: 'रास अल खैमाह', areas: [] },
      { en: 'Fujairah', ar: 'الفجيرة', bn: 'ফুজাইরাহ', hi: 'फुजैराह', areas: [] },
    ]
  },
  kw: { 
    code: 'kw', name: 'Kuwait', nameAr: 'الكويت', nameBn: 'কুয়েত', nameHi: 'कुवैत',
    currency: 'KWD', phoneCode: '+965', flag: '/flags/kw.svg', defaultLang: 'ar', 
    cities: [
      { en: 'Kuwait City', ar: 'مدينة الكويت', bn: 'কুয়েত সিটি', hi: 'कुवैत सिटी', areas: [
        { en: 'Sharq', ar: 'شرق', bn: 'শার্ক', hi: 'शर्क' },
        { en: 'Jabriya', ar: 'الجابرية', bn: 'জাবরিয়া', hi: 'जबरिया' },
        { en: 'Surra', ar: 'السرة', bn: 'সুররা', hi: 'सुर्रा' },
        { en: 'Salmiya', ar: 'السالمية', bn: 'সালমিয়া', hi: 'सलमिया' },
      ]},
      { en: 'Hawalli', ar: 'حولي', bn: 'হাওয়ালি', hi: 'हवाली', areas: [] },
      { en: 'Farwaniya', ar: 'الفروانية', bn: 'ফারওয়ানিয়া', hi: 'फरवानिया', areas: [
        { en: 'Fahaheel', ar: 'الفحيحيل', bn: 'ফাহাহিল', hi: 'फहाहील' },
      ]},
    ]
  },
  bh: { 
    code: 'bh', name: 'Bahrain', nameAr: 'البحرين', nameBn: 'বাহরাইন', nameHi: 'बहरीन',
    currency: 'BHD', phoneCode: '+973', flag: '/flags/bh.svg', defaultLang: 'ar', 
    cities: [
      { en: 'Manama', ar: 'المنامة', bn: 'মানামা', hi: 'मनामा', areas: [
        { en: 'Juffair', ar: 'الجفير', bn: 'জুফেয়ার', hi: 'जुफैर' },
        { en: 'Adliya', ar: 'العدلية', bn: 'আদলিয়া', hi: 'अदलिया' },
        { en: 'Seef', ar: 'السيف', bn: 'সিফ', hi: 'सीफ' },
        { en: 'Amwaj', ar: 'أمواج', bn: 'আমওয়াজ', hi: 'अमवाज' },
        { en: 'Hoora', ar: 'الحورة', bn: 'হুরা', hi: 'हूरा' },
      ]},
      { en: 'Riffa', ar: 'الرفاع', bn: 'রিফা', hi: 'रिफा', areas: [
        { en: 'East Riffa', ar: 'الرفاع الشرقي', bn: 'পূর্ব রিফা', hi: 'पूर्व रिफा' },
      ]},
      { en: 'Muharraq', ar: 'المحرق', bn: 'মুহাররাক', hi: 'मुहर्रक', areas: [
        { en: 'Busaiteen', ar: 'البسيتين', bn: 'বুসাইতিন', hi: 'बुसैतीन' },
      ]},
    ]
  },
  om: { 
    code: 'om', name: 'Oman', nameAr: 'عمان', nameBn: 'ওমান', nameHi: 'ओमान',
    currency: 'OMR', phoneCode: '+968', flag: '/flags/om.svg', defaultLang: 'ar', 
    cities: [
      { en: 'Muscat', ar: 'مسقط', bn: 'মাস্কাট', hi: 'मस्कट', areas: [
        { en: 'Ruwi', ar: 'روي', bn: 'রুউই', hi: 'रुवी' },
        { en: 'Al Khuwair', ar: 'الخوير', bn: 'আল খুওয়াইর', hi: 'अल खुवैर' },
        { en: 'Ghubra', ar: 'غبرة', bn: 'ঘুবরা', hi: 'घुबरा' },
        { en: 'Seeb', ar: 'السيب', bn: 'সিব', hi: 'सीब' },
        { en: 'Qurum', ar: 'القرم', bn: 'কুরুম', hi: 'कुरुम' },
      ]},
      { en: 'Salalah', ar: 'صلالة', bn: 'সালালাহ', hi: 'सलालाह', areas: [
        { en: 'Al Haffa', ar: 'الحافة', bn: 'আল হাফফা', hi: 'अल हफ्फा' },
      ]},
      { en: 'Sohar', ar: 'صحار', bn: 'সোহার', hi: 'सोहार', areas: [
        { en: 'Al Hambar', ar: 'الحنبر', bn: 'আল হাম্বার', hi: 'अल हंबर' },
      ]},
      { en: 'Nizwa', ar: 'نزوى', bn: 'নিজওয়া', hi: 'निज़वा', areas: [] },
    ]
  },
};

export type CountryCode = keyof typeof countries;

// ═══════════════════════════════════════════════════════════
// Helper Functions (Memoized ready)
// ═══════════════════════════════════════════════════════════
export function getCountry(code: string): Country {
  return countries[code as CountryCode] || countries.qa;
}

export function getCityName(city: City, lang: string): string {
  return (city as any)[lang] || city.en;
}

export function getAreaName(area: Area, lang: string): string {
  return (area as any)[lang] || area.en;
}

export function getCountryName(code: string, lang: string): string {
  return countryNames[code]?.[lang] || countries[code]?.name || code;
}

export function getCitiesForLang(code: string, lang: string): string[] {
  const c = getCountry(code);
  return c.cities.map(city => getCityName(city, lang));
}

export function getAllCities(code: string): City[] {
  return getCountry(code).cities;
}

export function getCurrencySymbol(code: string): string {
  return getCountry(code).currency;
}

export function getPhoneCode(code: string): string {
  return getCountry(code).phoneCode;
}