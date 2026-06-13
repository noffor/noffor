// lib/config.ts - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফুল কনফিগ
export const siteConfig = {
  name: 'Noffor',
  defaultCountry: 'qa',
  defaultLanguage: 'en',
  
  // ═══════════════════════════════════════════════════════
  // ৪২ ক্যাটাগরি (১২ মেইন + ৩০ অন্যান্য) • ৪ ভাষায় নাম
  // ═══════════════════════════════════════════════════════
  categories: [
    // ✅ 12 Main Categories
    { 
      slug: 'driver', 
      name: 'Driver', 
      nameBn: 'ড্রাইভার', 
      nameAr: 'سائق', 
      nameHi: 'ड्राइवर',
      icon: '/icons/driver.png', 
      banner: '/banners/driver.jpg',
      isMain: true
    },
    { 
      slug: 'electrician', 
      name: 'Electrician', 
      nameBn: 'ইলেকট্রিশিয়ান', 
      nameAr: 'كهربائي', 
      nameHi: 'इलेक्ट्रीशियन',
      icon: '/icons/electrician.png', 
      banner: '/banners/electrician.jpg',
      isMain: true
    },
    { 
      slug: 'plumber', 
      name: 'Plumber', 
      nameBn: 'প্লাম্বার', 
      nameAr: 'سباك', 
      nameHi: 'प्लंबर',
      icon: '/icons/plumber.png', 
      banner: '/banners/plumber.jpg',
      isMain: true
    },
    { 
      slug: 'mason', 
      name: 'Mason', 
      nameBn: 'রাজমিস্ত্রি', 
      nameAr: 'بناء', 
      nameHi: 'राजमिस्त्री',
      icon: '/icons/mason.png', 
      banner: '/banners/mason.jpg',
      isMain: true
    },
    { 
      slug: 'ac-technician', 
      name: 'AC Technician', 
      nameBn: 'এসি টেকনিশিয়ান', 
      nameAr: 'فني تكييف', 
      nameHi: 'एसी तकनीशियन',
      icon: '/icons/ac.png', 
      banner: '/banners/ac.jpg',
      isMain: true
    },
    { 
      slug: 'painter', 
      name: 'Painter', 
      nameBn: 'পেইন্টার', 
      nameAr: 'دهان', 
      nameHi: 'पेंटर',
      icon: '/icons/painter.png', 
      banner: '/banners/painter.jpg',
      isMain: true
    },
    { 
      slug: 'carpenter', 
      name: 'Carpenter', 
      nameBn: 'কার্পেন্টার', 
      nameAr: 'نجار', 
      nameHi: 'बढ़ई',
      icon: '/icons/carpenter.png', 
      banner: '/banners/carpenter.jpg',
      isMain: true
    },
    { 
      slug: 'welder', 
      name: 'Welder', 
      nameBn: 'ওয়েল্ডার', 
      nameAr: 'لحام', 
      nameHi: 'वेल्डर',
      icon: '/icons/welder.png', 
      banner: '/banners/welder.jpg',
      isMain: true
    },
    { 
      slug: 'cleaner', 
      name: 'Cleaner', 
      nameBn: 'ক্লিনার', 
      nameAr: 'منظف', 
      nameHi: 'क्लीनर',
      icon: '/icons/cleaner.png', 
      banner: '/banners/cleaner.jpg',
      isMain: true
    },
    { 
      slug: 'cook', 
      name: 'Cook', 
      nameBn: 'রাঁধুনি', 
      nameAr: 'طباخ', 
      nameHi: 'रसोइया',
      icon: '/icons/cook.png', 
      banner: '/banners/cook.jpg',
      isMain: true
    },
    { 
      slug: 'helper', 
      name: 'Helper', 
      nameBn: 'হেল্পার', 
      nameAr: 'مساعد', 
      nameHi: 'हेल्पर',
      icon: '/icons/helper.png', 
      banner: '/banners/helper.jpg',
      isMain: true
    },
    { 
      slug: 'gardener', 
      name: 'Gardener', 
      nameBn: 'মালী', 
      nameAr: 'بستاني', 
      nameHi: 'माली',
      icon: '/icons/gardener.png', 
      banner: '/banners/gardener.jpg',
      isMain: true
    },

    // ✅ 30 Other Categories
    { 
      slug: 'housemaid', 
      name: 'Housemaid', 
      nameBn: 'গৃহকর্মী', 
      nameAr: 'خادمة', 
      nameHi: 'हाउसमेड',
      icon: '/icons/housemaid.png', 
      banner: '/banners/housemaid.jpg',
      isMain: false
    },
    { 
      slug: 'nanny', 
      name: 'Nanny', 
      nameBn: 'আয়া', 
      nameAr: 'مربية', 
      nameHi: 'नैनी',
      icon: '/icons/nanny.png', 
      banner: '/banners/nanny.jpg',
      isMain: false
    },
    { 
      slug: 'office-assistant', 
      name: 'Office Assistant', 
      nameBn: 'অফিস সহকারী', 
      nameAr: 'مساعد مكتبي', 
      nameHi: 'ऑफिस असिस्टेंट',
      icon: '/icons/office-assistant.png', 
      banner: '/banners/office-assistant.jpg',
      isMain: false
    },
    { 
      slug: 'receptionist', 
      name: 'Receptionist', 
      nameBn: 'রিসেপশনিস্ট', 
      nameAr: 'موظف استقبال', 
      nameHi: 'रिसेप्शनिस्ट',
      icon: '/icons/receptionist.png', 
      banner: '/banners/receptionist.jpg',
      isMain: false
    },
    { 
      slug: 'salesman', 
      name: 'Salesman', 
      nameBn: 'সেলসম্যান', 
      nameAr: 'بائع', 
      nameHi: 'सेल्समैन',
      icon: '/icons/salesman.png', 
      banner: '/banners/salesman.jpg',
      isMain: false
    },
    { 
      slug: 'cashier', 
      name: 'Cashier', 
      nameBn: 'ক্যাশিয়ার', 
      nameAr: 'كاشير', 
      nameHi: 'कैशियर',
      icon: '/icons/cashier.png', 
      banner: '/banners/cashier.jpg',
      isMain: false
    },
    { 
      slug: 'security-guard', 
      name: 'Security Guard', 
      nameBn: 'সিকিউরিটি গার্ড', 
      nameAr: 'حارس أمن', 
      nameHi: 'सिक्योरिटी गार्ड',
      icon: '/icons/security-guard.png', 
      banner: '/banners/security-guard.jpg',
      isMain: false
    },
    { 
      slug: 'nurse', 
      name: 'Nurse', 
      nameBn: 'নার্স', 
      nameAr: 'ممرض', 
      nameHi: 'नर्स',
      icon: '/icons/nurse.png', 
      banner: '/banners/nurse.jpg',
      isMain: false
    },
    { 
      slug: 'pharmacist', 
      name: 'Pharmacist', 
      nameBn: 'ফার্মাসিস্ট', 
      nameAr: 'صيدلي', 
      nameHi: 'फार्मासिस्ट',
      icon: '/icons/pharmacist.png', 
      banner: '/banners/pharmacist.jpg',
      isMain: false
    },
    { 
      slug: 'lab-technician', 
      name: 'Lab Technician', 
      nameBn: 'ল্যাব টেকনিশিয়ান', 
      nameAr: 'فني مختبر', 
      nameHi: 'लैब तकनीशियन',
      icon: '/icons/lab-technician.png', 
      banner: '/banners/lab-technician.jpg',
      isMain: false
    },
    { 
      slug: 'physiotherapist', 
      name: 'Physiotherapist', 
      nameBn: 'ফিজিওথেরাপিস্ট', 
      nameAr: 'معالج طبيعي', 
      nameHi: 'फिजियोथेरेपिस्ट',
      icon: '/icons/physiotherapist.png', 
      banner: '/banners/physiotherapist.jpg',
      isMain: false
    },
    { 
      slug: 'mechanic', 
      name: 'Mechanic', 
      nameBn: 'মেকানিক', 
      nameAr: 'ميكانيكي', 
      nameHi: 'मैकेनिक',
      icon: '/icons/mechanic.png', 
      banner: '/banners/mechanic.jpg',
      isMain: false
    },
    { 
      slug: 'tailor', 
      name: 'Tailor', 
      nameBn: 'দর্জি', 
      nameAr: 'خياط', 
      nameHi: 'दर्जी',
      icon: '/icons/tailor.png', 
      banner: '/banners/tailor.jpg',
      isMain: false
    },
    { 
      slug: 'barista', 
      name: 'Barista', 
      nameBn: 'বারিস্তা', 
      nameAr: 'باريستا', 
      nameHi: 'बरिस्ता',
      icon: '/icons/barista.png', 
      banner: '/banners/barista.jpg',
      isMain: false
    },
    { 
      slug: 'photographer', 
      name: 'Photographer', 
      nameBn: 'ফটোগ্রাফার', 
      nameAr: 'مصور', 
      nameHi: 'फोटोग्राफर',
      icon: '/icons/photographer.png', 
      banner: '/banners/photographer.jpg',
      isMain: false
    },
    { 
      slug: 'cctv-technician', 
      name: 'CCTV Technician', 
      nameBn: 'সিসিটিভি টেকনিশিয়ান', 
      nameAr: 'فني كاميرات', 
      nameHi: 'CCTV तकनीशियन',
      icon: '/icons/cctv-technician.png', 
      banner: '/banners/cctv-technician.jpg',
      isMain: false
    },
    { 
      slug: 'gypsum-carpenter', 
      name: 'Gypsum Carpenter', 
      nameBn: 'জিপসাম কার্পেন্টার', 
      nameAr: 'نجار جبس', 
      nameHi: 'जिप्सम कारपेंटर',
      icon: '/icons/gypsum-carpenter.png', 
      banner: '/banners/gypsum-carpenter.jpg',
      isMain: false
    },
    { 
      slug: 'tiles-mason', 
      name: 'Tiles Mason', 
      nameBn: 'টাইলস মিস্ত্রি', 
      nameAr: 'عامل تبليط', 
      nameHi: 'टाइल्स मिस्त्री',
      icon: '/icons/tiles-mason.png', 
      banner: '/banners/tiles-mason.jpg',
      isMain: false
    },
    { 
      slug: 'blacksmith', 
      name: 'Blacksmith', 
      nameBn: 'কামার', 
      nameAr: 'حداد', 
      nameHi: 'लोहार',
      icon: '/icons/blacksmith.png', 
      banner: '/banners/blacksmith.jpg',
      isMain: false
    },
    { 
      slug: 'general-labour', 
      name: 'General Labour', 
      nameBn: 'সাধারণ শ্রমিক', 
      nameAr: 'عامل عام', 
      nameHi: 'सामान्य श्रमिक',
      icon: '/icons/general-labour.png', 
      banner: '/banners/general-labour.jpg',
      isMain: false
    },
    { 
      slug: 'steel-fixer', 
      name: 'Steel Fixer', 
      nameBn: 'স্টিল ফিক্সার', 
      nameAr: 'مثبت حديد', 
      nameHi: 'स्टील फिक्सर',
      icon: '/icons/steel-fixer.png', 
      banner: '/banners/steel-fixer.jpg',
      isMain: false
    },
    { 
      slug: 'scaffolder', 
      name: 'Scaffolder', 
      nameBn: 'স্ক্যাফোল্ডার', 
      nameAr: 'عامل سقالات', 
      nameHi: 'स्कैफोल्डर',
      icon: '/icons/scaffolder.png', 
      banner: '/banners/scaffolder.jpg',
      isMain: false
    },
    { 
      slug: 'heavy-driver', 
      name: 'Heavy Driver', 
      nameBn: 'ভারী ড্রাইভার', 
      nameAr: 'سائق ثقيل', 
      nameHi: 'भारी ड्राइवर',
      icon: '/icons/heavy-driver.png', 
      banner: '/banners/heavy-driver.jpg',
      isMain: false
    },
    { 
      slug: 'forklift-operator', 
      name: 'Forklift Operator', 
      nameBn: 'ফর্কলিফট অপারেটর', 
      nameAr: 'مشغل رافعة', 
      nameHi: 'फोर्कलिफ्ट ऑपरेटर',
      icon: '/icons/forklift-operator.png', 
      banner: '/banners/forklift-operator.jpg',
      isMain: false
    },
    { 
      slug: 'crane-operator', 
      name: 'Crane Operator', 
      nameBn: 'ক্রেন অপারেটর', 
      nameAr: 'مشغل رافعة', 
      nameHi: 'क्रेन ऑपरेटर',
      icon: '/icons/crane-operator.png', 
      banner: '/banners/crane-operator.jpg',
      isMain: false
    },
    { 
      slug: 'pipe-fitter', 
      name: 'Pipe Fitter', 
      nameBn: 'পাইপ ফিটার', 
      nameAr: 'مركب أنابيب', 
      nameHi: 'पाइप फिटर',
      icon: '/icons/pipe-fitter.png', 
      banner: '/banners/pipe-fitter.jpg',
      isMain: false
    },
    { 
      slug: 'waiter', 
      name: 'Waiter', 
      nameBn: 'ওয়েটার', 
      nameAr: 'نادل', 
      nameHi: 'वेटर',
      icon: '/icons/waiter.png', 
      banner: '/banners/waiter.jpg',
      isMain: false
    },
    { 
      slug: 'hotel-housekeeping', 
      name: 'Hotel Housekeeping', 
      nameBn: 'হোটেল হাউসকিপিং', 
      nameAr: 'تدبير فندقي', 
      nameHi: 'होटल हाउसकीपिंग',
      icon: '/icons/hotel-housekeeping.png', 
      banner: '/banners/hotel-housekeeping.jpg',
      isMain: false
    },
    { 
      slug: 'beautician', 
      name: 'Beautician', 
      nameBn: 'বিউটিশিয়ান', 
      nameAr: 'خبيرة تجميل', 
      nameHi: 'ब्यूटीशियन',
      icon: '/icons/beautician.png', 
      banner: '/banners/beautician.jpg',
      isMain: false
    },
    { 
      slug: 'barber', 
      name: 'Barber', 
      nameBn: 'নাপিত', 
      nameAr: 'حلاق', 
      nameHi: 'नाई',
      icon: '/icons/barber.png', 
      banner: '/banners/barber.jpg',
      isMain: false
    },
  ],

  // ═══════════════════════════════════════════════════════
  // দেশ কনফিগ
  // ═══════════════════════════════════════════════════════
  countries: {
    qa: { name: 'Qatar', nameBn: 'কাতার', nameAr: 'قطر', nameHi: 'कतर', currency: 'QAR', phoneCode: '+974' },
    sa: { name: 'Saudi Arabia', nameBn: 'সৌদি আরব', nameAr: 'السعودية', nameHi: 'सऊदी अरब', currency: 'SAR', phoneCode: '+966' },
    ae: { name: 'UAE', nameBn: 'UAE', nameAr: 'الإمارات', nameHi: 'UAE', currency: 'AED', phoneCode: '+971' },
    kw: { name: 'Kuwait', nameBn: 'কুয়েত', nameAr: 'الكويت', nameHi: 'कुवैत', currency: 'KWD', phoneCode: '+965' },
    bh: { name: 'Bahrain', nameBn: 'বাহরাইন', nameAr: 'البحرين', nameHi: 'बहरीन', currency: 'BHD', phoneCode: '+973' },
    om: { name: 'Oman', nameBn: 'ওমান', nameAr: 'عمان', nameHi: 'ओमान', currency: 'OMR', phoneCode: '+968' },
  },

  // ═══════════════════════════════════════════════════════
  // সোশ্যাল লিংক
  // ═══════════════════════════════════════════════════════
  social: {
    facebook: 'https://facebook.com/noffor',
    twitter: 'https://twitter.com/noffor',
    instagram: 'https://instagram.com/noffor',
    youtube: 'https://youtube.com/@noffor',
  },

  // ═══════════════════════════════════════════════════════
  // কন্টাক্ট
  // ═══════════════════════════════════════════════════════
  contact: {
    email: 'noffor2026@gmail.com',
    phone: '+974 66003608',
    whatsapp: '+97466003608',
  },

  // ═══════════════════════════════════════════════════════
  // পেমেন্ট
  // ═══════════════════════════════════════════════════════
  payment: {
    featuredPrice: 2, // QAR per day
    featuredPriceText: '2 QAR/day',
    qrCode: '/images/qr-code.png',
  },
};

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════
export const categories = siteConfig.categories;

