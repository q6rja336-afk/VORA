'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Play, Plus, Check, Star } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import type { ContentItem } from '@/lib/catalogue';

interface CarouselProps {
  title: string;
  titleAr?: string;
  items: ContentItem[];
  variant?: 'default' | 'wide';
}

export default function ContentCarousel({ title, titleAr, items, variant = 'default' }: CarouselProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const router    = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const cardWidth  = variant === 'wide' ? 300 : 200;
  const cardHeight = variant === 'wide' ? 169 : 280;
  const gap        = 14;

  // في RTL: التمرير للأمام (لليسار المنطقي) = scrollLeft سالب
  // زر "التالي" (يسار الشاشة) ← يحرك المحتوى للأمام
  // زر "السابق" (يمين الشاشة) → يحرك المحتوى للخلف
  const scroll = (dir: 'next' | 'prev') => {
    const track = trackRef.current;
    if (!track) return;
    const amount = (cardWidth + gap) * 3;
    // في RTL: next = scrollLeft يقل (اتجاه سالب)، prev = scrollLeft يزيد
    track.scrollBy({ left: dir === 'next' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section style={{ marginBottom: 'var(--stack-lg)' }}>
      {/* ── Section Header ── */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '0 var(--margin-main)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <h2 style={{
            fontFamily: 'var(--font-arabic)', fontSize: '22px', fontWeight: '700',
            color: 'var(--on-surface)', letterSpacing: '-0.3px',
          }}>{title}</h2>
          {titleAr && (
            <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '14px', color: 'var(--primary)', opacity: 0.8 }}>
              {titleAr}
            </span>
          )}
        </div>

        {/* أزرار التمرير — RTL: السهم الأيمن = السابق، الأيسر = التالي */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* زر السابق: يعرض ← ويتجه يمين الشاشة */}
          <motion.button
            whileHover={{ scale: 1.1, background: 'rgba(85,101,175,0.2)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('prev')}
            style={arrowStyle}
            aria-label="السابق"
          >
            <ChevronRight size={18} />
          </motion.button>
          {/* زر التالي: يعرض → ويتجه يسار الشاشة */}
          <motion.button
            whileHover={{ scale: 1.1, background: 'rgba(85,101,175,0.2)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('next')}
            style={arrowStyle}
            aria-label="التالي"
          >
            <ChevronLeft size={18} />
          </motion.button>
        </div>
      </div>

      {/* ── Track ── */}
      <div style={{ position: 'relative' }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex', gap: `${gap}px`,
            overflowX: 'auto', scrollSnapType: 'x mandatory',
            padding: `8px var(--margin-main) 16px`,
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            // RTL: الكروت تبدأ من اليمين
            direction: 'rtl',
          }}
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              style={{
                flexShrink: 0, width: `${cardWidth}px`, height: `${cardHeight}px`,
                scrollSnapAlign: 'start',
              }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <ContentCard
                item={item}
                hovered={hovered === item.id}
                width={cardWidth}
                height={cardHeight}
                variant={variant}
                onPlay={(e) => {
                  e.stopPropagation();
                  router.push(`/watch/${item.id}`);
                }}
                onClick={() => router.push(`/details/${item.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  item: ContentItem;
  hovered: boolean;
  width: number;
  height: number;
  variant: 'default' | 'wide';
  onPlay: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function ContentCard({ item, hovered, width, height, variant, onPlay, onClick }: CardProps) {
  const { isInList, toggleItem } = useWatchlist();
  const inList = isInList(item.id);

  // ترجمة التصنيفات للعربية
  const genreAr: Record<string, string> = {
    'Sci-Fi': 'خيال علمي', 'Thriller': 'إثارة', 'Action': 'أكشن',
    'Drama': 'دراما', 'Mystery': 'غموض', 'Art': 'فن', 'Documentary': 'وثائقي',
  };

  return (
    <motion.div
      animate={{
        y: hovered ? -8 : 0,
        boxShadow: hovered
          ? '0 24px 60px rgba(0,0,0,0.7), 0 0 32px rgba(85,101,175,0.2)'
          : '0 4px 16px rgba(0,0,0,0.4)',
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative', width: '100%', height: '100%',
        borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        cursor: 'pointer', background: 'var(--surface-container)',
        // الكرت نفسه يرث اتجاه النص من الـ RTL
        direction: 'rtl',
      }}
      onClick={onClick}
    >
      {/* الصورة */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${variant === 'wide' ? item.backdropUrl : item.posterUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'transform 0.5s ease',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
        }}
      />

      {/* تدرج السفلي */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(13,14,22,0.95) 0%, rgba(13,14,22,0.3) 50%, transparent 100%)',
      }} />

      {/* شارة "جديد" — أعلى اليمين (بداية RTL) */}
      {item.isNew && (
        <div style={{
          position: 'absolute', top: '10px', insetInlineStart: '10px',
          padding: '3px 10px', borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, #5565af, #a8b3e5)',
          color: '#fff', fontSize: '11px', fontFamily: 'var(--font-arabic)',
          fontWeight: '700',
        }}>جديد</div>
      )}

      {/* أيقونة رائج — أعلى اليسار (نهاية RTL) */}
      {item.isTrending && (
        <div style={{
          position: 'absolute', top: '10px', insetInlineEnd: '10px',
          fontSize: '18px',
        }}>🔥</div>
      )}

      {/* المحتوى السفلي */}
      <div style={{
        position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0,
        padding: '16px 14px',
      }}>
        {/* التقييم */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px',
          fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: '600',
          color: '#ffd700', direction: 'ltr', justifyContent: 'flex-end',
        }}>
          <span style={{ color: 'var(--outline)', fontWeight: '400', marginInlineEnd: '6px' }}>{item.year}</span>
          {item.score}
          <Star size={11} fill="currentColor" />
        </div>

        <p style={{
          fontFamily: 'var(--font-arabic)', fontSize: variant === 'wide' ? '15px' : '13px',
          fontWeight: '600', color: '#fff', lineHeight: '1.3',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{item.titleAr ?? item.title}</p>

        {/* أزرار الـ hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
            >
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={onPlay}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #5565af, #3e4c8c)',
                  color: '#fff', fontFamily: 'var(--font-arabic)',
                  fontSize: '12px', fontWeight: '600', border: 'none',
                  cursor: 'pointer', flex: 1, justifyContent: 'center',
                }}
              >
                <Play size={12} fill="currentColor" />
                شاهد
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
                className={inList ? "" : "glass"}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '34px', height: '34px', borderRadius: 'var(--radius-full)',
                  background: inList ? 'var(--secondary-container)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', 
                  border: 'none', cursor: 'pointer',
                  boxShadow: inList ? '0 0 20px rgba(77,197,123,0.5)' : 'none',
                }}
                aria-label={inList ? "إزالة من القائمة" : "أضف إلى القائمة"}
              >
                {inList ? <Check size={16} /> : <Plus size={16} />}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const arrowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--on-surface-variant)', cursor: 'pointer', transition: 'all 0.2s',
};
