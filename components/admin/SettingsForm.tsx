"use client";
import { useState } from 'react';

export default function SettingsForm({ settings: initial }: { settings: any }) {
  const [s, setS] = useState(initial);

  return (
    <div className="bg-white rounded-xl p-4 border space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          ['Site Name', 'siteName'],['Featured Price (QAR)', 'featuredPrice'],
          ['Banner Slots', 'bannerSlots'],['Free Banner (min)', 'freeBannerMinutes'],
          ['Featured Hours', 'featuredHours'],
        ].map(([l, k]) => (
          <div key={k}><label className="block text-sm text-gray-600 mb-1">{l}</label>
            <input value={s[k]} onChange={e => setS({...s, [k]: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        ))}
      </div>
      <button onClick={() => alert('Saved!')} className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Save Settings</button>
    </div>
  );
}