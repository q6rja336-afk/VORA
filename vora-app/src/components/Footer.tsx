'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer style={{
      padding: '60px var(--margin-main) 40px',
      borderTop: '1px solid var(--outline-variant)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
      background: 'rgba(0,0,0,0.2)'
    }}>
      {/* شعار VORA */}
      <Link href="/">
        <motion.div
          whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/logo.png"
            alt="VORA"
            width={160}
            height={52}
            style={{
              height: '52px',
              width: 'auto',
              objectFit: 'contain',
              opacity: 0.9,
              filter: 'brightness(1.1)',
            }}
          />
        </motion.div>
      </Link>

      <div style={{
        display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center',
        fontFamily: 'var(--font-arabic)', fontSize: '14px', color: 'var(--outline)',
      }}>
        <span>منصة البث</span>
        <span>•</span>
        <span>سياسة الخصوصية</span>
        <span>•</span>
        <span>شروط الاستخدام</span>
        <span>•</span>
        <FooterLink href="/contact">تواصل معنا</FooterLink>
      </div>

      <p style={{ 
        fontFamily: 'var(--font-inter)', fontSize: '12px', 
        color: 'var(--outline)', textAlign: 'center', opacity: 0.7 
      }}>
        © 2026 VORA. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      style={{ 
        textDecoration: 'none', 
        color: 'inherit', 
        transition: 'color 0.2s' 
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--on-surface)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--outline)')}
    >
      {children}
    </Link>
  );
}
