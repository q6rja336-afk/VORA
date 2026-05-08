'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: 'الأفلام', href: '/movies' },
  { label: 'المسلسلات', href: '/series' },
  { label: 'قائمتي', href: '/watchlist' },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
    }
  };

  // Determine account link destination
  const accountHref = !user ? '/login' : (isAdmin ? '/admin' : '/account');

  return (
    <>
      {/* ── Desktop / Tablet Navbar ── */}
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-strong' : ''
        }`}
        style={{ padding: '0 var(--margin-main)' }}
      >
        <nav style={{ maxWidth: '1400px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          
          {/* الشعار */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Image
                src="/logo.png"
                alt="VORA"
                width={280}
                height={96}
                style={{
                  height: '18px',
                  width: 'auto',
                  objectFit: 'contain',
                }}
                priority
              />
            </motion.div>
          </Link>

          {/* Nav Links */}
          <ul style={{ display: 'flex', gap: '4px', listStyle: 'none', flex: 1 }} className="hidden-mobile">
            {navLinks.map(l => (
              <li key={l.href}>
                <Link href={l.href} style={{
                  display: 'block', padding: '8px 14px', borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-arabic)', fontSize: '15px', fontWeight: '500',
                  color: 'var(--on-surface-variant)', textDecoration: 'none',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.color = 'var(--on-surface)';
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.color = 'var(--on-surface-variant)';
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginInlineStart: 'auto' }}>
            
            {/* Desktop Only Icons (تظهر فقط على المتصفح) */}
            <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.div
                    key="search-input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <input
                      ref={searchRef}
                      type="search"
                      placeholder="ابحث..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      onBlur={() => !searchQuery && setSearchOpen(false)}
                      style={{
                        width: '100%', padding: '8px 16px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--primary-container)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--on-surface)',
                        fontFamily: 'var(--font-arabic)', fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchOpen(true)}
                    style={iconBtnStyle}
                    aria-label="بحث"
                  >
                    <Search size={20} />
                  </motion.button>
                )}
              </AnimatePresence>

              <Link href={accountHref} style={{ textDecoration: 'none' }}>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  style={{
                    ...iconBtnStyle,
                    background: isAdmin ? 'linear-gradient(135deg, #ffd700, #ffa500)' : 'linear-gradient(135deg, var(--primary-container), #3e4c8c)',
                    color: '#fff', width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
                    boxShadow: isAdmin ? '0 0 16px rgba(255,215,0,0.3)' : '0 0 16px rgba(79,97,255,0.4)',
                  }} 
                  aria-label="الملف الشخصي"
                >
                  <User size={18} />
                </motion.button>
              </Link>
            </div>

            {/* Mobile hamburger (يظهر فقط على الهاتف - تم سحبه للخارج ليكون منفصلاً) */}
            <div className="show-mobile">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(v => !v)}
                style={{ ...iconBtnStyle, border: 'none', background: 'transparent' }}
                aria-label="القائمة"
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="glass-strong"
            style={{
              position: 'fixed', inset: 0, zIndex: 49,
              display: 'flex', flexDirection: 'column',
              padding: '100px 24px 40px',
              gap: '24px',
            }}
          >
            {/* Search in Menu */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
              <input
                type="search"
                placeholder="ابحث عن فيلم أو مسلسل..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                style={{
                  width: '100%', padding: '14px 44px 14px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--on-surface)',
                  fontFamily: 'var(--font-arabic)', fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Account in Menu */}
            <Link href={accountHref} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 20px', borderRadius: 'var(--radius-lg)',
              background: isAdmin 
                ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))' 
                : 'linear-gradient(135deg, rgba(79,97,255,0.2), rgba(79,97,255,0.05))',
              border: isAdmin ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(79,97,255,0.2)',
              textDecoration: 'none', color: '#fff'
            }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: isAdmin ? '#ffd700' : 'var(--primary-container)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isAdmin ? '#000' : '#fff'
              }}>
                <User size={20} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-arabic)' }}>
                {isAdmin ? 'لوحة الإدارة' : (user ? 'حسابي الشخصي' : 'تسجيل الدخول')}
              </span>
            </Link>

            {/* Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block', padding: '16px 20px',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '18px', fontWeight: '600',
                      color: 'var(--on-surface)', textDecoration: 'none',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >{l.label}</Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        .show-mobile { display: none; }
      `}</style>
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'var(--on-surface-variant)', cursor: 'pointer',
  transition: 'color 0.2s, background 0.2s',
};
