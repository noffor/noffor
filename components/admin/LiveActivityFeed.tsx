"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, UserPlus, Gavel, CheckCircle, AlertTriangle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'registration' | 'bid' | 'booking' | 'report' | 'payment';
  message: string;
  time: string;
  country?: string;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    
    // Initial mock data
    setActivities([
      { id: '1', type: 'registration', message: 'New worker registered: Mohammed Rahim', time: '2 min ago', country: 'QA' },
      { id: '2', type: 'bid', message: 'New bid placed on "House Driver needed"', time: '5 min ago', country: 'QA' },
      { id: '3', type: 'booking', message: 'Booking completed: Jamal Uddin - Plumber', time: '8 min ago', country: 'QA' },
      { id: '4', type: 'report', message: 'Profile reported: Suspicious activity', time: '12 min ago', country: 'AE' },
      { id: '5', type: 'payment', message: 'Payment received: 1,800 QAR - Booking #2847', time: '15 min ago', country: 'QA' },
    ]);

    // Realtime subscription
    const channel = supabase
      .channel('admin-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_activities' }, (payload) => {
        if (aliveRef.current && payload.new) {
          setActivities(prev => [{
            id: payload.new.id,
            type: payload.new.type || 'registration',
            message: payload.new.message || 'New activity',
            time: 'Just now',
            country: payload.new.country || 'QA',
          }, ...prev.slice(0, 49)]);
        }
      })
      .subscribe();

    return () => {
      aliveRef.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'registration': return <UserPlus size={14} className="text-green-400" />;
      case 'bid': return <Gavel size={14} className="text-yellow-400" />;
      case 'booking': return <CheckCircle size={14} className="text-blue-400" />;
      case 'report': return <AlertTriangle size={14} className="text-red-400" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-orange-400" />
          <h3 className="text-white font-semibold text-sm">Live Activity</h3>
        </div>
        <span className="text-xs text-green-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>
      <div className="divide-y divide-gray-800 max-h-[400px] overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="px-5 py-3 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                  {activity.country && (
                    <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">{activity.country}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}