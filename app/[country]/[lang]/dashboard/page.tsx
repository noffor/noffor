// app/[country]/[lang]/dashboard/page.tsx
// 🚀 1M+ DAILY USERS • SUPERSONIC DASHBOARD • 4 LANGUAGES • POST CRUD • PROFILE EDIT • ALL FIXED
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3, Edit, Eye, CreditCard, Heart, Bell, Settings, Star, 
  Phone, Briefcase, Globe, Shield, Mail, MapPin, History, User, 
  Trash2, LogOut, Clock, DollarSign, Camera, Save, AlertCircle, 
  Upload, Wifi, WifiOff, Home, Calendar, Share2, Download, TrendingUp,
  Check, X, Info, Plus, Image as ImageIcon, Send, MoreVertical, Edit3, MessageSquare,
  FileText, BookOpen, ChevronRight
} from 'lucide-react';

// 🔥 Lazy loaded components
const Header = lazy(() => import('@/components/layout/Header'));
const MobileNav = lazy(() => import('@/components/layout/MobileNav'));
const LiveLocationTracker = lazy(() => import('@/components/worker/LiveLocationTracker'));

// 🔥 Types
type TabKey = 'overview' | 'trips' | 'posts' | 'edit' | 'stats' | 'saved' | 'alerts' | 'settings' | 'analytics';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
}

