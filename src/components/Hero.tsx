'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import type { ContentItem } from '@/lib/catalogue';

interface HeroProps {
  items: ContentItem[];
}

export default function Hero({ items }: HeroProps) {
  const [active, setActive]     = useState(0);
  const [muted, setMuted]       = useState(true);
  const router = useRouter();

  // Auto-cycle featured items every 8 seconds
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % items.length), 8000);
    return () => clearInterval(t);
  }, [items.length]);

  const item = items[active];

  if (!item) return (
    <div style={{ height: '60vh', background: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader"></div>
    </div>
  );

  // Gradient colours for each slide
  const gradients = [
    'from-[#0d1340] via-transparent',
    'from-[#1a0d2e] via-transparent',
    'from-[#0d1f1a] via-transparent',
    'from-[#2d1a0d] via-transparent',
    'from-[#0d1a2d] via-transparent',
    'from-[#1a0d1a] via-transparent',
  ];

  return (
    <section
      id="hero"
      style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '600px', overflow: 'hidden' }}
    >
      {/* ── Backdrop ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute', inset: 0,
            background: `url(${item.backdropUrl}) center/cover no-repeat`,
          }}
        />
      </AnimatePresence>

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, #12131c 0%, rgba(18,19,28,0.3) 50%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        // في RTL: التدرج الجانبي يبدأ من اليمين (جانب المحتوى)
        background: 'linear-gradient(to left, rgba(18,19,28,0.95) 0%, rgba(18,19,28,0.5) 40%, transparent 70%)',
      }} />

      {/* Animated noise grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        backgroundSize: '256px',
        pointerEvents: 'none',
      }} />

      {/* ── Content ── */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end',
        padding: 'clamp(24px, 5vw, 80px)',
        paddingBottom: 'clamp(60px, 8vh, 120px)',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id + '-content'}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: '620px' }}
          >
            {/* تشيبات التصنيف */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {item.isNew && (
                <span className="chip chip-primary" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>
                  ✦ جديد
                </span>
              )}
              {item.isTrending && <span className="chip"><span style={{ color: '#ffb692' }}>🔥</span> رائج</span>}
              {item.genre.map(g => {
                const ar: Record<string, string> = {
                  'Sci-Fi': 'خيال علمي', 'Thriller': 'إثارة', 'Action': 'أكشن',
                  'Drama': 'دراما', 'Mystery': 'غموض', 'Art': 'فن', 'Documentary': 'وثائقي',
                };
                return <span key={g} className="chip">{ar[g] ?? g}</span>;
              })}
            </div>

            {/* العنوان الرئيسي بالعربية */}
            <h1 style={{
              fontFamily: 'var(--font-arabic)',
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: '700',
              lineHeight: '1.15',
              letterSpacing: '-1px',
              color: '#fff',
              marginBottom: '16px',
              textShadow: '0 4px 32px rgba(0,0,0,0.5)',
            }}>
              {item.titleAr ?? item.title}
            </h1>

            {/* العنوان الإنجليزي بالأسفل كعنوان فرعي */}
            {item.titleAr && (
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '16px', fontWeight: '500',
                color: 'var(--primary)', marginBottom: '16px', opacity: 0.8,
                letterSpacing: '0.3px',
              }}>
                {item.title}
              </p>
            )}

            {/* Meta */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              fontFamily: 'var(--font-inter)', fontSize: '13px',
              color: 'var(--on-surface-variant)', marginBottom: '20px',
            }}>
              <span style={{ color: '#ffd700', fontWeight: '600' }}>★ {item.score}</span>
              <span>{item.year}</span>
              <span className="chip" style={{ padding: '2px 8px' }}>{item.rating}</span>
              <span>{item.duration}</span>
            </div>

            {/* Description */}
            <p style={{
              fontFamily: 'var(--font-arabic)', fontSize: '15px', lineHeight: '1.7',
              color: 'var(--on-surface-variant)', marginBottom: '32px',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {item.description}
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <motion.button
                id="hero-play-btn"
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(79,97,255,0.6)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(`/watch/${item.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 28px', borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--primary-container) 0%, #3648e8 100%)',
                  color: '#fff', fontFamily: 'var(--font-arabic)',
                  fontSize: '16px', fontWeight: '600', cursor: 'pointer',
                  border: 'none', boxShadow: '0 0 24px rgba(79,97,255,0.4)',
                  transition: 'box-shadow 0.3s',
                }}
              >
                <Play size={18} fill="currentColor" />
                مشاهدة الآن
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(`/details/${item.id}`)}
                className="glass"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 24px', borderRadius: 'var(--radius-full)',
                  color: 'var(--on-surface)', fontFamily: 'var(--font-arabic)',
                  fontSize: '16px', fontWeight: '500', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.12)',
                  transition: 'background 0.3s',
                }}
              >
                <Info size={18} />
                التفاصيل
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Slide Indicators ── */}
      <div style={{
        position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '8px',
      }}>
        {items.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            animate={{
              width: i === active ? 28 : 8,
              background: i === active ? '#4f61ff' : 'rgba(255,255,255,0.3)',
            }}
            transition={{ duration: 0.3 }}
            style={{
              height: '8px', borderRadius: 'var(--radius-full)',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
            aria-label={`الشريحة ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Mute Toggle ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMuted(v => !v)}
        className="glass"
        style={{
          position: 'absolute', bottom: '32px', insetInlineEnd: '32px',
          width: '44px', height: '44px', borderRadius: 'var(--radius-full)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--on-surface)', cursor: 'pointer', border: 'none',
        }}
        aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </motion.button>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
