"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/config';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { 
  Plus, MapPin, Clock, DollarSign, Users, Send, Briefcase, X, Filter, Zap, 
  Building, MessageCircle, Utensils, Phone, CheckCircle, Award, TrendingDown,
  AlertCircle, RefreshCw, Wrench, SprayCan, ChefHat, Flower, Scissors, 
  ShoppingCart, Monitor, Truck, HardHat, Shield, Camera, Heart
} from 'lucide-react';

// ============ ADVANCED CACHE SYSTEM ============
const CACHE_CONFIG = {
  TTL: 15000,
  MAX_CACHE_SIZE: 1000,
  STALE_WHILE_REVALIDATE: true,
  BACKGROUND_REFRESH: true,
  BATCH_INTERVAL: 300,
  RETRY_ATTEMPTS: 3,
  REALTIME_DEBOUNCE: 2000,
};

const VIRTUAL_CONFIG = {
  OVERSCAN: 5,
  ITEM_HEIGHT: 350,
  CONCURRENT_FETCHES: 3,
  PREFETCH_THRESHOLD: 0.5,
};

// ============ PERFORMANCE OPTIMIZER ============
class PerformanceOptimizer {
  static debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer as NodeJS.Timeout);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  static throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => any>(fn: T, keyGen?: (...args: Parameters<T>) => string): T {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>) => {
      const key = keyGen ? keyGen(...args) : JSON.stringify(args);
      if (cache.has(key)) return cache.get(key)!;
      const result = fn(...args);
      cache.set(key, result);
      if (cache.size > 1000) cache.delete(cache.keys().next().value!);
      return result;
    }) as T;
  }
}

// ============ DISTRIBUTED CACHE LAYER ============
class DistributedCache {
  private static instance: DistributedCache;
  private memoryCache: Map<string, { data: any; timestamp: number }>;
  private pendingRequests: Map<string, Promise<any>>;
  private cleanupInterval: ReturnType<typeof setInterval> | null;

  private constructor() {
    this.memoryCache = new Map();
    this.pendingRequests = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  static getInstance(): DistributedCache {
    if (!this.instance) this.instance = new DistributedCache();
    return this.instance;
  }

  async get(key: string, fetcher: () => Promise<any>, ttl = CACHE_CONFIG.TTL): Promise<any> {
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      if (CACHE_CONFIG.STALE_WHILE_REVALIDATE) {
        this.revalidateInBackground(key, fetcher);
      }
      return cached.data;
    }

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = fetcher().then(data => {
      this.memoryCache.set(key, { data, timestamp: Date.now() });
      this.pendingRequests.delete(key);
      return data;
    }).catch(err => {
      this.pendingRequests.delete(key);
      if (cached) return cached.data;
      throw err;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  private async revalidateInBackground(key: string, fetcher: () => Promise<any>) {
    try {
      const data = await fetcher();
      this.memoryCache.set(key, { data, timestamp: Date.now() });
    } catch (err) {
      console.error('Background revalidation failed:', err);
    }
  }

  invalidate(pattern?: string) {
    if (pattern) {
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) this.memoryCache.delete(key);
      }
    } else {
      this.memoryCache.clear();
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.memoryCache) {
      if (now - value.timestamp > CACHE_CONFIG.TTL * 2) {
        this.memoryCache.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval as NodeJS.Timeout);
    }
  }
}

// ============ REALTIME CONNECTION MANAGER ============
class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, any>;
  private reconnectTimers: Map<string, ReturnType<typeof setTimeout>>;
  private listeners: Map<string, Set<() => void>>;

  private constructor() {
    this.connections = new Map();
    this.reconnectTimers = new Map();
    this.listeners = new Map();
  }

  static getInstance(): ConnectionManager {
    if (!this.instance) this.instance = new ConnectionManager();
    return this.instance;
  }

  subscribe(channel: string, callback: () => void) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
      this.establishConnection(channel);
    }
    this.listeners.get(channel)!.add(callback);
    return () => this.unsubscribe(channel, callback);
  }

  private async establishConnection(channel: string) {
    try {
      const connection = supabase
        .channel(channel)
        .on('postgres_changes', { event: '*', schema: 'public' }, 
          PerformanceOptimizer.debounce(() => {
            this.notifyListeners(channel);
          }, CACHE_CONFIG.REALTIME_DEBOUNCE)
        )
        .subscribe((status: string) => {
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.reconnect(channel);
          }
        });

      this.connections.set(channel, connection);
    } catch (err) {
      console.error('Connection failed:', err);
      this.reconnect(channel);
    }
  }

  private reconnect(channel: string) {
    if (this.reconnectTimers.has(channel)) {
      clearTimeout(this.reconnectTimers.get(channel) as NodeJS.Timeout);
    }
    const timer = setTimeout(() => this.establishConnection(channel), 5000);
    this.reconnectTimers.set(channel, timer);
  }

  private notifyListeners(channel: string) {
    const listeners = this.listeners.get(channel);
    if (listeners) {
      startTransition(() => {
        listeners.forEach(callback => callback());
      });
    }
  }

  private unsubscribe(channel: string, callback: () => void) {
    const listeners = this.listeners.get(channel);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(channel);
        const connection = this.connections.get(channel);
        if (connection) supabase.removeChannel(connection);
        this.connections.delete(channel);
        const timer = this.reconnectTimers.get(channel);
        if (timer) {
          clearTimeout(timer as NodeJS.Timeout);
          this.reconnectTimers.delete(channel);
        }
      }
    }
  }

  destroy() {
    this.listeners.clear();
    this.connections.forEach(conn => supabase.removeChannel(conn));
    this.connections.clear();
    this.reconnectTimers.forEach(timer => clearTimeout(timer as NodeJS.Timeout));
    this.reconnectTimers.clear();
  }
}