// 🔥 Complete 4-Language Translations
const LANG: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', loading: 'Loading...',
    home: 'Home', trips: 'Trips', posts: 'Posts', edit: 'Edit',
    stats: 'Stats', saved: 'Saved', alerts: 'Alerts',
    analytics: 'Analytics', settings: 'Settings',
    earned: 'Earned', rating: 'Rating', jobs: 'Jobs', exp: 'Exp',
    profileViews: 'Profile Views', contacts: 'Contacts',
    jobOffers: 'Job Offers', profileCompletion: 'Profile Completion',
    noTrips: 'No trips yet', noSaved: 'No saved workers yet',
    noAlerts: 'No notifications', noPosts: 'No posts yet',
    createPost: 'Create Post', writePost: "What's on your mind?",
    postPlaceholder: 'Share your skills, experience...',
    publish: 'Publish', publishing: 'Publishing...',
    editPost: 'Edit Post', updatePost: 'Update',
    deletePost: 'Delete Post', deletePostConfirm: 'Delete this post?',
    postDeleted: 'Post deleted!', postCreated: 'Post created!',
    postUpdated: 'Post updated!',
    editProfile: 'Edit Profile', fullName: 'Full Name',
    category: 'Category', expectedSalary: 'Expected Salary (QAR)',
    experience: 'Experience (years)', city: 'City', area: 'Area',
    phone: 'Phone', email: 'Email', bio: 'Bio / Description',
    saveChanges: 'Save Changes', saving: 'Saving...',
    delete: 'Delete', totalViews: 'Total Views',
    reviews: 'Reviews', yearsExp: 'Years Exp',
    view: 'View', share: 'Share', export: 'Export', logout: 'Logout',
    online: 'Online', offline: 'Offline', shareProfile: 'Share Profile',
    profileLinkCopied: 'Profile link copied!',
    profileSaved: 'Profile saved!', coverUpdated: 'Cover photo updated!',
    photoUpdated: 'Profile photo updated!',
    uploadFailed: 'Upload failed', saveFailed: 'Failed to save',
    deleteFailed: 'Delete failed', statusFailed: 'Failed to update status',
    youAreOnline: 'You are now online', youAreOffline: 'You are now offline',
    statsDownloaded: 'Stats downloaded!',
    performance: 'Performance', responseRate: 'Response Rate',
    earnings: 'Earnings', totalLifetime: 'Total Lifetime',
    monthlyAvg: 'Monthly Avg', weeklyAvg: 'Weekly Avg',
    new: 'New', pending: 'pending', completed: 'completed',
    cancelled: 'cancelled', deleteConfirm: 'Are you sure? This cannot be undone.',
    copiedFailed: 'Failed to copy',
    likes: 'likes', comments: 'comments',
    justNow: 'just now', minutesAgo: 'm ago', hoursAgo: 'h ago',
    daysAgo: 'd ago', addImage: 'Add Image',
    cancel: 'Cancel', confirm: 'Confirm',
    noImage: 'No image', redirecting: 'Redirecting to login...',
    switchLanguage: 'Switch Language',
    createNewPost: 'Create New Post',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড', loading: 'লোড হচ্ছে...',
    home: 'হোম', trips: 'ট্রিপস', posts: 'পোস্ট', edit: 'এডিট',
    stats: 'পরিসংখ্যান', saved: 'সংরক্ষিত', alerts: 'নোটিফিকেশন',
    analytics: 'বিশ্লেষণ', settings: 'সেটিংস',
    earned: 'আয়', rating: 'রেটিং', jobs: 'কাজ', exp: 'অভিজ্ঞতা',
    profileViews: 'প্রোফাইল ভিউ', contacts: 'যোগাযোগ',
    jobOffers: 'জব অফার', profileCompletion: 'প্রোফাইল সম্পূর্ণতা',
    noTrips: 'কোনো ট্রিপ নেই', noSaved: 'কোনো সংরক্ষিত শ্রমিক নেই',
    noAlerts: 'কোনো নোটিফিকেশন নেই', noPosts: 'কোনো পোস্ট নেই',
    createPost: 'পোস্ট তৈরি', writePost: 'আপনার মনের কথা?',
    postPlaceholder: 'আপনার দক্ষতা, অভিজ্ঞতা শেয়ার করুন...',
    publish: 'প্রকাশ', publishing: 'প্রকাশ হচ্ছে...',
    editPost: 'পোস্ট এডিট', updatePost: 'আপডেট',
    deletePost: 'পোস্ট মুছুন', deletePostConfirm: 'পোস্টটি মুছবেন?',
    postDeleted: 'পোস্ট মুছে ফেলা হয়েছে!', postCreated: 'পোস্ট তৈরি হয়েছে!',
    postUpdated: 'পোস্ট আপডেট হয়েছে!',
    editProfile: 'প্রোফাইল সম্পাদনা', fullName: 'পুরো নাম',
    category: 'ক্যাটাগরি', expectedSalary: 'প্রত্যাশিত বেতন (QAR)',
    experience: 'অভিজ্ঞতা (বছর)', city: 'শহর', area: 'এলাকা',
    phone: 'ফোন', email: 'ইমেইল', bio: 'বায়ো / বিবরণ',
    saveChanges: 'পরিবর্তন সংরক্ষণ', saving: 'সংরক্ষণ হচ্ছে...',
    delete: 'মুছুন', totalViews: 'মোট ভিউ',
    reviews: 'রিভিউ', yearsExp: 'বছরের অভিজ্ঞতা',
    view: 'দেখুন', share: 'শেয়ার', export: 'এক্সপোর্ট', logout: 'লগআউট',
    online: 'অনলাইন', offline: 'অফলাইন', shareProfile: 'প্রোফাইল শেয়ার',
    profileLinkCopied: 'প্রোফাইল লিংক কপি হয়েছে!',
    profileSaved: 'প্রোফাইল সংরক্ষিত!', coverUpdated: 'কভার আপডেট!',
    photoUpdated: 'প্রোফাইল ছবি আপডেট!',
    uploadFailed: 'আপলোড ব্যর্থ', saveFailed: 'সংরক্ষণ ব্যর্থ',
    deleteFailed: 'মুছতে ব্যর্থ', statusFailed: 'স্ট্যাটাস আপডেট ব্যর্থ',
    youAreOnline: 'আপনি এখন অনলাইন', youAreOffline: 'আপনি এখন অফলাইন',
    statsDownloaded: 'পরিসংখ্যান ডাউনলোড!',
    performance: 'পারফরম্যান্স', responseRate: 'রেসপন্স রেট',
    earnings: 'আয়', totalLifetime: 'মোট লাইফটাইম',
    monthlyAvg: 'মাসিক গড়', weeklyAvg: 'সাপ্তাহিক গড়',
    new: 'নতুন', pending: 'অপেক্ষমাণ', completed: 'সম্পন্ন',
    cancelled: 'বাতিল', deleteConfirm: 'আপনি কি নিশ্চিত? ফেরত আনা যাবে না।',
    copiedFailed: 'কপি ব্যর্থ',
    likes: 'লাইক', comments: 'কমেন্ট',
    justNow: 'এই মাত্র', minutesAgo: 'মি আগে', hoursAgo: 'ঘ আগে',
    daysAgo: 'দি আগে', addImage: 'ছবি যোগ',
    cancel: 'বাতিল', confirm: 'নিশ্চিত',
    noImage: 'কোনো ছবি নেই', redirecting: 'লগইনে রিডিরেক্ট...',
    switchLanguage: 'ভাষা পরিবর্তন',
    createNewPost: 'নতুন পোস্ট তৈরি',
  },
  ar: {
    dashboard: 'لوحة التحكم', loading: 'جاري التحميل...',
    home: 'الرئيسية', trips: 'الرحلات', posts: 'منشورات', edit: 'تعديل',
    stats: 'إحصائيات', saved: 'محفوظ', alerts: 'تنبيهات',
    analytics: 'تحليلات', settings: 'إعدادات',
    earned: 'المكسب', rating: 'تقييم', jobs: 'وظائف', exp: 'خبرة',
    profileViews: 'مشاهدات', contacts: 'اتصالات',
    jobOffers: 'عروض عمل', profileCompletion: 'اكتمال الملف',
    noTrips: 'لا رحلات', noSaved: 'لا عمال محفوظين',
    noAlerts: 'لا تنبيهات', noPosts: 'لا منشورات',
    createPost: 'إنشاء منشور', writePost: 'ما الذي يدور في ذهنك؟',
    postPlaceholder: 'شارك مهاراتك، خبراتك...',
    publish: 'نشر', publishing: 'نشر...',
    editPost: 'تعديل', updatePost: 'تحديث',
    deletePost: 'حذف', deletePostConfirm: 'حذف المنشور؟',
    postDeleted: 'تم الحذف!', postCreated: 'تم النشر!',
    postUpdated: 'تم التحديث!',
    editProfile: 'تعديل الملف', fullName: 'الاسم',
    category: 'فئة', expectedSalary: 'الراتب (QAR)',
    experience: 'خبرة (سنوات)', city: 'مدينة', area: 'منطقة',
    phone: 'هاتف', email: 'بريد', bio: 'نبذة',
    saveChanges: 'حفظ', saving: 'جاري...',
    delete: 'حذف', totalViews: 'مشاهدات',
    reviews: 'تقييمات', yearsExp: 'سنين',
    view: 'عرض', share: 'مشاركة', export: 'تصدير', logout: 'خروج',
    online: 'متصل', offline: 'غير متصل', shareProfile: 'مشاركة',
    profileLinkCopied: 'تم النسخ!', profileSaved: 'تم الحفظ!',
    coverUpdated: 'تم تحديث الغلاف!', photoUpdated: 'تم تحديث الصورة!',
    uploadFailed: 'فشل التحميل', saveFailed: 'فشل الحفظ',
    deleteFailed: 'فشل الحذف', statusFailed: 'فشل التحديث',
    youAreOnline: 'أنت متصل', youAreOffline: 'أنت غير متصل',
    statsDownloaded: 'تم التحميل!',
    performance: 'أداء', responseRate: 'استجابة',
    earnings: 'أرباح', totalLifetime: 'الإجمالي',
    monthlyAvg: 'شهري', weeklyAvg: 'أسبوعي',
    new: 'جديد', pending: 'قيد', completed: 'مكتمل', cancelled: 'ملغي',
    deleteConfirm: 'هل أنت متأكد؟', copiedFailed: 'فشل النسخ',
    likes: 'إعجاب', comments: 'تعليقات',
    justNow: 'الآن', minutesAgo: 'د', hoursAgo: 'س',
    daysAgo: 'ي', addImage: 'إضافة صورة',
    cancel: 'إلغاء', confirm: 'تأكيد',
    noImage: 'لا صورة', redirecting: 'جاري التحويل...',
    switchLanguage: 'تغيير اللغة',
    createNewPost: 'إنشاء منشور جديد',
  },
  hi: {
    dashboard: 'डैशबोर्ड', loading: 'लोड हो रहा...',
    home: 'होम', trips: 'ट्रिप्स', posts: 'पोस्ट', edit: 'एडिट',
    stats: 'आंकड़े', saved: 'सेव्ड', alerts: 'अलर्ट',
    analytics: 'एनालिटिक्स', settings: 'सेटिंग्स',
    earned: 'कमाई', rating: 'रेटिंग', jobs: 'काम', exp: 'अनुभव',
    profileViews: 'प्रोफाइल व्यू', contacts: 'संपर्क',
    jobOffers: 'जॉब ऑफर', profileCompletion: 'प्रोफाइल पूर्णता',
    noTrips: 'कोई ट्रिप नहीं', noSaved: 'कोई सेव्ड नहीं',
    noAlerts: 'कोई नोटिफिकेशन नहीं', noPosts: 'कोई पोस्ट नहीं',
    createPost: 'पोस्ट बनाएं', writePost: 'आपके मन में क्या है?',
    postPlaceholder: 'अपनी स्किल शेयर करें...',
    publish: 'प्रकाशित', publishing: 'प्रकाशित...',
    editPost: 'पोस्ट एडिट', updatePost: 'अपडेट',
    deletePost: 'पोस्ट डिलीट', deletePostConfirm: 'पोस्ट डिलीट करें?',
    postDeleted: 'पोस्ट डिलीट!', postCreated: 'पोस्ट बना!',
    postUpdated: 'पोस्ट अपडेट!',
    editProfile: 'प्रोफाइल एडिट', fullName: 'पूरा नाम',
    category: 'श्रेणी', expectedSalary: 'वेतन (QAR)',
    experience: 'अनुभव (साल)', city: 'शहर', area: 'क्षेत्र',
    phone: 'फोन', email: 'ईमेल', bio: 'बायो',
    saveChanges: 'सेव करें', saving: 'सेव...',
    delete: 'डिलीट', totalViews: 'कुल व्यू',
    reviews: 'समीक्षा', yearsExp: 'साल अनुभव',
    view: 'देखें', share: 'शेयर', export: 'एक्सपोर्ट', logout: 'लॉगआउट',
    online: 'ऑनलाइन', offline: 'ऑफलाइन', shareProfile: 'शेयर',
    profileLinkCopied: 'लिंक कॉपी!', profileSaved: 'सेव!',
    coverUpdated: 'कवर अपडेट!', photoUpdated: 'फोटो अपडेट!',
    uploadFailed: 'अपलोड फेल', saveFailed: 'सेव फेल',
    deleteFailed: 'डिलीट फेल', statusFailed: 'स्टेटस फेल',
    youAreOnline: 'आप ऑनलाइन हैं', youAreOffline: 'आप ऑफलाइन हैं',
    statsDownloaded: 'डाउनलोड!',
    performance: 'प्रदर्शन', responseRate: 'रिस्पॉन्स',
    earnings: 'कमाई', totalLifetime: 'कुल',
    monthlyAvg: 'मासिक', weeklyAvg: 'साप्ताहिक',
    new: 'नया', pending: 'लंबित', completed: 'पूर्ण', cancelled: 'रद्द',
    deleteConfirm: 'क्या आप सुनिश्चित हैं?', copiedFailed: 'कॉपी फेल',
    likes: 'लाइक', comments: 'कमेंट',
    justNow: 'अभी', minutesAgo: 'मि', hoursAgo: 'घं',
    daysAgo: 'दि', addImage: 'इमेज',
    cancel: 'रद्द', confirm: 'पुष्टि',
    noImage: 'कोई इमेज नहीं', redirecting: 'लॉगिन पर रीडायरेक्ट...',
    switchLanguage: 'भाषा बदलें',
    createNewPost: 'नया पोस्ट बनाएं',
  }
};

