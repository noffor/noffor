// app/[country]/[lang]/dashboard/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import LiveLocationTracker from '@/components/worker/LiveLocationTracker';
import OnlineToggle from '@/components/home/OnlineToggle';
import { 
  BarChart3, Edit, Eye, CreditCard, Heart, Bell, Settings, Star, 
  ToggleLeft, ToggleRight, Phone, Briefcase, Lock, Globe, Shield, 
  Mail, MapPin, History, User, Trash2, LogOut, Clock, DollarSign, 
  Camera, Save, Info, Send, X, Check, AlertCircle, Upload, Wifi, WifiOff,
  Home, Calendar, MessageCircle, Share2, Download, Filter, TrendingUp
} from 'lucide-react';
import { getText, LangCode } from '@/lib/language';
import { getCountry, getCityName, getAreaName } from '@/lib/countries';

type TabKey = 'overview' | 'trips' | 'edit' | 'stats' | 'saved' | 'alerts' | 'settings' | 'analytics';
type LangKey = 'en' | 'bn' | 'ar' | 'hi';

export default function DashboardPage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const router = useRouter();
  
  // States
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [online, setOnline] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [editForm, setEditForm] = useState<any>({});
  const [coverUploading, setCoverUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [earnings, setEarnings] = useState({ total: 0, monthly: 0, weekly: 0 });
  const [analytics, setAnalytics] = useState({ views: 0, profileVisits: 0, calls: 0, messages: 0 });
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const t = (key: string) => getText(lang as LangCode, key);

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get user from localStorage + Supabase session fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('noffor_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id || u.phone);
      setOnline(u.is_online || false);
      return;
    }

    // Fallback: Supabase session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        let { data: profile } = await supabase.from('profiles')
          .select('*').eq('id', session.user.id).single();
        
        if (!profile) {
          const { data: newProfile } = await supabase.from('profiles').insert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            photo_url: session.user.user_metadata?.avatar_url || '/default-avatar.png',
            role: 'labor', country,
            is_online: false, is_verified: true,
            created_at: new Date().toISOString()
          }).select('*').single();
          if (newProfile) profile = newProfile;
        }
        
        if (profile) {
          localStorage.setItem('noffor_user', JSON.stringify(profile));
          if (profile.role === 'labor') localStorage.setItem('noffor_worker', JSON.stringify(profile));
          setUserId(profile.id);
          setOnline(profile.is_online || false);
          setProfile(profile);
          setEditForm(profile);
        }
      } else {
        router.push(`/${country}/${lang}/login`);
      }
    });
  }, []);

  // Load all data
  useEffect(() => {
    if (!userId) return;
    loadAll();
  }, [userId, country]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Load profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},phone.eq.${userId}`)
        .eq('country', country)
        .maybeSingle();
      
      if (profData) { 
        setProfile(profData); 
        setEditForm(profData); 
        setOnline(profData.is_online || false);
      }

      // Load bookings/trips
      const { data: tripData } = await supabase
        .from('bookings')
        .select('*')
        .or(`worker_id.eq.${userId},employer_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(30);

      setTrips(tripData || []);

      // Load saved workers
      const { data: savedData } = await supabase
        .from('saved_profiles')
        .select('*, saved:saved_profile_id(id, name, category, photo_url, rating, expected_salary)')
        .eq('user_id', userId)
        .limit(20);

      setSavedWorkers(savedData || []);

      // Load notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      setNotifications(notifData || []);

      // Calculate earnings
      const completedTrips = (tripData || []).filter(t => t.status === 'completed');
      const totalEarned = completedTrips.reduce((sum, t) => sum + (t.total_amount || t.offered_amount || 0), 0);
      setEarnings({
        total: totalEarned,
        monthly: totalEarned / 12,
        weekly: totalEarned / 52
      });

      // Analytics
      setAnalytics({
        views: profData?.views || 0,
        profileVisits: profData?.profile_visits || 0,
        calls: profData?.contacts || 0,
        messages: notifData?.length || 0
      });

    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Online/Offline
  const toggleOnline = async () => {
    if (!profile?.id) {
      showToast('Profile not found', 'error');
      return;
    }
    
    const next = !online;
    setOnline(next);
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_online: next, last_online: new Date().toISOString() })
      .eq('id', profile.id);
    
    if (error) {
      setOnline(!next);
      showToast('Failed to update status', 'error');
    } else {
      const stored = localStorage.getItem('noffor_user');
      if (stored) {
        const user = JSON.parse(stored);
        user.is_online = next;
        localStorage.setItem('noffor_user', JSON.stringify(user));
      }
      localStorage.setItem('noffor_worker_online', JSON.stringify(next));
      showToast(next ? 'You are now online' : 'You are now offline', 'success');
      
      // Update location tracking when online
      if (next) {
        // Trigger location update
        window.dispatchEvent(new Event('worker-online'));
      }
    }
  };

  // Image compression to WebP
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
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
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

  // Upload Cover Photo
  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    
    setCoverUploading(true);
    
    try {
      const compressed = await compressImage(file);
      const path = `${profile.id}/cover_${Date.now()}.webp`;
      
      const { error } = await supabase.storage
        .from('profiles')
        .upload(path, compressed, { upsert: true, contentType: 'image/webp' });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('id', profile.id);
      
      if (updateError) throw updateError;
      
      setProfile({ ...profile, cover_url: publicUrl });
      showToast('Cover photo updated!', 'success');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message, 'error');
    }
    
    setCoverUploading(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Upload Profile Photo
  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    
    setPhotoUploading(true);
    
    try {
      const compressed = await compressImage(file);
      const path = `${profile.id}/photo_${Date.now()}.webp`;
      
      const { error } = await supabase.storage
        .from('profiles')
        .upload(path, compressed, { upsert: true, contentType: 'image/webp' });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', profile.id);
      
      if (updateError) throw updateError;
      
      setProfile({ ...profile, photo_url: publicUrl });
      showToast('Profile photo updated!', 'success');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message, 'error');
    }
    
    setPhotoUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Save profile
  const saveProfile = async () => {
    if (!profile?.id) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: editForm.name,
        category: editForm.category,
        expected_salary: editForm.expected_salary,
        experience: editForm.experience,
        city: editForm.city,
        area: editForm.area,
        bio: editForm.bio,
        phone: editForm.phone,
        email: editForm.email,
      })
      .eq('id', profile.id);
    
    if (error) {
      showToast('Failed to save: ' + error.message, 'error');
    } else {
      setProfile({ ...profile, ...editForm });
      showToast('Profile saved!', 'success');
    }
    setSaving(false);
  };

  const deleteProfile = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    await supabase.from('profiles').delete().eq('id', profile.id);
    localStorage.clear();
    router.push(`/${country}/${lang}`);
  };

  const logout = () => {
    localStorage.removeItem('noffor_user');
    localStorage.removeItem('noffor_worker');
    localStorage.removeItem('noffor_worker_online');
    router.push(`/${country}/${lang}/login`);
  };

  const markNotifRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const shareProfile = () => {
    const url = `${window.location.origin}/${country}/${lang}/profile/${profile?.id}`;
    navigator.clipboard.writeText(url);
    showToast('Profile link copied!', 'success');
  };

  const downloadStats = () => {
    const stats = {
      name: profile?.name,
      views: analytics.views,
      profileVisits: analytics.profileVisits,
      calls: analytics.calls,
      messages: analytics.messages,
      earnings: earnings.total,
      rating: profile?.rating,
      date: new Date().toISOString()
    };
    const dataStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats_${profile?.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Stats downloaded!', 'success');
  };

  const tabs = [
    { id: 'overview' as TabKey, icon: Home, label: 'Home' },
    { id: 'trips' as TabKey, icon: Calendar, label: 'Trips' },
    { id: 'edit' as TabKey, icon: Edit, label: 'Edit' },
    { id: 'stats' as TabKey, icon: TrendingUp, label: 'Stats' },
    { id: 'saved' as TabKey, icon: Heart, label: 'Saved' },
    { id: 'alerts' as TabKey, icon: Bell, label: 'Alerts' },
    { id: 'analytics' as TabKey, icon: BarChart3, label: 'Analytics' },
    { id: 'settings' as TabKey, icon: Settings, label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const p = profile || { 
    name: 'Worker', category: 'General', rating: 0, total_reviews: 0, 
    views: 0, contacts: 0, offers: 0, expected_salary: '0', 
    experience: '0', city: 'Doha', area: '', 
    photo_url: '/default-avatar.png', cover_url: '' 
  };
  
  const photoSrc = p.photo_url && p.photo_url !== '/default-avatar.png' ? p.photo_url : '/default-avatar.png';
  const coverSrc = p.cover_url ? p.cover_url : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      
      {/* Live Location Tracker */}
      {online && profile?.id && (
        <LiveLocationTracker workerId={profile.id} isOnline={online} lang={lang} />
      )}
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in duration-200">
          <div className={`px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {toast.type === 'success' ? <Check size={16} /> : 
             toast.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />}
            {toast.msg}
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-3 py-3 lg:py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border overflow-hidden mb-3 shadow-sm">
          <div className="relative h-32 lg:h-40 bg-gradient-to-r from-green-600 to-emerald-700">
            {coverSrc && (
              <img src={coverSrc} className="w-full h-full object-cover" alt="Cover" />
            )}
            <button 
              onClick={() => coverInputRef.current?.click()} 
              className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              disabled={coverUploading}
            >
              {coverUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={16} />}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={uploadCover} />
          </div>
          
          <div className="relative px-4 pb-4">
            <div className="relative -mt-10 lg:-mt-12 w-20 h-20 lg:w-24 lg:h-24 mx-auto">
              <img 
                src={photoSrc} 
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white object-cover bg-gray-200" 
                alt="Profile"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
              />
              <button 
                onClick={() => photoInputRef.current?.click()} 
                className="absolute bottom-0 right-0 bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 transition"
                disabled={photoUploading}
              >
                {photoUploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </div>
            
            <div className="text-center mt-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="font-bold text-lg">{p.name}</h2>
                {p.is_verified && <Shield size={16} className="text-blue-500" />}
              </div>
              <p className="text-sm text-gray-500">{p.category}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star size={14} className="text-yellow-500" fill="#EAB308" />
                <span className="text-sm font-medium">{p.rating || 0}</span>
                <span className="text-xs text-gray-400">({p.total_reviews || 0} reviews)</span>
              </div>
              
              {/* Online Toggle Button */}
              <div className="mt-2 flex justify-center">
                <OnlineToggle profileId={profile?.id} initial={online} lang={lang} />
              </div>
              
              {/* Share Button */}
              <button 
                onClick={shareProfile}
                className="mt-2 text-xs text-gray-500 hover:text-green-600 transition flex items-center justify-center gap-1 mx-auto"
              >
                <Share2 size={12} /> Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-white rounded-xl p-2 text-center border shadow-sm">
            <DollarSign size={16} className="text-green-500 mx-auto" />
            <p className="text-xs font-bold">{earnings.total} QAR</p>
            <p className="text-[8px] text-gray-400">Total Earned</p>
          </div>
          <div className="bg-white rounded-xl p-2 text-center border shadow-sm">
            <Star size={16} className="text-yellow-500 mx-auto" />
            <p className="text-xs font-bold">{p.rating || 0}</p>
            <p className="text-[8px] text-gray-400">Rating</p>
          </div>
          <div className="bg-white rounded-xl p-2 text-center border shadow-sm">
            <Briefcase size={16} className="text-blue-500 mx-auto" />
            <p className="text-xs font-bold">{trips.length}</p>
            <p className="text-[8px] text-gray-400">Total Jobs</p>
          </div>
          <div className="bg-white rounded-xl p-2 text-center border shadow-sm">
            <Clock size={16} className="text-orange-500 mx-auto" />
            <p className="text-xs font-bold">{p.experience || 0} yrs</p>
            <p className="text-[8px] text-gray-400">Experience</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`rounded-xl p-2 text-center cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border hover:bg-orange-50'
              }`}
            >
              <tab.icon size={18} className="mx-auto mb-0.5" />
              <p className="text-[8px] font-medium truncate">{tab.label}</p>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-3 gap-2">
          {/* Overview */}
          {activeTab === 'overview' && (
            <>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <Eye size={20} className="text-orange-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{p.views || 0}</p>
                <p className="text-[10px] text-gray-400">Profile Views</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <Phone size={20} className="text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{p.contacts || 0}</p>
                <p className="text-[10px] text-gray-400">Contacts</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <Briefcase size={20} className="text-purple-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{p.offers || 0}</p>
                <p className="text-[10px] text-gray-400">Job Offers</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm col-span-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Profile Completion</span>
                  <span className="text-xs font-bold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </>
          )}

          {/* Trips */}
          {activeTab === 'trips' && (
            trips.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                No trips yet
              </div>
            ) : (
              trips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl p-3 border shadow-sm">
                  <History size={16} className="text-green-500 mx-auto mb-1" />
                  <p className="text-xs font-bold truncate">{trip.job_title || trip.category}</p>
                  <p className="text-[10px] text-gray-400">{trip.distance_km || '?'} km</p>
                  <p className="text-xs font-bold text-green-600">{trip.total_amount || trip.offered_amount} QAR</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 ${
                    trip.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    trip.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {trip.status || 'pending'}
                  </span>
                </div>
              ))
            )
          )}

          {/* Edit Profile */}
          {activeTab === 'edit' && (
            <div className="col-span-3 bg-white rounded-xl p-4 border space-y-3 shadow-sm">
              <h3 className="font-bold text-sm flex items-center gap-2"><Edit size={16} /> Edit Profile</h3>
              <div className="grid grid-cols-2 gap-2">
                <input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Full Name" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} placeholder="Category" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.expected_salary || ''} onChange={e => setEditForm({...editForm, expected_salary: e.target.value})} placeholder="Expected Salary (QAR)" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.experience || ''} onChange={e => setEditForm({...editForm, experience: e.target.value})} placeholder="Experience (years)" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} placeholder="City" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.area || ''} onChange={e => setEditForm({...editForm, area: e.target.value})} placeholder="Area" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email" className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <textarea value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Bio / Description" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="flex gap-2">
                <button onClick={saveProfile} disabled={saving} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition">
                  <Save size={16} className="inline mr-1" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={deleteProfile} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                  <Trash2 size={16} className="inline mr-1" /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          {activeTab === 'stats' && (
            <>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <p className="text-2xl font-bold text-blue-600">{p.views || 0}</p>
                <p className="text-[10px] text-gray-400">Total Views</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <p className="text-2xl font-bold text-green-600">{p.contacts || 0}</p>
                <p className="text-[10px] text-gray-400">Contacts</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <p className="text-2xl font-bold text-purple-600">{p.offers || 0}</p>
                <p className="text-[10px] text-gray-400">Offers</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <p className="text-2xl font-bold text-yellow-600">{p.rating || 0}</p>
                <p className="text-[10px] text-gray-400">Rating</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <p className="text-2xl font-bold text-orange-600">{p.total_reviews || 0}</p>
                <p className="text-[10px] text-gray-400">Reviews</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border shadow-sm">
                <p className="text-2xl font-bold text-indigo-600">{p.experience || 0}</p>
                <p className="text-[10px] text-gray-400">Years Exp</p>
              </div>
            </>
          )}

          {/* Saved Workers */}
          {activeTab === 'saved' && (
            savedWorkers.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <Heart size={40} className="mx-auto mb-2 opacity-30" />
                No saved workers yet
              </div>
            ) : (
              savedWorkers.map((s: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-3 border text-center shadow-sm hover:shadow-md transition cursor-pointer">
                  <img 
                    src={s.saved?.photo_url || '/default-avatar.png'} 
                    className="w-14 h-14 rounded-full mx-auto mb-2 object-cover border-2 border-gray-200" 
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                  />
                  <p className="text-xs font-bold truncate">{s.saved?.name || 'Worker'}</p>
                  <p className="text-[10px] text-gray-500">{s.saved?.category || ''}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star size={10} className="text-yellow-500" fill="#EAB308" />
                    <span className="text-[10px]">{s.saved?.rating || 0}</span>
                  </div>
                  <button className="mt-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full w-full">
                    View Profile
                  </button>
                </div>
              ))
            )
          )}

          {/* Alerts */}
          {activeTab === 'alerts' && (
            notifications.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <Bell size={40} className="mx-auto mb-2 opacity-30" />
                No notifications
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => markNotifRead(n.id)} 
                  className={`col-span-3 bg-white rounded-xl p-3 border cursor-pointer transition ${
                    !n.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'opacity-70'
                  }`}
                >
                  <p className="text-xs font-bold">{n.title}</p>
                  <p className="text-[11px] text-gray-600 mt-1">{n.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                    {!n.is_read && <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full">New</span>}
                  </div>
                </div>
              ))
            )
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="col-span-3 space-y-3">
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <h3 className="font-bold text-sm mb-3 flex items-center justify-between">
                  <span>Performance Analytics</span>
                  <button onClick={downloadStats} className="text-[10px] bg-gray-100 px-2 py-1 rounded">
                    <Download size={10} className="inline" /> Export
                  </button>
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Profile Views</span><span className="font-bold">{analytics.views}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, analytics.views)}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Contact Requests</span><span className="font-bold">{analytics.calls}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, analytics.calls * 10)}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Job Offers</span><span className="font-bold">{p.offers || 0}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, (p.offers || 0) * 10)}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Response Rate</span><span className="font-bold">98%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{ width: '98%' }}></div></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <h3 className="font-bold text-sm mb-2">Earnings Summary</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{earnings.total} QAR</p>
                  <p className="text-[10px] text-gray-400">Total Lifetime Earnings</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-sm font-bold">{earnings.monthly.toFixed(0)} QAR</p>
                    <p className="text-[8px] text-gray-400">Monthly Avg</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-sm font-bold">{earnings.weekly.toFixed(0)} QAR</p>
                    <p className="text-[8px] text-gray-400">Weekly Avg</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <button onClick={() => setActiveTab('edit')} className="bg-lime-50 text-lime-600 rounded-xl p-3 text-center hover:shadow-md transition">
                <User size={20} className="mx-auto mb-1" />
                <p className="text-[10px] font-medium">Edit Profile</p>
              </button>
              <button onClick={() => {}} className="bg-blue-50 text-blue-600 rounded-xl p-3 text-center hover:shadow-md transition">
                <Globe size={20} className="mx-auto mb-1" />
                <p className="text-[10px] font-medium">{lang.toUpperCase()}</p>
              </button>
              <button onClick={shareProfile} className="bg-purple-50 text-purple-600 rounded-xl p-3 text-center hover:shadow-md transition">
                <Share2 size={20} className="mx-auto mb-1" />
                <p className="text-[10px] font-medium">Share</p>
              </button>
              <button onClick={downloadStats} className="bg-indigo-50 text-indigo-600 rounded-xl p-3 text-center hover:shadow-md transition">
                <Download size={20} className="mx-auto mb-1" />
                <p className="text-[10px] font-medium">Export Data</p>
              </button>
              <button onClick={logout} className="bg-gray-200 text-gray-700 rounded-xl p-3 text-center hover:shadow-md transition">
                <LogOut size={20} className="mx-auto mb-1" />
                <p className="text-[10px] font-medium">Logout</p>
              </button>
              <button onClick={deleteProfile} className="bg-red-50 text-red-600 rounded-xl p-3 text-center hover:shadow-md transition">
                <Trash2 size={20} className="mx-auto mb-1" />
                <p className="text-[10px] font-medium">Delete</p>
              </button>
            </div>
          )}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}