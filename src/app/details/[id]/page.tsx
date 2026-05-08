'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Bookmark, Plus, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useWatchlist } from '@/context/WatchlistContext';

export default function DetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isInList, toggleItem } = useWatchlist();
  
  const id = params.id as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    async function fetchItem() {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setItem({
          ...data,
          backdropUrl: data.backdrop_url,
          posterUrl: data.poster_url,
          videoUrl: data.video_url,
          seasonsData: data.seasons_data || [],
        });
      }
      setLoading(false);
    }
    fetchItem();
  }, [id]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div className="loader"></div>
    </div>
  );

  if (!item) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <h2 style={{ color: '#fff', fontFamily: 'var(--font-arabic)' }}>المحتوى غير موجود</h2>
      </div>
    );
  }

  const isSeries = item.type === 'series';
  const inList = isInList(item.id);
  const currentSeason = item.seasonsData?.find((s: any) => s.seasonNumber === selectedSeason) || item.seasonsData?.[0];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', overflowX: 'hidden' }}>
      <Navbar />

      <style jsx>{`
        .backdrop-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 85vh;
          z-index: 0;
          overflow: hidden;
        }
        .backdrop-image {
          position: absolute;
          inset: 0;
          background-image: url(${item.backdropUrl});
          background-size: cover;
          background-position: center 20%;
        }
        .backdrop-overlay-top {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, var(--background) 5%, rgba(18,19,28,0.7) 30%, transparent 70%);
        }
        .backdrop-overlay-side {
          position: absolute;
          inset: 0;
          background: linear-gradient(to left, rgba(18,19,28,0.9) 0%, rgba(18,19,28,0.4) 40%, transparent 100%);
        }

        @media (max-width: 768px) {
          .backdrop-container {
            height: 100vh;
          }
          .backdrop-image {
            background-position: center center;
          }
          .backdrop-overlay-side {
            background: linear-gradient(to top, rgba(18,19,28,0.8) 0%, transparent 100%);
          }
        }
      `}</style>

      <div className="backdrop-container">
        <div className="backdrop-image" />
        <div className="backdrop-overlay-top" />
        <div className="backdrop-overlay-side" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: '25vh', paddingBottom: '140px', paddingLeft: 'var(--margin-main)', paddingRight: 'var(--margin-main)', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ maxWidth: '800px' }}>
            <h1 style={{ fontFamily: 'var(--font-arabic)', fontSize: 'clamp(40px, 7vw, 84px)', fontWeight: '800', lineHeight: '1', color: '#fff', marginBottom: '20px', textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              {item.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', color: 'var(--on-surface)', fontSize: '16px', fontWeight: '500' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd700' }}>
                <Star size={18} fill="currentColor" />
                <span style={{ fontFamily: 'var(--font-inter)', fontWeight: '700' }}>{item.score}</span>
              </div>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>{item.year}</span>
              {item.duration && (
                <><span style={{ opacity: 0.3 }}>|</span><span>{item.duration}</span></>
              )}
              <span style={{ opacity: 0.3 }}>|</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {item.genre?.map((g: string) => (<span key={g} style={{ color: 'var(--primary)' }}>{g}</span>))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(79,97,255,0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/watch/${item.id}${isSeries ? '?s=1&e=1' : ''}`)}
                style={{ padding: '14px 40px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary) 0%, #3648e8 100%)', color: '#fff', fontFamily: 'var(--font-arabic)', fontSize: '18px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <Play size={20} fill="currentColor" />
                شاهد الآن
              </motion.button>

              <motion.button
                whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleItem(item.id)}
                style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-full)', background: inList ? '#4dc57b' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {inList ? <Bookmark size={22} fill="currentColor" /> : <Plus size={22} />}
              </motion.button>
            </div>

            <p style={{ fontFamily: 'var(--font-arabic)', fontSize: '18px', lineHeight: '1.7', color: 'var(--on-surface-variant)', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {item.description}
            </p>
          </motion.div>

          {isSeries && item.seasonsData?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3, duration: 0.8 }} 
              style={{ 
                background: 'var(--background)', 
                padding: '40px var(--margin-main)', 
                marginInline: 'calc(-1 * var(--margin-main))', 
                width: '100vw',
                direction: 'rtl' // Ensure full RTL flow
              }}
            >
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                
                {/* Season Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                  <h3 style={{ fontFamily: 'var(--font-arabic)', fontSize: '24px', fontWeight: '800', color: '#fff' }}>الحلقات</h3>
                  {item.seasonsData.length > 1 && (
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                        style={{
                          appearance: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff',
                          border: '1px solid rgba(255,255,255,0.1)', padding: '10px 40px 10px 16px',
                          borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontSize: '16px', outline: 'none'
                        }}
                      >
                        {item.seasonsData.map((s: any) => (
                          <option key={s.seasonNumber} value={s.seasonNumber} style={{ background: '#12131c' }}>الموسم {s.seasonNumber}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                    </div>
                  )}
                </div>

                {/* Episode Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                  gap: '24px',
                  justifyContent: 'start', // Start from right in RTL
                  direction: 'rtl'
                }}>
                  {currentSeason?.episodes.map((url: string, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)', borderColor: 'var(--primary)' }}
                      style={{
                        display: 'flex', gap: '20px', padding: '20px', borderRadius: '24px', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', 
                        alignItems: 'center', direction: 'rtl'
                      }}
                      onClick={() => router.push(`/watch/${item.id}?s=${selectedSeason}&e=${index + 1}`)}
                    >
                      {/* Number on Right */}
                      <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', opacity: 0.3, width: '40px', textAlign: 'center' }}>
                        {index + 1}
                      </div>

                      {/* Content in Middle */}
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <h4 style={{ fontFamily: 'var(--font-arabic)', fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>الحلقة {index + 1}</h4>
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '13px', opacity: 0.5 }}>الموسم {selectedSeason}</span>
                      </div>

                      {/* Play Icon on Left (Original Orientation) */}
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(79,97,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={18} fill="var(--primary)" color="var(--primary)" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}
