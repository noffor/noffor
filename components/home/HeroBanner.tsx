"use client";
import React, { useEffect, useState, useCallback, useRef, useMemo, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, AlertCircle, ImageOff } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

// ═══════════════════════════════════════════════════════════
const CONFIG = {
  BANNER_TTL: 60000,
  MAX_RETRY: 2,
  BATCH_SIZE: 20,
  REALTIME_DEBOUNCE: 2000,
  PREFETCH_COUNT: 3,
  INTERSECTION_THRESHOLD: 0.3,
  SWIPE_THRESHOLD: 50,
  AUTO_PLAY_INTERVAL: 5000,
  THROTTLE_DELAY: 150,
};

const memoryCache = new Map<string, { data: any; timestamp: number }>();

// ═══════════════════════════════════════════════════════════
class ImagePreloader {
  private static cache = new Map<string, HTMLImageElement>();
  private static queue: string[] = [];
  private static loading = false;
  private static maxCache = 50;

  static preload(urls: string[]) {
    this.queue = [...new Set([...this.queue, ...urls])];
    if (!this.loading) this.processQueue();
  }

  private static async processQueue() {
    this.loading = true;
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 5);
      await Promise.allSettled(
        batch.map(url =>
          new Promise<void>((resolve) => {
            if (this.cache.has(url)) { resolve(); return; }
            const img = new Image();
            img.onload = () => {
              this.cache.set(url, img);
              if (this.cache.size > this.maxCache) {
                const firstKey = this.cache.keys().next().value;
                if (firstKey) this.cache.delete(firstKey);
              }
              resolve();
            };
            img.onerror = () => { resolve(); };
            img.src = url;
          })
        )
      );
    }
    this.loading = false;
  }
}

// ═══════════════════════════════════════════════════════════
const optimizeImage = (url: string, w = 1200, q = 85): string => {
  if (!url) return '';
  if (url.includes('supabase.co/storage')) return `${url}?width=${w}&quality=${q}&format=webp&resize=cover`;
  return url;
};

function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...a: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function throttle<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let ok = true;
  return (...a: Parameters<T>) => { if (ok) { fn(...a); ok = false; setTimeout(() => ok = true, ms); } };
}

// ═══════════════════════════════════════════════════════════
const BannerItem = React.memo(({ banner, current, total, lang, country, onPrev, onNext, onDotClick }: any) => {
  const t = useCallback((k: string) => getText(lang as LangCode, k), [lang]);
  const emp = banner.role === 'employer';
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const img = useMemo(() => optimizeImage(banner.photo_url || '', 1200, 85), [banner.photo_url]);
  const mob = useMemo(() => optimizeImage(banner.photo_url || '', 640, 75), [banner.photo_url]);

  useEffect(() => { if (img) ImagePreloader.preload([img, mob]); }, [img, mob]);

  return (
    <div className="absolute inset-0 w-full h-full will-change-transform">
      <div className="absolute inset-0 bg-gray-900">
        {!err ? (
          <picture>
            <source srcSet={img} media="(min-width: 1024px)" type="image/webp" />
            <source srcSet={mob} type="image/webp" />
            <img src={img || '/banners/default.webp'} alt={banner.name || 'Banner'}
              className={`w-full h-full object-cover object-center transition-opacity duration-500 ${ok ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy" decoding="async"
              onLoad={() => startTransition(() => setOk(true))}
              onError={() => startTransition(() => setErr(true))}
              width={1200} height={500}
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', contentVisibility: 'auto' }} />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
            <ImageOff size={48} className="text-white/50" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" style={{ transform: 'translateZ(0)' }} />
      {total > 1 && (
        <>
          <button onClick={onPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-95 z-10" aria-label="Previous"><ChevronLeft size={24} /></button>
          <button onClick={onNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-95 z-10" aria-label="Next"><ChevronRight size={24} /></button>
        </>
      )}
      <a href={`/${country}/${lang}/profile/${banner.id}`} className="absolute bottom-4 left-4 right-4 text-white no-underline block z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${emp ? 'bg-blue-500' : 'bg-orange-500'}`}>{emp ? (t('hiring') || 'HIRING') : t('featured')}</span>
          {banner.is_online && !emp && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />}
        </div>
        <h2 className="text-lg lg:text-3xl font-bold truncate drop-shadow-lg">{banner.name || (emp ? 'Company' : 'Worker')}</h2>
        <p className="text-sm lg:text-base opacity-90 mt-1 truncate drop-shadow-lg">{emp ? `${t('hiring') || 'Hiring'}: ${banner.category || ''} • ${banner.expected_salary || ''}` : `${banner.category || ''} • ${banner.expected_salary || ''}`}</p>
      </a>
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 lg:gap-1.5 z-10">
          {Array.from({ length: Math.min(total, 20) }).map((_, i) => (
            <button key={i} onClick={() => onDotClick(i)} className={`flex-shrink-0 w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-3 lg:w-5' : 'bg-white/50 hover:bg-white/70'}`} aria-label={`Banner ${i + 1}`} />
          ))}
        </div>
      )}
      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full z-10">{current + 1}/{total}</div>
    </div>
  );
});
BannerItem.displayName = 'BannerItem';

