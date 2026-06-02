// components/home/AreaSelector.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {getCountry,getCityName,getAreaName,type City,type Area} from '@/lib/countries';
import {getText,LangCode} from '@/lib/language';
import {MapPin,Building2,Search} from 'lucide-react';

// ৪ ভাষা ট্রান্সলেশন
const T:Record<string,Record<string,string>>={
  en:{selectCity:'Select City',selectArea:'Select Area',allCities:'All Cities',allAreas:'All Areas',searchCity:'Search city...',noCity:'No cities found'},
  bn:{selectCity:'শহর বাছুন',selectArea:'এরিয়া বাছুন',allCities:'সব শহর',allAreas:'সব এরিয়া',searchCity:'শহর খুঁজুন...',noCity:'কোনো শহর পাওয়া যায়নি'},
  ar:{selectCity:'اختر المدينة',selectArea:'اختر المنطقة',allCities:'كل المدن',allAreas:'كل المناطق',searchCity:'ابحث عن مدينة...',noCity:'لا توجد مدن'},
  hi:{selectCity:'शहर चुनें',selectArea:'क्षेत्र चुनें',allCities:'सभी शहर',allAreas:'सभी क्षेत्र',searchCity:'शहर खोजें...',noCity:'कोई शहर नहीं'},
};

// City Option (Memoized)
const CityOption=React.memo(({city,lang}:{city:City;lang:string})=>{
  const name=getCityName(city,lang);
  return<option value={city.en}>{name}</option>;
});
CityOption.displayName='CityOption';

// Area Option (Memoized)
const AreaOption=React.memo(({area,lang}:{area:Area;lang:string})=>{
  const name=getAreaName(area,lang);
  return<option value={area.en}>{name}</option>;
});
AreaOption.displayName='AreaOption';

export default function AreaSelector({country,lang,onSelect}:{
  country:string;lang:string;onSelect?:(city:string,area:string)=>void;
}){
  const tr=useMemo(()=>T[lang]||T.en,[lang]);
  const c=useMemo(()=>getCountry(country),[country]);
  
  const[selectedCityEn,setSelectedCityEn]=useState('');
  const[selectedArea,setSelectedArea]=useState('');
  const[areas,setAreas]=useState<Area[]>([]);

  // ✅ Memoized city list
  const cities=useMemo(()=>c?.cities||[],[c]);

  // ✅ Memoized handlers
  const handleCityChange=useCallback((cityEn:string)=>{
    startTransition(()=>{
      const city=cities.find(c=>c.en===cityEn);
      setSelectedCityEn(cityEn);
      setAreas(city?.areas||[]);
      setSelectedArea('');
      onSelect?.(cityEn,'');
    });
  },[cities,onSelect]);

  const handleAreaChange=useCallback((areaEn:string)=>{
    startTransition(()=>{
      setSelectedArea(areaEn);
      onSelect?.(selectedCityEn,areaEn);
    });
  },[selectedCityEn,onSelect]);

  return(
    <div className="flex items-center gap-2 mb-3 bg-white p-2 lg:p-3 rounded-lg border shadow-sm" style={{contain:'layout style paint',transform:'translateZ(0)'}}>
      {/* Country Badge */}
      <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-lg flex-shrink-0">
        <MapPin size={14} className="text-orange-500"/>
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{c?.name||country.toUpperCase()}</span>
      </div>
      
      {/* City Select */}
      <div className="relative flex-1">
        <Building2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        <select 
          className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs lg:text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
          value={selectedCityEn}
          onChange={e=>handleCityChange(e.target.value)}
        >
          <option value="">{tr.selectCity}</option>
          {cities.map((city,idx)=>(
            <CityOption key={idx} city={city} lang={lang}/>
          ))}
        </select>
      </div>
      
      {/* Area Select */}
      <div className="relative flex-1">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        <select 
          className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs lg:text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          value={selectedArea}
          onChange={e=>handleAreaChange(e.target.value)}
          disabled={!selectedCityEn}
        >
          <option value="">{tr.selectArea}</option>
          {areas.map((area,idx)=>(
            <AreaOption key={idx} area={area} lang={lang}/>
          ))}
        </select>
      </div>
    </div>
  );
}