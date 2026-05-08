import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import ContentGrid from '@/components/ContentGrid';
import Footer from '@/components/Footer';
import { getAllContent } from '@/lib/supabase';

// Helper to map Supabase data
const mapContent = (item: any) => ({
  ...item,
  backdropUrl: item.backdrop_url,
  posterUrl: item.poster_url,
  videoUrl: item.video_url,
  isFeatured: item.is_featured,
  isTrending: item.is_trending,
  isNew: item.is_new,
});

export default async function MoviesPage() {
  const allContent = await getAllContent() || [];
  const movies = allContent
    .filter(c => c.type === 'movie')
    .map(mapContent);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <PageHeader 
        title="الأفلام" 
        description="مجموعة مختارة من أحدث وأروع الأفلام العالمية، من روائع السينما الكلاسيكية إلى أحدث الإنتاجات."
      />
      <ContentGrid items={movies} />
    </main>
  );
}
