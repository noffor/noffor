// app/[country]/[lang]/dashboard/employer/page.tsx
// 🚀 SUPER SONIC • ১ বিলিয়ন ইউজার • জিরো ল্যাগ • ওয়েবপি • ফুল ফিচার
"use client";
import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { 
  BarChart3, Edit, Eye, Heart, Bell, Settings, Star, Phone, Briefcase, 
  Plus, Search, MapPin, Clock, DollarSign, User, Trash2, LogOut, Save, 
  X, Check, Globe, MessageCircle, Award, TrendingUp, Filter, 
  Download, Share2, Flag, CreditCard, Shield, Calendar, Upload,
  Camera, Info, Send, AlertTriangle, CheckCircle, Package, Truck
} from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

// Types
type TabKey = 'overview' | 'jobs' | 'post' | 'saved' | 'alerts' | 'settings' | 'inbox' | 'analytics';
type LangKey = 'en' | 'bn' | 'ar' | 'hi';
type JobStatus = 'open' | 'closed' | 'filled' | 'expired';
type NotificationType = 'bid' | 'message' | 'job_update' | 'payment' | 'rating';

interface JobPost {
  id: string;
  title: string;
  category: string;
  budget_min: number;
  budget_max: number;
  location: string;
  description: string;
  phone: string;
  worker_count: number;
  employer_phone: string;
  employer_name: string;
  status: JobStatus;
  country: string;
  created_at: string;
  expires_at: string;
  bids: { count: number }[];
  views: number;
  share_count: number;
}

interface Message {
  id: string;
  from_id: string;
  to_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_photo: string;
}

interface Bid {
  id: string;
  job_id: string;
  worker_id: string;
  worker_name: string;
  worker_photo: string;
  worker_rating: number;
  offered_amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface Worker {
  id: string;
  name: string;
  category: string;
  photo_url: string;
  rating: number;
  expected_salary: number;
  experience: number;
  city: string;
  is_verified: boolean;
  online: boolean;
}

// Optimized Image Component with WebP
const OptimizedImage = memo(({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <img 
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setImgSrc('/default-avatar.png')}
    />
  );
});
OptimizedImage.displayName = 'OptimizedImage';

