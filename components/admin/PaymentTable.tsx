// components/admin/PaymentTable.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {Check,XCircle,Trash2,Loader2,AlertCircle,Filter,Calendar,Search,ChevronUp,ChevronDown} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{all:'All',pending:'Pending',confirmed:'Confirmed',rejected:'Rejected',user:'User',amount:'Amount',status:'Status',actions:'Actions',approve:'Approve',reject:'Reject',delete:'Delete',confirmDelete:'Delete this payment?',noPayments:'No payments found',search:'Search...',qar:'QAR',total:'Total'},
  bn:{all:'সব',pending:'পেন্ডিং',confirmed:'কনফার্ম',rejected:'বাতিল',user:'ইউজার',amount:'টাকা',status:'অবস্থা',actions:'অ্যাকশন',approve:'অনুমোদন',reject:'বাতিল',delete:'মুছুন',confirmDelete:'পেমেন্ট মুছবেন?',noPayments:'কোনো পেমেন্ট নেই',search:'খুঁজুন...',qar:'রিয়াল',total:'মোট'},
  ar:{all:'الكل',pending:'معلق',confirmed:'مؤكد',rejected:'مرفوض',user:'مستخدم',amount:'مبلغ',status:'حالة',actions:'إجراءات',approve:'موافقة',reject:'رفض',delete:'حذف',confirmDelete:'حذف الدفع؟',noPayments:'لا توجد مدفوعات',search:'بحث...',qar:'ريال',total:'المجموع'},
  hi:{all:'सभी',pending:'लंबित',confirmed:'पुष्टि',rejected:'अस्वीकृत',user:'उपयोगकर्ता',amount:'राशि',status:'स्थिति',actions:'कार्रवाई',approve:'स्वीकृत',reject:'अस्वीकार',delete:'हटाएं',confirmDelete:'भुगतान हटाएं?',noPayments:'कोई भुगतान नहीं',search:'खोजें...',qar:'रियाल',total:'कुल'},
};

// ═══════════════════════════════════════════════════════════
// Status Badge (Memoized)
// ═══════════════════════════════════════════════════════════
const StatusBadge=React.memo(({status,tr}:{status:string;tr:Record<string,string>})=>{
  const colors:Record<string,string>={confirmed:'bg-green-100 text-green-700',pending:'bg-yellow-100 text-yellow-700',rejected:'bg-red-100 text-red-700'};
  return<span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${colors[status]||'bg-gray-100 text-gray-600'}`}>{tr[status]||status}</span>;
});
StatusBadge.displayName='StatusBadge';

// ═══════════════════════════════════════════════════════════
// Action Button (Memoized)
// ═══════════════════════════════════════════════════════════
const ActionBtn=React.memo(({icon:Icon,color,title,onClick}:{icon:any;color:string;title:string;onClick:()=>void})=>(
  <button onClick={onClick} className={`p-2 rounded-lg ${color} hover:opacity-80 active:scale-90 transition-all`} title={title}><Icon size={14}/></button>
));
ActionBtn.displayName='ActionBtn';

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{payments:any[];lang?:string;onAction?:(action:string,payment:any)=>void}

// ═══════════════════════════════════════════════════════════
// PaymentTable (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const PaymentTable=React.memo(({payments,lang='en',onAction}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[filter,setFilter]=useState('all');
  const[search,setSearch]=useState('');
  const[sortDir,setSortDir]=useState<'asc'|'desc'>('desc');

  const filtered=useMemo(()=>{
    let result=filter==='all'?payments:payments.filter(p=>p.status===filter);
    if(search)result=result.filter(p=>p.user?.toLowerCase().includes(search.toLowerCase())||String(p.amount).includes(search));
    result=[...result].sort((a,b)=>(sortDir==='desc'?1:-1)*((a.amount||0)-(b.amount||0)));
    return result;
  },[payments,filter,search,sortDir]);

  const totalAmount=useMemo(()=>filtered.reduce((s,p)=>s+(Number(p.amount)||0),0),[filtered]);

  const handleAction=useCallback((action:string,payment:any)=>{
    if(action==='delete'&&!confirm(tr.confirmDelete))return;
    onAction?.(action,payment);
  },[onAction,tr]);

  const filters=['all','pending','confirmed','rejected'];

  return(
    <div style={{contain:'layout style paint'}}>
      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex gap-1 overflow-x-auto">
          {filters.map(s=>(
            <button key={s} onClick={()=>startTransition(()=>setFilter(s))} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all active:scale-95 ${filter===s?'bg-orange-600 text-white shadow-sm':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{tr[s as keyof typeof tr]||s}</button>
          ))}
        </div>
        <div className="flex items-center bg-white rounded-lg px-3 py-1.5 border flex-1">
          <Search size={12} className="text-gray-400 flex-shrink-0"/>
          <input value={search} onChange={e=>startTransition(()=>setSearch(e.target.value))} placeholder={tr.search} className="bg-transparent outline-none px-2 text-xs flex-1"/>
        </div>
      </div>

      {/* Total */}
      {filtered.length>0&&(
        <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
          <span>{filtered.length} {filter==='all'?tr.all:tr[filter as keyof typeof tr]}</span>
          <span className="font-semibold text-orange-600">{tr.total}: {totalAmount} {tr.qar}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{tr.user}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={()=>startTransition(()=>setSortDir(d=>d==='asc'?'desc':'asc'))}>
                <div className="flex items-center gap-1">{tr.amount}{sortDir==='asc'?<ChevronUp size={12}/>:<ChevronDown size={12}/>}</div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{tr.status}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0?(
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400"><AlertCircle size={20} className="mx-auto mb-2"/>{tr.noPayments}</td></tr>
            ):filtered.map(p=>(
              <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">{p.user?.[0]?.toUpperCase()||'?'}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.user||'N/A'}</p>
                      {p.date&&<p className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10}/>{p.date}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-orange-600">{p.amount} {tr.qar}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status||'pending'} tr={tr}/></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {p.status==='pending'&&(<>
                      <ActionBtn icon={Check} color="bg-green-50 text-green-600" title={tr.approve} onClick={()=>handleAction('approve',p)}/>
                      <ActionBtn icon={XCircle} color="bg-red-50 text-red-600" title={tr.reject} onClick={()=>handleAction('reject',p)}/>
                    </>)}
                    <ActionBtn icon={Trash2} color="bg-gray-50 text-gray-600" title={tr.delete} onClick={()=>handleAction('delete',p)}/>
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

PaymentTable.displayName='PaymentTable';

export default PaymentTable;