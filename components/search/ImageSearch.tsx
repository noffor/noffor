"use client";
import { useRef, useState } from 'react';
import { Camera, ImageIcon } from 'lucide-react';

export default function ImageSearch() {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="text-center space-y-3">
      <h3 className="font-bold text-sm">Search by Image</h3>
      {preview && <img src={preview} className="w-full h-48 object-cover rounded-xl" />}
      <div className="flex gap-2">
        <button onClick={() => cameraRef.current?.click()} className="flex-1 py-3 bg-orange-600 text-white rounded-xl text-sm font-medium flex flex-col items-center gap-1">
          <Camera size={22} /> Camera
        </button>
        <button onClick={() => galleryRef.current?.click()} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium flex flex-col items-center gap-1">
          <ImageIcon size={22} /> Gallery
        </button>
        <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={handleFile} className="hidden" />
        <input type="file" accept="image/*" ref={galleryRef} onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}