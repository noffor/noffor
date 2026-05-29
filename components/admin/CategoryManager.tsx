"use client";
import { useState } from 'react';
import { Plus, Trash2, Camera, Upload } from 'lucide-react';

export default function CategoryManager({ categories: initial }: { categories: any[] }) {
  const [categories, setCategories] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');

  const add = () => {
    if (name.trim()) {
      setCategories([...categories, { slug: name.toLowerCase().replace(/\s/g,'-'), name, icon:'/icons/default.svg', banner:'/banners/default.jpg' }]);
      setName(''); setShowAdd(false);
    }
  };

  return (
    <div>
      <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 mb-3"><Plus size={14} /> Add</button>
      {showAdd && (
        <div className="flex gap-2 mb-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Save</button>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {categories.map(c => (
          <div key={c.slug} className="bg-white rounded-xl p-3 border flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src={c.icon} className="w-8 h-8 rounded" />
                <button className="absolute inset-0 bg-black/40 rounded hidden group-hover:flex items-center justify-center"><Camera size={12} className="text-white" /></button>
              </div>
              <span className="text-sm font-medium">{c.name}</span>
            </div>
            <button onClick={() => setCategories(categories.filter(x => x.slug !== c.slug))} className="text-red-400"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}