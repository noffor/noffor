// lib/utils.ts
import { GULF_COUNTRIES } from '@/types';

export function getCountryByCode(code: string) {
  return GULF_COUNTRIES.find(c => c.code === code) || GULF_COUNTRIES[0];
}

export function getCountryName(code: string, lang: string): string {
  const country = getCountryByCode(code);
  if (lang === 'bn') return (country as any).nameBn || country.name;
  if (lang === 'ar') return (country as any).nameAr || country.name;
  if (lang === 'hi') return (country as any).nameHi || country.name;
  return country.name;
}

export function formatCurrency(amount: number, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  return `${country.currency} ${amount.toLocaleString()}`;
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1));
}

export function getETA(distanceKm: number): number {
  const avgSpeed = 20;
  return Math.ceil((distanceKm / avgSpeed) * 60);
}

export function formatDate(date: string, lang: string): string {
  const d = new Date(date);
  if (lang === 'bn') return d.toLocaleDateString('bn-BD');
  if (lang === 'ar') return d.toLocaleDateString('ar-EG');
  if (lang === 'hi') return d.toLocaleDateString('hi-IN');
  return d.toLocaleDateString('en-US');
}

export function formatTime(time: string, lang: string): string {
  return time;
}

export function getRelativeTime(date: string, lang: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (lang === 'bn') {
    if (diffMins < 1) return 'এইমাত্র';
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
    return `${diffDays} দিন আগে`;
  }
  
  if (lang === 'ar') {
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  }
  
  if (lang === 'hi') {
    if (diffMins < 1) return 'अभी';
    if (diffMins < 60) return `${diffMins} मिनट पहले`;
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    return `${diffDays} दिन पहले`;
  }
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}