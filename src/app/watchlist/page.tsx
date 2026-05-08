'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import ContentGrid from '@/components/ContentGrid';
import { useWatchlist } from '@/context/WatchlistContext';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const [listItems, setListItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlistContent() {
      if (watchlist.length === 0) {
        setListItems([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('content')
        .select('*')
        .in('id', watchlist);

      if (data) {
        setListItems(data.map(item => ({
          ...item,
          backdropUrl: item.backdrop_url,
          posterUrl: item.poster_url,
          videoUrl: item.video_url,
          isFeatured: item.is_featured,
          isTrending: item.is_trending,
          isNew: item.is_new,
        })));
      }
      setLoading(false);
    }

    fetchWatchlistContent();
  }, [watchlist]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div className="loader"></div>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <PageHeader 
        title="قائمتي" 
        description="جميع أفلامك ومسلسلاتك المفضلة التي قمت بحفظها للعودة إليها لاحقاً."
      />
      
      {listItems.length > 0 ? (
        <ContentGrid items={listItems} />
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '100px 20px', textAlign: 'center',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
            color: 'var(--outline)',
          }}>
            <Bookmark size={32} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-arabic)', fontSize: '24px',
            color: '#fff', marginBottom: '12px',
          }}>قائمتك فارغة</h2>
          <p style={{
            fontFamily: 'var(--font-arabic)', color: 'var(--on-surface-variant)',
            marginBottom: '32px',
          }}>ابدأ باستكشاف المحتوى وأضف ما يعجبك إلى قائمتك الخاصة.</p>
          
          <Link href="/" style={{
            padding: '12px 32px', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #4dc57b 0%, #3ba665 100%)',
            color: '#fff', textDecoration: 'none',
            fontFamily: 'var(--font-arabic)', fontWeight: '600',
            boxShadow: '0 0 20px rgba(77,197,123,0.3)',
          }}>
            تصفح الرئيسية
          </Link>
        </div>
      )}
    </main>
  );
}
