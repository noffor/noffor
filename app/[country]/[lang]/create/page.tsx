"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { siteConfig } from '@/lib/config';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { User, Building, Camera, Upload, X, Check, Briefcase, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const DROPDOWNS = {
  experience: ['0-1 year', '1-3 years', '3-5 years', '5-7 years', '7-10 years', '10+ years'],
  visaStatus: ['Transferable', 'Company Visa', 'Freelance Visa', 'Family Sponsorship', 'Visit Visa'],
  sponsorship: ['Self Sponsorship', 'Company Sponsorship', 'Father Sponsorship', 'Husband Sponsorship'],
  accommodation: ['Provided by Company', 'Own Arrangement', 'Shared Accommodation', 'Not Required'],
  food: ['Provided by Company', 'Own Arrangement', 'Not Required'],
  cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Daayen'],
  areas: ['West Bay', 'The Pearl', 'Al Sadd', 'Bin Mahmoud', 'Old Airport', 'Industrial Area', 'Najma', 'Al Gharafa'],
  jobTypes: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Freelance'],
  urgency: ['Immediate', 'Within 3 days', 'Within a week', 'Flexible']
};

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English', native: 'English' },
  { value: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { value: 'Arabic', label: 'Arabic', native: 'العربية' },
  { value: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'Urdu', label: 'Urdu', native: 'اردو' },
  { value: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { value: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { value: 'Nepali', label: 'Nepali', native: 'नेपाली' },
  { value: 'Sinhala', label: 'Sinhala', native: 'සිංහල' },
  { value: 'Tagalog', label: 'Tagalog', native: 'Tagalog' }
];

// Category based default images
const getCategoryDefaultImage = (category: string): string => {
  const images: Record<string, string> = {
    'Driver': '/images/categories/driver.jpg',
    'Electrician': '/images/categories/electrician.jpg',
    'Plumber': '/images/categories/plumber.jpg',
    'Mason': '/images/categories/mason.jpg',
    'AC Technician': '/images/categories/ac-technician.jpg',
    'Painter': '/images/categories/painter.jpg',
    'Carpenter': '/images/categories/carpenter.jpg',
    'Cleaner': '/images/categories/cleaner.jpg',
    'Cook': '/images/categories/cook.jpg',
    'Helper': '/images/categories/helper.jpg',
    'Gardener': '/images/categories/gardener.jpg',
    'Welder': '/images/categories/welder.jpg',
  };
  return images[category] || '/images/categories/default-job.jpg';
};

async function compressImage(file: File): Promise<Blob> {
  return new Promise(resolve => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > 600) { h = (h * 600) / w; w = 600; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => resolve(b!), 'image/webp', 0.6);
    };
  });
}

