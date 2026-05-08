'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px var(--margin-main)',
        textAlign: 'center'
      }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            fontFamily: 'var(--font-arabic)', 
            fontSize: '48px', 
            fontWeight: '800',
            marginBottom: '20px',
            color: '#fff'
          }}
        >
          تواصل معنا
        </motion.h1>
        
        <motion.p 
          animate={{ 
            y: [20, -100], 
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ 
            color: 'var(--primary)', 
            fontSize: '42px', 
            fontWeight: '900',
            fontFamily: 'var(--font-arabic)',
            filter: 'drop-shadow(0 0 20px rgba(85, 101, 175, 0.5))'
          }}
        >
          🖕🖕🖕 وووييييووو 🖕🖕🖕
        </motion.p>
      </div>

      <Footer />
    </main>
  );
}
