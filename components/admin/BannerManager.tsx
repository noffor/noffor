"use client";
import { useState } from 'react';
import { Upload, X } from 'lucide-react';

export default function BannerManager({ banners }: { banners: any[] }) {
  const [slots, setSlots] = useState(banners);

  return (
    <div className="grid grid-cols-4 lg:grid-cols-10 gap-2">
      {slots.map(b => (
        <div key={b.slot} className={`rounded-xl p-2 text-center border ${b.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <p className="text-lg font-bold">{b.slot}</p>
          {b.isActive ? (
            <>
              <img src={b.imageUrl} className="w-full h-10 object-cover rounded mt-1" />
              <p className="text-[9px] text-green-600 truncate">{b.userId}</p>
              <button className="mt-1 text-[9px] text-red-500">Remove</button>
            </>
          ) : (
            <label className="mt-2 text-[10px] text-orange-600 cursor-pointer">
              <Upload size={12} className="inline mr-1" /> Add
              <input type="file" accept="image/*" className="hidden" />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}