// ============ REQUEST BATCHER ============
class RequestBatcher {
  private static instance: RequestBatcher;
  private queues: Map<string, {
    fn: (ids: string[]) => Promise<any>;
    ids: Set<string>;
    timer: ReturnType<typeof setTimeout> | null;
  }>;

  private constructor() {
    this.queues = new Map();
  }

  static getInstance(): RequestBatcher {
    if (!this.instance) this.instance = new RequestBatcher();
    return this.instance;
  }

  async add(queueName: string, id: string, fn: (ids: string[]) => Promise<any>): Promise<any> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, { fn, ids: new Set(), timer: null });
    }
    
    const queue = this.queues.get(queueName)!;
    queue.ids.add(id);

    if (queue.timer) {
      clearTimeout(queue.timer as NodeJS.Timeout);
    }

    return new Promise((resolve, reject) => {
      queue.timer = setTimeout(async () => {
        const ids = Array.from(queue.ids);
        queue.ids.clear();
        queue.timer = null;
        
        try {
          const results = await fn(ids);
          resolve(results);
        } catch (err) {
          reject(err);
        }
      }, CACHE_CONFIG.BATCH_INTERVAL);
    });
  }
}

// ============ CATEGORY TRANSLATION MAP — 42 Categories (4 Languages) ============
const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
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
};

const translateCategory = (category: string, lang: string): string => {
  return CATEGORY_TRANSLATIONS[category]?.[lang] || category;
};

// ============ MEMOIZED CATEGORIES — 42 Categories with Icons ============
const getCategoryList = (lang: string) => [
  { key: 'all', icon: Filter, name: { en: 'All', bn: 'সব', ar: 'الكل', hi: 'सभी' }[lang] || 'All' },
  { key: 'Driver', icon: Users, name: translateCategory('Driver', lang) },
  { key: 'Electrician', icon: Zap, name: translateCategory('Electrician', lang) },
  { key: 'Plumber', icon: Wrench, name: translateCategory('Plumber', lang) },
  { key: 'Mason', icon: Building, name: translateCategory('Mason', lang) },
  { key: 'AC Technician', icon: Zap, name: translateCategory('AC Technician', lang) },
  { key: 'Painter', icon: SprayCan, name: translateCategory('Painter', lang) },
  { key: 'Carpenter', icon: HardHat, name: translateCategory('Carpenter', lang) },
  { key: 'Welder', icon: Wrench, name: translateCategory('Welder', lang) },
  { key: 'Cleaner', icon: SprayCan, name: translateCategory('Cleaner', lang) },
  { key: 'Cook', icon: ChefHat, name: translateCategory('Cook', lang) },
  { key: 'Helper', icon: Users, name: translateCategory('Helper', lang) },
  { key: 'Gardener', icon: Flower, name: translateCategory('Gardener', lang) },
  { key: 'Housemaid', icon: Heart, name: translateCategory('Housemaid', lang) },
  { key: 'Nanny', icon: Heart, name: translateCategory('Nanny', lang) },
  { key: 'Office Assistant', icon: Briefcase, name: translateCategory('Office Assistant', lang) },
  { key: 'Receptionist', icon: Monitor, name: translateCategory('Receptionist', lang) },
  { key: 'Salesman', icon: ShoppingCart, name: translateCategory('Salesman', lang) },
  { key: 'Cashier', icon: DollarSign, name: translateCategory('Cashier', lang) },
  { key: 'Security Guard', icon: Shield, name: translateCategory('Security Guard', lang) },
  { key: 'Nurse', icon: Heart, name: translateCategory('Nurse', lang) },
  { key: 'Pharmacist', icon: Briefcase, name: translateCategory('Pharmacist', lang) },
  { key: 'Lab Technician', icon: Monitor, name: translateCategory('Lab Technician', lang) },
  { key: 'Physiotherapist', icon: Heart, name: translateCategory('Physiotherapist', lang) },
  { key: 'Mechanic', icon: Wrench, name: translateCategory('Mechanic', lang) },
  { key: 'Tailor', icon: Scissors, name: translateCategory('Tailor', lang) },
  { key: 'Barista', icon: ChefHat, name: translateCategory('Barista', lang) },
  { key: 'Photographer', icon: Camera, name: translateCategory('Photographer', lang) },
  { key: 'CCTV Technician', icon: Monitor, name: translateCategory('CCTV Technician', lang) },
  { key: 'Gypsum Carpenter', icon: HardHat, name: translateCategory('Gypsum Carpenter', lang) },
  { key: 'Tiles Mason', icon: Building, name: translateCategory('Tiles Mason', lang) },
  { key: 'Blacksmith', icon: Wrench, name: translateCategory('Blacksmith', lang) },
  { key: 'General Labour', icon: Users, name: translateCategory('General Labour', lang) },
  { key: 'Steel Fixer', icon: HardHat, name: translateCategory('Steel Fixer', lang) },
  { key: 'Scaffolder', icon: Building, name: translateCategory('Scaffolder', lang) },
  { key: 'Heavy Driver', icon: Truck, name: translateCategory('Heavy Driver', lang) },
  { key: 'Forklift Operator', icon: Truck, name: translateCategory('Forklift Operator', lang) },
  { key: 'Crane Operator', icon: Truck, name: translateCategory('Crane Operator', lang) },
  { key: 'Pipe Fitter', icon: Wrench, name: translateCategory('Pipe Fitter', lang) },
  { key: 'Waiter', icon: ChefHat, name: translateCategory('Waiter', lang) },
  { key: 'Hotel Housekeeping', icon: Building, name: translateCategory('Hotel Housekeeping', lang) },
  { key: 'Beautician', icon: Scissors, name: translateCategory('Beautician', lang) },
  { key: 'Barber', icon: Scissors, name: translateCategory('Barber', lang) },
];

