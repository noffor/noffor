"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Send, Users, MapPin, Tag } from 'lucide-react';

export default function NotificationSender() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'workers' | 'employers' | 'country' | 'category'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title || !message) return;
    setSending(true);
    
    // Build filter
    let filter: any = {};
    if (target === 'workers') filter.role = 'labor';
    else if (target === 'employers') filter.role = 'employer';
    else if (target === 'country' && targetValue) filter.country = targetValue;
    else if (target === 'category' && targetValue) filter.category = targetValue;

    // Send to live_activities table (triggers notification)
    const { data: users } = await supabase.from('profiles').select('id').match(filter);
    
    if (users) {
      const notifications = users.map(u => ({
        user_id: u.id,
        title,
        message,
        type: 'admin',
        read: false,
        created_at: new Date().toISOString(),
      }));
      
      // Batch insert
      for (let i = 0; i < notifications.length; i += 50) {
        await supabase.from('notifications').insert(notifications.slice(i, i + 50));
      }
    }
    
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setTitle(''); setMessage(''); }, 3000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={18} className="text-orange-400" />
        <h3 className="text-white font-semibold text-sm">Send Notification</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Target</label>
          <div className="flex gap-1 flex-wrap">
            {(['all','workers','employers','country','category'] as const).map(t => (
              <button key={t} onClick={() => setTarget(t)} className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${target===t?'bg-orange-600 text-white':'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {t === 'all' && <span className="flex items-center gap-1"><Users size={10} />All</span>}
                {t === 'workers' && 'Workers'}
                {t === 'employers' && 'Employers'}
                {t === 'country' && <span className="flex items-center gap-1"><MapPin size={10} />Country</span>}
                {t === 'category' && <span className="flex items-center gap-1"><Tag size={10} />Category</span>}
              </button>
            ))}
          </div>
        </div>

        {(target === 'country') && (
          <select value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-3 py-1.5">
            <option value="">Select Country</option>
            <option value="QA">Qatar</option>
            <option value="SA">Saudi Arabia</option>
            <option value="AE">UAE</option>
            <option value="KW">Kuwait</option>
            <option value="OM">Oman</option>
            <option value="BH">Bahrain</option>
          </select>
        )}

        {target === 'category' && (
          <select value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-3 py-1.5">
            <option value="">Select Category</option>
            <option value="Driver">Driver</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Mason">Mason</option>
            <option value="AC Technician">AC Technician</option>
            <option value="Painter">Painter</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Welder">Welder</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Cook">Cook</option>
            <option value="Helper">Helper</option>
            <option value="Gardener">Gardener</option>
          </select>
        )}

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..." className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-1.5 placeholder-gray-500 focus:outline-none focus:border-orange-500" />
        </div>
        
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification message..." rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-1.5 placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none" />
        </div>

        <button onClick={handleSend} disabled={sending || !title || !message} className="w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50 transition-all">
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : sent ? (
            <><CheckCircle size={16} />Sent Successfully!</>
          ) : (
            <><Send size={14} />Send Notification</>
          )}
        </button>
      </div>
    </div>
  );
}

import { CheckCircle } from 'lucide-react';