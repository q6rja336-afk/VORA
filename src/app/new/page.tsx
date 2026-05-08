import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import ContentGrid from '@/components/ContentGrid';
import { NEW_ARRIVALS } from '@/lib/catalogue';

export default function NewPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <PageHeader 
        title="أحدث الإضافات" 
        description="ابقَ على اطلاع دائم بأحدث ما أضيف إلى مكتبة VORA من محتوى حصري ومميز."
      />
      <ContentGrid items={NEW_ARRIVALS} />
    </main>
  );
}