// ============ TRANSLATIONS ============
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    live_bidding: "Live Bidding", post_job: "Post Job", active_jobs: "Active", total_posted: "Total", today_new: "Today",
    all: "All", driver: "Driver", electric: "Electrician", plumber: "Plumber", mason: "Mason",
    ac_tech: "AC Tech", painter: "Painter", carpenter: "Carpenter",
    no_active_jobs: "No active jobs", post_first_job: "Post First Job",
    bid_now: "Bid Now", workers: "workers", bids: "Bids", any_location: "Any", qar: "QAR", whatsapp: "WhatsApp",
    post_a_job: "Post a Job", job_title: "Job Title *", select_category: "Select Category *",
    min_budget: "Min (QAR)", max_budget: "Max (QAR)", location_area: "Location / Area",
    workers_needed: "Workers", company_name: "Company", contact_phone: "Phone *",
    job_description: "Description...", duty_time: "Duty Time", meal_provided: "Meal Provided",
    place_your_bid: "Place Your Bid", your_price: "Your Price (QAR) *", why_you: "Why you?",
    submit_bid: "Submit Bid", open: "OPEN", required: "Title, Category & Phone required",
    bid_amount: "Enter bid amount", posted: "Job Posted!", bid_success: "Bid Placed Successfully!",
    lowest: "Lowest Bid", close: "Close", no_bids_yet: "No bids yet", be_first: "Be the first to bid!",
    posting: "Posting...", submitting: "Submitting...", employer: "Employer", login_required: "Enter phone number to bid",
    phone_label: "Your Phone Number", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ Your bid has been placed", lowest_bid: "🔥 Lowest Bid", call: "Call", 
    bid_history: "Bid History", total_bids: "Total Bids", contact_employer: "Contact Employer",
    bid_amount_label: "Your Bid Amount", your_message: "Your Message (Optional)",
    error_loading: "Error loading data. Please retry.", retry: "Retry",
    load_more: "Load More", no_more_jobs: "No more jobs", refreshing: "Refreshing...",
  },
  bn: {
    live_bidding: "লাইভ বিডিং", post_job: "জব পোস্ট", active_jobs: "সক্রিয়", total_posted: "মোট", today_new: "আজ",
    all: "সব", driver: "ড্রাইভার", electric: "ইলেকট্রিশিয়ান", plumber: "প্লাম্বার", mason: "মিস্ত্রি",
    ac_tech: "এসি টেক", painter: "পেইন্টার", carpenter: "কার্পেন্টার",
    no_active_jobs: "কোনো জব নেই", post_first_job: "প্রথম জব পোস্ট",
    bid_now: "বিড করুন", workers: "শ্রমিক", bids: "বিড", any_location: "যে কোনো", qar: "রিয়াল", whatsapp: "হোয়াটসঅ্যাপ",
    post_a_job: "জব পোস্ট", job_title: "শিরোনাম *", select_category: "ক্যাটাগরি *",
    min_budget: "ন্যূনতম", max_budget: "সর্বোচ্চ", location_area: "অবস্থান",
    workers_needed: "শ্রমিক", company_name: "কোম্পানি", contact_phone: "ফোন *",
    job_description: "বিবরণ...", duty_time: "ডিউটি সময়", meal_provided: "খাবার দেয়া হবে",
    place_your_bid: "বিড দিন", your_price: "আপনার মূল্য *", why_you: "আপনি কেন?",
    submit_bid: "জমা দিন", open: "খোলা", required: "শিরোনাম, ক্যাটাগরি ও ফোন আবশ্যক",
    bid_amount: "বিড মূল্য দিন", posted: "জব পোস্ট হয়েছে!", bid_success: "আপনার বিড সফলভাবে প্লেস হয়েছে!",
    lowest: "সর্বনিম্ন বিড", close: "বন্ধ", no_bids_yet: "কোনো বিড নেই", be_first: "প্রথম বিড করুন!",
    posting: "পোস্ট হচ্ছে...", submitting: "জমা হচ্ছে...", employer: "নিয়োগকর্তা", login_required: "বিড করতে ফোন নম্বর দিন",
    phone_label: "আপনার ফোন নম্বর", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ আপনার বিড প্লেস হয়েছে", lowest_bid: "🔥 সর্বনিম্ন বিড", call: "কল করুন",
    bid_history: "বিড ইতিহাস", total_bids: "মোট বিড", contact_employer: "নিয়োগকর্তার সাথে যোগাযোগ",
    bid_amount_label: "আপনার বিডের মূল্য", your_message: "আপনার বার্তা (ঐচ্ছিক)",
    error_loading: "ডেটা লোড করতে সমস্যা। আবার চেষ্টা করুন।", retry: "আবার চেষ্টা",
    load_more: "আরও দেখুন", no_more_jobs: "আর কোনো জব নেই", refreshing: "রিফ্রেশ হচ্ছে...",
  },
  ar: {
    live_bidding: "المزايدة", post_job: "نشر", active_jobs: "نشط", total_posted: "المجموع", today_new: "اليوم",
    all: "الكل", driver: "سائق", electric: "كهربائي", plumber: "سباك", mason: "بناء",
    ac_tech: "تكييف", painter: "دهان", carpenter: "نجار",
    no_active_jobs: "لا وظائف", post_first_job: "انشر الأول",
    bid_now: "زايد", workers: "عمال", bids: "عروض", any_location: "أي", qar: "ر.ق", whatsapp: "واتساب",
    post_a_job: "نشر وظيفة", job_title: "المسمى *", select_category: "الفئة *",
    min_budget: "الحد الأدنى", max_budget: "الأقصى", location_area: "الموقع",
    workers_needed: "عمال", company_name: "شركة", contact_phone: "هاتف *",
    job_description: "وصف...", duty_time: "الدوام", meal_provided: "وجبات",
    place_your_bid: "زايد", your_price: "سعرك *", why_you: "لماذا أنت؟",
    submit_bid: "إرسال", open: "مفتوح", required: "المسمى والفئة والهاتف مطلوب",
    bid_amount: "أدخل المبلغ", posted: "تم النشر!", bid_success: "تم تقديم عرضك بنجاح!",
    lowest: "أقل عرض", close: "إغلاق", no_bids_yet: "لا عروض", be_first: "كن الأول!",
    posting: "جاري النشر...", submitting: "جاري الإرسال...", employer: "صاحب العمل", login_required: "أدخل رقم الهاتف للمزايدة",
    phone_label: "رقم هاتفك", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ تم تقديم عرضك", lowest_bid: "🔥 أقل عرض", call: "اتصل",
    bid_history: "تاريخ العروض", total_bids: "إجمالي العروض", contact_employer: "اتصال بصاحب العمل",
    bid_amount_label: "مبلغ عرضك", your_message: "رسالتك (اختياري)",
    error_loading: "خطأ في تحميل البيانات. حاول مرة أخرى.", retry: "إعادة المحاولة",
    load_more: "تحميل المزيد", no_more_jobs: "لا مزيد من الوظائف", refreshing: "جاري التحديث...",
  },
  hi: {
    live_bidding: "लाइव बिडिंग", post_job: "जॉब पोस्ट", active_jobs: "सक्रिय", total_posted: "कुल", today_new: "आज",
    all: "सभी", driver: "ड्राइवर", electric: "इलेक्ट्रीशियन", plumber: "प्लंबर", mason: "मिस्त्री",
    ac_tech: "एसी टेक", painter: "पेंटर", carpenter: "कारपेंटर",
    no_active_jobs: "कोई जॉब नहीं", post_first_job: "पहली जॉब",
    bid_now: "बिड करें", workers: "श्रमिक", bids: "बिड", any_location: "कोई", qar: "रियाल", whatsapp: "व्हाट्सएप",
    post_a_job: "जॉब पोस्ट", job_title: "शीर्षक *", select_category: "श्रेणी *",
    min_budget: "न्यूनतम", max_budget: "अधिकतम", location_area: "स्थान",
    workers_needed: "श्रमिक", company_name: "कंपनी", contact_phone: "फ़ोन *",
    job_description: "विवरण...", duty_time: "ड्यूटी", meal_provided: "भोजन",
    place_your_bid: "बिड दें", your_price: "कीमत *", why_you: "आप क्यों?",
    submit_bid: "जमा करें", open: "खुला", required: "शीर्षक, श्रेणी और फ़ोन ज़रूरी",
    bid_amount: "राशि डालें", posted: "पोस्ट हो गया!", bid_success: "आपकी बिड सफलतापूर्वक लग गई!",
    lowest: "सबसे कम बिड", close: "बंद", no_bids_yet: "कोई बिड नहीं", be_first: "पहली बिड करें!",
    posting: "पोस्ट हो रहा...", submitting: "जमा हो रहा...", employer: "नियोक्ता", login_required: "बिड करने के लिए फ़ोन नंबर दें",
    phone_label: "आपका फ़ोन नंबर", phone_placeholder: "+880 1234 567890",
    your_bid_placed: "✓ आपकी बिड लग गई", lowest_bid: "🔥 सबसे कम बिड", call: "कॉल करें",
    bid_history: "बिड इतिहास", total_bids: "कुल बिड", contact_employer: "नियोक्ता से संपर्क करें",
    bid_amount_label: "आपकी बिड राशि", your_message: "आपका संदेश (वैकल्पिक)",
    error_loading: "डेटा लोड करने में त्रुटि। पुनः प्रयास करें।", retry: "पुनः प्रयास",
    load_more: "और देखें", no_more_jobs: "कोई और जॉब नहीं", refreshing: "रिफ्रेश हो रहा है...",
  },
};

