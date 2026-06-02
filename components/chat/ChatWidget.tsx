// components/chat/ChatWidget.tsx - Booking Query 400 Error Fix
"use client";
import React,{useState,useEffect,useRef,useCallback,useMemo,startTransition} from 'react';
import {supabase} from '@/lib/supabase';
import {MessageCircle,X,Send,Phone,Loader2,AlertCircle} from 'lucide-react';

const T:Record<string,Record<string,string>>={
  en:{chat:'Chat',typeMessage:'Type message...',send:'Send',call:'Call',noMessages:'No messages yet',loginRequired:'Login to chat',loading:'Loading...',error:'Failed to load',retry:'Retry'},
  bn:{chat:'চ্যাট',typeMessage:'লিখুন...',send:'পাঠান',call:'কল',noMessages:'কোনো মেসেজ নেই',loginRequired:'লগইন করুন',loading:'লোড হচ্ছে...',error:'লোড ব্যর্থ',retry:'আবার চেষ্টা'},
  ar:{chat:'محادثة',typeMessage:'اكتب...',send:'إرسال',call:'اتصال',noMessages:'لا توجد رسائل',loginRequired:'سجل للدردشة',loading:'جاري...',error:'فشل',retry:'إعادة'},
  hi:{chat:'चैट',typeMessage:'लिखें...',send:'भेजें',call:'कॉल',noMessages:'कोई संदेश नहीं',loginRequired:'लॉगिन करें',loading:'लोड...',error:'विफल',retry:'पुनः प्रयास'},
};

const CONFIG={MESSAGE_LIMIT:50,RETRY_MAX:2};
interface Message{id:string;sender_id:string;receiver_id:string;message:string;created_at:string;booking_id?:string;}
interface Props{lang:string;}

