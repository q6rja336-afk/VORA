'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import type { ContentItem } from '@/lib/catalogue';
import type { WatchProgress } from '@/lib/supabase';

interface ContinueWatchingProps {
  items: ContentItem[];
  progress: Record<string, WatchProgress>;
}

export default function ContinueWatching({ items, progress }: ContinueWatchingProps) {
  const router = useRouter();

  if (!items.length) return null;

  return (
    <section style={{ marginBottom: 'var(--stack-lg)' }}>
      <div style={{ padding: '0 var(--margin-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={18} style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontFamily: 'var(--font-arabic)', fontSize: '22px', fontWeight: '700', color: 'var(--on-surface)' }}>
          أكمل المشاهدة
        </h2>
      </div>

      <div style={{
        display: 'flex', gap: '14px', overflowX: 'auto',
        padding: '8px var(--margin-main) 16px',
        scrollbarWidth: 'none',
      }}>
        {items.map((item, i) => {
          const p = progress[item.id];
          const pct = p ? Math.min(100, (p.position_seconds / p.duration_seconds) * 100) : 0;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
              onClick={() => {
                const params = new URLSearchParams();
                params.set('t', (p?.position_seconds ?? 0).toString());
                if (p?.season_number) params.set('s', p.season_number.toString());
                if (p?.episode_number) params.set('e', p.episode_number.toString());
                router.push(`/watch/${item.id}?${params.toString()}`);
              }}
              style={{
                position: 'relative', flexShrink: 0, width: '260px', height: '150px',
                borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'pointer',
                background: 'var(--surface-container)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              {/* Backdrop */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${item.backdropUrl})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              {/* Gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(13,14,22,0.95) 0%, rgba(13,14,22,0.3) 60%, transparent 100%)',
              }} />

              {/* Play icon */}
              <div
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '44px', height: '44px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(79,97,255,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', boxShadow: '0 0 24px rgba(79,97,255,0.5)',
                }}
              >
                <Play size={18} fill="#fff" color="#fff" />
              </div>

              {/* Title + Progress */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                  <p style={{
                    fontFamily: 'var(--font-arabic)', fontSize: '13px', fontWeight: '600',
                    color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{item.titleAr ?? item.title}</p>
                  
                  {p?.season_number && p?.episode_number && (
                    <span style={{ 
                      fontSize: '10px', background: 'rgba(85, 101, 175, 0.2)', color: 'var(--primary)', 
                      padding: '2px 6px', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-inter)'
                    }}>
                      S{p.season_number}-E{p.episode_number}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: '2px',
                      background: 'linear-gradient(to right, #4f61ff, #bdc2ff)',
                    }}
                  />
                </div>

                <p style={{
                  fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--on-surface-variant)',
                  marginTop: '4px',
                }}>
                  {p ? formatRemaining(p.duration_seconds - p.position_seconds) : ''}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return 'انتهى';
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} د متبقية`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}س ${rm}د متبقية`;
}