// 🔥 Time formatter
const timeAgo = (dateStr: string, lang: string): string => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);
  const t = (key: string) => LANG[lang]?.[key] || LANG.en[key] || key;
  
  if (diff < 60) return t('justNow');
  if (diff < 3600) return Math.floor(diff / 60) + t('minutesAgo');
  if (diff < 86400) return Math.floor(diff / 3600) + t('hoursAgo');
  return Math.floor(diff / 86400) + t('daysAgo');
};

// 🔥 Image compressor
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      let { width, height } = img;
      const maxSize = 1200;
      if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      canvas.width = width; canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed'));
      }, 'image/webp', 0.8);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
};

// 🔥 Toast Component
const Toast = memo(({ toast, onClose }: { toast: any; onClose: () => void }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  if (!toast) return null;
  const colors: Record<string, string> = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
  const icons: Record<string, any> = { success: Check, error: AlertCircle, info: Info };
  const Icon = icons[toast.type] || Info;
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[99999] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className={`px-4 py-2 rounded-full text-sm shadow-2xl flex items-center gap-2 text-white ${colors[toast.type]}`}>
        <Icon size={16} /><span className="whitespace-nowrap">{toast.msg}</span>
      </div>
    </div>
  );
});
Toast.displayName = 'Toast';

