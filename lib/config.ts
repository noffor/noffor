// lib/config.ts - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফুল কনফিগ
export const siteConfig = {
  name: 'Noffor',
  defaultCountry: 'qa',
  defaultLanguage: 'en',
  
  // ═══════════════════════════════════════════════════════
  // ১২ ক্যাটাগরি (৪ ভাষায় নাম)
  // ═══════════════════════════════════════════════════════
  categories: [
    { 
      slug: 'driver', 
      name: 'Driver', 
      nameBn: 'ড্রাইভার', 
      nameAr: 'سائق', 
      nameHi: 'ड्राइवर',
      icon: '/icons/driver.png', 
      banner: '/banners/driver.jpg' 
    },
    { 
      slug: 'electrician', 
      name: 'Electrician', 
      nameBn: 'ইলেকট্রিশিয়ান', 
      nameAr: 'كهربائي', 
      nameHi: 'इलेक्ट्रीशियन',
      icon: '/icons/electrician.png', 
      banner: '/banners/electrician.jpg' 
    },
    { 
      slug: 'plumber', 
      name: 'Plumber', 
      nameBn: 'প্লাম্বার', 
      nameAr: 'سباك', 
      nameHi: 'प्लंबर',
      icon: '/icons/plumber.png', 
      banner: '/banners/plumber.jpg' 
    },
    { 
      slug: 'mason', 
      name: 'Mason', 
      nameBn: 'রাজমিস্ত্রি', 
      nameAr: 'بناء', 
      nameHi: 'राजमिस्त्री',
      icon: '/icons/mason.png', 
      banner: '/banners/mason.jpg' 
    },
    { 
      slug: 'ac-technician', 
      name: 'AC Technician', 
      nameBn: 'এসি টেকনিশিয়ান', 
      nameAr: 'فني تكييف', 
      nameHi: 'एसी तकनीशियन',
      icon: '/icons/ac.png', 
      banner: '/banners/ac.jpg' 
    },
    { 
      slug: 'painter', 
      name: 'Painter', 
      nameBn: 'পেইন্টার', 
      nameAr: 'دهان', 
      nameHi: 'पेंटर',
      icon: '/icons/painter.png', 
      banner: '/banners/painter.jpg' 
    },
    { 
      slug: 'carpenter', 
      name: 'Carpenter', 
      nameBn: 'কার্পেন্টার', 
      nameAr: 'نجار', 
      nameHi: 'बढ़ई',
      icon: '/icons/carpenter.png', 
      banner: '/banners/carpenter.jpg' 
    },
    { 
      slug: 'welder', 
      name: 'Welder', 
      nameBn: 'ওয়েল্ডার', 
      nameAr: 'لحام', 
      nameHi: 'वेल्डर',
      icon: '/icons/welder.png', 
      banner: '/banners/welder.jpg' 
    },
    { 
      slug: 'cleaner', 
      name: 'Cleaner', 
      nameBn: 'ক্লিনার', 
      nameAr: 'منظف', 
      nameHi: 'क्लीनर',
      icon: '/icons/cleaner.png', 
      banner: '/banners/cleaner.jpg' 
    },
    { 
      slug: 'cook', 
      name: 'Cook', 
      nameBn: 'রাঁধুনি', 
      nameAr: 'طباخ', 
      nameHi: 'रसोइया',
      icon: '/icons/cook.png', 
      banner: '/banners/cook.jpg' 
    },
    { 
      slug: 'helper', 
      name: 'Helper', 
      nameBn: 'হেল্পার', 
      nameAr: 'مساعد', 
      nameHi: 'हेल्पर',
      icon: '/icons/helper.png', 
      banner: '/banners/helper.jpg' 
    },
    { 
      slug: 'gardener', 
      name: 'Gardener', 
      nameBn: 'মালী', 
      nameAr: 'بستاني', 
      nameHi: 'माली',
      icon: '/icons/gardener.png', 
      banner: '/banners/gardener.jpg' 
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
    email: 'support@noffor.com',
    phone: '+974 1234 5678',
    whatsapp: '+97412345678',
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