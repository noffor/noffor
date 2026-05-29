// components/profile/BioGrid.tsx
"use client";

interface BioGridProps {
  profile: any;
  lang: string;
}

export default function BioGrid({ profile, lang }: BioGridProps) {
  const getLabel = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      experience: { en: 'Experience', bn: 'অভিজ্ঞতা', ar: 'الخبرة', hi: 'अनुभव' },
      license: { en: 'License', bn: 'লাইসেন্স', ar: 'رخصة', hi: 'लाइसेंस' },
      languages: { en: 'Languages', bn: 'ভাষা', ar: 'اللغات', hi: 'भाषाएं' },
      visa: { en: 'Visa Status', bn: 'ভিসা স্ট্যাটাস', ar: 'حالة التأشيرة', hi: 'वीज़ा स्थिति' },
      sponsor: { en: 'Sponsorship', bn: 'স্পন্সরশিপ', ar: 'الكفالة', hi: 'प्रायोजन' },
      accommodation: { en: 'Accommodation', bn: 'আবাসন', ar: 'السكن', hi: 'आवास' },
      food: { en: 'Food', bn: 'খাবার', ar: 'الطعام', hi: 'भोजन' },
      salary: { en: 'Expected Salary', bn: 'প্রত্যাশিত বেতন', ar: 'الراتب المتوقع', hi: 'अपेक्षित वेतन' },
      city: { en: 'City', bn: 'শহর', ar: 'المدينة', hi: 'शहर' },
      area: { en: 'Area', bn: 'এলাকা', ar: 'المنطقة', hi: 'क्षेत्र' },
      rating: { en: 'Rating', bn: 'রেটিং', ar: 'تقييم', hi: 'रेटिंग' },
      online: { en: 'Status', bn: 'স্ট্যাটাস', ar: 'الحالة', hi: 'स्थिति' }
    };
    return labels[key]?.[lang] || labels[key]?.en || key;
  };

  const bioItems = [
    { key: 'experience', value: profile.experience || '-' },
    { key: 'license', value: profile.license || '-' },
    // ✅ ফিক্স: languages এখন string, join করার দরকার নেই
    { key: 'languages', value: profile.languages || '-' },
    { key: 'visa', value: profile.visa_status || '-' },
    { key: 'sponsor', value: profile.sponsorship || '-' },
    { key: 'accommodation', value: profile.accommodation || '-' },
    { key: 'food', value: profile.food || '-' },
    { key: 'salary', value: profile.expected_salary || '-' },
    { key: 'city', value: profile.city || '-' },
    { key: 'area', value: profile.area || '-' },
  ];

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="font-semibold text-lg mb-3">
        {lang === 'bn' ? 'জীবনবৃত্তান্ত' : lang === 'ar' ? 'السيرة الذاتية' : lang === 'hi' ? 'जीवन परिचय' : 'Bio'}
      </h3>
      <div className="space-y-2">
        {bioItems.map((item) => (
          <div key={item.key} className="flex justify-between py-1 border-b last:border-0">
            <span className="text-gray-500 text-sm">{getLabel(item.key)}</span>
            <span className="text-gray-800 text-sm font-medium">{item.value}</span>
          </div>
        ))}
        <div className="flex justify-between py-1">
          <span className="text-gray-500 text-sm">{getLabel('online')}</span>
          <span className={`text-sm font-medium ${profile.is_online ? 'text-green-600' : 'text-gray-400'}`}>
            {profile.is_online 
              ? (lang === 'bn' ? 'অনলাইন' : lang === 'ar' ? 'متصل' : lang === 'hi' ? 'ऑनलाइन' : 'Online')
              : (lang === 'bn' ? 'অফলাইন' : lang === 'ar' ? 'غير متصل' : lang === 'hi' ? 'ऑफलाइन' : 'Offline')}
          </span>
        </div>
        {profile.rating > 0 && (
          <div className="flex justify-between py-1">
            <span className="text-gray-500 text-sm">{getLabel('rating')}</span>
            <span className="text-yellow-500 text-sm font-medium">⭐ {profile.rating} / 5</span>
          </div>
        )}
      </div>
    </div>
  );
}