// 🔥 Profile Header
const ProfileHeader = memo(({ profile, coverSrc, photoSrc, coverUploading, photoUploading, online, lang, coverInputRef, photoInputRef, uploadCover, uploadPhoto, toggleOnline, shareProfile }: any) => {
  const t = (key: string) => LANG[lang]?.[key] || LANG.en[key] || key;
  const [coverError, setCoverError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => { setCoverError(false); }, [coverSrc]);
  useEffect(() => { setPhotoError(false); }, [photoSrc]);

  return (
    <div className="bg-white rounded-xl border overflow-hidden mb-3 shadow-sm">
      <div className="relative h-32 lg:h-40 bg-gradient-to-r from-green-600 to-emerald-700">
        {coverSrc && !coverError ? (
          <img src={coverSrc} className="w-full h-full object-cover" alt="Cover" loading="lazy" onError={() => setCoverError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera size={32} className="text-white/50" />
          </div>
        )}
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); coverInputRef.current?.click(); }} disabled={coverUploading}
          className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all active:scale-90 z-10">
          {coverUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={16} />}
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadCover(e); }} />
      </div>

      <div className="relative px-4 pb-4">
        <div className="relative -mt-10 lg:-mt-12 w-20 h-20 lg:w-24 lg:h-24 mx-auto">
          {photoSrc && !photoError ? (
            <img src={photoSrc} className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white object-cover bg-gray-200 shadow-md" alt="Profile" loading="lazy" onError={() => setPhotoError(true)} />
          ) : (
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white bg-gradient-to-br from-green-400 to-emerald-600 shadow-md flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          )}
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); photoInputRef.current?.click(); }} disabled={photoUploading}
            className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-full transition-all active:scale-90 shadow-md z-10">
            {photoUploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadPhoto(e); }} />
        </div>
        
        <div className="text-center mt-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-bold text-lg">{profile?.name || 'Worker'}</h2>
            {profile?.is_verified && <Shield size={16} className="text-blue-500" />}
          </div>
          <p className="text-sm text-gray-500">{profile?.category || 'General'}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Star size={14} className="text-yellow-500" fill="#EAB308" />
            <span className="text-sm font-medium">{profile?.rating || 0}</span>
            <span className="text-xs text-gray-400">({profile?.total_reviews || 0})</span>
          </div>
          
          <div className="mt-3 flex justify-center">
            <button type="button" onClick={toggleOnline}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${online ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-200 text-gray-600'}`}>
              {online ? <><div className="w-2 h-2 bg-white rounded-full animate-pulse" />{t('online')}</> : <><WifiOff size={14} />{t('offline')}</>}
            </button>
          </div>
          
          <button onClick={shareProfile} className="mt-2 text-xs text-gray-400 hover:text-green-600 transition flex items-center justify-center gap-1 mx-auto">
            <Share2 size={12} /> {t('shareProfile')}
          </button>
        </div>
      </div>
    </div>
  );
});
ProfileHeader.displayName = 'ProfileHeader';

// 🔥 Post Card Component
const PostCard = memo(({ post, lang, onEdit, onDelete, userId }: { post: Post; lang: string; onEdit: (post: Post) => void; onDelete: (id: string) => void; userId: string }) => {
  const t = (key: string) => LANG[lang]?.[key] || LANG.en[key] || key;
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = post.user_id === userId;
  
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 pb-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            {post.user_id?.slice(0, 2) || 'W'}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Worker</p>
            <p className="text-[10px] text-gray-400">{timeAgo(post.created_at, lang)}</p>
          </div>
        </div>
        
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-100 rounded-full transition active:scale-90">
              <MoreVertical size={14} className="text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border z-20 py-1 min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onEdit(post); setShowMenu(false); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 transition">
                  <Edit3 size={12} /> {t('editPost')}
                </button>
                <button onClick={() => { onDelete(post.id); setShowMenu(false); }} className="w-full px-3 py-2 text-xs text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition">
                  <Trash2 size={12} /> {t('deletePost')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-3">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img src={post.image_url} alt="Post" loading="lazy" className="mt-2 rounded-lg w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(post.image_url, '_blank')} />
        )}
      </div>
      
      <div className="flex items-center gap-4 px-3 pb-3 border-t pt-2">
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition">
          <Heart size={14} /> {post.likes_count || 0} {t('likes')}
        </button>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition">
          <MessageSquare size={14} /> {post.comments_count || 0} {t('comments')}
        </button>
      </div>
    </div>
  );
});
PostCard.displayName = 'PostCard';