const formTexts: Record<string, any> = {
  en: { 
    title: 'Create Profile', phone: 'Phone *', name: 'Full Name *', category: 'Category', 
    salary: 'Salary (QAR)', experience: 'Experience', city: 'City', area: 'Area', 
    photo: 'Photo', next: 'Next', back: 'Back', submit: 'Submit', 
    employerTitle: 'Post Job', jobTitle: 'Job Title *', jobSalary: 'Salary', 
    companyName: 'Company *', companyPhone: 'Phone *', jobDesc: 'Description', 
    license: 'License', languages: 'Language', visaStatus: 'Visa Status', 
    sponsorship: 'Sponsorship', accommodation: 'Accommodation', food: 'Food', 
    bio: 'Bio', workPhotos: 'Work Photos',
    whatCreate: 'What do you want to create?',
    workerProfile: 'Worker Profile',
    workerDesc: 'Enter information manually',
    postJob: 'Post Job',
    postJobDesc: 'Post as employer',
    success: 'Success!',
    redirecting: 'Redirecting to home...',
    jobSubmit: 'Post Job',
    jobLocation: 'Job Location',
    jobType: 'Job Type',
    workersNeeded: 'Workers Needed',
    urgency: 'Urgency',
    jobImage: 'Job Image',
    uploadImage: 'Upload Image',
    selectCategoryHint: 'Select category for auto image',
    or: 'OR'
  },
  bn: { 
    title: 'প্রোফাইল তৈরি', phone: 'ফোন *', name: 'পুরো নাম *', category: 'ক্যাটাগরি', 
    salary: 'বেতন (রিয়াল)', experience: 'অভিজ্ঞতা', city: 'শহর', area: 'এলাকা', 
    photo: 'ছবি', next: 'পরবর্তী', back: 'পিছনে', submit: 'জমা দিন', 
    employerTitle: 'চাকরি পোস্ট', jobTitle: 'চাকরির শিরোনাম *', jobSalary: 'বেতন', 
    companyName: 'কোম্পানি *', companyPhone: 'ফোন *', jobDesc: 'বিবরণ', 
    license: 'লাইসেন্স', languages: 'ভাষা', visaStatus: 'ভিসা স্ট্যাটাস', 
    sponsorship: 'স্পন্সরশিপ', accommodation: 'আবাসন', food: 'খাবার', 
    bio: 'বায়ো', workPhotos: 'কাজের ছবি',
    whatCreate: 'কী তৈরি করতে চান?',
    workerProfile: 'শ্রমিক প্রোফাইল',
    workerDesc: 'হাতে কলমে তথ্য দিন',
    postJob: 'চাকরি পোস্ট',
    postJobDesc: 'নিয়োগকর্তা হিসেবে পোস্ট করুন',
    success: 'সফল!',
    redirecting: 'হোম পেজে রিডাইরেক্ট করা হচ্ছে...',
    jobSubmit: 'পোস্ট করুন',
    jobLocation: 'কাজের অবস্থান',
    jobType: 'চাকরির ধরন',
    workersNeeded: 'প্রয়োজনীয় কর্মী',
    urgency: 'জরুরীতা',
    jobImage: 'চাকরির ছবি',
    uploadImage: 'ছবি আপলোড',
    selectCategoryHint: 'অটো ছবির জন্য ক্যাটাগরি নির্বাচন করুন',
    or: 'অথবা'
  },
  ar: { 
    title: 'إنشاء ملف', phone: 'الهاتف *', name: 'الاسم الكامل *', category: 'الفئة', 
    salary: 'الراتب (ريال)', experience: 'الخبرة', city: 'المدينة', area: 'المنطقة', 
    photo: 'صورة', next: 'التالي', back: 'رجوع', submit: 'إرسال', 
    employerTitle: 'نشر وظيفة', jobTitle: 'عنوان الوظيفة *', jobSalary: 'الراتب', 
    companyName: 'الشركة *', companyPhone: 'الهاتف *', jobDesc: 'الوصف', 
    license: 'رخصة', languages: 'اللغة', visaStatus: 'حالة التأشيرة', 
    sponsorship: 'الكفالة', accommodation: 'السكن', food: 'الطعام', 
    bio: 'السيرة', workPhotos: 'صور العمل',
    whatCreate: 'ماذا تريد إنشاء؟',
    workerProfile: 'ملف عامل',
    workerDesc: 'أدخل المعلومات يدويًا',
    postJob: 'نشر وظيفة',
    postJobDesc: 'انشر كصاحب عمل',
    success: 'نجاح!',
    redirecting: 'جاري التحويل إلى الصفحة الرئيسية...',
    jobSubmit: 'نشر',
    jobLocation: 'موقع العمل',
    jobType: 'نوع الوظيفة',
    workersNeeded: 'عدد العمال المطلوبين',
    urgency: 'الإلحاح',
    jobImage: 'صورة الوظيفة',
    uploadImage: 'تحميل صورة',
    selectCategoryHint: 'اختر الفئة للحصول على صورة تلقائية',
    or: 'أو'
  },
  hi: { 
    title: 'प्रोफाइल बनाएं', phone: 'फोन *', name: 'पूरा नाम *', category: 'श्रेणी', 
    salary: 'वेतन (रियाल)', experience: 'अनुभव', city: 'शहर', area: 'क्षेत्र', 
    photo: 'फोटो', next: 'अगला', back: 'पीछे', submit: 'जमा करें', 
    employerTitle: 'नौकरी पोस्ट करें', jobTitle: 'नौकरी का शीर्षक *', jobSalary: 'वेतन', 
    companyName: 'कंपनी *', companyPhone: 'फोन *', jobDesc: 'विवरण', 
    license: 'लाइसेंस', languages: 'भाषा', visaStatus: 'वीज़ा स्थिति', 
    sponsorship: 'प्रायोजन', accommodation: 'आवास', food: 'भोजन', 
    bio: 'जीवन परिचय', workPhotos: 'काम की तस्वीरें',
    whatCreate: 'आप क्या बनाना चाहते हैं?',
    workerProfile: 'श्रमिक प्रोफाइल',
    workerDesc: 'जानकारी दर्ज करें',
    postJob: 'नौकरी पोस्ट करें',
    postJobDesc: 'नियोक्ता के रूप में पोस्ट करें',
    success: 'सफल!',
    redirecting: 'होम पेज पर रीडायरेक्ट किया जा रहा है...',
    jobSubmit: 'पोस्ट करें',
    jobLocation: 'कार्य स्थान',
    jobType: 'नौकरी का प्रकार',
    workersNeeded: 'आवश्यक श्रमिक',
    urgency: 'तात्कालिकता',
    jobImage: 'नौकरी की छवि',
    uploadImage: 'छवि अपलोड करें',
    selectCategoryHint: 'ऑटो छवि के लिए श्रेणी चुनें',
    or: 'या'
  }
};