function getTranslations(lang: string) {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

// ============ CUSTOM HOOK: useScrollLock ============
function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [lock]);
}

// ============ BID WORKER CARD COMPONENT ============
const BidWorkerCard = React.memo(({ bid, isLowest, lang, onContact }: { 
  bid: any; 
  isLowest: boolean; 
  lang: string; 
  onContact: (phone: string) => void 
}) => {
  const tr = useMemo(() => getTranslations(lang), [lang]);
  
  return (
    <div className={`rounded-xl p-3 transition-all hover:shadow-md ${
      isLowest ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gray-50 border border-gray-100'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isLowest ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            <span className="text-xs font-bold">{bid.amount}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">
              {bid.labor_phone || bid.labor_id?.substring(0, 10) || 'Worker'}
            </p>
            <p className="text-xs text-gray-500 truncate">{bid.message || 'No message'}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button 
            onClick={() => onContact(bid.labor_phone || bid.labor_id)}
            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition active:scale-95"
            title={tr.whatsapp}
          >
            <MessageCircle size={14} />
          </button>
          <button 
            onClick={() => onContact(bid.labor_phone || bid.labor_id)}
            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition active:scale-95"
            title={tr.call}
          >
            <Phone size={14} />
          </button>
        </div>
      </div>
      {isLowest && (
        <div className="mt-1">
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Award size={10} /> {tr.lowest}
          </span>
        </div>
      )}
    </div>
  );
});

BidWorkerCard.displayName = 'BidWorkerCard';

// ============ JOB CARD COMPONENT ============
const JobCard = React.memo(({ job, lang, onBid, onViewBids, userPhone }: { 
  job: any; 
  lang: string; 
  onBid: (job: any) => void; 
  onViewBids: (job: any) => void; 
  userPhone: string | null 
}) => {
  const tr = useMemo(() => getTranslations(lang), [lang]);
  const hasUserBid = job.user_bid;
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-3 lg:p-4 border-b bg-gradient-to-r from-green-50/50 to-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Briefcase size={16} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm lg:text-base truncate">{job.title}</h3>
              {/* ⭐ CATEGORY TRANSLATED */}
              <p className="text-xs text-green-600 font-medium">{translateCategory(job.category, lang)}</p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{tr.open}</span>
            {job.worker_count > 1 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                {job.worker_count} {tr.workers}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 lg:p-4">
        <div className="grid grid-cols-2 gap-1.5 lg:gap-2 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1 truncate">
            <MapPin size={12} className="flex-shrink-0" /> 
            <span className="truncate">{job.location || tr.any_location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={12} className="flex-shrink-0" /> 
            {job.budget_min || 0}-{job.budget_max || 0} {tr.qar}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="flex-shrink-0" /> 
            {new Date(job.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} className="flex-shrink-0" /> 
            {job.bid_count || 0} {tr.bids}
          </div>
          {job.duty_time && (
            <div className="flex items-center gap-1 col-span-2">
              <Clock size={12} className="text-green-600 flex-shrink-0" /> 
              <span className="font-medium truncate">{tr.duty_time}: {job.duty_time}</span>
            </div>
          )}
          {job.meal_provided && (
            <div className="flex items-center gap-1 col-span-2">
              <Utensils size={12} className="text-orange-500 flex-shrink-0" /> 
              <span className="font-medium text-orange-600">{tr.meal_provided}</span>
            </div>
          )}
        </div>

        {job.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{job.description}</p>
        )}

        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50/80 rounded-lg">
          <Building size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{job.employer_name || tr.employer}</span>
          <a href={`https://wa.me/${job.employer_phone}`} target="_blank" rel="noopener noreferrer" 
             className="ml-auto text-xs text-green-600 flex items-center gap-1 hover:text-green-800 flex-shrink-0">
            <MessageCircle size={12} /> {tr.whatsapp}
          </a>
        </div>

        {hasUserBid && (
          <div className="mb-2 p-1.5 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-[10px] text-green-600 flex items-center gap-1">
              <CheckCircle size={10} /> {tr.your_bid_placed}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={() => onBid(job)} 
            className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 active:bg-green-800 active:scale-[0.98] transition-all"
          >
            {tr.bid_now}
          </button>
          <button 
            onClick={() => onViewBids(job)} 
            className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all"
          >
            <Users size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

JobCard.displayName = 'JobCard';

// ============ SKELETON CARD ============
const SkeletonCard = React.memo(() => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
    <div className="flex gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="h-3 bg-gray-100 rounded" />
      <div className="h-3 bg-gray-100 rounded" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-1/2" />
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

// ============ ERROR BOUNDARY ============
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ============ MAIN PAGE COMPONENT ============
export default function BidPage() {
  const params = useParams();
  const router = useRouter();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const tr = useMemo(() => getTranslations(lang), [lang]);

  // Core State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showBidForm, setShowBidForm] = useState<any>(null);
  const [showBids, setShowBids] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, open: 0, todayNew: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [bidList, setBidList] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [workerCount, setWorkerCount] = useState('1');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [dutyTime, setDutyTime] = useState('');
  const [mealProvided, setMealProvided] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMsg, setBidMsg] = useState('');

  // Refs for performance
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const subscriptionCleanupRef = useRef<(() => void) | null>(null);

  // Service instances
  const cache = useMemo(() => DistributedCache.getInstance(), []);
  const connectionManager = useMemo(() => ConnectionManager.getInstance(), []);
  const requestBatcher = useMemo(() => RequestBatcher.getInstance(), []);

  // Body Scroll Lock
  const isAnyModalOpen = showPostForm || showBidForm !== null || showBids !== null;
  useScrollLock(isAnyModalOpen);

  // Load user phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('labor_phone');
    setUserPhone(savedPhone);
  }, []);

  // ⭐ Memoized category list for current language
  const categoryList = useMemo(() => getCategoryList(lang), [lang]);

  // ============ OPTIMIZED DATA FETCHING ============
  const fetchJobs = useCallback(async (pageNum: number = 1, append = false) => {
    const cacheKey = `jobs:${country}:${pageNum}:${filter}`;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    return cache.get(cacheKey, async () => {
      let query = supabase
        .from('job_posts')
        .select('*')
        .eq('country', country)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * 20, pageNum * 20 - 1);

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data: jobsData, error } = await query;

      if (error) throw error;
      
      if (controller.signal.aborted) return { jobs: [], hasMore: false };
      
      if (!jobsData || jobsData.length === 0) return { jobs: [], hasMore: false };

      const jobIds = jobsData.map((j: any) => j.id);
      
      const { data: allBids } = await supabase
        .from('bids')
        .select('job_id, labor_phone')
        .in('job_id', jobIds);

      if (controller.signal.aborted) return { jobs: [], hasMore: false };

      const countMap: Record<string, number> = {};
      const userBidMap: Record<string, boolean> = {};
      
      allBids?.forEach((b: any) => {
        countMap[b.job_id] = (countMap[b.job_id] || 0) + 1;
        if (userPhone && b.labor_phone === userPhone) {
          userBidMap[b.job_id] = true;
        }
      });

      const enriched = jobsData.map((job: any) => ({ 
        ...job, 
        bid_count: countMap[job.id] || 0,
        user_bid: userBidMap[job.id] || false
      }));

      return { 
        jobs: enriched, 
        hasMore: jobsData.length === 20 
      };
    });
  }, [country, filter, userPhone, cache]);

  // ============ LOAD JOBS WITH PAGINATION ============
  const loadJobs = useCallback(async (force = false, append = false) => {
    if (force) cache.invalidate('jobs:');
    
    if (!append) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = append ? page + 1 : 1;
      const { jobs: newJobs, hasMore: more } = await fetchJobs(currentPage, append);
      
      if (append) {
        setJobs(prev => [...prev, ...newJobs]);
        setPage(currentPage);
      } else {
        setJobs(newJobs);
        setPage(1);
        updateStats(newJobs);
      }
      
      setHasMore(more);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Load error:', err);
        setError(tr.error_loading);
        if (!append) setJobs([]);
      }
    }
    
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, [fetchJobs, page, tr, cache]);

  // ============ PULL TO REFRESH ============
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadJobs(true);
  }, [loadJobs]);

  // ============ INFINITE SCROLL ============
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          startTransition(() => {
            loadJobs(false, true);
          });
        }
      },
      { threshold: VIRTUAL_CONFIG.PREFETCH_THRESHOLD }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    observerRef.current = observer;

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loading, loadJobs]);

  // ============ STATS UPDATE ============
  const updateStats = useCallback((data: any[]) => {
    const today = new Date().toDateString();
    setStats({
      total: data.length,
      open: data.filter((j: any) => j.status === 'open').length,
      todayNew: data.filter((j: any) => new Date(j.created_at).toDateString() === today).length,
    });
  }, []);

  // ============ LOAD BIDS FOR MODAL ============
  const loadBidsForJob = useCallback(async (jobId: string) => {
    setLoadingBids(true);
    try {
      const cacheKey = `bids:${jobId}`;
      const data = await cache.get(cacheKey, async () => {
        const { data, error } = await supabase
          .from('bids')
          .select('*')
          .eq('job_id', jobId)
          .order('amount', { ascending: true });
        
        if (error) throw error;
        return data || [];
      });
      
      setBidList(data);
    } catch (err) {
      console.error('Load bids error:', err);
      setBidList([]);
    }
    setLoadingBids(false);
  }, [cache]);

  // ============ REALTIME WITH ADVANCED CONNECTION MANAGEMENT ============
  useEffect(() => {
    const channel = `realtime:${country}`;
    const cleanup = connectionManager.subscribe(channel, () => {
      startTransition(() => {
        loadJobs(true);
      });
    });
    
    subscriptionCleanupRef.current = cleanup;
    
    loadJobs(true);
    
    return () => {
      cleanup();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [country, loadJobs, connectionManager]);

  // ============ POST JOB WITH OPTIMISTIC UPDATE ============
  const postJob = useCallback(async () => {
    if (!title.trim() || !category || !phone.trim()) {
      alert(tr.required);
      return;
    }
    if (submitting) return;
    
    setSubmitting(true);
    
    const optimisticJob = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      category,
      budget_min: parseInt(budgetMin) || 0,
      budget_max: parseInt(budgetMax) || 0,
      location: location.trim(),
      description: desc.trim(),
      country,
      employer_phone: phone.trim(),
      employer_name: company.trim() || 'Employer',
      worker_count: parseInt(workerCount) || 1,
      duty_time: dutyTime.trim() || null,
      meal_provided: mealProvided,
      status: 'open',
      created_at: new Date().toISOString(),
      bid_count: 0,
      user_bid: false,
    };
    
    setJobs(prev => [optimisticJob, ...prev]);
    setShowPostForm(false);
    resetForm();
    
    try {
      const { error } = await supabase.from('job_posts').insert({
        title: optimisticJob.title,
        category: optimisticJob.category,
        budget_min: optimisticJob.budget_min,
        budget_max: optimisticJob.budget_max,
        location: optimisticJob.location,
        description: optimisticJob.description,
        country: optimisticJob.country,
        employer_phone: optimisticJob.employer_phone,
        employer_name: optimisticJob.employer_name,
        worker_count: optimisticJob.worker_count,
        duty_time: optimisticJob.duty_time,
        meal_provided: optimisticJob.meal_provided,
        status: 'open',
        profile_language: lang
      });

      if (error) throw error;

      alert(tr.posted);
      cache.invalidate('jobs:');
      loadJobs(true);
    } catch (err: any) {
      console.error('Post job error:', err);
      alert(err.message || 'Failed to post job');
      setJobs(prev => prev.filter(j => j.id !== optimisticJob.id));
    }
    
    setSubmitting(false);
  }, [title, category, budgetMin, budgetMax, location, desc, country, phone, company, workerCount, dutyTime, mealProvided, submitting, tr, loadJobs, lang, cache]);

  const resetForm = () => {
    setTitle(''); setCategory(''); setBudgetMin(''); setBudgetMax('');
    setLocation(''); setDesc(''); setPhone(''); setCompany(''); setWorkerCount('1');
    setDutyTime(''); setMealProvided(false);
  };

  // ============ PLACE BID WITH RETRY ============
  const placeBid = useCallback(async (jobId: string) => {
    if (!bidAmount.trim()) {
      alert(tr.bid_amount);
      return;
    }
    
    let laborPhone = userPhone;
    if (!laborPhone) {
      laborPhone = prompt(tr.phone_label, '+880');
      if (laborPhone && laborPhone.length > 5) {
        localStorage.setItem('labor_phone', laborPhone);
        setUserPhone(laborPhone);
      } else {
        alert(tr.login_required);
        return;
      }
    }
    
    if (submitting) return;

    setSubmitting(true);
    
    setJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, bid_count: (j.bid_count || 0) + 1, user_bid: true }
        : j
    ));
    
    let retries = 0;
    const maxRetries = CACHE_CONFIG.RETRY_ATTEMPTS;
    
    while (retries < maxRetries) {
      try {
        const { error } = await supabase.from('bids').insert({
          job_id: jobId,
          labor_id: laborPhone,
          labor_phone: laborPhone,
          amount: parseInt(bidAmount) || 0,
          message: bidMsg.trim() || 'I am interested in this job',
          status: 'pending'
        });

        if (error) throw error;

        setBidSuccess(`${tr.your_bid_placed}: ${bidAmount} ${tr.qar}`);
        setTimeout(() => setBidSuccess(null), 3000);
        
        alert(tr.bid_success);
        setShowBidForm(null);
        setBidAmount('');
        setBidMsg('');
        
        cache.invalidate('jobs:');
        cache.invalidate(`bids:${jobId}`);
        loadJobs(true);
        break;
      } catch (err: any) {
        retries++;
        if (retries === maxRetries) {
          console.error('Bid error:', err);
          alert(err.message || 'Failed to place bid');
          setJobs(prev => prev.map(j => 
            j.id === jobId 
              ? { ...j, bid_count: Math.max(0, (j.bid_count || 0) - 1), user_bid: false }
              : j
          ));
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
    
    setSubmitting(false);
  }, [bidAmount, bidMsg, submitting, tr, loadJobs, userPhone, cache]);

  // ============ CONTACT HANDLER ============
  const handleContact = useCallback((phone: string) => {
    if (phone) {
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  }, []);

  // ============ FILTERED JOBS WITH MEMOIZATION ============
  const filteredJobs = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter((j: any) => j.category === filter);
  }, [jobs, filter]);

  // ============ RENDER ============
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{tr.error_loading}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {tr.retry}
          </button>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50/50 pb-20 lg:pb-0">
        <Header country={country} lang={lang} />
        
        <div className="max-w-5xl mx-auto px-3 lg:px-4 py-3 lg:py-4">
          
          {/* Bid Success Notification */}
          {bidSuccess && (
            <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
              {bidSuccess}
            </div>
          )}
          
          {/* Error Notification */}
          {error && (
            <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError(null)} className="ml-2 hover:bg-red-600 rounded-full p-0.5 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
          
          {/* Refreshing Indicator */}
          {refreshing && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              {tr.refreshing}
            </div>
          )}
          
          {/* Hero Stats */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-4 lg:p-5 mb-4 text-white shadow-lg shadow-green-500/10">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg lg:text-2xl font-bold flex items-center gap-2">
                <Zap size={22} className="text-yellow-300" />
                {tr.live_bidding}
              </h1>
              <div className="flex gap-2">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={() => setShowPostForm(true)} 
                  className="px-3 lg:px-4 py-2 bg-white text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                >
                  <Plus size={16} /> {tr.post_job}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:gap-3 text-center">
              {[
                { value: stats.open, label: tr.active_jobs },
                { value: stats.total, label: tr.total_posted },
                { value: `+${stats.todayNew}`, label: tr.today_new },
              ].map((stat, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl p-2 lg:p-3">
                  <p className="text-xl lg:text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs opacity-80 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ⭐ Category Filter - 42 Categories in 4 Languages */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm py-2">
            {categoryList.map(cat => (
              <button
                key={cat.key}
                onClick={() => {
                  setFilter(cat.key);
                  startTransition(() => {
                    loadJobs(true);
                  });
                }}
                className={`flex-shrink-0 rounded-xl px-3 py-2 text-center text-xs font-medium transition-all duration-200 ${
                  filter === cat.key 
                    ? 'bg-green-600 text-white shadow-md scale-105' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50 active:bg-green-100'
                }`}
              >
                <cat.icon size={14} className="mx-auto mb-0.5" />
                {cat.name}
              </button>
            ))}
          </div>
          
          {/* Job Grid with Infinite Scroll */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Briefcase size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">{tr.no_active_jobs}</p>
              <button onClick={() => setShowPostForm(true)} 
                className="mt-4 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-colors">
                {tr.post_first_job}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredJobs.map((job: any) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    lang={lang}
                    userPhone={userPhone}
                    onBid={setShowBidForm} 
                    onViewBids={(job: any) => {
                      setShowBids(job);
                      loadBidsForJob(job.id);
                    }} 
                  />
                ))}
              </div>
              
              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="mt-4 text-center py-4">
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-sm">{tr.refreshing}</span>
                  </div>
                ) : hasMore ? (
                  <button 
                    onClick={() => loadJobs(false, true)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    {tr.load_more}
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">{tr.no_more_jobs}</p>
                )}
              </div>
            </>
          )}

          {/* ============ POST JOB MODAL ============ */}
          {showPostForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPostForm(false)}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 z-10">
                  <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                    <Briefcase size={20} className="text-green-600" /> {tr.post_a_job}
                  </h2>
                  <button onClick={() => setShowPostForm(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-2.5">
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder={tr.job_title} 
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                  
                  {/* ⭐ Category Select with Translations */}
                  <select value={category} onChange={e => setCategory(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white">
                    <option value="">{tr.select_category}</option>
                    {Object.entries(CATEGORY_TRANSLATIONS).map(([key, val]) => (
                      <option key={key} value={key}>{val[lang] || val.en}</option>
                    ))}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder={tr.min_budget} type="number"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                    <input value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder={tr.max_budget} type="number"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  </div>
                  
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder={tr.location_area}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input value={dutyTime} onChange={e => setDutyTime(e.target.value)} placeholder={tr.duty_time}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                    <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                      <input type="checkbox" checked={mealProvided} onChange={e => setMealProvided(e.target.checked)} className="w-4 h-4 text-green-600 rounded" />
                      <span className="text-gray-600 text-xs">{tr.meal_provided}</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input value={workerCount} onChange={e => setWorkerCount(e.target.value)} placeholder={tr.workers_needed} type="number"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder={tr.company_name}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  </div>
                  
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={tr.contact_phone} type="tel"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder={tr.job_description} rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none" />
                  
                  <button onClick={postJob} disabled={submitting}
                    className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                    {submitting ? tr.posting : tr.post_job}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============ BID MODAL ============ */}
          {showBidForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowBidForm(null)}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 lg:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto overscroll-contain" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-gray-800">{tr.place_your_bid}</h2>
                  <button onClick={() => setShowBidForm(null)} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-100">
                  <p className="font-semibold text-sm text-gray-800">{showBidForm.title}</p>
                  {/* ⭐ Category Translated in Bid Modal */}
                  <p className="text-xs text-gray-500">{translateCategory(showBidForm.category, lang)} • {showBidForm.location || tr.any_location}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">{showBidForm.budget_min || 0}-{showBidForm.budget_max || 0} {tr.qar}</p>
                  {showBidForm.duty_time && <p className="text-xs text-gray-500 mt-1">🕐 {showBidForm.duty_time}</p>}
                  {showBidForm.meal_provided && <p className="text-xs text-orange-600 mt-1">🍽️ {tr.meal_provided}</p>}
                </div>
                
                <label className="text-xs font-medium text-gray-700 mb-1 block">{tr.bid_amount_label}</label>
                <input value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder={tr.your_price} type="number"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                
                <label className="text-xs font-medium text-gray-700 mb-1 block">{tr.your_message}</label>
                <textarea value={bidMsg} onChange={e => setBidMsg(e.target.value)} placeholder={tr.why_you} rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none" />
                
                <button onClick={() => placeBid(showBidForm.id)} disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all active:scale-[0.98]">
                  <Send size={16} /> {submitting ? tr.submitting : tr.submit_bid}
                </button>
                
                {!userPhone && (
                  <p className="text-xs text-gray-400 text-center mt-3">
                    📱 {tr.login_required}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============ BIDS LIST MODAL ============ */}
          {showBids && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => { setShowBids(null); setBidList([]); }}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 lg:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto overscroll-contain shadow-2xl" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
                  <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {tr.bid_history}
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      {bidList.length} {tr.total_bids}
                    </span>
                  </h2>
                  <button onClick={() => { setShowBids(null); setBidList([]); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Job Info */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 mb-4 border border-gray-100">
                  <p className="font-semibold text-sm text-gray-800">{showBids.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {/* ⭐ Category Translated in Bids Modal */}
                    <span>{translateCategory(showBids.category, lang)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{showBids.location || tr.any_location}</span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    {showBids.budget_min || 0} - {showBids.budget_max || 0} {tr.qar}
                  </p>
                </div>

                {/* Contact Employer Button */}
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium mb-2">{tr.contact_employer}</p>
                  <div className="flex gap-2">
                    <a href={`https://wa.me/${showBids.employer_phone}`} target="_blank" rel="noopener noreferrer" 
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-600 active:scale-[0.98] transition-all">
                      <MessageCircle size={16} /> {tr.whatsapp}
                    </a>
                    <a href={`tel:${showBids.employer_phone}`} 
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-[0.98] transition-all">
                      <Phone size={16} /> {tr.call}
                    </a>
                  </div>
                </div>

                {/* Bids List */}
                {loadingBids ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                          <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bidList.length === 0 ? (
                  <div className="text-center py-8">
                    <Users size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">{tr.no_bids_yet}</p>
                    <p className="text-gray-300 text-xs mt-1">{tr.be_first}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mb-2 pb-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingDown size={12} /> {bidList.length} {tr.bids} • {tr.lowest_bid}: {Math.min(...bidList.map((b: any) => b.amount))} {tr.qar}
                      </p>
                    </div>
                    {bidList.map((bid: any, index: number) => (
                      <BidWorkerCard 
                        key={bid.id} 
                        bid={bid} 
                        isLowest={index === 0}
                        lang={lang}
                        onContact={handleContact}
                      />
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => { setShowBids(null); setBidList([]); }}
                  className="w-full mt-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all sticky bottom-0"
                >
                  {tr.close}
                </button>
              </div>
            </div>
          )}

        </div>
        
      </div>
    </ErrorBoundary>
  );
}