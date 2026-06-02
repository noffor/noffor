// components/admin/CategoryManager.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {Plus,Trash2,Camera,Upload,X,Loader2,CheckCircle,AlertCircle} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{add:'Add Category',save:'Save',cancel:'Cancel',placeholder:'Category Name',delete:'Delete',confirm:'Are you sure?',yes:'Yes',no:'No',empty:'No categories',error:'Failed to add',success:'Category added!',icon:'Change Icon',banner:'Change Banner'},
  bn:{add:'ক্যাটাগরি যোগ',save:'সেভ',cancel:'বাতিল',placeholder:'ক্যাটাগরি নাম',delete:'মুছুন',confirm:'আপনি কি নিশ্চিত?',yes:'হ্যাঁ',no:'না',empty:'কোনো ক্যাটাগরি নেই',error:'যোগ করতে ব্যর্থ',success:'ক্যাটাগরি যোগ হয়েছে!',icon:'আইকন বদলান',banner:'ব্যানার বদলান'},
  ar:{add:'إضافة فئة',save:'حفظ',cancel:'إلغاء',placeholder:'اسم الفئة',delete:'حذف',confirm:'هل أنت متأكد؟',yes:'نعم',no:'لا',empty:'لا توجد فئات',error:'فشل الإضافة',success:'تمت الإضافة!',icon:'تغيير الأيقونة',banner:'تغيير البانر'},
  hi:{add:'श्रेणी जोड़ें',save:'सहेजें',cancel:'रद्द',placeholder:'श्रेणी का नाम',delete:'हटाएं',confirm:'क्या आप सुनिश्चित हैं?',yes:'हाँ',no:'नहीं',empty:'कोई श्रेणी नहीं',error:'जोड़ने में विफल',success:'श्रेणी जुड़ गई!',icon:'आइकन बदलें',banner:'बैनर बदलें'},
};

// ═══════════════════════════════════════════════════════════
// Category Item (Memoized)
// ═══════════════════════════════════════════════════════════
const CategoryItem=React.memo(({cat,onDelete,lang}:{cat:any;onDelete:(slug:string)=>void;lang:string})=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[imgError,setImgError]=useState(false);
  const[showConfirm,setShowConfirm]=useState(false);

  const handleDelete=useCallback(()=>{setShowConfirm(true)},[]);
  const confirmDelete=useCallback(()=>{onDelete(cat.slug);setShowConfirm(false)},[cat.slug,onDelete]);

  return(
    <div className="bg-white rounded-xl p-3 border flex items-center justify-between group hover:shadow-md transition-all" style={{transform:'translateZ(0)'}}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          {imgError?(
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Camera size={14} className="text-gray-400"/></div>
          ):(
            <img src={cat.icon} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" loading="lazy" onError={()=>startTransition(()=>setImgError(true))}/>
          )}
          <button className="absolute inset-0 bg-black/50 rounded-lg hidden group-hover:flex items-center justify-center transition-opacity" title={tr.icon}>
            <Upload size={12} className="text-white"/>
          </button>
        </div>
        
        {/* Name */}
        <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">{cat.name}</span>
      </div>

      {/* Delete */}
      {showConfirm?(
        <div className="flex items-center gap-1">
          <button onClick={confirmDelete} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors">{tr.yes}</button>
          <button onClick={()=>setShowConfirm(false)} className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors">{tr.no}</button>
        </div>
      ):(
        <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 active:scale-90" title={tr.delete}>
          <Trash2 size={14}/>
        </button>
      )}
    </div>
  );
});
CategoryItem.displayName='CategoryItem';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{categories:any[];lang?:string;onAdd?:(cat:any)=>void;onDelete?:(slug:string)=>void}

// ═══════════════════════════════════════════════════════════
// CategoryManager (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const CategoryManager=React.memo(({categories:initial,lang='en',onAdd,onDelete}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[categories,setCategories]=useState(initial);
  const[showAdd,setShowAdd]=useState(false);
  const[name,setName]=useState('');
  const[error,setError]=useState('');
  const[success,setSuccess]=useState(false);

  const add=useCallback(()=>{
    if(!name.trim()){setError(tr.placeholder);return}
    const slug=name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    const newCat={slug,name:name.trim(),icon:'/icons/default.svg',banner:'/banners/default.jpg'};
    startTransition(()=>{setCategories(p=>[...p,newCat]);setName('');setShowAdd(false);setError('');setSuccess(true)});
    onAdd?.(newCat);
    setTimeout(()=>startTransition(()=>setSuccess(false)),2000);
  },[name,onAdd,tr]);

  const handleDelete=useCallback((slug:string)=>{
    startTransition(()=>setCategories(p=>p.filter(c=>c.slug!==slug)));
    onDelete?.(slug);
  },[onDelete]);

  return(
    <div style={{contain:'layout style paint'}}>
      {/* Success Toast */}
      {success&&(
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle size={14}/>{tr.success}
        </div>
      )}

      {/* Add Button + Form */}
      <button onClick={()=>startTransition(()=>setShowAdd(true))} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center gap-2 mb-3">
        <Plus size={16}/>{tr.add}
      </button>

      {showAdd&&(
        <div className="flex flex-col sm:flex-row gap-2 mb-3 bg-white p-3 rounded-xl border shadow-sm animate-fade-in">
          <div className="flex-1">
            <input value={name} onChange={e=>{setName(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&add()} placeholder={tr.placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"/>
            {error&&<p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all flex items-center gap-1"><CheckCircle size={14}/>{tr.save}</button>
            <button onClick={()=>{setShowAdd(false);setName('');setError('')}} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 active:scale-95 transition-all flex items-center gap-1"><X size={14}/>{tr.cancel}</button>
          </div>
        </div>
      )}

      {/* Category Grid */}
      {categories.length===0?(
        <div className="text-center py-8 text-gray-400 text-sm">{tr.empty}</div>
      ):(
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {categories.map(c=><CategoryItem key={c.slug} cat={c} onDelete={handleDelete} lang={lang}/>)}
        </div>
      )}
    </div>
  );
});

CategoryManager.displayName='CategoryManager';

export default CategoryManager;