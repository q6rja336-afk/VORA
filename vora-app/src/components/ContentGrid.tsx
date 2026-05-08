'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWatchlist } from '@/context/WatchlistContext';
import { Play, Plus, Check, Star } from 'lucide-react';
import type { ContentItem } from '@/lib/catalogue';

interface GridProps {
  items: ContentItem[];
}

export default function ContentGrid({ items }: GridProps) {
  const router = useRouter();
  const { isInList, toggleItem } = useWatchlist();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '24px',
      padding: '0 var(--margin-main) 80px',
    }}>
      {items.map((item, idx) => {
        const inList = isInList(item.id);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            whileHover={{ y: -8 }}
            style={{
              position: 'relative',
              aspectRatio: '2/3',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'var(--surface-container)',
              cursor: 'pointer',
            }}
            onClick={() => router.push(`/details/${item.id}`)}
          >
            {/* Poster Image */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${item.posterUrl})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
            
            {/* Overlay */}
            <div className="card-overlay" style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
              opacity: 0.8,
            }} />

            {/* Content */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '16px', direction: 'rtl',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-arabic)', fontSize: '15px', fontWeight: '600',
                color: '#fff', marginBottom: '8px',
              }}>{item.titleAr ?? item.title}</h3>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/watch/${item.id}`);
                  }}
                  style={{
                    flex: 1, height: '32px', borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--primary-container) 0%, #3648e8 100%)',
                    color: '#fff', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', fontSize: '12px', fontWeight: '600',
                    fontFamily: 'var(--font-arabic)', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79,97,255,0.3)',
                  }}
                >
                  <Play size={12} fill="currentColor" />
                  شاهد
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                  style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                    background: inList ? '#4dc57b' : 'rgba(255,255,255,0.1)',
                    color: '#fff', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: inList ? '0 0 15px rgba(77,197,123,0.4)' : 'none',
                  }}
                >
                  {inList ? <Check size={16} /> : <Plus size={16} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