export default function CreatePage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const currentLang = (params as any).lang || 'en';
  const router = useRouter();
  const ft = formTexts[currentLang as keyof typeof formTexts] || formTexts.en;
  
  const [mode, setMode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Worker states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [license, setLicense] = useState('');
  const [languages, setLanguages] = useState('');
  const [visaStatus, setVisaStatus] = useState('');
  const [sponsorship, setSponsorship] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [food, setFood] = useState('');
  const [bio, setBio] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPrev, setPhotoPrev] = useState('');
  const [workFiles, setWorkFiles] = useState<File[]>([]);
  const [workPreviews, setWorkPreviews] = useState<string[]>([]);
  
  // Employer states
  const [jobTitle, setJobTitle] = useState('');
  const [jobCat, setJobCat] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState('');
  const [urgency, setUrgency] = useState('');
  
  // ✅ NEW: Job Image states (instead of company logo)
  const [jobImageFile, setJobImageFile] = useState<File | null>(null);
  const [jobImagePrev, setJobImagePrev] = useState('');
  const [jobImageUploading, setJobImageUploading] = useState(false);
  const [useDefaultImage, setUseDefaultImage] = useState(true);

  const handleWorkPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + workFiles.length > 6) {
      alert('Max 6 photos');
      return;
    }
    setWorkFiles([...workFiles, ...files]);
    setWorkPreviews([...workPreviews, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeWorkPhoto = (index: number) => {
    setWorkFiles(workFiles.filter((_, i) => i !== index));
    URL.revokeObjectURL(workPreviews[index]);
    setWorkPreviews(workPreviews.filter((_, i) => i !== index));
  };

  // ✅ Job Image handler
  const handleJobImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setJobImageUploading(true);
    try {
      const compressed = await compressImage(file);
      const webpFile = new File([compressed], `job_${Date.now()}.webp`, { type: 'image/webp' });
      setJobImagePrev(URL.createObjectURL(webpFile));
      setJobImageFile(webpFile);
      setUseDefaultImage(false);
    } catch (err) {
      console.error('Job image compression error:', err);
    } finally {
      setJobImageUploading(false);
    }
  };

  // Auto-set default image when category changes
  const handleCategoryChange = (cat: string) => {
    setJobCat(cat);
    if (useDefaultImage && !jobImageFile) {
      const defaultImage = getCategoryDefaultImage(cat);
      setJobImagePrev(defaultImage);
    }
  };

  const handleLaborSubmit = async () => {
    if (!phone || !name) {
      setError('Phone & Name required');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      let photoUrl = '/avatar.png';
      if (photoFile) {
        const compressed = await compressImage(photoFile);
        const file = new File([compressed], `${Date.now()}.webp`);
        const { data, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(`photos/${Date.now()}.webp`, file);
        if (uploadError) throw uploadError;
        if (data) photoUrl = supabase.storage.from('profiles').getPublicUrl(data.path).data.publicUrl;
      }
      
      const workUrls = [];
      for (const wf of workFiles) {
        const compressed = await compressImage(wf);
        const file = new File([compressed], `${Date.now()}.webp`);
        const { data, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(`works/${Date.now()}.webp`, file);
        if (uploadError) throw uploadError;
        if (data) workUrls.push(supabase.storage.from('profiles').getPublicUrl(data.path).data.publicUrl);
      }
      
      const { error: insertError } = await supabase.from('profiles').insert({
        phone, name, role: 'labor', category, country, city, area, experience,
        expected_salary: salary ? `${salary} QAR` : null, license, languages: languages || null,
        visa_status: visaStatus, sponsorship, accommodation, food, bio, photo_url: photoUrl, 
        photos: workUrls, rating: 0, total_reviews: 0, is_online: true, 
        profile_language: currentLang, created_at: new Date().toISOString()
      });
      
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => router.push(`/${country}/${currentLang}`), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerSubmit = async () => {
    if (!companyPhone || !companyName || !jobTitle) {
      setError('Please fill company phone, company name and job title');
      return;
    }
    setLoading(true);
    setError('');
    
    const formattedSalary = jobSalary ? `${jobSalary} QAR` : null;
    const formattedBio = `Job: ${jobTitle}
Company: ${companyName}
Phone: ${companyPhone}
Location: ${jobLocation || 'Not specified'}
Job Type: ${jobType || 'Not specified'}
Workers Needed: ${workersNeeded || 'Not specified'}
Urgency: ${urgency || 'Not specified'}

Description:
${jobDesc || 'No description provided'}`;
    
    // Upload job image if exists
    let jobImageUrl = '';
    if (jobImageFile && !useDefaultImage) {
      try {
        const { data, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(`job_images/${Date.now()}.webp`, jobImageFile);
        if (!uploadError && data) {
          jobImageUrl = supabase.storage.from('profiles').getPublicUrl(data.path).data.publicUrl;
        }
      } catch (err) {
        console.error('Job image upload error:', err);
      }
    } else if (useDefaultImage && jobCat) {
      jobImageUrl = getCategoryDefaultImage(jobCat);
    }
    
    try {
      const { error: insertError } = await supabase.from('profiles').insert({
        phone: companyPhone, name: companyName, role: 'employer', 
        category: jobCat || 'General', expected_salary: formattedSalary, bio: formattedBio,
        city: 'Doha', country: country, rating: 0, total_reviews: 0, is_online: true,
        profile_language: currentLang, created_at: new Date().toISOString(),
        photo_url: jobImageUrl || '/default-job.jpg'
      });
      
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => router.push(`/${country}/${currentLang}/dashboard/employer`), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-8 shadow">
          <div className="w-20 h-20 bg-green-100 rounded-full flex mx-auto mb-4 items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">{ft.success}</h2>
          <p className="text-gray-500 mt-2">{ft.redirecting}</p>
        </div>
      </div>
    </div>
  );

  if (!mode) return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-6">{ft.whatCreate}</h1>
        <div className="space-y-4">
          <button onClick={() => setMode('labor')} className="w-full bg-white p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-500 flex items-center gap-4 transition">
            <User size={32} className="text-orange-600" />
            <div className="text-left flex-1">
              <h2 className="font-bold text-xl">{ft.workerProfile}</h2>
              <p className="text-sm text-gray-500">{ft.workerDesc}</p>
            </div>
            <ChevronRight size={20} />
          </button>
          <button onClick={() => setMode('employer')} className="w-full bg-white p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-500 flex items-center gap-4 transition">
            <Building size={32} className="text-blue-600" />
            <div className="text-left flex-1">
              <h2 className="font-bold text-xl">{ft.postJob}</h2>
              <p className="text-sm text-gray-500">{ft.postJobDesc}</p>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <MobileNav country={country} lang={currentLang} />
    </div>
  );

  if (mode === 'labor') return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-4">
        <button onClick={() => setMode('')} className="text-orange-600 mb-4 flex items-center gap-1">
          <ChevronLeft size={18}/> {ft.back}
        </button>
        
        {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-orange-600 rounded-full transition-all" style={{ width: `${(step/5)*100}%` }} />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
          {step === 1 && (
            <>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={ft.phone} className="w-full p-3 border rounded-xl text-lg" type="tel" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder={ft.name} className="w-full p-3 border rounded-xl text-lg" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border rounded-xl text-lg">
                <option value="">{ft.category}</option>
                {siteConfig.categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
            </>
          )}
          
          {step === 2 && (
            <>
              <div className="flex justify-center mb-2">
                {photoPrev ? (
                  <div className="relative">
                    <img src={photoPrev} className="w-28 h-28 rounded-full object-cover border-4 border-orange-300" />
                    <button onClick={() => { setPhotoFile(null); setPhotoPrev(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center">
                      <X size={16}/>
                    </button>
                  </div>
                ) : (
                  <label className="w-28 h-28 bg-gray-100 rounded-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed">
                    <Camera size={28} className="text-gray-500"/>
                    <span className="text-xs">{ft.photo}</span>
                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f) { setPhotoFile(f); setPhotoPrev(URL.createObjectURL(f)); } }} className="hidden"/>
                  </label>
                )}
              </div>
              <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.experience}</option>
                {DROPDOWNS.experience.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <select value={visaStatus} onChange={e => setVisaStatus(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.visaStatus}</option>
                {DROPDOWNS.visaStatus.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <select value={sponsorship} onChange={e => setSponsorship(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.sponsorship}</option>
                {DROPDOWNS.sponsorship.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </>
          )}
          
          {step === 3 && (
            <>
              <input value={salary} onChange={e => setSalary(e.target.value)} placeholder={ft.salary} className="w-full p-3 border rounded-xl" type="number" />
              <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.city}</option>
                {DROPDOWNS.cities.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <select value={area} onChange={e => setArea(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.area}</option>
                {DROPDOWNS.areas.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <select value={accommodation} onChange={e => setAccommodation(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.accommodation}</option>
                {DROPDOWNS.accommodation.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <select value={food} onChange={e => setFood(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.food}</option>
                {DROPDOWNS.food.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </>
          )}
          
          {step === 4 && (
            <>
              <input value={license} onChange={e => setLicense(e.target.value)} placeholder={ft.license} className="w-full p-3 border rounded-xl" />
              <select value={languages} onChange={e => setLanguages(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">{ft.languages}</option>
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.native} ({opt.label})</option>
                ))}
              </select>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={ft.bio} rows={4} className="w-full p-3 border rounded-xl resize-none" />
            </>
          )}
          
          {step === 5 && (
            <div>
              <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-orange-400">
                <Upload size={32} className="mx-auto text-gray-400"/>
                <p className="text-sm mt-2">{ft.workPhotos} (max 6)</p>
                <input type="file" multiple accept="image/*" onChange={handleWorkPhotos} className="hidden"/>
              </label>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {workPreviews.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} className="h-24 w-full object-cover rounded-lg"/>
                    <button onClick={() => removeWorkPhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <X size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-5">
          {step > 1 && <button onClick={() => setStep(step-1)} className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold">{ft.back}</button>}
          {step < 5 ? 
            <button onClick={() => setStep(step+1)} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold">{ft.next} →</button> : 
            <button onClick={handleLaborSubmit} disabled={loading} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold">{loading ? '...' : ft.submit}</button>
          }
        </div>
      </div>
      <MobileNav country={country} lang={currentLang} />
    </div>
  );

  // ✅ Employer Form with Job Image (not company logo)
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header country={country} lang={currentLang} />
      <div className="max-w-md mx-auto px-4 py-8">
        <button onClick={() => setMode('')} className="text-blue-600 mb-4 flex items-center gap-1">
          <ChevronLeft size={18}/> {ft.back}
        </button>
        
        {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase size={24}/> {ft.employerTitle}
          </h2>
          
          {/* ✅ Job Image Upload - Simple & Fast */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {ft.jobImage || 'Job Image'}
            </label>
            {jobImagePrev ? (
              <div className="relative">
                <img src={jobImagePrev} className="w-full h-32 rounded-xl object-cover border-2 border-blue-300" />
                <button 
                  onClick={() => { setJobImageFile(null); setJobImagePrev(''); setUseDefaultImage(true); }} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="w-full h-32 bg-gray-100 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed hover:border-blue-400 transition">
                {jobImageUploading ? (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImageIcon size={24} className="text-gray-500" />
                    <span className="text-xs text-gray-500 mt-1">{ft.uploadImage || 'Upload Image'}</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleJobImage} className="hidden" />
              </label>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              {ft.selectCategoryHint || 'Select category for auto image'}
            </p>
          </div>
          
          <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder={ft.jobTitle} className="w-full p-3 border rounded-xl" />
          
          <select value={jobCat} onChange={e => handleCategoryChange(e.target.value)} className="w-full p-3 border rounded-xl">
            <option value="">{ft.category}</option>
            {siteConfig.categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
          
          <input value={jobSalary} onChange={e => setJobSalary(e.target.value)} placeholder={ft.jobSalary} className="w-full p-3 border rounded-xl" />
          
          <input 
            value={jobLocation} 
            onChange={e => setJobLocation(e.target.value)} 
            placeholder={ft.jobLocation || 'Job Location'} 
            className="w-full p-3 border rounded-xl" 
          />
          
          <select value={jobType} onChange={e => setJobType(e.target.value)} className="w-full p-3 border rounded-xl">
            <option value="">{ft.jobType || 'Job Type'}</option>
            {DROPDOWNS.jobTypes.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          
          <input 
            value={workersNeeded} 
            onChange={e => setWorkersNeeded(e.target.value)} 
            placeholder={ft.workersNeeded || 'Workers Needed'} 
            type="number"
            className="w-full p-3 border rounded-xl" 
          />
          
          <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full p-3 border rounded-xl">
            <option value="">{ft.urgency || 'Urgency'}</option>
            {DROPDOWNS.urgency.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={ft.companyName} className="w-full p-3 border rounded-xl" />
          <input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder={ft.companyPhone} className="w-full p-3 border rounded-xl" type="tel" />
          <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder={ft.jobDesc} rows={4} className="w-full p-3 border rounded-xl resize-none" />
          
          <button onClick={handleEmployerSubmit} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Posting...' : ft.jobSubmit}
          </button>
        </div>
      </div>
      <MobileNav country={country} lang={currentLang} />
    </div>
  );
}