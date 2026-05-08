import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ContentCarousel from '@/components/ContentCarousel';
import ContinueWatching from '@/components/ContinueWatching';
import Footer from '@/components/Footer';
import { getAllContent, getContinueWatching } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper to map Supabase data to our ContentItem interface
const mapContent = (item: any) => ({
  ...item,
  backdropUrl: item.backdrop_url,
  posterUrl: item.poster_url,
  videoUrl: item.video_url,
  isFeatured: item.is_featured,
  isTrending: item.is_trending,
  isNew: item.is_new,
});

export default async function HomePage() {
  let allContent: any[] = [];
  try {
    const allContentRaw = await getAllContent();
    allContent = (allContentRaw || []).map(mapContent);
  } catch (error) {
    console.error("Failed to fetch content:", error);
  }

  const featured = allContent.filter(c => c.isFeatured);
  const trending = allContent.filter(c => c.isTrending);
  const newArrivals = allContent.filter(c => c.isNew);

  // Fetch Continue Watching data
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';
  let continueItems: any[] = [];
  let progressMap: Record<string, any> = {};

  try {
    const progressData = await getContinueWatching(DEMO_USER_ID);
    if (progressData.length > 0) {
      progressData.forEach((p: any) => {
        progressMap[p.content_id] = p;
        const found = allContent.find(c => c.id === p.content_id);
        if (found) continueItems.push(found);
      });
    }
  } catch (error) {
    console.error("Failed to fetch watch progress:", error);
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      {/* Hero — full viewport */}
      <Hero items={featured.length > 0 ? featured : allContent} />

      {/* Catalogue sections */}
      {allContent.length > 0 ? (
        <div style={{ paddingTop: 'var(--stack-lg)' }}>
          {/* Continue Watching (Only if there's progress) */}
          {continueItems.length > 0 && (
            <ContinueWatching items={continueItems} progress={progressMap} />
          )}

          {/* وصل حديثاً */}
          <ContentCarousel
            title="وصل حديثاً"
            items={newArrivals}
          />
        </div>
      ) : (
        <div style={{ 
          height: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', gap: '16px', color: 'var(--on-surface-variant)',
          textAlign: 'center', padding: '0 24px'
        }}>
          <p style={{ fontFamily: 'var(--font-arabic)', fontSize: '18px' }}>لم يتم العثور على أي محتوى بعد.</p>
          <p style={{ fontSize: '14px', opacity: 0.5 }}>تأكد من إضافة أفلام أو مسلسلات من لوحة التحكم.</p>
        </div>
      )}

      <Footer />
    </main>
  );
}
