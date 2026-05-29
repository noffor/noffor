export const countries = {
  qa: { code: 'qa', name: 'Qatar', nameAr: 'قطر', currency: 'QAR', phoneCode: '+974', flag: '/flags/qa.svg', defaultLang: 'ar', cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor'] },
  sa: { code: 'sa', name: 'Saudi Arabia', nameAr: 'السعودية', currency: 'SAR', phoneCode: '+966', flag: '/flags/sa.svg', defaultLang: 'ar', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'] },
  ae: { code: 'ae', name: 'UAE', nameAr: 'الإمارات', currency: 'AED', phoneCode: '+971', flag: '/flags/ae.svg', defaultLang: 'ar', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'] },
  kw: { code: 'kw', name: 'Kuwait', nameAr: 'الكويت', currency: 'KWD', phoneCode: '+965', flag: '/flags/kw.svg', defaultLang: 'ar', cities: ['Kuwait City', 'Hawalli', 'Farwaniya'] },
  om: { code: 'om', name: 'Oman', nameAr: 'عمان', currency: 'OMR', phoneCode: '+968', flag: '/flags/om.svg', defaultLang: 'ar', cities: ['Muscat', 'Salalah', 'Sohar'] },
  bh: { code: 'bh', name: 'Bahrain', nameAr: 'البحرين', currency: 'BHD', phoneCode: '+973', flag: '/flags/bh.svg', defaultLang: 'ar', cities: ['Manama', 'Riffa', 'Muharraq'] },
};

export type CountryCode = keyof typeof countries;

export function getCountry(country: string) {
  return countries[country as CountryCode] || countries.qa;
}