const MessageBubble=React.memo(({msg,isMine}:{msg:Message;isMine:boolean})=>{
  const time=useMemo(()=>{try{return new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}catch{return''}},[msg.created_at]);
  return(
    <div className={`flex ${isMine?'justify-end':'justify-start'} animate-fade-in`}>
      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs shadow-sm ${isMine?'bg-green-600 text-white rounded-br-md':'bg-white text-gray-800 rounded-bl-md border border-gray-100'}`}>
        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
        <p className={`text-[10px] mt-1 ${isMine?'text-green-200':'text-gray-400'}`}>{time}</p>
      </div>
    </div>
  );
});
MessageBubble.displayName='MessageBubble';

const ChatWidget=React.memo(({lang}:Props)=>{
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const[messages,setMessages]=useState<Message[]>([]);
  const[newMsg,setNewMsg]=useState('');
  const[isOpen,setIsOpen]=useState(false);
  const[unread,setUnread]=useState(0);
  const[hasBooking,setHasBooking]=useState(false);
  const[bookingData,setBookingData]=useState<any>(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState(false);
  const[currentUserId,setCurrentUserId]=useState('');
  const bottomRef=useRef<HTMLDivElement>(null);
  const channelRef=useRef<any>(null);
  const aliveRef=useRef(true);

  useEffect(()=>{
    aliveRef.current=true;
    try{const u=localStorage.getItem('noffor_user');if(u){const p=JSON.parse(u);setCurrentUserId(p.id||p.phone||'')}}catch{}
    return()=>{aliveRef.current=false};
  },[]);

  // ✅ FIXED: Check if userId is UUID or phone
  const checkBooking=useCallback(async()=>{
    if(!currentUserId)return;
    startTransition(()=>setLoading(true));
    try{
      // ✅ UUID হলে worker_id/employer_id দিয়ে query
      const isUUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUserId);
      
      let query=supabase.from('bookings').select('*').in('status',['accepted','in_progress']).order('created_at',{ascending:false}).limit(1);
      
      if(isUUID){
        query=query.or(`worker_id.eq.${currentUserId},employer_id.eq.${currentUserId}`);
      }else{
        query=query.or(`employer_phone.eq.${currentUserId},contact_phone.eq.${currentUserId}`);
      }
      
      const{data:bookings,error:e}=await query;
      
      if(e){
        console.error('Booking query error:',e);
        throw e;
      }
      
      if(!aliveRef.current)return;
      if(bookings&&bookings.length>0){
        startTransition(()=>{setHasBooking(true);setBookingData(bookings[0])});
        await loadMessages(bookings[0].id);
      }
      startTransition(()=>setLoading(false));
    }catch(err:any){
      console.error('Check booking error:',err);
      startTransition(()=>{setError(true);setLoading(false)});
    }
  },[currentUserId]);

  useEffect(()=>{if(currentUserId)checkBooking()},[currentUserId,checkBooking]);

  const loadMessages=useCallback(async(bookingId:string)=>{
    try{
      const{data,error:e}=await supabase.from('messages').select('*').eq('booking_id',bookingId).order('created_at',{ascending:true}).limit(CONFIG.MESSAGE_LIMIT);
      if(e)throw e;
      if(aliveRef.current)startTransition(()=>setMessages(data||[]));
    }catch{startTransition(()=>setError(true))}
  },[]);

  useEffect(()=>{
    if(!hasBooking||!bookingData?.id)return;
    if(channelRef.current){supabase.removeChannel(channelRef.current)}
    channelRef.current=supabase.channel(`chat:${bookingData.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`booking_id=eq.${bookingData.id}`},(payload:any)=>{
      if(aliveRef.current){startTransition(()=>{setMessages(p=>[...p,payload.new]);if(!isOpen)setUnread(u=>u+1)})}
    }).subscribe();
    return()=>{if(channelRef.current){supabase.removeChannel(channelRef.current);channelRef.current=null}};
  },[hasBooking,bookingData?.id,isOpen]);

  useEffect(()=>{if(isOpen)bottomRef.current?.scrollIntoView({behavior:'smooth'})},[messages,isOpen]);

  const sendMessage=useCallback(async()=>{
    if(!newMsg.trim()||!bookingData||!currentUserId)return;
    const msgText=newMsg.trim();setNewMsg('');
    const receiverId=currentUserId===bookingData.worker_id?bookingData.employer_id:bookingData.worker_id;
    const{error:e}=await supabase.from('messages').insert({booking_id:bookingData.id,sender_id:currentUserId,receiver_id:receiverId,message:msgText});
    if(e)console.error('Send error:',e);
  },[newMsg,bookingData,currentUserId]);

  const handleKeyDown=useCallback((e:React.KeyboardEvent)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}},[sendMessage]);

  if(!hasBooking)return null;

  return(
    <>
      <button onClick={()=>{setIsOpen(!isOpen);setUnread(0)}} className="fixed bottom-20 lg:bottom-6 right-4 z-50 bg-green-600 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all will-change-transform" style={{transform:'translateZ(0)'}}>
        {isOpen?<X size={20}/>:<div className="relative"><MessageCircle size={20}/>{unread>0&&<span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">{unread>9?'9+':unread}</span>}</div>}
      </button>
      {isOpen&&(
        <div className="fixed bottom-36 lg:bottom-16 right-4 z-50 w-80 lg:w-96 h-[450px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up" style={{transform:'translateZ(0)'}}>
          <div className="p-3 border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2"><MessageCircle size={16}/><p className="font-bold text-sm">{tr.chat}</p>{bookingData?.contact_phone&&<a href={`tel:${bookingData.contact_phone}`} className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><Phone size={12}/></a>}</div>
            <button onClick={()=>setIsOpen(false)} className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X size={14}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {loading?<div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400"/></div>
            :error?<div className="text-center py-8"><AlertCircle size={24} className="text-red-400 mx-auto mb-2"/><button onClick={checkBooking} className="text-xs text-orange-600 underline">{tr.retry}</button></div>
            :messages.length===0?<p className="text-center text-gray-400 py-8 text-sm">{tr.noMessages}</p>
            :messages.map(msg=>{const isMine=msg.sender_id===currentUserId;return<MessageBubble key={msg.id} msg={msg} isMine={isMine}/>})}
            <div ref={bottomRef}/>
          </div>
          <div className="p-3 border-t bg-white rounded-b-2xl flex gap-2">
            <textarea value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={handleKeyDown} placeholder={tr.typeMessage} rows={1} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none bg-gray-50" style={{maxHeight:'80px'}}/>
            <button onClick={sendMessage} disabled={!newMsg.trim()} className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-1"><Send size={14}/></button>
          </div>
        </div>
      )}
    </>
  );
});

ChatWidget.displayName='ChatWidget';

export default ChatWidget;