// ═══════════════════════════════════════════════════════════
const Skeleton = React.memo(() => (
  <div className="relative w-full h-48 lg:h-64 xl:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
  </div>
));
Skeleton.displayName = 'Skeleton';

const ErrorState = React.memo(({ retry }: { retry: () => void }) => (
  <div className="relative w-full h-48 lg:h-64 xl:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
    <div className="text-center text-white px-4">
      <AlertCircle size={32} className="mx-auto mb-2" />
      <p className="text-sm font-medium">Failed to load</p>
      <button onClick={retry} className="mt-2 px-4 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition active:scale-95">Retry</button>
    </div>
  </div>
));
ErrorState.displayName = 'ErrorState';

// ═══════════════════════════════════════════════════════════
// 🚀 মেইন হিরো ব্যানার
// ═══════════════════════════════════════════════════════════
export default function HeroBanner({ country, lang }: { country: string; lang: string }) {
  const t = useCallback((k: string) => getText(lang as LangCode, k), [lang]);
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tx = useRef(0);
  const ty = useRef(0);
  const tt = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const loadRef = useRef<((f?: boolean) => Promise<void>) | null>(null);

  // ═══════════════════════════════════════════════════════
  const load = useCallback(async (force = false) => {
    if (!alive.current) return;
    const key = `b:${country}:${lang}`;

    if (!force) {
      const mc = memoryCache.get(key);
      if (mc && Date.now() - mc.timestamp < CONFIG.BANNER_TTL) {
        startTransition(() => { setBanners(mc.data); setLoading(false); });
        return;
      }
      try {
        const sc = sessionStorage.getItem(key);
        if (sc) {
          const p = JSON.parse(sc);
          if (Date.now() - p.t < CONFIG.BANNER_TTL) {
            memoryCache.set(key, { data: p.d, timestamp: p.t });
            startTransition(() => { setBanners(p.d); setLoading(false); });
            return;
          }
        }
      } catch {}
    }

    setLoading(true);
    setError(false);

    for (let r = 0; r <= CONFIG.MAX_RETRY; r++) {
      try {
        const { data, error: e } = await supabase
          .from('profiles')
          .select('id,name,role,category,expected_salary,photo_url,is_online,country,created_at')
          .eq('country', country).order('created_at', { ascending: false }).limit(CONFIG.BATCH_SIZE);
        if (e) throw e;
        if (data && alive.current) {
          const v = data.filter((b: any) => b.photo_url);
          const all = v.length > 0 ? v : data;
          memoryCache.set(key, { data: all, timestamp: Date.now() });
          try { sessionStorage.setItem(key, JSON.stringify({ d: all, t: Date.now() })); } catch {}
          const urls = all.slice(0, CONFIG.PREFETCH_COUNT + 1).map((b: any) => optimizeImage(b.photo_url, 1200, 85)).filter(Boolean);
          ImagePreloader.preload(urls);
          startTransition(() => { setBanners(all); setCurrent(0); setLoading(false); });
        } else if (alive.current) {
          startTransition(() => { setBanners([]); setLoading(false); });
        }
        return;
      } catch {
        if (r >= CONFIG.MAX_RETRY && alive.current) {
          startTransition(() => { setError(true); setLoading(false); });
        } else {
          await new Promise(res => setTimeout(res, 1000 * (r + 1)));
        }
      }
    }
  }, [country, lang]);

  loadRef.current = load;

  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    const h = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, []);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: CONFIG.INTERSECTION_THRESHOLD });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // ═══════════════════════════════════════════════════════
  useEffect(() => {
  let channel: any = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const refresh = () => {
    memoryCache.delete(`b:${country}:${lang}`);
    loadRef.current?.(true);
  };

  const setupRealtime = async () => {
    try {
      // আগের চ্যানেল ক্লিনআপ
      if (channel) {
        await supabase.removeChannel(channel);
      }

      channel = supabase
        .channel(`banner-realtime-${country}-${Date.now()}`) // ইউনিক নাম
        .on(
          'postgres_changes',
          {
            event: '*',           // সব ইভেন্ট
            schema: 'public',
            table: 'profiles',
            filter: `country=eq.${country}`,
          },
          () => {
            console.log('🔔 Realtime update received!');
            refresh();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime connected successfully');
            // পোলিং বন্ধ
            if (pollTimer) {
              clearInterval(pollTimer);
              pollTimer = null;
            }
          } else {
            console.warn('⚠️ Realtime subscription failed:', status);
            // পোলিং চালু
            if (!pollTimer) {
              pollTimer = setInterval(refresh, 15000);
            }
          }
        });
    } catch (err) {
      console.error('❌ Realtime setup error:', err);
      if (!pollTimer) {
        pollTimer = setInterval(refresh, 15000);
      }
    }
  };

  setupRealtime();

  return () => {
    if (pollTimer) clearInterval(pollTimer);
    if (channel) {
      supabase.removeChannel(channel).catch(() => {});
    }
  };
}, [country, lang]);

  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    alive.current = true;
    load(true);
    return () => { alive.current = false; };
  }, []);

  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (banners.length <= 1 || paused || !visible) {
      if (timer.current) { clearInterval(timer.current); timer.current = null; }
      return;
    }
    timer.current = setInterval(() => setCurrent(p => (p + 1) % banners.length), CONFIG.AUTO_PLAY_INTERVAL);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [banners.length, paused, visible]);

  useEffect(() => {
    return () => { if (timer.current) clearInterval(timer.current); alive.current = false; };
  }, []);

  // ═══════════════════════════════════════════════════════
  const prev = useCallback(() => setCurrent(p => (p - 1 + banners.length) % banners.length), [banners.length]);
  const next = useCallback(() => setCurrent(p => (p + 1) % banners.length), [banners.length]);
  const dot = useCallback((i: number) => setCurrent(i), []);
  const retry = useCallback(() => loadRef.current?.(true), []);
  const ts = useCallback((e: React.TouchEvent) => { tx.current = e.touches[0].clientX; tt.current = Date.now(); }, []);
  const tm = useCallback(throttle((e: React.TouchEvent) => { ty.current = e.touches[0].clientX; }, CONFIG.THROTTLE_DELAY), []);
  const te = useCallback(() => {
    const d = tx.current - ty.current;
    const dt = Date.now() - tt.current;
    if (Math.abs(d) > CONFIG.SWIPE_THRESHOLD && dt < 300) { d > 0 ? next() : prev(); }
  }, [next, prev]);

  const empty = useMemo(() => (
    <div className="relative w-full h-48 lg:h-64 xl:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <p className="text-lg lg:text-2xl font-bold">{t('featured')}</p>
        <p className="text-sm opacity-80 mt-2">{t('noResults')}</p>
        <a href={`/${country}/${lang}/create`} className="inline-block mt-3 px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition active:scale-95">{t('create')}</a>
      </div>
    </div>
  ), [country, lang, t]);

  // ═══════════════════════════════════════════════════════
  if (loading) return <Skeleton />;
  if (error) return <ErrorState retry={retry} />;
  if (banners.length === 0) return empty;

  return (
    <div ref={container}
      className="relative w-full h-48 lg:h-64 xl:h-80 rounded-xl overflow-hidden group select-none"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={ts} onTouchMove={tm} onTouchEnd={te}
      role="region" aria-label="Featured banners" aria-roledescription="carousel"
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', contain: 'layout style paint' }}>
      <div className="relative w-full h-full">
        {banners.map((b, i) => i === current && (
          <BannerItem key={b.id} banner={b} current={current} total={banners.length} lang={lang} country={country} onPrev={prev} onNext={next} onDotClick={dot} />
        ))}
      </div>
    </div>
  );
}