export default function EmployerDashboard() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const router = useRouter();
  
  // State Management
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '', category: '', budget_min: '', budget_max: '', 
    location: '', description: '', phone: '', worker_count: '1',
    expires_in: '7'
  });
  const [posting, setPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedBids, setSelectedBids] = useState<Bid[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'filled'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'budget_high' | 'budget_low'>('newest');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalViews: 0, totalBids: 0, hiredWorkers: 0, totalSpent: 0,
    avgResponseTime: 0, completionRate: 0
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const t = (key: string) => getText(lang as LangCode, key);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const L = useCallback((key: string) => {
    const labels: Record<string, Record<string, string>> = {
      overview: { en: 'Overview', bn: 'ওভারভিউ', ar: 'نظرة عامة', hi: 'अवलोकन' },
      jobs: { en: 'My Jobs', bn: 'আমার জব', ar: 'وظائفي', hi: 'मेरी जॉब्स' },
      post: { en: 'Post Job', bn: 'জব পোস্ট', ar: 'نشر وظيفة', hi: 'जॉब पोस्ट' },
      saved: { en: 'Saved', bn: 'সেভ', ar: 'محفوظ', hi: 'सहेजा' },
      alerts: { en: 'Alerts', bn: 'এলার্ট', ar: 'تنبيهات', hi: 'अलर्ट' },
      settings: { en: 'Settings', bn: 'সেটিংস', ar: 'إعدادات', hi: 'सेटिंग्स' },
      inbox: { en: 'Inbox', bn: 'ইনবক্স', ar: 'صندوق الوارد', hi: 'इनबॉक्स' },
      analytics: { en: 'Analytics', bn: 'অ্যানালিটিক্স', ar: 'تحليلات', hi: 'एनालिटिक्स' },
      search: { en: 'Search Workers', bn: 'শ্রমিক খুঁজুন', ar: 'بحث عن عمال', hi: 'श्रमिक खोजें' },
      logout: { en: 'Logout', bn: 'লগআউট', ar: 'خروج', hi: 'लॉगआउट' },
      noData: { en: 'No data found', bn: 'কোনো ডাটা নেই', ar: 'لا توجد بيانات', hi: 'कोई डेटा नहीं' },
      posted: { en: 'Job posted successfully!', bn: 'জব পোস্ট হয়েছে!', ar: 'تم نشر الوظيفة!', hi: 'जॉब पोस्ट हो गया!' },
      delete: { en: 'Delete', bn: 'ডিলিট', ar: 'حذف', hi: 'हटाएं' },
      save: { en: 'Save Changes', bn: 'সেভ', ar: 'حفظ', hi: 'सहेजें' },
      cancel: { en: 'Cancel', bn: 'বাতিল', ar: 'إلغاء', hi: 'रद्द' },
      edit: { en: 'Edit Job', bn: 'এডিট', ar: 'تعديل', hi: 'संपादन' },
      close: { en: 'Close Job', bn: 'ক্লোজ', ar: 'إغلاق', hi: 'बंद करें' },
      bids: { en: 'Bids', bn: 'বিড', ar: 'عروض', hi: 'बोलियां' },
      message: { en: 'Message', bn: 'মেসেজ', ar: 'رسالة', hi: 'संदेश' },
      hire: { en: 'Hire', bn: 'হায়ার', ar: 'توظيف', hi: 'किराए पर लें' },
      verified: { en: 'Verified', bn: 'ভেরিফাইড', ar: 'موثق', hi: 'सत्यापित' },
      online: { en: 'Online', bn: 'অনলাইন', ar: 'متصل', hi: 'ऑनलाइन' },
      offline: { en: 'Offline', bn: 'অফলাইন', ar: 'غير متصل', hi: 'ऑफलाइन' },
      employer: { en: 'Employer', bn: 'নিয়োগকর্তা', ar: 'صاحب العمل', hi: 'नियोक्ता' }
    };
    return labels[key]?.[lang as LangKey] || labels[key]?.en || key;
  }, [lang]);

  // Load user from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('noffor_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id || u.phone);
      setPostForm(prev => ({ ...prev, phone: u.phone || '' }));
    } else {
      router.push(`/${country}/${lang}/login`);
    }
  }, []);

  // Load all data
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    loadAll();
  }, [userId, country]);

  const loadAll = async () => {
    try {
      const [prof, jobData, savedData, notifData, msgData, bidData] = await Promise.all([
        supabase.from('profiles').select('*').or(`id.eq.${userId},phone.eq.${userId}`).eq('country', country).single(),
        supabase.from('job_posts').select('*, bids:job_bids(count)').eq('employer_phone', userId).order('created_at', { ascending: false }),
        supabase.from('saved_profiles').select('*, saved:saved_profile_id(*)').eq('user_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
        supabase.from('messages').select('*').or(`from_id.eq.${userId},to_id.eq.${userId}`).order('created_at', { ascending: false }).limit(100),
        supabase.from('job_bids').select('*, worker:worker_id(name,photo_url,rating)').eq('employer_id', userId).order('created_at', { ascending: false })
      ]);
      
      if (prof.data) { setProfile(prof.data); setEditForm(prof.data); }
      setJobs(jobData.data || []);
      setSavedWorkers(savedData.data || []);
      setNotifications(notifData.data || []);
      setMessages(msgData.data || []);
      setBids(bidData.data || []);
      
      // Calculate analytics
      const totalViews = (jobData.data || []).reduce((sum, j) => sum + (j.views || 0), 0);
      const totalBids = (jobData.data || []).reduce((sum, j) => sum + (j.bids?.[0]?.count || 0), 0);
      setAnalytics({
        totalViews, totalBids, hiredWorkers: 0, totalSpent: 0,
        avgResponseTime: 0, completionRate: 0
      });
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload image with WebP compression
  const uploadImage = async (file: File, type: 'photo' | 'cover'): Promise<string | null> => {
    if (!profile?.id) return null;
    
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return null;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return null;
    }

    const compressed = await compressImage(file);
    const ext = 'webp';
    const path = `${profile.id}/${type}_${Date.now()}.${ext}`;
    
    const { error } = await supabase.storage
      .from('profiles')
      .upload(path, compressed, { upsert: true, contentType: 'image/webp' });
    
    if (error) {
      showToast(`Upload failed: ${error.message}`, 'error');
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
    return publicUrl;
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width, height = img.height;
          const maxSize = 800;
          
          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob!], file.name, { type: 'image/webp' }));
          }, 'image/webp', 0.8);
        };
      };
    });
  };

  const updateProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const url = await uploadImage(file, 'photo');
    if (url) {
      await supabase.from('profiles').update({ photo_url: url }).eq('id', profile.id);
      setProfile({ ...profile, photo_url: url });
      showToast('Profile photo updated!', 'success');
    }
    setPhotoUploading(false);
  };

  const updateCoverPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    const url = await uploadImage(file, 'cover');
    if (url) {
      await supabase.from('profiles').update({ cover_url: url }).eq('id', profile.id);
      setProfile({ ...profile, cover_url: url });
      showToast('Cover photo updated!', 'success');
    }
    setCoverUploading(false);
  };

  const saveProfile = async () => {
    if (!profile?.id) return;
    setSaving(true);
    await supabase.from('profiles').update(editForm).eq('id', profile.id);
    setProfile({ ...profile, ...editForm });
    showToast('Profile saved!', 'success');
    setSaving(false);
  };

  // Post Job with validation
  const postJob = async () => {
    if (!postForm.title || !postForm.category || !postForm.phone) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    setPosting(true);
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + parseInt(postForm.expires_in));
    
    const { error } = await supabase.from('job_posts').insert({
      ...postForm,
      budget_min: parseInt(postForm.budget_min) || 0,
      budget_max: parseInt(postForm.budget_max) || 0,
      worker_count: parseInt(postForm.worker_count) || 1,
      country, employer_phone: postForm.phone,
      employer_name: profile?.name || 'Employer',
      status: 'open', profile_language: lang,
      expires_at: expires_at.toISOString(),
      views: 0, share_count: 0
    });
    
    if (error) {
      showToast('Failed to post job: ' + error.message, 'error');
    } else {
      setShowPostForm(false);
      setPostForm({ title: '', category: '', budget_min: '', budget_max: '', location: '', description: '', phone: userId, worker_count: '1', expires_in: '7' });
      showToast(L('posted'), 'success');
      loadAll();
    }
    setPosting(false);
  };

  // Edit Job
  const updateJob = async () => {
    if (!editingJob) return;
    const { error } = await supabase
      .from('job_posts')
      .update({
        title: editingJob.title,
        category: editingJob.category,
        budget_min: editingJob.budget_min,
        budget_max: editingJob.budget_max,
        location: editingJob.location,
        description: editingJob.description,
        worker_count: editingJob.worker_count,
        status: editingJob.status
      })
      .eq('id', editingJob.id);
    
    if (error) {
      showToast('Update failed', 'error');
    } else {
      showToast('Job updated!', 'success');
      setEditingJob(null);
      loadAll();
    }
  };

  // Delete Job
  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    const { error } = await supabase.from('job_posts').delete().eq('id', id);
    if (error) {
      showToast('Delete failed', 'error');
    } else {
      showToast('Job deleted', 'success');
      loadAll();
    }
  };

  // Close/Open Job
  const toggleJobStatus = async (job: JobPost) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    const { error } = await supabase
      .from('job_posts')
      .update({ status: newStatus })
      .eq('id', job.id);
    
    if (!error) {
      showToast(`Job ${newStatus === 'open' ? 'opened' : 'closed'}`, 'success');
      loadAll();
    }
  };

  // Search Workers with debounce
  const searchWorkers = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('country', country)
      .eq('user_type', 'worker')
      .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
      .limit(50);
    setSearchResults(data || []);
    setSearching(false);
  }, [searchQuery, country]);

  // Send Message
  const sendMessage = async () => {
    if (!selectedWorker || !messageText.trim()) return;
    setSendingMessage(true);
    
    const { error } = await supabase.from('messages').insert({
      from_id: userId,
      to_id: selectedWorker.id,
      message: messageText,
      is_read: false,
      created_at: new Date().toISOString(),
      sender_name: profile?.name,
      sender_photo: profile?.photo_url
    });
    
    if (error) {
      showToast('Failed to send message', 'error');
    } else {
      showToast('Message sent!', 'success');
      setMessageText('');
      setShowMessageModal(false);
      loadAll();
    }
    setSendingMessage(false);
  };

  // Accept Bid
  const acceptBid = async (bid: Bid) => {
    const { error } = await supabase
      .from('job_bids')
      .update({ status: 'accepted' })
      .eq('id', bid.id);
    
    if (!error) {
      await supabase.from('job_posts').update({ status: 'filled' }).eq('id', bid.job_id);
      showToast('Bid accepted! Worker hired.', 'success');
      loadAll();
    }
  };

  // Share Job
  const shareJob = (job: JobPost) => {
    const url = `${window.location.origin}/${country}/${lang}/job/${job.id}`;
    navigator.clipboard.writeText(url);
    showToast('Job link copied to clipboard!', 'success');
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('noffor_user');
    localStorage.removeItem('noffor_worker');
    localStorage.removeItem('noffor_worker_online');
    localStorage.removeItem('noffor_employer');
    sessionStorage.clear();
    router.push(`/${country}/${lang}/login`);
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(j => j.status === filterStatus);
    }
    
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'budget_high':
        filtered.sort((a, b) => (b.budget_max || 0) - (a.budget_max || 0));
        break;
      case 'budget_low':
        filtered.sort((a, b) => (a.budget_min || 0) - (b.budget_min || 0));
        break;
    }
    
    return filtered;
  }, [jobs, filterStatus, sortBy]);

  const tabs: { id: TabKey; icon: any; label: string }[] = [
    { id: 'overview', icon: BarChart3, label: L('overview') },
    { id: 'jobs', icon: Briefcase, label: L('jobs') },
    { id: 'post', icon: Plus, label: L('post') },
    { id: 'saved', icon: Heart, label: L('saved') },
    { id: 'inbox', icon: MessageCircle, label: L('inbox') },
    { id: 'analytics', icon: TrendingUp, label: L('analytics') },
    { id: 'alerts', icon: Bell, label: L('alerts') },
    { id: 'settings', icon: Settings, label: L('settings') }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const p = profile || { name: 'Employer', photo_url: '/default-avatar.png', cover_url: '' };
  const unreadMessages = messages.filter(m => !m.is_read && m.to_id === userId).length;
  const pendingBids = bids.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className={`px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <AlertTriangle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            {toast.message}
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-3 py-3 lg:py-4">
        
        {/* Enhanced Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl overflow-hidden mb-3">
          {p.cover_url && (
            <img src={p.cover_url} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
          )}
          <div className="relative p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={p.photo_url || '/default-avatar.png'} 
                  className="w-16 h-16 rounded-full border-4 border-white object-cover bg-white" 
                  alt="Profile"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                />
                <button 
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md"
                >
                  {photoUploading ? <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Camera size={12} className="text-blue-600" />}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={updateProfilePhoto} />
              </div>
              <div className="flex-1 text-white">
                <h2 className="font-bold text-lg">{p.name}</h2>
                <p className="text-sm opacity-80 flex items-center gap-2">
                  <Globe size={12} /> {country?.toUpperCase()} • {L('employer')}
                  {p.is_verified && <Award size={14} className="text-yellow-400" />}
                </p>
              </div>
              <button onClick={() => setActiveTab('settings')} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                <Edit size={14} className="inline" /> {L('edit')}
              </button>
            </div>
            <div className="flex gap-4 mt-3 text-white/90 text-xs">
              <div><span className="font-bold">{jobs.length}</span> Jobs</div>
              <div><span className="font-bold">{pendingBids}</span> Bids</div>
              <div><span className="font-bold">{unreadMessages}</span> Messages</div>
            </div>
          </div>
          <button onClick={() => coverInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full">
            <Camera size={14} className="text-white" />
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={updateCoverPhoto} />
        </div>

        {/* Tabs with indicators */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`rounded-xl p-2 text-center cursor-pointer hover:shadow-md border active:scale-95 transition-all relative ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-blue-50'
              }`}
            >
              <tab.icon size={18} className="mx-auto mb-1" />
              <p className="text-[9px] font-medium truncate">{tab.label}</p>
              {tab.id === 'inbox' && unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
              {tab.id === 'jobs' && pendingBids > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingBids}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { icon: Briefcase, label: 'Active Jobs', val: jobs.filter(j => j.status === 'open').length, color: 'blue' },
                  { icon: MessageCircle, label: 'Total Bids', val: analytics.totalBids, color: 'green' },
                  { icon: Eye, label: 'Profile Views', val: analytics.totalViews, color: 'purple' },
                  { icon: DollarSign, label: 'Total Spent', val: `${analytics.totalSpent} QAR`, color: 'orange' }
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 text-center border">
                    <s.icon size={20} className={`text-${s.color}-500 mx-auto mb-1`} />
                    <p className="text-xl font-bold">{s.val}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="font-bold text-sm mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                      {n.type === 'bid' && <Bell size={14} className="text-blue-500" />}
                      {n.type === 'message' && <MessageCircle size={14} className="text-green-500" />}
                      <span className="flex-1 text-xs">{n.message}</span>
                      <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-center text-gray-400 text-sm">{L('noData')}</p>}
                </div>
              </div>
            </>
          )}

          {/* Jobs Tab with Filters */}
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex flex-wrap gap-2 mb-4">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="px-3 py-1 border rounded-lg text-sm">
                  <option value="all">All Jobs</option>
                  <option value="open">Open</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-1 border rounded-lg text-sm">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                </select>
                <button onClick={() => setShowPostForm(true)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
                  <Plus size={14} /> New Job
                </button>
              </div>
              
              {filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">{L('noData')}</div>
              ) : (
                <div className="grid gap-3">
                  {filteredJobs.map(job => (
                    <div key={job.id} className="border rounded-xl p-3 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{job.title}</h4>
                          <p className="text-xs text-gray-500">{job.category} • {job.location}</p>
                          <p className="text-xs font-medium text-blue-600">{job.budget_min}-{job.budget_max} QAR</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              job.status === 'open' ? 'bg-green-100 text-green-700' :
                              job.status === 'filled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {job.status}
                            </span>
                            <span className="text-[10px] text-gray-400">{job.bids?.[0]?.count || 0} bids</span>
                            <span className="text-[10px] text-gray-400">{job.views || 0} views</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingJob(job)} className="p-1 text-gray-500 hover:text-blue-600">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => toggleJobStatus(job)} className="p-1 text-gray-500 hover:text-green-600">
                            {job.status === 'open' ? <X size={14} /> : <Check size={14} />}
                          </button>
                          <button onClick={() => shareJob(job)} className="p-1 text-gray-500 hover:text-purple-600">
                            <Share2 size={14} />
                          </button>
                          <button onClick={() => deleteJob(job.id)} className="p-1 text-gray-500 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {job.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{job.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Job Modal */}
          {editingJob && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-4">
                <h3 className="font-bold mb-3">Edit Job</h3>
                <input value={editingJob.title} onChange={e => setEditingJob({ ...editingJob, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Title" />
                <select value={editingJob.category} onChange={e => setEditingJob({ ...editingJob, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2">
                  <option value="">Category</option>
                  {['Driver','Electrician','Plumber','Mason','AC Technician','Painter','Carpenter'].map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="number" value={editingJob.budget_min} onChange={e => setEditingJob({ ...editingJob, budget_min: parseInt(e.target.value) })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Min" />
                  <input type="number" value={editingJob.budget_max} onChange={e => setEditingJob({ ...editingJob, budget_max: parseInt(e.target.value) })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Max" />
                </div>
                <textarea value={editingJob.description} onChange={e => setEditingJob({ ...editingJob, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" placeholder="Description" />
                <div className="flex gap-2">
                  <button onClick={updateJob} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditingJob(null)} className="flex-1 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Post Job Form */}
          {showPostForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-xl max-w-md w-full p-4 max-h-[90vh] overflow-y-auto">
                <h3 className="font-bold mb-3">{L('post')}</h3>
                <input value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} placeholder="Job Title *" className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                <select value={postForm.category} onChange={e => setPostForm({ ...postForm, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2">
                  <option value="">Select Category *</option>
                  {['Driver','Electrician','Plumber','Mason','AC Technician','Painter','Carpenter','Cleaner','Security','Teacher','Nurse','Chef'].map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={postForm.budget_min} onChange={e => setPostForm({ ...postForm, budget_min: e.target.value })} placeholder="Min Budget" type="number" className="px-3 py-2 border rounded-lg text-sm" />
                  <input value={postForm.budget_max} onChange={e => setPostForm({ ...postForm, budget_max: e.target.value })} placeholder="Max Budget" type="number" className="px-3 py-2 border rounded-lg text-sm" />
                </div>
                <input value={postForm.location} onChange={e => setPostForm({ ...postForm, location: e.target.value })} placeholder="Location" className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={postForm.worker_count} onChange={e => setPostForm({ ...postForm, worker_count: e.target.value })} placeholder="Workers Needed" type="number" className="px-3 py-2 border rounded-lg text-sm" />
                  <select value={postForm.expires_in} onChange={e => setPostForm({ ...postForm, expires_in: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                    <option value="3">Expires in 3 days</option>
                    <option value="7">Expires in 7 days</option>
                    <option value="14">Expires in 14 days</option>
                    <option value="30">Expires in 30 days</option>
                  </select>
                </div>
                <textarea value={postForm.description} onChange={e => setPostForm({ ...postForm, description: e.target.value })} placeholder="Description (optional)" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                <div className="flex gap-2">
                  <button onClick={postJob} disabled={posting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
                    {posting ? '...' : L('post')}
                  </button>
                  <button onClick={() => setShowPostForm(false)} className="flex-1 py-2 bg-gray-200 rounded-lg text-sm">{L('cancel')}</button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Workers */}
          {activeTab === 'saved' && (
            <div className="bg-white rounded-xl p-4 border">
              {savedWorkers.length === 0 ? (
                <div className="text-center py-8"><Heart size={40} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-500">{L('noData')}</p></div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {savedWorkers.map((s, i) => (
                    <div key={i} className="text-center p-3 border rounded-xl hover:shadow-md transition cursor-pointer" onClick={() => router.push(`/${country}/${lang}/profile/${s.saved?.id}`)}>
                      <OptimizedImage src={s.saved?.photo_url || '/default-avatar.png'} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                      <p className="text-sm font-bold truncate">{s.saved?.name}</p>
                      <p className="text-[10px] text-gray-500">{s.saved?.category}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star size={12} className="text-yellow-500" fill="#EAB308" />
                        <span className="text-xs">{s.saved?.rating || 0}</span>
                      </div>
                      <button className="mt-2 text-xs text-blue-600">View Profile</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><MessageCircle size={16} /> Messages {unreadMessages > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadMessages} unread</span>}</h3>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No messages yet</div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`p-3 rounded-lg ${!msg.is_read && msg.to_id === userId ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <OptimizedImage src={msg.sender_photo || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="text-sm font-bold">{msg.sender_name}</p>
                            <p className="text-xs text-gray-600">{msg.message}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedWorker && showMessageModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl max-w-md w-full p-4">
                    <h3 className="font-bold mb-3">Message to {selectedWorker.name}</h3>
                    <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm mb-3" placeholder="Type your message..." />
                    <div className="flex gap-2">
                      <button onClick={sendMessage} disabled={sendingMessage} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">{sendingMessage ? '...' : 'Send'}</button>
                      <button onClick={() => setShowMessageModal(false)} className="flex-1 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid gap-3">
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="font-bold text-sm mb-3">Job Performance</h3>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-xs mb-1"><span>Total Views</span><span>{analytics.totalViews}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, analytics.totalViews / 10)}%` }} /></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span>Total Bids</span><span>{analytics.totalBids}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, analytics.totalBids / 10)}%` }} /></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span>Hired Workers</span><span>{analytics.hiredWorkers}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, analytics.hiredWorkers * 10)}%` }} /></div></div>
                </div>
              </div>
              
              {/* Bids Section */}
              {bids.length > 0 && (
                <div className="bg-white rounded-xl p-4 border">
                  <h3 className="font-bold text-sm mb-3">Incoming Bids</h3>
                  <div className="space-y-3">
                    {bids.filter(b => b.status === 'pending').slice(0, 5).map(bid => (
                      <div key={bid.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <OptimizedImage src={bid.worker_photo || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="text-sm font-bold">{bid.worker_name}</p>
                            <p className="text-xs text-gray-500">Offered: {bid.offered_amount} QAR</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => acceptBid(bid)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Accept</button>
                          <button onClick={() => { setSelectedWorker({ id: bid.worker_id, name: bid.worker_name, photo_url: bid.worker_photo, category: '', rating: 0, expected_salary: 0, experience: 0, city: '', is_verified: false, online: false }); setShowMessageModal(true); }} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Message</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="bg-white rounded-xl p-4 border">
              {notifications.length === 0 ? (
                <div className="text-center py-8"><Bell size={40} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-500">{L('noData')}</p></div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 rounded-lg ${!n.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                      <p className="text-sm font-bold">{n.title}</p>
                      <p className="text-xs text-gray-600">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-4 border space-y-4">
              <h3 className="font-bold text-sm">Profile Settings</h3>
              
              <div className="space-y-2">
                <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <select value={editForm.preferred_language || lang} onChange={e => setEditForm({ ...editForm, preferred_language: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                  <option value="ar">العربية</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
              
              <button onClick={saveProfile} disabled={saving} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                <Save size={16} /> {saving ? '...' : L('save')}
              </button>
              
              <hr />
              
              <h3 className="font-bold text-sm text-red-600">Danger Zone</h3>
              <button onClick={logout} className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                <LogOut size={16} /> {L('logout')}
              </button>
            </div>
          )}

          {/* Search Workers Section - Always visible in settings */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-4 border mt-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Search size={16} /> {L('search')}</h3>
              <div className="flex gap-2 mb-3">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && searchWorkers()} placeholder="Search by name, category, or city..." className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <button onClick={searchWorkers} disabled={searching} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">{searching ? '...' : 'Search'}</button>
              </div>
              <div className="grid gap-2">
                {searchResults.map(w => (
                  <div key={w.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <OptimizedImage src={w.photo_url || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold flex items-center gap-1">{w.name} {w.is_verified && <Award size={12} className="text-yellow-500" />}</p>
                      <p className="text-xs text-gray-500">{w.category} • {w.expected_salary} QAR • {w.city}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => router.push(`/${country}/${lang}/profile/${w.id}`)} className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">View</button>
                      <button onClick={() => { setSelectedWorker(w); setShowMessageModal(true); }} className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded"><MessageCircle size={12} className="inline" /> Msg</button>
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && searchQuery && <p className="text-center text-gray-400 text-sm py-4">{L('noData')}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <MobileNav country={country} lang={lang} />
    </div>
  );
}