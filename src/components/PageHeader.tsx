'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div style={{
      padding: '140px var(--margin-main) 60px',
      background: 'linear-gradient(to bottom, rgba(79,97,255,0.05) 0%, transparent 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      marginBottom: '40px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={{
          fontFamily: 'var(--font-arabic)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '800',
          color: '#fff',
          marginBottom: '16px',
        }}>{title}</h1>
        <p style={{
          fontFamily: 'var(--font-arabic)',
          fontSize: '18px',
          color: 'var(--on-surface-variant)',
          maxWidth: '600px',
          lineHeight: '1.6',
        }}>{description}</p>
      </motion.div>
    </div>
  );
}
