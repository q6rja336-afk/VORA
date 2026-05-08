'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Film, PlusCircle, LogOut, ChevronLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, signOut } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDemo = typeof window !== 'undefined' && localStorage.getItem('vora_demo_admin') === 'true';
  const isAdmin = profile?.role === 'admin' || isDemo;

  useEffect(() => {
    if (!loading && !isAdmin && !isDemo) {
      router.push('/');
    }
  }, [isAdmin, loading, router, isDemo]);

  if (!mounted || (loading && !isDemo)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <Loader2 className="animate-spin" color="var(--primary)" size={40} />
      </div>
    );
  }

  // If it's a demo, or it's an admin, show the UI
  if (!isAdmin && !isDemo) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--surface-container)', 
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 16px',
        position: 'fixed',
        top: 0, bottom: 0, right: 0,
        zIndex: 100
      }}>
        <div style={{ padding: '0 16px 40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>VORA <span style={{ color: '#fff', fontSize: '14px', fontWeight: '400', opacity: 0.6 }}>Admin</span></h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarLink href="/admin" icon={<LayoutDashboard size={20} />} label="إدارة المحتوى" />
          <SidebarLink href="/admin/new" icon={<PlusCircle size={20} />} label="إضافة جديد" />
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <button 
            onClick={() => { signOut(); router.push('/login'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', color: '#f87171',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '16px', fontWeight: '600'
            }}
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginRight: '280px', padding: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ background: 'rgba(255,255,255,0.05)', x: -5 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', borderRadius: '12px',
          color: 'var(--on-surface)', fontSize: '16px', fontWeight: '500'
        }}
      >
        {icon}
        <span style={{ flex: 1 }}>{label}</span>
        <ChevronLeft size={16} opacity={0.3} />
      </motion.div>
    </Link>
  );
}