export function getCategoryBySlug(slug: string) {
  return categories.find(c => c.slug === slug);
}

export function getCategoryName(slug: string, lang: string) {
  const cat = getCategoryBySlug(slug);
  if (!cat) return slug;
  const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof cat;
  return (cat as any)[key] || cat.name;
}

export function getMainCategories() {
  return categories.filter(c => (c as any).isMain === true);
}

export function getOtherCategories() {
  return categories.filter(c => (c as any).isMain === false);
}

// ═══════════════════════════════════════════════════════════
// ফ্ল্যাগ (১৫+ দেশ)
// ═══════════════════════════════════════════════════════════
export const flags: Record<string, string> = {
  bangladesh: '/flags/bd.svg',
  india: '/flags/in.svg',
  pakistan: '/flags/pk.svg',
  nepal: '/flags/np.svg',
  srilanka: '/flags/lk.svg',
  philippines: '/flags/ph.svg',
  egypt: '/flags/eg.svg',
  qatar: '/flags/qa.svg',
  saudi: '/flags/sa.svg',
  uae: '/flags/ae.svg',
  kuwait: '/flags/kw.svg',
  bahrain: '/flags/bh.svg',
  oman: '/flags/om.svg',
  indonesia: '/flags/id.svg',
  sudan: '/flags/sd.svg',
  jordan: '/flags/jo.svg',
  lebanon: '/flags/lb.svg',
  syria: '/flags/sy.svg',
};