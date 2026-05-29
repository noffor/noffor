// components/chat/ChatWidget.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageCircle, X, Send, Phone } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface Props {
  lang: string;
}

export default function ChatWidget({ lang }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasBooking, setHasBooking] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const t = useCallback((key: string) => {
    const texts: any = {
      en: { chat: 'Chat', typeMessage: 'Type...', send: 'Send', call: 'Call', noMessages: 'No messages', loginRequired: 'Login to chat' },
      bn: { chat: 'চ্যাট', typeMessage: 'লিখুন...', send: 'পাঠান', call: 'কল', noMessages: 'মেসেজ নেই', loginRequired: 'চ্যাট করতে লগইন করুন' },
      ar: { chat: 'محادثة', typeMessage: 'اكتب...', send: 'إرسال', call: 'اتصال', noMessages: 'لا رسائل', loginRequired: 'سجل للدردشة' },
      hi: { chat: 'चैट', typeMessage: 'लिखें...', send: 'भेजें', call: 'कॉल', noMessages: 'कोई संदेश नहीं', loginRequired: 'चैट के लिए लॉगिन करें' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  }, [lang]);

  useEffect(() => {
    checkUserAndBooking();
  }, []);

  const checkUserAndBooking = async () => {
    const user = localStorage.getItem('noffor_user');
    if (!user) return;

    const userData = JSON.parse(user);
    
    // Check active booking
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .or(`worker_id.eq.${userData.id},employer_id.eq.${userData.phone}`)
      .in('status', ['accepted', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (bookings && bookings.length > 0) {
      setHasBooking(true);
      setBookingData(bookings[0]);
      loadMessages(bookings[0].id);
      
      // Realtime
      channelRef.current = supabase
        .channel('chat-global')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_2026_05_29',
          filter: `booking_id=eq.${bookings[0].id}`
        }, (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => [...prev, msg]);
          if (!isOpen) setUnread(u => u + 1);
        })
        .subscribe();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (bookingId: string) => {
    const { data } = await supabase
      .from('messages_2026_05_29')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !bookingData) return;
    
    const user = JSON.parse(localStorage.getItem('noffor_user') || '{}');
    const receiverId = user.id === bookingData.worker_id ? bookingData.employer_id : bookingData.worker_id;
    
    const { error } = await supabase.from('messages_2026_05_29').insert({
      booking_id: bookingData.id,
      sender_id: user.id || user.phone,
      receiver_id: receiverId,
      message: newMsg.trim()
    });

    if (!error) setNewMsg('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!hasBooking) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
        className="fixed bottom-20 lg:bottom-6 right-4 z-50 bg-green-600 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all"
      >
        {isOpen ? <X size={20} /> : (
          <div className="relative">
            <MessageCircle size={20} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-36 lg:bottom-16 right-4 z-50 w-72 lg:w-80 h-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="p-2.5 border-b bg-green-600 text-white rounded-t-2xl flex items-center justify-between">
            <p className="font-bold text-xs">{t('chat')}</p>
            <div className="flex items-center gap-1">
              {bookingData?.contact_phone && (
                <a href={`tel:${bookingData.contact_phone}`} className="p-1 bg-white/20 rounded-full">
                  <Phone size={12} />
                </a>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 bg-white/20 rounded-full">
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50 text-xs">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 py-8">{t('noMessages')}</p>
            ) : (
              messages.map(msg => {
                const user = JSON.parse(localStorage.getItem('noffor_user') || '{}');
                const isMine = msg.sender_id === (user.id || user.phone);
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-xs ${
                      isMine ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-0.5 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t bg-white rounded-b-2xl flex gap-1">
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeMessage')}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-green-500/20 focus:border-green-500 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim()}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}