// components/admin/UserTable.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {Search,XCircle,Check,Shield,MessageCircle,Trash2,Loader2,AlertCircle,ChevronUp,ChevronDown,UserX,UserCheck} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{search:'Search users...',name:'Name',phone:'Phone',status:'Status',actions:'Actions',active:'Active',inactive:'Inactive',blocked:'Blocked',suspend:'Suspend',verify:'Verify',contact:'Contact',delete:'Delete',noUsers:'No users found',confirmDelete:'Delete this user?',loading:'Loading...'},
  bn:{search:'ব্যবহারকারী খুঁজুন...',name:'নাম',phone:'ফোন',status:'অবস্থা',actions:'অ্যাকশন',active:'সক্রিয়',inactive:'নিষ্ক্রিয়',blocked:'ব্লক',suspend:'সাসপেন্ড',verify:'ভেরিফাই',contact:'যোগাযোগ',delete:'মুছুন',noUsers:'কোনো ব্যবহারকারী নেই',confirmDelete:'ইউজার মুছবেন?',loading:'লোড হচ্ছে...'},
  ar:{search:'بحث عن مستخدم...',name:'اسم',phone:'هاتف',status:'حالة',actions:'إجراءات',active:'نشط',inactive:'غير نشط',blocked:'محظور',suspend:'تعليق',verify:'تحقق',contact:'اتصال',delete:'حذف',noUsers:'لا يوجد مستخدمين',confirmDelete:'حذف هذا المستخدم؟',loading:'جاري...'},
  hi:{search:'उपयोगकर्ता खोजें...',name:'नाम',phone:'फोन',status:'स्थिति',actions:'कार्रवाई',active:'सक्रिय',inactive:'निष्क्रिय',blocked:'अवरुद्ध',suspend:'निलंबित',verify:'सत्यापित',contact:'संपर्क',delete:'हटाएं',noUsers:'कोई उपयोगकर्ता नहीं',confirmDelete:'हटाएं?',loading:'लोड...'},
};

// ═══════════════════════════════════════════════════════════
// Status Badge (Memoized)
// ═══════════════════════════════════════════════════════════
const StatusBadge=React.memo(({status,tr}:{status:string;tr:Record<string,string>})=>{
  const colors:Record<string,string>={
    active:'bg-green-100 text-green-700',inactive:'bg-gray-100 text-gray-600',
    blocked:'bg-red-100 text-red-700',pending:'bg-yellow-100 text-yellow-700',
  };
  return(
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${colors[status]||'bg-gray-100 text-gray-600'}`}>
      {tr[status]||status}
    </span>
  );
});
StatusBadge.displayName='StatusBadge';

// ═══════════════════════════════════════════════════════════
// Action Button (Memoized)
// ═══════════════════════════════════════════════════════════
const ActionButton=React.memo(({icon:Icon,color,title,onClick}:{icon:any;color:string;title:string;onClick:()=>void})=>(
  <button onClick={onClick} className={`p-2 rounded-lg ${color} hover:opacity-80 active:scale-90 transition-all`} title={title}>
    <Icon size={14}/>
  </button>
));
ActionButton.displayName='ActionButton';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{users:any[];lang?:string;onAction?:(action:string,user:any)=>void}

// ═══════════════════════════════════════════════════════════
// UserTable (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const UserTable=React.memo(({users,lang='en',onAction}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[search,setSearch]=useState('');
  const[sortBy,setSortBy]=useState<'name'|'status'>('name');
  const[sortDir,setSortDir]=useState<'asc'|'desc'>('asc');

  const filtered=useMemo(()=>{
    const q=search.toLowerCase();
    let result=users.filter(u=>u.name?.toLowerCase().includes(q)||u.phone?.includes(q));
    result.sort((a,b)=>{
      const va=a[sortBy]||'';const vb=b[sortBy]||'';
      return sortDir==='asc'?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va));
    });
    return result;
  },[users,search,sortBy,sortDir]);

  const handleSort=useCallback((key:'name'|'status')=>{
    startTransition(()=>{if(sortBy===key)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortBy(key);setSortDir('asc')}});
  },[sortBy]);

  const handleAction=useCallback((action:string,user:any)=>{
    if(action==='delete'&&!confirm(tr.confirmDelete))return;
    onAction?.(action,user);
  },[onAction,tr]);

  return(
    <div style={{contain:'layout style paint'}}>
      {/* Search */}
      <div className="flex items-center bg-white rounded-xl px-3 py-2.5 border border-gray-200 mb-3 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
        <Search size={14} className="text-gray-400 flex-shrink-0"/>
        <input value={search} onChange={e=>startTransition(()=>setSearch(e.target.value))} placeholder={tr.search} className="bg-transparent outline-none px-2 text-sm flex-1"/>
        {search&&<span className="text-xs text-gray-400">{filtered.length} found</span>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={()=>handleSort('name')}>
                <div className="flex items-center gap-1">{tr.name}{sortBy==='name'&&(sortDir==='asc'?<ChevronUp size={12}/>:<ChevronDown size={12}/>)}</div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{tr.phone}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={()=>handleSort('status')}>
                <div className="flex items-center gap-1">{tr.status}{sortBy==='status'&&(sortDir==='asc'?<ChevronUp size={12}/>:<ChevronDown size={12}/>)}</div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0?(
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400"><AlertCircle size={20} className="mx-auto mb-2"/>{tr.noUsers}</td></tr>
            ):filtered.map(u=>(
              <tr key={u.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {u.photo_url?<img src={u.photo_url} alt="" className="w-8 h-8 object-cover" loading="lazy"/>:null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{u.name||'N/A'}</p>
                      <p className="text-xs text-gray-400 truncate">{u.category||'-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{u.phone||'-'}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status||'active'} tr={tr}/></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <ActionButton icon={u.status==='blocked'?UserCheck:XCircle} color="bg-red-50 text-red-600" title={u.status==='blocked'?tr.active:tr.suspend} onClick={()=>handleAction(u.status==='blocked'?'unblock':'suspend',u)}/>
                    <ActionButton icon={Shield} color="bg-blue-50 text-blue-600" title={tr.verify} onClick={()=>handleAction('verify',u)}/>
                    <ActionButton icon={MessageCircle} color="bg-green-50 text-green-600" title={tr.contact} onClick={()=>handleAction('contact',u)}/>
                    <ActionButton icon={Trash2} color="bg-gray-50 text-gray-600" title={tr.delete} onClick={()=>handleAction('delete',u)}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

UserTable.displayName='UserTable';

export default UserTable;