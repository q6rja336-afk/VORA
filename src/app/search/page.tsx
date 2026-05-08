'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentGrid from '@/components/ContentGrid';
import { motion } from 'framer-motion';
import { Search, Film, Loader2 } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Searching for:', query);
        
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(50);

        if (error) {
          console.error('Supabase Search Error:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        setResults(mapResults(data || []));
      } catch (err: any) {
        console.error('Search error details:', err);
      } finally {
        setLoading(false);
      }
    }

    // Helper to map results
    function mapResults(data: any[]) {
      return data.map(item => ({
        id: item.id,
        title: item.title,
        titleAr: item.title, // Fallback since we don't have title_ar
        description: item.description,
        posterUrl: item.poster_url,
        backdropUrl: item.backdrop_url,
        score: item.score,
        year: item.year,
        type: item.type,
        genre: item.genre || [],
      }));
    }

    performSearch();
  }, [query]);

  return (
    <div style={{ minHeight: '80vh', paddingTop: '100px' }}>
      <header style={{ padding: '0 var(--margin-main) 40px', direction: 'rtl' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}
        >
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'var(--primary-container)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: '#fff' 
          }}>
            <Search size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-arabic)', fontSize: '28px', fontWeight: '800', color: '#fff' }}>
              نتائج البحث عن: "{query}"
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
              عثرنا على {results.length} نتيجة تطابق بحثك
            </p>
          </div>
        </motion.div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '16px' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p style={{ fontFamily: 'var(--font-arabic)', color: 'var(--on-surface-variant)' }}>جاري البحث في المكتبة...</p>
        </div>
      ) : results.length > 0 ? (
        <ContentGrid items={results} />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            justifyContent: 'center', height: '40vh', gap: '20px', textAlign: 'center' 
          }}
        >
          <div style={{ opacity: 0.2 }}>
            <Film size={80} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-arabic)', fontSize: '20px', color: 'var(--on-surface-variant)' }}>
            عذراً، لم نجد أي نتائج تطابق "{query}"
          </h2>
          <p style={{ maxWidth: '400px', fontSize: '14px', color: 'var(--outline)', lineHeight: '1.6' }}>
            تأكد من كتابة الاسم بشكل صحيح، أو جرب البحث بكلمات مفتاحية أخرى.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults />
      </Suspense>
      <Footer />
    </main>
  );
}
