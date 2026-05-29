"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageSlider({ images }: { images: string[] }) {
  const valid = images.filter(Boolean);
  const [current, setCurrent] = useState(0);

  // ✅ অটো স্লাইড - ৫ সেকেন্ড
  useEffect(() => {
    if (valid.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % valid.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [valid.length]);

  if (!valid.length) {
    return (
      <div className="w-full h-64 lg:h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
        No Image
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div className="relative w-full h-64 lg:h-96 rounded-xl overflow-hidden group">
        <img src={valid[current]} alt="" className="w-full h-full object-cover" />

        {valid.length > 1 && (
          <>
            <button onClick={() => setCurrent(p => (p - 1 + valid.length) % valid.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrent(p => (p + 1) % valid.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {valid.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {valid.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {valid.slice(0, 4).map((img, i) => (
            <img key={i} src={img} onClick={() => setCurrent(i)} className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 flex-shrink-0 ${i === current ? 'border-orange-500' : 'border-transparent'}`} loading="lazy" />
          ))}
        </div>
      )}
    </div>
  );
}