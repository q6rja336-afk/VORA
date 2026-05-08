'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // DEMO BYPASS: Check for hardcoded credentials
    if (email === 'admin@vora.com' && password === '123456') {
      localStorage.setItem('vora_demo_admin', 'true');
      window.location.href = '/admin'; // Redirect and force reload to refresh context
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check role and redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1a1b2e 0%, #0c0c16 100%)',
      padding: '24px'
    }}>
      {/* Abstract Background Glows */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'rgba(79, 97, 255, 0.15)', filter: 'blur(120px)', borderRadius: '50%' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '30vw', height: '30vw', background: 'rgba(77, 197, 123, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '48px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '12px' }}>
            <Image 
              src="/logo.png" 
              alt="VORA" 
              width={240} 
              height={70} 
              style={{ 
                margin: '0 auto', 
                height: '70px', 
                width: 'auto',
                filter: 'drop-shadow(0 0 20px rgba(79, 97, 255, 0.5))'
              }} 
            />
          </div>
          <h1 style={{ fontFamily: 'var(--font-arabic)', fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-0.8px' }}>مرحباً بك مجدداً</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>سجل دخولك لمتابعة المشاهدة</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px', color: '#f87171', fontSize: '14px', marginBottom: '24px', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            style={primaryButtonStyle}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 48px 14px 16px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  color: '#fff',
  fontFamily: 'var(--font-arabic)',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.3s',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  background: 'linear-gradient(135deg, var(--primary) 0%, #3648e8 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '16px',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 20px rgba(79, 97, 255, 0.3)',
};

const secondaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'background 0.3s',
};
