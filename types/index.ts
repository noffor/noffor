// types/index.ts
export interface Worker {
  id: string;
  worker_id?: string;
  name: string;
  category: string;
  photo_url?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  eta?: number;
  expected_salary?: string;
  is_online?: boolean;
  rating?: number;
  experience?: string;
  profiles?: Worker;
}

export interface Booking {
  id: string;
  job_id?: string;
  worker_id: string;
  employer_id: string;
  worker_name?: string;
  employer_name?: string;
  job_title: string;
  job_description?: string;
  category?: string;
  offered_amount: number;
  payment_type: string;
  payment_method: string;
  hourly_rate?: number;
  daily_rate?: number;
  total_amount: number;
  start_date: string;
  start_time: string;
  duration_days: number;
  location_text: string;
  location_lat?: number;
  location_lng?: number;
  worker_lat?: number;
  worker_lon?: number;
  distance_km?: number;
  eta_minutes?: number;
  special_instructions?: string;
  contact_phone: string;
  status: string;
  created_at?: string;
  accepted_at?: string;
  completed_at?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
  nameAr?: string;
  nameBn?: string;
  nameHi?: string;
}

export const GULF_COUNTRIES: Country[] = [
  { code: 'qa', name: 'Qatar', currency: 'QAR', flag: '🇶🇦', nameAr: 'قطر', nameBn: 'কাতার', nameHi: 'कतर' },
  { code: 'sa', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦', nameAr: 'السعودية', nameBn: 'সৌদি আরব', nameHi: 'सऊदी अरब' },
  { code: 'ae', name: 'UAE', currency: 'AED', flag: '🇦🇪', nameAr: 'الإمارات', nameBn: 'ইউএই', nameHi: 'यूएई' },
  { code: 'kw', name: 'Kuwait', currency: 'KWD', flag: '🇰🇼', nameAr: 'الكويت', nameBn: 'কুয়েত', nameHi: 'कुवैत' },
  { code: 'bh', name: 'Bahrain', currency: 'BHD', flag: '🇧🇭', nameAr: 'البحرين', nameBn: 'বাহরাইন', nameHi: 'बहरीन' },
  { code: 'om', name: 'Oman', currency: 'OMR', flag: '🇴🇲', nameAr: 'عمان', nameBn: 'ওমান', nameHi: 'ओमान' },
];

export const DEFAULT_COUNTRY = GULF_COUNTRIES[0];
export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGS = ['en', 'ar', 'bn', 'hi'] as const;
export type LangCode = typeof SUPPORTED_LANGS[number];