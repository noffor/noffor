// components/home/NearWorkersSection.tsx
"use client";
import { useState, useEffect } from 'react';
import NearWorkers from '@/components/NearWorkers';
import BookingForm from '@/components/BookingForm';
import { Worker, UserLocation } from '@/types';

interface NearWorkersSectionProps {
  country: string;
  lang: string;
}

export default function NearWorkersSection({ country, lang }: NearWorkersSectionProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  if (!userLocation) {
    return null;
  }

  return (
    <>
      <NearWorkers 
        country={country} 
        lang={lang} 
        userLocation={userLocation} 
        onBook={setSelectedWorker} 
      />
      
      <BookingForm 
        worker={selectedWorker!}
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        country={country}
        lang={lang}
      />
    </>
  );
}