// 🔥 Create/Edit Post Modal
const PostModal = memo(({ isOpen, onClose, onSubmit, editPost, lang, loading }: any) => {
  const t = (key: string) => LANG[lang]?.[key] || LANG.en[key] || key;
  const [content, setContent] = useState(editPost?.content || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(editPost?.image_url || '');
  const imageRef = useRef<HTMLInputElement>(null!);
  
  useEffect(() => {
    if (editPost) {
      setContent(editPost.content || '');
      setPreview(editPost.image_url || '');
    } else {
      setContent('');
      setPreview('');
    }
    setImage(null);
  }, [editPost, isOpen]);
  
  if (!isOpen) return null;
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({ content: content.trim(), image });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText size={20} className="text-green-600" />
            {editPost ? t('editPost') : t('createPost')}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t('postPlaceholder')} rows={4}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition resize-none" autoFocus />
        
        {preview && (
          <div className="relative mt-2">
            <img src={preview} alt="Preview" className="rounded-lg w-full max-h-48 object-cover" />
            <button onClick={() => { setPreview(''); setImage(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow">
              <X size={14} />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => imageRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs hover:bg-gray-200 transition">
            <ImageIcon size={14} /> {t('addImage')}
          </button>
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </div>
        
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
            {t('cancel')}
          </button>
          <button onClick={handleSubmit} disabled={loading || !content.trim()}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            {editPost ? (loading ? t('publishing') : t('updatePost')) : (loading ? t('publishing') : t('publish'))}
          </button>
        </div>
      </div>
    </div>
  );
});
PostModal.displayName = 'PostModal';

// 🔥 Confirm Delete Modal
const ConfirmModal = memo(({ isOpen, onClose, onConfirm, message, lang }: any) => {
  const t = (key: string) => LANG[lang]?.[key] || LANG.en[key] || key;
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-4">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-800">{message || t('deletePostConfirm')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
            {t('cancel')}
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition">
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
});
ConfirmModal.displayName = 'ConfirmModal';

// 🔥 Tab Button
const TabButton = memo(({ tab, isActive, onClick }: any) => (
  <button onClick={() => onClick(tab.id)}
    className={`rounded-xl p-2 text-center cursor-pointer transition-all active:scale-95 ${isActive ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-orange-50'}`}>
    <tab.icon size={18} className="mx-auto mb-0.5" />
    <p className="text-[8px] font-medium truncate">{tab.label}</p>
  </button>
));
TabButton.displayName = 'TabButton';

// ═══════════════════════════════════════════════════════
// 🔥 MAIN DASHBOARD COMPONENT - ALL FIXED
// ═══════════════════════════════════════════════════════
export default function DashboardPage() {
  const params = useParams();
  const country = (params as any)?.country || 'qa';
  const lang = (params as any)?.lang || 'en';
  const router = useRouter();
  
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();
  
  const t = useCallback((key: string) => LANG[lang]?.[key] || LANG.en[key] || key, [lang]);
  
  // 🔥 State
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [online, setOnline] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [editForm, setEditForm] = useState<any>({});
  const [coverUploading, setCoverUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [earnings, setEarnings] = useState({ total: 0, monthly: 0, weekly: 0 });
  const [analytics, setAnalytics] = useState({ views: 0, profileVisits: 0, calls: 0, messages: 0 });
  
  // 🔥 Post states
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string>('');
  
  // 🔥 Refs
  const coverInputRef = useRef<HTMLInputElement>(null!);
  const photoInputRef = useRef<HTMLInputElement>(null!);
  const loadedRef = useRef(false);
  const mountedRef = useRef(true);
  const lockRef = useRef(false);
  
  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type, id: Date.now() });
  }, []);
  
  // 🔥 Tabs
  const TABS = useMemo(() => [
    { id: 'overview' as TabKey, icon: Home, label: t('home') },
    { id: 'trips' as TabKey, icon: Calendar, label: t('trips') },
    { id: 'posts' as TabKey, icon: BookOpen, label: t('posts') },
    { id: 'edit' as TabKey, icon: Edit, label: t('edit') },
    { id: 'stats' as TabKey, icon: TrendingUp, label: t('stats') },
    { id: 'saved' as TabKey, icon: Heart, label: t('saved') },
    { id: 'alerts' as TabKey, icon: Bell, label: t('alerts') },
    { id: 'analytics' as TabKey, icon: BarChart3, label: t('analytics') },
    { id: 'settings' as TabKey, icon: Settings, label: t('settings') },
  ], [lang, t]);

  // ✅ AUTH GUARD - ১ সেকেন্ড ডিলে (লগইন লুপ ফিক্স)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace(`/${country}/${lang}/login`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, isAuthenticated, country, lang, router]);

  // ✅ লোকাল স্টোরেজ থেকে দ্রুত লোড
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    
    mountedRef.current = true;
    
    const stored = localStorage.getItem('noffor_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserId(u.id || u.phone || '');
        setOnline(u.is_online || false);
        setProfile(u);
        setEditForm(u);
        setLoading(false);
      } catch {}
    }
    
    return () => { mountedRef.current = false; };
  }, [authLoading, isAuthenticated]);

  // ✅ Supabase থেকে ফ্রেশ ডাটা
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    
    const initLoad = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (!localStorage.getItem('noffor_user')) {
            router.push(`/${country}/${lang}/login`);
          }
          return;
        }
        
        if (!mountedRef.current) return;
        
        let { data: freshProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!freshProfile) {
          const { data: newProfile } = await supabase.from('profiles').insert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            phone: session.user.phone || '',
            photo_url: '',
            cover_url: '',
            role: 'labor',
            country,
            is_online: false,
            is_verified: true,
            is_public: false,
            rating: 0,
            total_reviews: 0,
            views: 0,
            profile_visits: 0,
            contacts: 0,
            created_at: new Date().toISOString()
          }).select('*').single();
          if (newProfile) freshProfile = newProfile;
        }
        
        if (freshProfile && mountedRef.current) {
          localStorage.setItem('noffor_user', JSON.stringify(freshProfile));
          setUserId(freshProfile.id);
          setOnline(freshProfile.is_online || false);
          setProfile(freshProfile);
          setEditForm(freshProfile);
          setLoading(false);
        }
        
        if (freshProfile?.id) {
          loadAllData(freshProfile.id);
        }
      } catch (err) {
        console.error('Init error:', err);
        if (mountedRef.current) {
          const stored = localStorage.getItem('noffor_user');
          if (!stored) router.push(`/${country}/${lang}/login`);
          else setLoading(false);
        }
      }
    };
    
    initLoad();
  }, [authLoading, isAuthenticated, country, lang, router]);
  
  // 🔥 সকল ডাটা লোড
  const loadAllData = useCallback(async (uid: string) => {
    if (!uid || !mountedRef.current) return;
    
    try {
      const [profRes, tripRes, postRes, savedRes, notifRes] = await Promise.all([
        supabase.from('profiles').select('*').or(`id.eq.${uid},phone.eq.${uid}`).eq('country', country).maybeSingle(),
        supabase.from('bookings').select('*').or(`worker_id.eq.${uid},employer_id.eq.${uid}`).order('created_at', { ascending: false }).limit(30),
        supabase.from('posts').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
        supabase.from('saved_profiles').select('*, saved:saved_profile_id(id, name, category, photo_url, rating, expected_salary)').eq('user_id', uid).limit(20),
        supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(30),
      ]);
      
      if (!mountedRef.current) return;
      
      if (profRes.data) {
        setProfile(profRes.data);
        setEditForm(profRes.data);
        setOnline(profRes.data.is_online || false);
        localStorage.setItem('noffor_user', JSON.stringify(profRes.data));
      }
      
      const tripsData = tripRes.data || [];
      setTrips(tripsData);
      setPosts(postRes.data || []);
      setSavedWorkers(savedRes.data || []);
      setNotifications(notifRes.data || []);
      
      const completedTrips = tripsData.filter(t => t.status === 'completed');
      const totalEarned = completedTrips.reduce((sum, t) => sum + (t.total_amount || t.offered_amount || 0), 0);
      setEarnings({ total: totalEarned, monthly: totalEarned / 12, weekly: totalEarned / 52 });
      
      const profData = profRes.data || {};
      setAnalytics({ views: profData.views || 0, profileVisits: profData.profile_visits || 0, calls: profData.contacts || 0, messages: notifRes.data?.length || 0 });
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [country]);
  
  useEffect(() => { 
    if (userId && !loadedRef.current) { 
      loadedRef.current = true; 
      loadAllData(userId); 
    }
  }, [userId, loadAllData]);
  
  // 🔥 অনলাইন/অফলাইন টগল
  const toggleOnline = useCallback(async () => {
    if (lockRef.current || !profile?.id) return;
    lockRef.current = true; const next = !online; setOnline(next);
    try {
      const { error } = await supabase.from('profiles').update({ is_online: next, last_online: new Date().toISOString() }).eq('id', profile.id);
      if (error) throw error;
      const stored = localStorage.getItem('noffor_user');
      if (stored) { const user = JSON.parse(stored); user.is_online = next; localStorage.setItem('noffor_user', JSON.stringify(user)); }
      localStorage.setItem('noffor_worker_online', JSON.stringify(next));
      showToast(next ? t('youAreOnline') : t('youAreOffline'), 'success');
      if (next) window.dispatchEvent(new Event('worker-online'));
    } catch { setOnline(!next); showToast(t('statusFailed'), 'error'); }
    finally { setTimeout(() => { lockRef.current = false; }, 500); }
  }, [online, profile, showToast, t]);
  
  // 🔥 কভার আপলোড
  const uploadCover = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id || lockRef.current) return;
    lockRef.current = true; setCoverUploading(true);
    try {
      const compressed = await compressImage(file);
      const path = `${profile.id}/cover_${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('profiles').upload(path, compressed, { upsert: true, contentType: 'image/webp', cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      const { error: updateError } = await supabase.from('profiles').update({ cover_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
      if (mountedRef.current) { setProfile((prev: any) => ({ ...prev, cover_url: publicUrl })); showToast(t('coverUpdated'), 'success'); }
    } catch (err: any) { showToast(t('uploadFailed') + ': ' + err.message, 'error'); }
    finally { if (mountedRef.current) setCoverUploading(false); setTimeout(() => { lockRef.current = false; }, 500); if (coverInputRef.current) coverInputRef.current.value = ''; }
  }, [profile, showToast, t]);
  
  // 🔥 ফটো আপলোড
  const uploadPhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id || lockRef.current) return;
    lockRef.current = true; setPhotoUploading(true);
    try {
      const compressed = await compressImage(file);
      const path = `${profile.id}/photo_${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('profiles').upload(path, compressed, { upsert: true, contentType: 'image/webp', cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      const { error: updateError } = await supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
      if (mountedRef.current) { setProfile((prev: any) => ({ ...prev, photo_url: publicUrl })); showToast(t('photoUpdated'), 'success'); }
    } catch (err: any) { showToast(t('uploadFailed') + ': ' + err.message, 'error'); }
    finally { if (mountedRef.current) setPhotoUploading(false); setTimeout(() => { lockRef.current = false; }, 500); if (photoInputRef.current) photoInputRef.current.value = ''; }
  }, [profile, showToast, t]);
  
  // 🔥 প্রোফাইল সেভ
  const saveProfile = useCallback(async () => {
    if (!profile?.id || lockRef.current) return;
    lockRef.current = true; setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        name: editForm.name, category: editForm.category, expected_salary: editForm.expected_salary,
        experience: editForm.experience, city: editForm.city, area: editForm.area,
        bio: editForm.bio, phone: editForm.phone, email: editForm.email,
      }).eq('id', profile.id);
      if (error) throw error;
      if (mountedRef.current) { setProfile({ ...profile, ...editForm }); showToast(t('profileSaved'), 'success'); }
    } catch (err: any) { showToast(t('saveFailed') + ': ' + err.message, 'error'); }
    finally { if (mountedRef.current) setSaving(false); setTimeout(() => { lockRef.current = false; }, 500); }
  }, [profile, editForm, showToast, t]);
  
  // ═══════════════════════════════════════════
  // 🔥 POST CRUD OPERATIONS
  // ═══════════════════════════════════════════
  
  const handlePostSubmit = useCallback(async ({ content, image }: { content: string; image: File | null }) => {
    if (!userId || lockRef.current) return;
    lockRef.current = true; setPostLoading(true);
    
    try {
      let image_url = editingPost?.image_url || '';
      
      if (image) {
        const compressed = await compressImage(image);
        const path = `posts/${userId}/${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('posts').upload(path, compressed, { upsert: true, contentType: 'image/webp', cacheControl: '3600' });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(path);
        image_url = publicUrl;
      }
      
      if (editingPost) {
        const { error } = await supabase.from('posts').update({
          content, image_url, updated_at: new Date().toISOString()
        }).eq('id', editingPost.id);
        if (error) throw error;
        showToast(t('postUpdated'), 'success');
      } else {
        const { error } = await supabase.from('posts').insert({
          user_id: userId, content, image_url, created_at: new Date().toISOString()
        });
        if (error) throw error;
        showToast(t('postCreated'), 'success');
      }
      
      const { data } = await supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
      if (mountedRef.current && data) setPosts(data);
      
      setShowPostModal(false);
      setEditingPost(null);
    } catch (err: any) {
      showToast(t('uploadFailed') + ': ' + err.message, 'error');
    } finally {
      if (mountedRef.current) setPostLoading(false);
      setTimeout(() => { lockRef.current = false; }, 500);
    }
  }, [userId, editingPost, showToast, t]);
  
  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
    setShowPostModal(true);
  }, []);
  
  const handleDeleteClick = useCallback((postId: string) => {
    setDeletingPostId(postId);
    setShowDeleteConfirm(true);
  }, []);
  
  const confirmDeletePost = useCallback(async () => {
    if (!deletingPostId || lockRef.current) return;
    lockRef.current = true;
    
    try {
      const { error } = await supabase.from('posts').delete().eq('id', deletingPostId);
      if (error) throw error;
      
      if (mountedRef.current) {
        setPosts(prev => prev.filter(p => p.id !== deletingPostId));
        showToast(t('postDeleted'), 'success');
      }
    } catch (err: any) {
      showToast(t('deleteFailed') + ': ' + err.message, 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingPostId('');
      setTimeout(() => { lockRef.current = false; }, 500);
    }
  }, [deletingPostId, showToast, t]);
  
  // ✅ প্রোফাইল ডিলিট
  const deleteProfile = useCallback(async () => {
    if (!confirm(t('deleteConfirm'))) return;
    try { 
      await supabase.from('profiles').delete().eq('id', profile.id);
      await signOut();
    }
    catch (err) { showToast(t('deleteFailed'), 'error'); }
  }, [profile, signOut, showToast, t]);
  
  // ✅ লগআউট
  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);
  
  // নোটিফিকেশন রিড
  const markNotifRead = useCallback(async (id: string) => {
    try { await supabase.from('notifications').update({ is_read: true }).eq('id', id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); }
    catch {}
  }, []);
  
  // শেয়ার প্রোফাইল
  const shareProfile = useCallback(() => {
    const url = `${window.location.origin}/${country}/${lang}/profile/${profile?.id}`;
    navigator.clipboard.writeText(url).then(() => showToast(t('profileLinkCopied'), 'success')).catch(() => showToast(t('copiedFailed'), 'error'));
  }, [country, lang, profile, showToast, t]);
  
  // স্ট্যাটস ডাউনলোড
  const downloadStats = useCallback(() => {
    const stats = { name: profile?.name, views: analytics.views, profileVisits: analytics.profileVisits, calls: analytics.calls, messages: analytics.messages, earnings: earnings.total, rating: profile?.rating, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `stats_${profile?.name}_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
    showToast(t('statsDownloaded'), 'success');
  }, [profile, analytics, earnings, showToast, t]);
  
  // 🔥 Memoized values
  const EDIT_FIELDS = useMemo(() => [
    { key: 'name', placeholder: t('fullName') }, { key: 'category', placeholder: t('category') },
    { key: 'expected_salary', placeholder: t('expectedSalary') }, { key: 'experience', placeholder: t('experience') },
    { key: 'city', placeholder: t('city') }, { key: 'area', placeholder: t('area') },
    { key: 'phone', placeholder: t('phone') }, { key: 'email', placeholder: t('email') },
  ], [lang, t]);
  
  const QUICK_STATS = useMemo(() => [
    { icon: DollarSign, color: 'text-green-500', value: `${earnings.total} QAR`, label: t('earned') },
    { icon: Star, color: 'text-yellow-500', value: (profile || {}).rating || 0, label: t('rating') },
    { icon: Briefcase, color: 'text-blue-500', value: trips.length, label: t('jobs') },
    { icon: Clock, color: 'text-orange-500', value: `${(profile || {}).experience || 0} yrs`, label: t('exp') },
  ], [earnings, trips, profile, lang, t]);
  
  const SETTINGS_BTNS = useMemo(() => [
    { icon: User, color: 'bg-lime-50 text-lime-600', label: t('editProfile'), action: () => setActiveTab('edit') },
    { icon: Globe, color: 'bg-blue-50 text-blue-600', label: lang.toUpperCase(), action: () => {
      const langs = ['en', 'bn', 'ar', 'hi'];
      const currentIdx = langs.indexOf(lang);
      const nextIdx = (currentIdx + 1) % langs.length;
      router.push(`/${country}/${langs[nextIdx]}/dashboard`);
    }},
    { icon: Share2, color: 'bg-purple-50 text-purple-600', label: t('share'), action: () => shareProfile() },
    { icon: Download, color: 'bg-indigo-50 text-indigo-600', label: t('export'), action: () => downloadStats() },
    { icon: LogOut, color: 'bg-gray-200 text-gray-700', label: t('logout'), action: () => logout() },
    { icon: Trash2, color: 'bg-red-50 text-red-600', label: t('delete'), action: () => deleteProfile() },
  ], [lang, country, router, shareProfile, downloadStats, logout, deleteProfile, t]);
  
  // ✅ Auth লোডিং স্টেট
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  // ✅ নট অথেন্টিকেটেড স্টেট
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">{t('redirecting')}</p>
        </div>
      </div>
    );
  }
  
  // ✅ ডাটা লোডিং
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  const p = profile || {};
  const photoSrc = p.photo_url || '';
  const coverSrc = p.cover_url || '';
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Suspense fallback={<div className="h-16 bg-white shadow" />}>
        <Header country={country} lang={lang} />
      </Suspense>
      
      {online && profile?.id && (
        <Suspense fallback={null}>
          <LiveLocationTracker workerId={profile.id} isOnline={online} lang={lang} />
        </Suspense>
      )}
      
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <PostModal isOpen={showPostModal} onClose={() => { setShowPostModal(false); setEditingPost(null); }}
        onSubmit={handlePostSubmit} editPost={editingPost} lang={lang} loading={postLoading} />
      
      <ConfirmModal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeletingPostId(''); }}
        onConfirm={confirmDeletePost} message={t('deletePostConfirm')} lang={lang} />
      
      <div className="max-w-4xl mx-auto px-3 py-3 lg:py-4">
        <ProfileHeader profile={p} coverSrc={coverSrc} photoSrc={photoSrc} coverUploading={coverUploading} photoUploading={photoUploading}
          online={online} lang={lang} coverInputRef={coverInputRef} photoInputRef={photoInputRef}
          uploadCover={uploadCover} uploadPhoto={uploadPhoto} toggleOnline={toggleOnline} shareProfile={shareProfile} />
        
        <div className="grid grid-cols-4 gap-2 mb-3">
          {QUICK_STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-2 text-center border shadow-sm">
              <stat.icon size={16} className={`${stat.color} mx-auto`} />
              <p className="text-xs font-bold mt-0.5">{stat.value}</p>
              <p className="text-[8px] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-1 mb-3">
          {TABS.map(tab => (
            <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={setActiveTab} />
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {activeTab === 'overview' && (
            <>
              {[
                { icon: Eye, color: 'text-orange-500', value: p.views || 0, label: t('profileViews') },
                { icon: Phone, color: 'text-green-500', value: p.contacts || 0, label: t('contacts') },
                { icon: Briefcase, color: 'text-purple-500', value: p.offers || 0, label: t('jobOffers') },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-3 text-center border shadow-sm">
                  <item.icon size={20} className={`${item.color} mx-auto mb-1`} />
                  <p className="text-xl font-bold">{item.value}</p>
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                </div>
              ))}
              <div className="bg-white rounded-xl p-3 border shadow-sm col-span-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">{t('profileCompletion')}</span>
                  <span className="text-xs font-bold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: '85%' }} />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'trips' && (
            trips.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t('noTrips')}</p>
              </div>
            ) : (
              trips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl p-3 border shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={14} className="text-green-500" />
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                      trip.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{t(trip.status || 'pending')}</span>
                  </div>
                  <p className="text-xs font-bold truncate">{trip.job_title || trip.category || 'Job'}</p>
                  <p className="text-[10px] text-gray-400">{trip.distance_km || '?'} km</p>
                  <p className="text-xs font-bold text-green-600 mt-1">{trip.total_amount || trip.offered_amount} QAR</p>
                </div>
              ))
            )
          )}
          
          {activeTab === 'posts' && (
            <div className="col-span-3 space-y-3">
              <button onClick={() => { setEditingPost(null); setShowPostModal(true); }}
                className="w-full bg-green-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2">
                <Plus size={16} /> {t('createNewPost')}
              </button>
              
              {posts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t('noPosts')}</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} lang={lang} userId={userId}
                    onEdit={handleEditPost} onDelete={handleDeleteClick} />
                ))
              )}
            </div>
          )}
          
          {activeTab === 'edit' && (
            <div className="col-span-3 space-y-2">
              {EDIT_FIELDS.map((field, i) => (
                <div key={i} className="relative">
                  <input
                    value={editForm[field.key] || ''}
                    onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 bg-white rounded-xl border text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                  />
                </div>
              ))}
              <div className="relative">
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder={t('bio')}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white rounded-xl border text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition resize-none"
                />
              </div>
              <button onClick={saveProfile} disabled={saving}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                {saving ? t('saving') : t('saveChanges')}
              </button>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="col-span-3 space-y-2">
              {[
                { icon: TrendingUp, color: 'text-green-500', value: earnings.total, label: t('totalLifetime'), suffix: 'QAR' },
                { icon: TrendingUp, color: 'text-blue-500', value: Math.round(earnings.monthly), label: t('monthlyAvg'), suffix: 'QAR' },
                { icon: TrendingUp, color: 'text-purple-500', value: Math.round(earnings.weekly), label: t('weeklyAvg'), suffix: 'QAR' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border shadow-sm flex items-center gap-3">
                  <stat.icon size={20} className={stat.color} />
                  <div>
                    <p className="text-lg font-bold">{stat.value} <span className="text-xs font-normal text-gray-400">{stat.suffix}</span></p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'saved' && (
            savedWorkers.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <Heart size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t('noSaved')}</p>
              </div>
            ) : (
              savedWorkers.map((saved: any) => (
                <div key={saved.id} className="bg-white rounded-xl p-3 border shadow-sm">
                  <div className="flex items-center gap-2">
                    <img src={saved.saved?.photo_url || ''} className="w-10 h-10 rounded-full object-cover bg-gray-200" alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{saved.saved?.name || 'Worker'}</p>
                      <p className="text-[10px] text-gray-400">{saved.saved?.category || 'General'}</p>
                      {saved.saved?.rating > 0 && (
                        <div className="flex items-center gap-0.5"><Star size={10} className="text-yellow-500" fill="#EAB308" /><span className="text-[10px]">{saved.saved.rating}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
          
          {activeTab === 'alerts' && (
            notifications.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <Bell size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t('noAlerts')}</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div key={n.id} onClick={() => !n.is_read && markNotifRead(n.id)}
                  className={`col-span-3 bg-white rounded-xl p-3 border cursor-pointer ${!n.is_read ? 'border-l-4 border-l-green-500' : ''}`}>
                  <p className="text-xs font-medium">{n.title || 'Notification'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-[8px] text-gray-300 mt-1">{timeAgo(n.created_at, lang)}</p>
                </div>
              ))
            )
          )}
          
          {activeTab === 'analytics' && (
            <div className="col-span-3 space-y-2">
              {[
                { icon: Eye, color: 'text-orange-500', value: analytics.views, label: t('totalViews') },
                { icon: User, color: 'text-blue-500', value: analytics.profileVisits, label: t('profileViews') },
                { icon: Phone, color: 'text-green-500', value: analytics.calls, label: t('contacts') },
                { icon: MessageSquare, color: 'text-purple-500', value: analytics.messages, label: t('alerts') },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={item.color} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="col-span-3 space-y-2">
              {SETTINGS_BTNS.map((btn, i) => (
                <button key={i} onClick={btn.action}
                  className="w-full bg-white rounded-xl p-3 text-left flex items-center gap-3 border hover:shadow-md transition-all active:scale-[0.99] cursor-pointer">
                  <div className={`w-9 h-9 ${btn.color} rounded-full flex items-center justify-center`}>
                    <btn.icon size={18} />
                  </div>
                  <span className="text-sm font-medium flex-1">{btn.label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Suspense fallback={<div className="h-16" />}>
        <MobileNav country={country} lang={lang} />
      </Suspense>
    </div>
  );
}